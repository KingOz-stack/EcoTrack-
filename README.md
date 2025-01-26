# EcoTrack🌍

The **EcoTrack** is a simple web application designed to help users calculate their annual carbon footprint based on their transportation habits, dietary preferences, and recycling behavior. It provides actionable recommendations to minimize their environmental impact and visualizes their carbon emissions using customizable charts.

---

## Features

1. **Chatbot Interface**:
   - Engages users with a step-by-step Q&A to collect input on their lifestyle choices.
   - Supports transportation, dietary habits, and recycling preferences.

2. **Dynamic Chart Visualization**:
   - Displays **bar charts** and **pie charts** for users to view the results of their carbon footprint.
   - Displays data such as transportation, diet, and recycling contributions to CO2 emissions.

3. **Personalized Recommendations**:
   - Offers tips to help users reduce their carbon footprint based on their input.

4. **Modern UI Design**:
   - Includes a customizable logo and a visually appealing background with environmental themes.

---

## Technologies Used
# Eco-Track: Carbon Footprint Calculator

## Overview
A web-based calculator that helps users estimate their annual carbon footprint based on daily activities, including transportation, energy usage, and dietary choices. The application uses the Carbon Interface API for accurate emissions calculations.

## Features
- Daily commute emissions calculation
- Monthly electricity usage tracking
- Natural gas consumption analysis
- Dietary impact (meat consumption)
- Air travel emissions estimation
- Country-specific electricity emissions
- Real-time calculations using industry-standard data

## Technologies Used
### Frontend
- HTML5
- CSS3
- JavaScript
- Bootstrap (for styling)

### Backend
- Node.js
- Express.js
- Axios (for API requests)
- dotenv (for environment variables)

### External API
- Carbon Interface API

---

## Setup and Usage

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/eco-calculator.git
cd eco-calculator
```

### 2. Interact with the Eco Calculator
- Answer the chatbot's questions about your lifestyle.
- View your carbon footprint as a bar chart or pie chart.
- Get actionable insights to reduce your impact.

---

## Project Structure

```
eco-track/
│
├── public/
│   ├── index.html
│   ├── styles.css
│   ├── script.js
│   └── assets/
│       └── images/
│
├── server.js
│
├── node_modules/
│
├── .env
│
├── package.json
│
├── package-lock.json
│
└── README.md
```

---

## Customization

1. **Background Image**:
   - Replace the `background-placeholder.png` in the `#chatbot-container` CSS with your preferred image.
     
2. **Chart Colors**:
   - Modify the `backgroundColor` array in the `chartData` object in `script.js`.

---

## Usage
1. Enter your daily commute distance and mode of transport
2. Input monthly electricity consumption
3. Specify natural gas usage
4. Enter weekly meat consumption
5. Add number of monthly flights
6. Select your country
7. Click "Calculate" to see your annual carbon footprint

## API Reference
The application uses the Carbon Interface API for emissions calculations. Key endpoints:
- `/estimates` - Calculate emissions for various activities
- Vehicle emissions
- Electricity usage
- Flight emissions

## Contributing
1. Fork the repository
2. Create a new branch (`git checkout -b feature/improvement`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/improvement`)
5. Create a Pull Request

## License
This project is licensed under the MIT License - see the LICENSE.md file for details

## Acknowledgments
- Carbon Interface API for providing emissions data

## Future Improvements
- Add more transportation options
- Include renewable energy options
- Implement user accounts for tracking progress
- Add visualization of carbon footprint data
- Include tips for reducing carbon footprint
- Add comparison with average footprints by country
