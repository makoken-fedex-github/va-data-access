const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Hello, world!');
});

app.get('/pickup', (req, res) => {
  const result = {
    accountType: "individual", // options: ["individual", "business"]
    coffee_price_value: 2.55,
    isLoggedIn: true, // boolean
    returnCode: 0,
    shipmentType: "international", // eligible for pickup: ["domestic", "return", "international"]. uneligible: ["freight", "dangerous"]
    shipmentPostalCode: "1000AA", // options: Dutch zip codes (regex: ^\d{4}[A-Za-z]{2}$ )
  };
  res.setHeader('Content-Type', 'application/json');
  res.json(result);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});
