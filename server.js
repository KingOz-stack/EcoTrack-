const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');

// Load environment variables
dotenv.config();

console.log('API Key:', process.env.CARBON_INTERFACE_API_KEY);

const app = express();
const port = process.env.PORT || 3000;
const BASE_URL = 'https://www.carboninterface.com/api/v1';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.post('/api/calculate-emissions', async (req, res) => {
    try {
        console.log('Received request:', req.body);
        const { commute, transport, electric, gas, meat, flights, country } = req.body;
        let total = 0;

        // Add logging for debugging
        console.log('Processing request with values:', {
            commute, transport, electric, gas, meat, flights, country
        });

        // Calculate transport emissions (daily commute → yearly)
        if (commute > 0 && transport !== 'bike') {
            const yearlyCommute = commute * 365;
            const transportData = {
                type: "vehicle",
                distance_unit: "km",
                distance_value: yearlyCommute,
                vehicle_model_id: "7268a9b7-17e8-4c8d-acca-cc7f2e4b54c9"
            };
            
            try {
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
            } catch (error) {
                console.error('Transport API error:', error.response?.data);
                total += yearlyCommute * 0.2; // Fallback: 0.2 kg CO2 per km
            }
        }

        // Calculate electricity emissions (monthly → yearly)
        if (electric > 0) {
            const yearlyElectric = electric * 12;
            const electricityData = {
                type: "electricity",
                electricity_unit: "kwh",
                electricity_value: yearlyElectric,
                country: country.toLowerCase()
            };

            try {
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
            } catch (error) {
                console.error('Electricity API error:', error.response?.data);
                total += yearlyElectric * 0.5; // Fallback: 0.5 kg CO2 per kWh
            }
        }

        // Calculate flight emissions (monthly → yearly)
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

            try {
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
            } catch (error) {
                console.error('Flight API error:', error.response?.data);
                total += yearlyFlights * 200; // Fallback: 200 kg CO2 per flight
            }
        }

        // Calculate gas emissions (monthly → yearly)
        if (gas > 0) {
            const yearlyGas = gas * 12;
            total += yearlyGas * 2.3; // 2.3 kg CO2 per m³
        }

        // Calculate meat emissions (weekly → yearly)
        if (meat > 0) {
            const yearlyMeat = meat * 52;
            total += yearlyMeat * 3.3; // 3.3 kg CO2 per kg of meat
        }

        console.log('Calculated total:', total);
        res.json({ total });
    } catch (error) {
        console.error('Server error:', error);
        console.error('Error details:', error.response?.data || error.message);
        res.status(500).json({ 
            error: 'Error calculating emissions',
            details: error.message 
        });
    }
});

// Add error handling middleware
app.use((err, req, res, next) => {
    console.error('Global error:', err);
    res.status(500).json({ 
        error: 'Server error', 
        details: err.message 
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
