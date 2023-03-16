const express = require('express');
const app = express();
app.use(express.json());
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
/*
* new property in result object called actionRecommendation with default value "VA"
* new property in result object called isLoggedIn with default value false
* if the trackingNumber starts with "100", then set result.shipmentType to domestic and result.shipmentPostalCode to "3012AM"
* if the trackingNumber starts with "200", then set result.shipmentType to international and result.shipmentPostalCode to "2132LS"
* if the trackingNumber starts with "900", then set result.shipmentType to dangerous and set result.actionRecommendation to "HumanOperator"
* if fdx_login contains a value and starts with "ssodrt-" then set result.isLoggedIn to true and introduce a new complex object type under result object called userDetails. Set result.userDetails.firstName to "John" and result.userDetails.lastName to "Doe". 
*/
app.post('/pickup', (req, res) => {
    const { trackingNumber, fdx_login } = req.body;
    let result = {
      accountType: 'individual',
      isLoggedIn: false,
      returnCode: 0,
      shipmentPostalCode: '1000AA',
      shipmentType: 'international',
      actionRecommendation: 'VA'
    };
    
    if (trackingNumber) {
      if (trackingNumber.startsWith('100')) {
        result.shipmentType = 'domestic';
        result.shipmentPostalCode = '3012AM';
      } else if (trackingNumber.startsWith('200')) {
        result.shipmentType = 'international';
        result.shipmentPostalCode = '2132LS';
      } else if (trackingNumber.startsWith('900')) {
        result.shipmentType = 'dangerous';
        result.actionRecommendation = 'HumanOperator';
      }
    }
  
    if (fdx_login && fdx_login.startsWith('ssodrt-')) {
      result.isLoggedIn = true;
      result.userDetails = {
        firstName: 'John',
        lastName: 'Doe'
      };
    }
  
    res.setHeader('Content-Type', 'application/json');
    res.json(result);
  });
  



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});


