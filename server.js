const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const BASE_URL = 'https://www.carboninterface.com/api/v1';

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

async function fetchVehicleMakes() {
    try {
        const response = await axios.get(`${BASE_URL}/vehicle_makes`, {
            headers: {
                'Authorization': `Bearer ${process.env.CARBON_INTERFACE_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        const makes = response.data;
        console.log('Available vehicle makes:', makes);

        // Example: Find a specific make and model
        const toyotaMake = makes.find(make => make.data.attributes.name.toLowerCase() === 'toyota');
        if (toyotaMake) {
            const modelsResponse = await axios.get(`${BASE_URL}/vehicle_makes/${toyotaMake.data.id}/vehicle_models`, {
                headers: {
                    'Authorization': `Bearer ${process.env.CARBON_INTERFACE_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            });

            const models = modelsResponse.data;
            console.log('Available Toyota models:', models);

            // Update your vehicle model ID here
            // For example, use the first model ID
            if (models.length > 0) {
                return models[0].data.id;
            }
        }
    } catch (error) {
        console.error('Error fetching vehicle makes:', error.response?.data || error.message);
    }
    return null;
}

// Call this function when the server starts
let vehicleModelId = null;
fetchVehicleMakes().then(id => {
    vehicleModelId = id;
    console.log('Using vehicle model ID:', vehicleModelId);
});

app.post('/api/calculate-emissions', async (req, res) => {
    try {
        const { commute, transport, electric, gas, meat, flights, country } = req.body;
        let total = 0;

        // Calculate transport emissions
        if (commute > 0 && transport !== 'bike') {
            const yearlyCommute = commute * 365;
            const transportData = {
                type: "vehicle",
                distance_unit: "km",
                distance_value: yearlyCommute,
                vehicle_model_id: vehicleModelId
            };
            
            const response = await axios.post(
                `${BASE_URL}/estimates`,
                transportData,
                {
                    headers: {
                        'Authorization': `Bearer ${process.env.CARBON_INTERFACE_API_KEY}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            total += response.data.data.attributes.carbon_kg;
        }

        // Calculate electricity emissions
        if (electric > 0) {
            const yearlyElectric = electric * 12;
            const electricityData = {
                type: "electricity",
                electricity_unit: "kwh",
                electricity_value: yearlyElectric,
                country: country.toLowerCase()
            };

            const response = await axios.post(
                `${BASE_URL}/estimates`,
                electricityData,
                {
                    headers: {
                        'Authorization': `Bearer ${process.env.CARBON_INTERFACE_API_KEY}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            total += response.data.data.attributes.carbon_kg;
        }

        // Calculate flight emissions
        if (flights > 0) {
            const yearlyFlights = flights * 12;
            const flightData = {
                type: "flight",
                passengers: 1,
                legs: [{
                    departure_airport: "lax",
                    destination_airport: "sfo"
                }]
            };

            const response = await axios.post(
                `${BASE_URL}/estimates`,
                flightData,
                {
                    headers: {
                        'Authorization': `Bearer ${process.env.CARBON_INTERFACE_API_KEY}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            total += response.data.data.attributes.carbon_kg * yearlyFlights;
        }

        // Calculate gas emissions
        if (gas > 0) {
            const yearlyGas = gas * 12;
            total += yearlyGas * 2.3;
        }

        // Calculate meat emissions
        if (meat > 0) {
            const yearlyMeat = meat * 52;
            total += yearlyMeat * 3.3;
        }

        res.json({ total });
    } catch (error) {
        console.error('Server error:', error.response?.data || error.message);
        res.status(500).json({ error: 'Error calculating emissions' });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});