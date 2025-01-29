const cors = require('cors');
const axios = require('axios');

// Initialize CORS middleware
const corsMiddleware = cors();

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
    // Enable CORS
    await runMiddleware(req, res, corsMiddleware);

    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { commute, transport, electric, gas, meat, flights, country } = req.body;
        const BASE_URL = 'https://www.carboninterface.com/api/v1';
        let total = 0;

        // Calculate transport emissions
        if (commute > 0 && transport !== 'bike') {
            const yearlyCommute = commute * 365;
            const transportData = {
                type: "vehicle",
                distance_unit: "km",
                distance_value: yearlyCommute,
                vehicle_model_id: "some-valid-model-id" // Replace with valid ID
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

        // Calculate other emissions...
        // (Include your existing calculations for electric, gas, meat, and flights)

        res.status(200).json({ total });
    } catch (error) {
        console.error('Server error:', error.response?.data || error.message);
        res.status(500).json({ error: 'Error calculating emissions' });
    }
};