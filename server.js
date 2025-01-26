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

app.post('/api/calculate-emissions', async (req, res) => {
    try {
        const { commute, transport, electric, gas, meat, flights, country } = req.body;
        let total = 0;

        // Daily commute to yearly total (km)
        const yearlyCommute = commute * 365;
        
        // Monthly flights to yearly total
        const yearlyFlights = flights * 12;
        
        // Monthly electricity to yearly total (kWh)
        const yearlyElectric = electric * 12;
        
        // Monthly gas to yearly total (m³)
        const yearlyGas = gas * 12;
        
        // Weekly meat to yearly total (kg)
        const yearlyMeat = meat * 52;

        // Calculate transport emissions
        if (commute > 0 && transport !== 'bike') {
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
                console.error('Transport calculation error:', error.response?.data);
                total += yearlyCommute * 0.2; // Fallback: 0.2 kg CO2 per km
            }
        }

        // Calculate electricity emissions
        if (electric > 0) {
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
                console.error('Electricity calculation error:', error.response?.data);
                total += yearlyElectric * 0.5; // Fallback: 0.5 kg CO2 per kWh
            }
        }

        // Calculate flight emissions
        if (flights > 0) {
            // Calculate for each flight in the year
            for (let i = 0; i < yearlyFlights; i++) {
                const flightData = {
                    type: "flight",
                    passengers: 1,
                    legs: [{
                        departure_airport: "lax",
                        destination_airport: "sfo" // Shorter domestic flight as example
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
                    total += response.data.data.attributes.carbon_kg;
                } catch (error) {
                    console.error('Flight calculation error:', error.response?.data);
                    total += 200; // Fallback: 200 kg CO2 per flight
                }
            }
        }

        // Add remaining calculations
        total += yearlyGas * 2.3;    // m³ gas to CO2
        total += yearlyMeat * 3.3;   // kg meat to CO2

        res.json({ total });
    } catch (error) {
        console.error('Server error:', error.response?.data || error.message);
        res.status(500).json({ error: 'Error calculating emissions' });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});