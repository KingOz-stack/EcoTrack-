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
    try {
        // Enable CORS
        await runMiddleware(req, res, corsMiddleware);

        // Only allow POST requests
        if (req.method !== 'POST') {
            return res.status(405).json({ error: 'Method not allowed' });
        }

        const { commute, transport, electric, gas, meat, flights, country } = req.body;
        let total = 0;

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

        // Calculate transport emissions (simplified for testing)
        if (commute > 0 && transport !== 'bike') {
            const yearlyCommute = commute * 365;
            total += yearlyCommute * 0.2; // Simplified calculation
        }

        // Calculate electricity emissions (simplified)
        if (electric > 0) {
            const yearlyElectric = electric * 12;
            total += yearlyElectric * 0.5; // Simplified calculation
        }

        // Calculate flight emissions (simplified)
        if (flights > 0) {
            const yearlyFlights = flights * 12;
            total += yearlyFlights * 90; // Simplified calculation
        }

        // Return the total with proper structure
        return res.status(200).json({ 
            success: true,
            total: total
        });

    } catch (error) {
        console.error('Server error:', error);
        return res.status(500).json({ 
            success: false,
            error: 'Error calculating emissions',
            details: error.message
        });
    }
};