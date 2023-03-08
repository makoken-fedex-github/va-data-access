const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Hello, world!');
});

app.get('/pickup', (req, res) => {
  const result = {
    returnCode: 0,
    coffee_price_value: 2.55,
    shipmentType: "international",
    shipmentPostalCode: "1112 XR"
  };
  res.setHeader('Content-Type', 'application/json');
  res.json(result);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});
