const cors = require('cors');
const axios = require('axios');

// Initialize CORS middleware
const corsMiddleware = cors();
const BASE_URL = 'https://www.carboninterface.com/api/v1';

// Fallback emission factors
const EMISSION_FACTORS = {
    transport: 0.2,   // kg CO2e per km
    electricity: 0.5, // kg CO2e per kWh
    lpg: 1.5,        // kg CO2e per liter
    meat: 2.5,       // kg CO2e per kg
    flight: 90       // kg CO2e per flight
};

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

        // Log the incoming request data
        console.log('Received request body:', req.body);

        const { commute, transport, electric, gas, meat, flights, country } = req.body;
        let total = 0;
        let breakdown = {};
        let usingFallback = false;

        try {
            // Try API calculations first
            if (process.env.CARBON_INTERFACE_API_KEY) {
                console.log('Attempting API calculations...');
                
                // Transport emissions
                if (commute > 0 && transport !== 'bike') {
                    try {
                        const response = await axios.post(
                            `${BASE_URL}/estimates`,
                            {
                                type: "vehicle",
                                distance_unit: "km",
                                distance_value: commute * 365,
                                vehicle_model_id: "7268a9b7-17e8-4c8d-acca-57059252afe9"
                            },
                            {
                                headers: {
                                    'Authorization': `Bearer ${process.env.CARBON_INTERFACE_API_KEY}`,
                                    'Content-Type': 'application/json'
                                }
                            }
                        );
                        breakdown.transport = response.data.data.attributes.carbon_kg;
                        total += breakdown.transport;
                    } catch (error) {
                        console.log('Falling back to transport estimates...');
                        usingFallback = true;
                        breakdown.transport = commute * 365 * EMISSION_FACTORS.transport;
                        total += breakdown.transport;
                    }
                }

                // 2. Electricity emissions calculation
                if (electric > 0) {
                    try {
                        const response = await axios.post(
                            `${BASE_URL}/estimates`,
                            {
                                type: "electricity",
                                electricity_unit: "kwh",
                                electricity_value: electric * 12,
                                country: country.toLowerCase()
                            },
                            {
                                headers: {
                                    'Authorization': `Bearer ${process.env.CARBON_INTERFACE_API_KEY}`,
                                    'Content-Type': 'application/json'
                                }
                            }
                        );
                        breakdown.electricity = response.data.data.attributes.carbon_kg;
                        total += breakdown.electricity;
                    } catch (error) {
                        console.log('Falling back to electricity estimates...');
                        usingFallback = true;
                        breakdown.electricity = electric * 12 * EMISSION_FACTORS.electricity;
                        total += breakdown.electricity;
                    }
                }

                // 3. Flight emissions calculation
                if (flights > 0) {
                    try {
                        const response = await axios.post(
                            `${BASE_URL}/estimates`,
                            {
                                type: "flight",
                                passengers: 1,
                                legs: [{
                                    departure_airport: "SFO",
                                    destination_airport: "LAX" // Using average domestic flight as baseline
                                }],
                                distance_unit: "km"
                            },
                            {
                                headers: {
                                    'Authorization': `Bearer ${process.env.CARBON_INTERFACE_API_KEY}`,
                                    'Content-Type': 'application/json'
                                }
                            }
                        );
                        breakdown.flights = response.data.data.attributes.carbon_kg;
                        total += breakdown.flights;
                    } catch (error) {
                        console.log('Falling back to flight estimates...');
                        usingFallback = true;
                        breakdown.flights = flights * EMISSION_FACTORS.flight;
                        total += breakdown.flights;
                    }
                }

                // 4. Cooking gas (LPG) emissions calculation
                if (gas > 0) {
                    try {
                        const response = await axios.post(
                            `${BASE_URL}/estimates`,
                            {
                                type: "fuel_combustion",
                                fuel_source_type: "lpg", // Changed to LPG
                                fuel_source_unit: "l",   // Changed to liters
                                fuel_source_value: gas * 12 // Monthly to yearly
                            },
                            {
                                headers: {
                                    'Authorization': `Bearer ${process.env.CARBON_INTERFACE_API_KEY}`,
                                    'Content-Type': 'application/json'
                                }
                            }
                        );
                        breakdown.gas = response.data.data.attributes.carbon_kg;
                        total += breakdown.gas;
                    } catch (error) {
                        console.log('Falling back to gas estimates...');
                        usingFallback = true;
                        breakdown.gas = gas * 12 * EMISSION_FACTORS.lpg;
                        total += breakdown.gas;
                    }
                }

            } else {
                throw new Error('API key not configured');
            }

        } catch (apiError) {
            console.log('API calculation failed, using estimates...', apiError.message);
            usingFallback = true;
            
            // Fallback calculations
            if (commute > 0 && transport !== 'bike') {
                breakdown.transport = commute * 365 * EMISSION_FACTORS.transport;
                total += breakdown.transport;
            }

            if (electric > 0) {
                breakdown.electricity = electric * 12 * EMISSION_FACTORS.electricity;
                total += breakdown.electricity;
            }

            if (gas > 0) {
                breakdown.gas = gas * 12 * EMISSION_FACTORS.lpg;
                total += breakdown.gas;
            }

            if (meat > 0) {
                breakdown.meat = meat * 52 * EMISSION_FACTORS.meat;
                total += breakdown.meat;
            }

            if (flights > 0) {
                breakdown.flights = flights * EMISSION_FACTORS.flight;
                total += breakdown.flights;
            }
        }

        // Add meat consumption (using EPA data as API doesn't cover food)
        if (meat > 0) {
            const yearlyMeat = meat * 52;
            breakdown.food = yearlyMeat * EMISSION_FACTORS.meat;
            total += breakdown.food;
        }

        return res.status(200).json({
            success: true,
            total: total,
            breakdown: breakdown,
            calculationType: usingFallback ? 'estimate' : 'api',
            message: usingFallback ? 
                'Using estimated calculations due to API unavailability' : 
                'Using precise API calculations'
        });

    } catch (error) {
        console.error('Server error:', error.response?.data || error.message);
        return res.status(500).json({
            success: false,
            error: 'Error calculating emissions',
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};