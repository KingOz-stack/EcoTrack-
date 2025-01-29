const cors = require('cors');
const axios = require('axios');

// Initialize CORS middleware
const corsMiddleware = cors();
const BASE_URL = 'https://www.carboninterface.com/api/v1';

// Helper function to wrap middleware
const runMiddleware = (req, res, fn) => {
    return new Promise((resolve, reject) => {
        fn(req, res, (result) => {
            if (result instanceof Error) {
                return reject(result);
            }
            return resolve(result);
        });
    });
};

module.exports = async (req, res) => {
    try {
        // Enable CORS
        await runMiddleware(req, res, corsMiddleware);

        // Only allow POST requests
        if (req.method !== 'POST') {
            return res.status(405).json({ error: 'Method not allowed' });
        }

        const { commute, transport, electric, gas, meat, flights, country } = req.body;
        let total = 0;

        // Array to hold all API requests
        const apiRequests = [];

        // 1. Transport emissions calculation
        if (commute > 0 && transport !== 'bike') {
            apiRequests.push(
                axios.post(`${BASE_URL}/estimates`, {
                    type: "vehicle",
                    distance_unit: "km",
                    distance_value: commute * 365,
                    vehicle_model_id: "7268a9b7-17e8-4c8d-acca-57059252afe9" // Generic car model
                }, {
                    headers: {
                        'Authorization': `Bearer ${process.env.CARBON_INTERFACE_API_KEY}`,
                        'Content-Type': 'application/json'
                    }
                })
            );
        }

        // 2. Electricity emissions calculation
        if (electric > 0) {
            apiRequests.push(
                axios.post(`${BASE_URL}/estimates`, {
                    type: "electricity",
                    electricity_unit: "kwh",
                    electricity_value: electric * 12,
                    country: country.toLowerCase()
                }, {
                    headers: {
                        'Authorization': `Bearer ${process.env.CARBON_INTERFACE_API_KEY}`,
                        'Content-Type': 'application/json'
                    }
                })
            );
        }

        // 3. Flight emissions calculation
        if (flights > 0) {
            apiRequests.push(
                axios.post(`${BASE_URL}/estimates`, {
                    type: "flight",
                    passengers: 1,
                    legs: [{
                        departure_airport: "SFO",
                        destination_airport: "LAX" // Using average domestic flight as baseline
                    }],
                    distance_unit: "km"
                }, {
                    headers: {
                        'Authorization': `Bearer ${process.env.CARBON_INTERFACE_API_KEY}`,
                        'Content-Type': 'application/json'
                    }
                })
            );
        }

        // 4. Natural gas emissions calculation
        if (gas > 0) {
            apiRequests.push(
                axios.post(`${BASE_URL}/estimates`, {
                    type: "fuel_combustion",
                    fuel_source_type: "ng",
                    fuel_source_unit: "ft3",
                    fuel_source_value: gas * 12
                }, {
                    headers: {
                        'Authorization': `Bearer ${process.env.CARBON_INTERFACE_API_KEY}`,
                        'Content-Type': 'application/json'
                    }
                })
            );
        }

        // Execute all API requests
        const results = await Promise.all(apiRequests);

        // Sum up all emissions
        results.forEach(response => {
            if (response.data && response.data.data.attributes.carbon_kg) {
                total += response.data.data.attributes.carbon_kg;
            }
        });

        // Add meat consumption (using EPA data as API doesn't cover food)
        if (meat > 0) {
            const yearlyMeat = meat * 52;
            total += yearlyMeat * 2.5; // EPA estimate for meat carbon intensity
        }

        // Return total emissions with breakdown
        return res.status(200).json({
            success: true,
            total: total,
            breakdown: {
                transport: results[0]?.data.data.attributes.carbon_kg || 0,
                electricity: results[1]?.data.data.attributes.carbon_kg || 0,
                flights: results[2]?.data.data.attributes.carbon_kg || 0,
                gas: results[3]?.data.data.attributes.carbon_kg || 0,
                food: meat > 0 ? meat * 52 * 2.5 : 0
            }
        });

    } catch (error) {
        console.error('Server error:', error.response?.data || error.message);
        return res.status(500).json({
            success: false,
            error: 'Error calculating emissions',
            details: error.message
        });
    }
};