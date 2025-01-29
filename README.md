# EcoTrack - Carbon Footprint Calculator

EcoTrack is a web application that helps users calculate and understand their carbon footprint. It provides personalized recommendations for reducing environmental impact based on lifestyle choices.

## Features

- **Carbon Footprint Calculation**
  - Transport emissions (daily commute)
  - Electricity usage
  - Cooking gas (LPG) consumption
  - Meat consumption
  - Flight travel

- **Interactive Visualizations**
  - Pie chart showing breakdown of emissions
  - Bar graph comparing user's footprint with country averages

- **Smart Calculations**
  - Primary calculation using Carbon Interface API
  - Fallback to reliable estimates when API is unavailable
  - Country-specific comparisons

- **Personalized Recommendations**
  - Category-specific tips for reducing emissions
  - Actionable insights based on user input
  - Interactive results display

## Technology Stack

- **Frontend**
  - HTML5
  - CSS3 (with modern animations and responsive design)
  - JavaScript (Vanilla)
  - Chart.js for visualizations

- **Backend**
  - Node.js
  - Express.js
  - Vercel Serverless Functions
  - Carbon Interface API integration

## Setup and Installation
---

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/eco-calculator.git
cd eco-calculator
```

### 2. Install dependencies:
```bash
npm install
```

### 3. Interact with the Eco Calculator
- Answer the chatbot's questions about your lifestyle.
- View your carbon footprint as a bar chart or pie chart.
- Get actionable insights to reduce your impact.

---

## Project Structure

```
eco-track/
├── api/
│ └── calculate-emissions/
│ └── index.js # Serverless API function
├── public/
│ ├── index.html # Main HTML file
│ ├── main.js # Frontend JavaScript
│ └── styles.css # Styling
├── package.json
└── .gitignore

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

## API Integration

The application uses the Carbon Interface API for precise calculations with a fallback system for reliability:

- Primary: Carbon Interface API calculations
- Fallback: Built-in emission factors
  - Transport: 0.2 kg CO2e per km
  - Electricity: 0.5 kg CO2e per kWh
  - LPG: 1.5 kg CO2e per liter
  - Meat: 2.5 kg CO2e per kg
  - Flights: 90 kg CO2e per flight

## Deployment

The application is deployed on Vercel and can be accessed at [your-deployment-url].

To deploy your own instance:

1. Fork this repository
2. Connect your fork to Vercel
3. Add your environment variables in Vercel dashboard
4. Deploy!

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Carbon Interface API for emissions data
- Chart.js for visualization capabilities
- Vercel for hosting and serverless functions

## Future Improvements

- [ ] Add more detailed transport options
- [ ] Implement user accounts for tracking progress
- [ ] Add more visualization options
- [ ] Include more country-specific data
- [ ] Add offline calculation capabilities

