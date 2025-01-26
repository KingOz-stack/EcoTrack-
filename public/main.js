// Define transportEmissions globally
const transportEmissions = {
    car: 0.2,
    bus: 0.1,
    train: 0.05,
    bike: 0
};

// Add country averages (in kg CO2e per year)
const countryAverages = {
    'global': 4000,
    'us': 16000,
    'uk': 10000,
    'canada': 15500,
    'australia': 17000,
    'germany': 9700,
    'france': 5100,
    'china': 7200,
    'india': 1900,
    'japan': 9000
};

document.addEventListener('DOMContentLoaded', function() {
    const footprintForm = document.getElementById('footprint-form');
    const submitButton = footprintForm.querySelector('button[type="submit"]');
    
    submitButton.addEventListener('click', function(event) {
        event.preventDefault();
        
        // Get all the input values
        const commuteDistance = parseFloat(document.getElementById('commute-input').value) || 0;
        const transportMethod = document.getElementById('transport-input').value;
        const electricUsage = parseFloat(document.getElementById('electric-input').value) || 0;
        const gasUsage = parseFloat(document.getElementById('gas-input').value) || 0;
        const meatConsumption = parseFloat(document.getElementById('meat-input').value) || 0;
        const flights = parseFloat(document.getElementById('flight-input').value) || 0;
        
        console.log('Calculating footprint with values:', {
            commuteDistance,
            transportMethod,
            electricUsage,
            gasUsage,
            meatConsumption,
            flights
        });
        
        calculateFootprint(event)
            .then(footprint => {
                console.log('Calculated footprint:', footprint);
                displayResults(footprint);
            })
            .catch(error => {
                console.error('Error calculating footprint:', error);
                displayError(error);
            });
        return false;
    });
});

async function calculateFootprint(event) {
    event.preventDefault();
    console.log('Form submitted'); // Debug log
    
    const formData = {
        commute: parseFloat(document.getElementById('commute').value) || 0,
        transport: document.getElementById('transport').value,
        electric: parseFloat(document.getElementById('electric').value) || 0,
        gas: parseFloat(document.getElementById('gas').value) || 0,
        meat: parseFloat(document.getElementById('meat').value) || 0,
        flights: parseFloat(document.getElementById('flights').value) || 0,
        country: document.getElementById('country').value
    };

    console.log('Form data:', formData); // Debug log

    try {
        console.log('Sending request to API...'); // Debug log
        const response = await fetch('/api/calculate-emissions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        console.log('Response status:', response.status); // Debug log

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error:', errorText); // Debug log
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('API Response:', data); // Debug log
        
        if (data.total) {
            document.getElementById('result').textContent = 
                `Your annual carbon footprint is approximately ${data.total.toFixed(2)} kg CO2e`;
        } else {
            document.getElementById('result').textContent = 
                'Error calculating carbon footprint';
        }
    } catch (error) {
        console.error('Error details:', error); // Debug log
        document.getElementById('result').textContent = 
            'Error calculating carbon footprint';
    }
}

function displayResults(footprint) {
    const resultsDiv = document.getElementById('results-output');
    resultsDiv.classList.remove('hidden');
    
    // Get selected country's average
    const selectedCountry = document.getElementById('country-input').value;
    const countryAverage = countryAverages[selectedCountry];
    
    // Calculate individual emissions
    const transport = document.getElementById('transport-input').value;
    const commuteEmissions = parseFloat(document.getElementById('commute-input').value) * 
        (transportEmissions[transport] * 365);
    const electricEmissions = parseFloat(document.getElementById('electric-input').value) * 0.5;
    const gasEmissions = parseFloat(document.getElementById('gas-input').value) * 2.3;
    const meatEmissions = parseFloat(document.getElementById('meat-input').value) * 3.3 * 52;
    const flightEmissions = parseFloat(document.getElementById('flight-input').value) * 200;

    // Create container for charts
    resultsDiv.innerHTML = `
        <h2>Your Carbon Footprint Results</h2>
        <div class="charts-container" style="display: flex; justify-content: space-between;">
            <div style="width: 45%;">
                <canvas id="footprint-pie-chart"></canvas>
            </div>
            <div style="width: 45%;">
                <canvas id="footprint-bar-chart"></canvas>
            </div>
        </div>
        <div id="recommendations-output"></div>
    `;

    // Create pie chart with country comparison
    const ctxPie = document.getElementById('footprint-pie-chart').getContext('2d');
    if (window.footprintPieChart) {
        window.footprintPieChart.destroy();
    }
    
    window.footprintPieChart = new Chart(ctxPie, {
        type: 'pie',
        data: {
            labels: ['Your Footprint', `${selectedCountry.toUpperCase()} Average`],
            datasets: [{
                data: [footprint, countryAverage],
                backgroundColor: ['#36A2EB', '#FF6384']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Your Footprint vs Country Average'
                }
            }
        }
    });

    // Create bar chart
    const ctxBar = document.getElementById('footprint-bar-chart').getContext('2d');
    if (window.footprintBarChart) {
        window.footprintBarChart.destroy();
    }

    window.footprintBarChart = new Chart(ctxBar, {
        type: 'bar',
        data: {
            labels: ['Transport', 'Electricity', 'Gas', 'Meat', 'Flights'],
            datasets: [{
                label: 'Emissions (kg CO2e)',
                data: [
                    commuteEmissions,
                    electricEmissions,
                    gasEmissions,
                    meatEmissions,
                    flightEmissions
                ],
                backgroundColor: [
                    '#FF9F40',
                    '#36A2EB',
                    '#FF6384',
                    '#4BC0C0',
                    '#9966FF'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Breakdown by Category'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'kg CO2e per year'
                    }
                }
            }
        }
    });

    // Update recommendations based on comparison
    const recommendationsDiv = document.getElementById('recommendations-output');
    const comparisonText = footprint > countryAverage 
        ? `Your footprint is ${((footprint/countryAverage - 1) * 100).toFixed(1)}% higher than the ${selectedCountry.toUpperCase()} average.`
        : `Your footprint is ${((1 - footprint/countryAverage) * 100).toFixed(1)}% lower than the ${selectedCountry.toUpperCase()} average.`;

    recommendationsDiv.innerHTML = `
        <h3>Your carbon footprint is ${footprint.toFixed(2)} kg CO2e per year</h3>
        <p>${comparisonText}</p>
        <p>Here are some recommendations to reduce your footprint:</p>
        <ul>
            <li>Consider using more public transportation</li>
            <li>Reduce meat consumption</li>
            <li>Improve home energy efficiency</li>
            ${footprint > countryAverage ? `<li>Look for ways to bring your emissions closer to the national average</li>` : ''}
        </ul>
    `;
}

function displayError(error) {
    const resultsDiv = document.getElementById('results-output');
    resultsDiv.classList.add('hidden');
    
    resultsDiv.innerHTML = `
        <h2>Error Calculating Footprint</h2>
        <p>${error.message}</p>
    `;
}

const axios = require('axios');

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    // Handle OPTIONS request
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { commute, transport, electric, gas, meat, flights, country } = req.body;
        let total = 0;

        console.log('Received data:', { commute, transport, electric, gas, meat, flights, country });

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
                    'https://www.carboninterface.com/api/v1/estimates',
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
                total += yearlyCommute * 0.2;
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
                    'https://www.carboninterface.com/api/v1/estimates',
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
                total += yearlyElectric * 0.5;
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
                    'https://www.carboninterface.com/api/v1/estimates',
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
                total += yearlyFlights * 200;
            }
        }

        // Calculate gas emissions (monthly → yearly)
        if (gas > 0) {
            const yearlyGas = gas * 12;
            total += yearlyGas * 2.3;
        }

        // Calculate meat emissions (weekly → yearly)
        if (meat > 0) {
            const yearlyMeat = meat * 52;
            total += yearlyMeat * 3.3;
        }

        console.log('Calculated total:', total);
        return res.status(200).json({ total });
    } catch (error) {
        console.error('Server error:', error);
        return res.status(500).json({ error: 'Failed to calculate emissions' });
    }
}