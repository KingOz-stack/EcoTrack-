// Replace with your actual API key
const API_KEY = 'API_KEY'; 

const state = {
    milesDriven: null,
    energyUsed: null,
    diet: null,
    step: 0, // Keeps track of the step in the conversation
};

document.getElementById('send-btn').addEventListener('click', function () {
    const userInput = document.getElementById('user-input').value.trim();
    if (userInput !== "") {
        addMessage(userInput, 'user');
        processUserInput(userInput);
        document.getElementById('user-input').value = "";
    }
});

document.getElementById('user-input').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        document.getElementById('send-btn').click();
    }
});

// Function to add messages to the chat
function addMessage(message, sender) {
    const chatBox = document.getElementById('chat-box');
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('chat-message', sender);
    messageDiv.textContent = message;
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight; // Scroll to the latest message
}

// Function to process the user's input and calculate carbon footprint
function processUserInput(input) {
    const chatBox = document.getElementById('chat-box');
    input = input.toLowerCase();

    switch (state.step) {
        case 0: // Starting the interaction
            if (input.includes('carbon footprint') || input.includes('calculate')) {
                addMessage("Sure! Let's calculate your carbon footprint. Please answer a few questions.", 'chatbot');
                state.step = 1;
                askMilesDriven();
            } else {
                addMessage("Sorry, I didn't understand that. Try asking about your carbon footprint.", 'chatbot');
            }
            break;

        case 1: // Asking about miles driven
            let miles = parseInt(input);
            if (isNaN(miles) || miles <= 0) {
                addMessage("Please provide a valid number for miles driven per week.", 'chatbot');
                break;
            }
            state.milesDriven = miles;
            addMessage(`Got it! You drive ${miles} miles per week.`, 'chatbot');
            state.step = 2;
            askEnergyUsage();
            break;

        case 2: // Asking about home energy usage
            let energy = parseInt(input);
            if (isNaN(energy) || energy <= 0) {
                addMessage("Please provide a valid number for your monthly energy usage in kWh.", 'chatbot');
                break;
            }
            state.energyUsed = energy;
            addMessage(`Got it! You use ${energy} kWh of electricity each month.`, 'chatbot');
            state.step = 3;
            askDiet();
            break;

        case 3: // Asking about diet
            if (input.includes("vegetarian")) {
                state.diet = "vegetarian";
                addMessage("Thanks! We'll consider your diet as vegetarian.", 'chatbot');
            } else if (input.includes("meat")) {
                state.diet = "meat";
                addMessage("Thanks! We'll consider your diet as meat-heavy.", 'chatbot');
            } else {
                addMessage("I didn't quite catch that. Are you vegetarian or do you eat meat?", 'chatbot');
                return;
            }
            state.step = 4;
            fetchCarbonData();
            break;

        default:
            addMessage("Sorry, something went wrong. Please try again.", 'chatbot');
            break;
    }
}

// Function to ask questions for carbon footprint calculation
function askMilesDriven() {
    setTimeout(() => {
        addMessage("How many miles do you drive per week?", 'chatbot');
    }, 1000);
}

function askEnergyUsage() {
    setTimeout(() => {
        addMessage("How many kilowatt-hours (kWh) of electricity do you use per month?", 'chatbot');
    }, 1000);
}

function askDiet() {
    setTimeout(() => {
        addMessage("What is your diet like? Are you vegetarian or do you eat meat?", 'chatbot');
    }, 1000);
}

// Function to fetch carbon footprint data from an API
async function fetchCarbonData() {
    try {
        // Assuming a placeholder URL for the API endpoint (you should replace it with the actual API endpoint)
        const apiUrl = `https://climatiq.io/?=${state.milesDriven}&energy=${state.energyUsed}&diet=${state.diet}&key=${API_KEY}`;

        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.success) {
            // Assuming the API returns data like this
            const { carbonFromDriving, carbonFromEnergy, carbonFromDiet, totalCarbonFootprint } = data;

            addMessage(`Your estimated carbon footprint is:`, 'chatbot');
            addMessage(`- From driving: ${carbonFromDriving} kg CO2/week`, 'chatbot');
            addMessage(`- From home energy: ${carbonFromEnergy} kg CO2/day`, 'chatbot');
            addMessage(`- From your diet: ${carbonFromDiet} kg CO2/year`, 'chatbot');
            addMessage(`Total estimated carbon footprint: ${totalCarbonFootprint} kg CO2`, 'chatbot');
        } else {
            addMessage("Sorry, I couldn't calculate your carbon footprint. Please try again later.", 'chatbot');
        }
    } catch (error) {
        addMessage("There was an error with the API request. Please try again.", 'chatbot');
    }
}
