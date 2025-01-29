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
    const resultsDiv = document.getElementById('results-output');
    
    // Country averages data
    const countryAverages = {
        'united states': 16500,
        'canada': 15500,
        'united kingdom': 10500,
        'australia': 17000,
        'germany': 11000,
        'france': 9000,
        'japan': 10500,
        'global': 12000
    };

    // Tips based on categories
    const tips = {
        transport: [
            "Consider using public transportation or carpooling",
            "Switch to an electric or hybrid vehicle",
            "Maintain your vehicle properly for better efficiency"
        ],
        energy: [
            "Install LED light bulbs",
            "Use energy-efficient appliances",
            "Improve home insulation"
        ],
        food: [
            "Reduce meat consumption",
            "Buy local and seasonal produce",
            "Minimize food waste"
        ],
        general: [
            "Plant trees or support reforestation projects",
            "Use renewable energy sources",
            "Reduce, reuse, and recycle"
        ]
    };

    submitButton.addEventListener('click', function(event) {
        event.preventDefault();
        
        // Get all the input values
        const commuteDistance = parseFloat(document.getElementById('commute-input').value) || 0;
        const transportMethod = document.getElementById('transport-input').value;
        const electricUsage = parseFloat(document.getElementById('electric-input').value) || 0;
        const gasUsage = parseFloat(document.getElementById('gas-input').value) || 0;
        const meatConsumption = parseFloat(document.getElementById('meat-input').value) || 0;
        const flights = parseFloat(document.getElementById('flight-input').value) || 0;
        
        // Show loading state
        resultsDiv.innerHTML = '<p>Calculating...</p>';
        resultsDiv.classList.remove('hidden');
        
        // API call to backend
        fetch('/api/calculate-emissions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                commute: commuteDistance,
                transport: transportMethod,
                electric: electricUsage,
                gas: gasUsage,
                meat: meatConsumption,
                flights: flights,
                country: document.getElementById('country-input').value
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Calculated footprint:', data.total);
            if (data.total !== undefined) {
                displayResults(data.total);
            } else {
                throw new Error('Invalid response format');
            }
        })
        .catch(error => {
            console.error('Error calculating footprint:', error);
            displayError(error);
        });
    });

    function displayResults(footprint) {
        resultsDiv.classList.remove('hidden');
        const selectedCountry = document.getElementById('country-input').value;
        const countryAverage = countryAverages[selectedCountry.toLowerCase()] || countryAverages['global'];
        
        const formattedFootprint = parseFloat(footprint).toFixed(2);
        const formattedAverage = parseFloat(countryAverage).toFixed(2);
        const percentage = ((footprint - countryAverage) / countryAverage * 100).toFixed(1);
        
        let comparisonText = '';
        if (footprint > countryAverage) {
            comparisonText = `This is ${percentage}% higher than`;
        } else {
            comparisonText = `This is ${Math.abs(percentage)}% lower than`;
        }
        
        // Create the results HTML with visualizations and tips
        let resultsHTML = `
            <h2>Your Carbon Footprint Results</h2>
            <p>Your annual carbon footprint is <strong>${formattedFootprint}</strong> kg CO2e.</p>
            <p>${comparisonText} the average in ${selectedCountry} (${formattedAverage} kg CO2e).</p>
            
            <div class="visualization">
                <h3>Comparison Visualization</h3>
                <div class="bar-chart">
                    <div class="bar your-footprint" style="width: ${(footprint/20000)*100}%;">
                        <span>Your Footprint: ${formattedFootprint}</span>
                    </div>
                    <div class="bar country-average" style="width: ${(countryAverage/20000)*100}%;">
                        <span>Country Average: ${formattedAverage}</span>
                    </div>
                </div>
            </div>

            <div class="recommendations">
                <h3>Recommended Actions to Reduce Your Footprint</h3>
                <div class="tips-container">
        `;

        // Add category-specific tips
        Object.keys(tips).forEach(category => {
            resultsHTML += `
                <div class="tip-category">
                    <h4>${category.charAt(0).toUpperCase() + category.slice(1)}</h4>
                    <ul>
                        ${tips[category].map(tip => `<li>${tip}</li>`).join('')}
                    </ul>
                </div>
            `;
        });

        resultsHTML += `
                </div>
            </div>
        `;

        resultsDiv.innerHTML = resultsHTML;

        // Add CSS classes for animations
        setTimeout(() => {
            document.querySelectorAll('.bar').forEach(bar => {
                bar.classList.add('animate');
            });
        }, 100);
    }

    function displayError(error) {
        resultsDiv.classList.remove('hidden');
        resultsDiv.innerHTML = `
            <h2>Error Calculating Footprint</h2>
            <p>${error.message}</p>
        `;
    }
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
            body: JSON.stringify({
                commute: commuteDistance,
                transport: transportMethod,
                electric: electricUsage,
                gas: gasUsage,
                meat: meatConsumption,
                flights: flights,
                country: document.getElementById('country-input').value
            })
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

function sanitizeHTML(str) {
    var temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
}

function displayResults(footprint) {
    if (typeof footprint !== 'number') {
        console.error('Invalid footprint value:', footprint);
        displayError(new Error('Invalid calculation result'));
        return;
    }

    const resultsDiv = document.getElementById('results-output');
    const selectedCountry = document.getElementById('country-input').value;
    const countryAverage = countryAverages[selectedCountry.toLowerCase()] || countryAverages['global'];
    
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


