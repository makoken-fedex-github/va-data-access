const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Hello, world!');
});

app.get('/pickup', (req, res) => {
  
  let result = {
    accountType: "individual", // options: ["individual", "business"]
    isLoggedIn: true, // boolean
    returnCode: 0,
    shipmentPostalCode: "1000AA", // options: Dutch zip codes (regex: ^\d{4}[A-Za-z]{2}$ )
    shipmentType: "international", // eligible for pickup: ["domestic", "return", "international"]. uneligible: ["freight", "dangerous"]
  };
  res.setHeader('Content-Type', 'application/json');
  res.json(result);
});

app.post('/pickup', (req, res) => {
  const { trackingNumber } = req.body;
  let result = {
    accountType: 'individual',
    isLoggedIn: true,
    returnCode: 0,
    shipmentPostalCode: '1000AA',
    shipmentType: 'international',
  };
  if (trackingNumber && trackingNumber.startsWith('111')) {
    result.shipmentPostalCode = '2000AB';
  }
  res.setHeader('Content-Type', 'application/json');
  res.json(result);
});



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});
