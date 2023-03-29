var nodemailer = require('nodemailer');


const express = require('express');
const app = express();

function sendEmail(subject, body) {
  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'va.nuance.email.sender@gmail.com',
      pass: process.env.email_password
    }
  });

  var mailOptions = {
    from: 'va.nuance.email.sender@gmail.com',
    to: 'bfb0a43e.myfedex.onmicrosoft.com@amer.teams.ms',
    subject: subject,
    text: body
  };
  console.log("sending email via gmail user email is va.nuance.email.sender@gmail.com and password is "+process.env.email_password);
  console.log("email dump"+JSON.stringify(mailOptions));
  // transporter.sendMail(mailOptions, function (error, info) {
  //   if (error) {
  //     console.log(error);
  //   } else {
  //     console.log('Email sent: ' + info.response);
  //   }
  // });
}

app.use(express.json());
app.get('/', (req, res) => {
  res.send('Hello, world!');
});

app.get('/pickup', (req, res) => {

  let cookies = req.headers.cookie ? req.headers.cookie.substring(0, 20) : "No cookies present";
  let result = {
    accountType: "individual", // options: ["individual", "business"]
    isLoggedIn: true, // boolean
    returnCode: 0,
    shipmentPostalCode: "1000AA", // options: Dutch zip codes (regex: ^\d{4}[A-Za-z]{2}$ )
    shipmentType: "international", // eligible for pickup: ["domestic", "return", "international"]. uneligible: ["freight", "dangerous"]
    cookies: cookies // cookies object or "No cookies present"
  };
  res.setHeader('Content-Type', 'application/json');
  res.json(result);
});
/*
* new property in result object called actionRecommendation with default value "VA"
* new property in result object called isLoggedIn with default value false
* if the tracking_number starts with "100", then set result.shipmentType to domestic and result.shipmentPostalCode to "3012AM"
* if the tracking_number starts with "200", then set result.shipmentType to international and result.shipmentPostalCode to "2132LS"
* if the tracking_number starts with "900", then set result.shipmentType to dangerous and set result.actionRecommendation to "HumanOperator"
* if fdx_login contains a value and starts with "ssodrt-" then set result.isLoggedIn to true and introduce a new complex object type under result object called userDetails. Set result.userDetails.firstName to "John" and result.userDetails.lastName to "Doe". 
*/
app.post('/pickup', (req, res) => {
  const { tracking_number, fdx_login, from_address, to_address, weight } = req.body;
  let result = {
    accountType: 'individual',
    isLoggedIn: false,
    returnCode: 0,
    shipmentPostalCode: '1000AA',
    shipmentType: 'international',
    actionRecommendation: 'VA'
  };

  if (tracking_number) {
    if (tracking_number.startsWith('100')) {
      result.shipmentType = 'domestic';
      result.shipmentPostalCode = '3012AM';
    } else if (tracking_number.startsWith('200')) {
      result.shipmentType = 'international';
      result.shipmentPostalCode = '2132LS';
    } else if (tracking_number.startsWith('900')) {
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


  if (to_address) {
    result.to_address_verify = to_address + "--received";
  }

  if (weight) {
    result.weight_verify = weight + "--received";
  }
  if (from_address) {
    result.from_address_verify = from_address + "--received";
    console.log("sending email... from address is set. "+ from_address);
    
    sendEmail("Nuance Mix - Schedule Pickup", "response data is "+JSON.stringify(result));
  }

  res.setHeader('Content-Type', 'application/json');
  res.json(result);
});

app.post('/login', (req, res) => {
  const { fdx_login } = req.body;
  let result = {
    isLoggedIn: false,
    returnCode: 0,
  };

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


