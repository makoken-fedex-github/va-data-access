
var nodemailer = require('nodemailer');
const axios = require('axios');
const Sib = require('sib-api-v3-sdk')
const client = Sib.ApiClient.instanceconst 
apiKey = client.authentications['api-key']
apiKey.apiKey = process.env.API_KEY
const express = require('express');
const app = express();
function sendTeamsNotification(subject,body){
  try{
      // Replace <webhook-url> with the actual webhook URL provided by Teams
    const webhookUrl = 'https://myfedex.webhook.office.com/webhookb2/9955e2de-3d21-437c-99c7-0b15657457c1@b945c813-dce6-41f8-8457-5a12c2fe15bf/IncomingWebhook/ad3b52249e764827952bd8281193b6ce/50fe584c-09e5-4b10-b92b-ff8d56c63bcd';
    // Define the message payload
    const payload = {
      "@type": "MessageCard",
      "@context": "http://schema.org/extensions",
      "themeColor": "0072C6",
      "title": "Your Pickup is confirmed",
      "text":"Your Pickup is confirmed",
      "summary": "Your pickup is confirmed for your package.",
      "sections": [
        {
          "activityTitle": "Pickup Confirmation",
          "activitySubtitle": "Sent by DCC - FedEx",
          "activityImage": "https://www.fedex.com/content/dam/fedex-com/logos/logo.png"
        }
      ]
    };
    // Send a POST request to the webhook URL with the message payload
    axios.post(webhookUrl, payload)
      .then(response => {
        console.log('Message sent:', response.data);
      })
      .catch(error => {
        console.error('Error sending message:', error);
      });
  }catch(ex){
    console.error("something went wrong when sending teams notifications..."+ex.message);
  }
}
function sendNotificationEmail(subject,body){
  try {
  const client = Sib.ApiClient.instance
  const apiKey = client.authentications['api-key']
  apiKey.apiKey = process.env.API_KEY
  const tranEmailApi = new Sib.TransactionalEmailsApi()
  const sender = {
      email: 'makoken.parkmobile@gmail.com',
      name: 'Test Email',
  }
  const receivers = [
      {
          email: 'ali.koeken.osv@fedex.com,makoken+va+notification@gmail.com',
      },
  ]
  tranEmailApi
      .sendTransacEmail({
          sender,
          to: receivers,
          subject: subject,
          textContent: body
      })
      .then(console.log)
      .catch(console.log)
  } catch (error) {
    console.error("something went wrong when sending email notifications..."+ex.message);
  }
}
/**
 * GENERATE SHIPMENT NUMBER
 */
function generateShipmentNumber() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let shipmentNumber = '';
  for (let i = 0; i < 16; i++) {
    shipmentNumber += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return shipmentNumber;
}


/**
 * GENERATE PICKUP DATE
 */
function generatePickupDate() {
  const currentDate = new Date();
  const pickupDate = new Date(currentDate.getTime() + Math.floor(Math.random() * 3 + 1) * 24 * 60 * 60 * 1000);
  return pickupDate.toISOString().slice(0, 10);
}


/**
 * SEND EMAIL
 */
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


/**
 * HELLO WORLD
 */
app.use(express.json());
app.get('/', (req, res) => {
  res.send('Hello, world!');
});


/**
 * LOGIN
 */
app.post('/login', (req, res) => {
  const { fdx_login } = req.body;
  let result = {
    isLoggedIn: false,
    returnCode: 0,
  };

  if (fdx_login && fdx_login.startsWith('ssodrt-88')) {
    result.isLoggedIn = true;
    result.userDetails = {
      email: 'jane.doe@mail.com',
      firstName: 'Jane',
      lastName: 'Doe',
      phoneNumber: '+31687654321'
    };
  } else if (fdx_login && fdx_login.startsWith('ssodrt-1337')) {
    result.isLoggedIn = true;
    result.userDetails = {
      email: 'fred.smith@fedex.com',
      firstName: 'Fred',
      lastName: 'Smith',
      phoneNumber: '+1123456789'
    };
  } else if (fdx_login && fdx_login.startsWith('ssodrt-')) {
    result.isLoggedIn = true;
    result.userDetails = {
      email: 'john.doe@mail.com',
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '+31612345678'
    };
  }

  res.setHeader('Content-Type', 'application/json');
  res.json(result);
});


/**
 * PICKUP (GET)
 */
app.get('/pickup', (req, res) => {
  let cookies = req.headers.cookie ? req.headers.cookie.substring(0, 50) : "No cookies present";
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


/**
 * PICKUP (POST)
 *
 * new property in result object called actionRecommendation with default value "VA"
 * new property in result object called isLoggedIn with default value false
 * if the trackingNumber starts with "100", then set result.shipmentType to domestic and result.shipmentPostalCode to "3012AM"
 * if the trackingNumber starts with "200", then set result.shipmentType to international and result.shipmentPostalCode to "2132LS"
 * if the trackingNumber starts with "900", then set result.shipmentType to dangerous and set result.actionRecommendation to "HumanOperator"
 * if fdx_login contains a value and starts with "ssodrt-" then set result.isLoggedIn to true and introduce a new complex object type under result object called userDetails. Set result.userDetails.firstName to "John" and result.userDetails.lastName to "Doe".
 */
app.post('/pickup', (req, res) => {
  // console.log("req.body is::: "+req.body);
  const { trackingNumber, shipmentAddressFrom, shipmentAddressTo, shipmentWeight, fdx_login } = req.body;
  let result = {
    accountType: 'individual',
    actionRecommendation: 'VA',
    returnCode: 0,
    shipmentAddressTo: shipmentAddresTo ? shipmentAddressTo : '',
    shipmentAddressFrom: shipmentAddressFrom ? shipmentAddressFrom : '',
    shipmentAmount: 0, // amount of packages
    shipmentPostalCode: '1000AA',
    shipmentType: 'international',
  };

  if (trackingNumber) {
    if (trackingNumber.startsWith('100')) {
      result.shipmentAddressFrom = 'Amsterdam';
      result.shipmentAmount = 3;
      result.shipmentInstructions = 'Use video doorbell on the left' // not functional yet in Mix
      result.shipmentPostalCode = '1051GM';
      result.shipmentType = 'domestic';

    } else if (trackingNumber.startsWith('200')) {
      result.accountType = 'business';
      result.shipmentAmount = 2;
      result.shipmentPostalCode = '2132LS';
      result.shipmentType = 'international';

    } else if (trackingNumber.startsWith('900')) {
      result.actionRecommendation = 'HumanOperator';
      result.shipmentAmount = 1;
      result.shipmentPostalCode = '8888XX';
      result.shipmentType = 'dangerous';
    }
  }

  /*
  if (shipmentAddressTo) {
    result.shipmentAddressTo_verify = shipmentAddressTo + "--received";
  }else{
    result.shipmentAddressTo_verify = "no-to-address--received";
  }

  if (shipmentWeight) {
    result.weight_verify = shipmentWeight+ "--received. request body everything-->>>"+JSON.stringify(req.body);
  }else{
    result.weight_verify = "no-to-weight_verify--received....request body everything-->>>"+JSON.stringify(req.body);
  }

  if (shipmentAddressFrom) {
    result.from_address_verify = shipmentAddressFrom + "--received";
    console.log("sending email... from address is set. "+ shipmentAddressFrom);

    //sendEmail("Nuance Mix - Schedule Pickup", "response data is "+JSON.stringify(result));
  } else {
    result.from_address_verify = "no-from-address--received";
  }*/

  res.setHeader('Content-Type', 'application/json');
  res.json(result);
});


/**
 * CONFIRM PICKUP
 * Pickup confirmation, processes the pickup data into a sentence.
 */
app.post('/confirmpickup', (req, res) => {
  const { trackingNumber, shipmentAddressFrom, shipmentAddressTo, shipmentAmount } = req.body;
  let pickupDate = generatePickupDate();
  let shipmentNumber= generateShipmentNumber();
  const confirmationMessage = `🚚 Great news! Your shipment (${trackingNumber}), consisting of ${shipmentAmount} packages is scheduled for pickup on ${pickupDate} in ${shipmentAddressFrom} and will be sent to ${shipmentAddressTo}. Your pickup reference is ${shipmentNumber}. Please check your email inbox to confirm or change pickup details.`;
  const result = {
    actionRecommendation: 'VA',
    trackingNr: trackingNumber,
    addressFrom: shipmentAddressFrom,
    addressTo: shipmentAddressTo,
    amount: shipmentAmount,
    confirmationMessage: confirmationMessage,
    pickupDate: pickupDate,
    returnCode: 0,
    shipmentNumber: shipmentNumber,
  };

  const notificationSubject =  `Pickup Confirmation for tracking number ${trackingNumber}`;
  sendNotificationEmail(notificationSubject,confirmationMessage)
  sendTeamsNotification(notificationSubject,confirmationMessage)

  res.json(result);
});



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});
