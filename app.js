const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Hello, world!');
});

app.get('/pickup', (req, res) => {
  const result = {
    accountType: "business",
    coffee_price_value: 2.55,
    isLoggedIn: true,
    returnCode: 0,
    shipmentType: "international", // eligible: domestic, return, non-eligible: freight, dangerous
    shipmentPostalCode: "90210", // US postal codes are accepted (regex)
  };
  res.setHeader('Content-Type', 'application/json');
  res.json(result);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});
