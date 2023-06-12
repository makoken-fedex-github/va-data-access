var nodemailer = require('nodemailer')
const axios = require('axios')
const Sib = require('sib-api-v3-sdk')
const client = Sib.ApiClient.instance
const apiKey = client.authentications['api-key']
apiKey.apiKey = process.env.API_KEY
const express = require('express')
const app = express()
// Parse request body as JSON
app.use(express.json())

const baseUrl = "https://va-data-access.onrender.com";
/**
 * SEND TEAMS NOTIFICATION
 * Sets the message template and sends the teams notification of a confirmed pickup.
 *
 * @param {any} subject
 * @param {any} body
 * @returns {any}
 */
function sendTeamsNotification (subject, body) {
  try {
    // Replace <webhook-url> with the actual webhook URL provided by Teams
    const webhookUrl =
      'https://myfedex.webhook.office.com/webhookb2/9955e2de-3d21-437c-99c7-0b15657457c1@b945c813-dce6-41f8-8457-5a12c2fe15bf/IncomingWebhook/ad3b52249e764827952bd8281193b6ce/50fe584c-09e5-4b10-b92b-ff8d56c63bcd'
    // Define the message payload
    const payload = {
      '@type': 'MessageCard',
      '@context': 'http://schema.org/extensions',
      themeColor: '0072C6',
      title: subject,
      text: body,
      summary: body,
      sections: [
        {
          activityTitle: subject,
          activitySubtitle: 'Sent by DCC - FedEx',
          activityImage:
            'https://www.fedex.com/content/dam/fedex-com/logos/logo.png'
        }
      ]
    }
    // Send a POST request to the webhook URL with the message payload
    axios
      .post(webhookUrl, payload)
      .then(response => {
        console.log('Message sent:', response.data)
      })
      .catch(error => {
        console.error('Error sending message:', error)
      })
  } catch (ex) {
    console.error(
      'something went wrong when sending teams notifications...' + ex.message
    )
  }
}

/**
 * SEND NOTIFICATION EMAIL
 * Sends an email notification of a confirmed pickup.
 *
 * @param {string} subject
 * @param {string} body
 */
function sendNotificationEmail (subject, body) {
  try {
    const client = Sib.ApiClient.instance
    const apiKey = client.authentications['api-key']
    apiKey.apiKey = process.env.API_KEY
    const tranEmailApi = new Sib.TransactionalEmailsApi()
    const sender = {
      email: 'makoken.parkmobile@gmail.com',
      name: 'FedEx Virtual Assistant'
    }
    const receivers = [
      {
        email: 'acwillemse@gmail.com'
      }
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
    console.error(
      'something went wrong when sending email notifications...' + ex.message
    )
  }
}

async function generateShipmentNumber() {
  const shipmentNumber = await axios.get(baseUrl+'/generate-shipment-number')
  console.log(`Generated shipment number: ${shipmentNumber.data}`)
  return shipmentNumber.data;

}
async function generatePickupDate() {
  const pickupDate = await axios.get(baseUrl+'/generate-pickup-date')
  console.log(`Generated pickup date: ${pickupDate.data}`)
  return pickupDate.data;
}

app.get('/generate-shipment-number', (req, res) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let shipmentNumber = ''
  for (let i = 0; i < 16; i++) {
    shipmentNumber += characters.charAt(
      Math.floor(Math.random() * characters.length)
    )
  }
  res.send(shipmentNumber)
})

/**
 * ENDPOINT: /generate-pickup-date
 * Generates a simulated date for the confirmed pickup.
 */
app.get('/generate-pickup-date', (req, res) => {
  const currentDate = new Date()
  const pickupDate = new Date(
    currentDate.getTime() +
      Math.floor(Math.random() * 3 + 1) * 24 * 60 * 60 * 1000
  )
  res.send(pickupDate.toISOString().slice(0, 10))
})


/**
 * LOGIN
 * Mock account API returning account data based on input.
 */
app.post('/login', (req, res) => {
  const { fdx_login } = req.body
  let result = {
    isLoggedIn: false,
    returnCode: 0
  }

  // Dummy account for Jane Doe
  if (fdx_login && fdx_login.startsWith('ssodrt-88')) {
    result.isLoggedIn = true
    result.userDetails = {
      email: 'jane.doe@mail.com',
      firstName: 'Jane',
      lastName: 'Doe',
      phoneNumber: '+31687654321'
    }
  // Dummy account for Fred Smith
  } else if (fdx_login && fdx_login.startsWith('ssodrt-1337')) {
    result.isLoggedIn = true
    result.userDetails = {
      email: 'fred.smith@fedex.com',
      firstName: 'Fred',
      lastName: 'Smith',
      phoneNumber: '+1123456789'
    }
  // Catch other set 'cookies' with a dummy account (John Doe)
  } else if (fdx_login && fdx_login.startsWith('ssodrt-')) {
    result.isLoggedIn = true
    result.userDetails = {
      email: 'john.doe@mail.com',
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '+31612345678'
    }
  }

  res.setHeader('Content-Type', 'application/json')
  res.json(result)
})

/**
 * PICKUP (POST)
 * Based on specific input this returns mock results.
 *
 * new property in result object called actionRecommendation with default value "VA"
 * new property in result object called isLoggedIn with default value false
 * if the trackingNumber starts with "100", then set result.shipmentType to domestic and result.shipmentPostalCode to "3012AM"
 * if the trackingNumber starts with "200", then set result.shipmentType to international and result.shipmentPostalCode to "2132LS"
 * if the trackingNumber starts with "900", then set result.shipmentType to dangerous and set result.actionRecommendation to "HumanOperator"
 * if fdx_login contains a value and starts with "ssodrt-" then set result.isLoggedIn to true and introduce a new complex object type under result object called userDetails. Set result.userDetails.firstName to "John" and result.userDetails.lastName to "Doe".
 */
app.post('/pickup', (req, res) => {
  const {
    trackingNumber,
    shipmentAddressFrom,
    shipmentAddressTo,
    shipmentWeight,
    fdx_login
  } = req.body;
  
  let result = {
    accountType: 'individual',
    actionRecommendation: 'VA',
    returnCode: 0,
    shipmentAddressTo: shipmentAddressTo ? shipmentAddressTo : '',
    shipmentAddressFrom: shipmentAddressFrom ? shipmentAddressFrom : '',
    shipmentAmount: 0, // amount of packages
    shipmentPostalCode: '1000AA',
    shipmentType: 'international'
  };

  if (trackingNumber) {
    if (trackingNumber === '500500500500') {
      return res.status(500).json({ error: 'Internal Server Error' });
    } else if (trackingNumber === '400400400400') {
      return res.status(400).json({ error: 'Bad Request' });
    } else if (trackingNumber.startsWith('100')) {
      result.shipmentAddressFrom = 'Amsterdam';
      result.shipmentAmount = 3;
      result.shipmentInstructions = 'Use video doorbell on the left'; // not functional yet in Mix
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

  res.setHeader('Content-Type', 'application/json');
  res.json(result);
});


/**
 * CONFIRM PICKUP
 * Pickup confirmation, processes the pickup data into a sentence.
 */
app.post('/confirmpickup', async (req, res) => {
  const {
    trackingNumber,
    shipmentAddressFrom,
    shipmentAddressTo,
    shipmentAmount
  } = req.body
  let pickupDate = await generatePickupDate()
  let shipmentNumber = await generateShipmentNumber()
  const confirmationMessage = `🚚 Great news! Your shipment (${trackingNumber}), consisting of ${shipmentAmount} packages is scheduled for pickup on ${pickupDate} in ${shipmentAddressFrom} and will be sent to ${shipmentAddressTo}. Your pickup reference is ${shipmentNumber}. Please check your email inbox to confirm or change pickup details.`
  const confirmationEmail = `<h1>🚚 Thanks for scheduling a pickup with us.</h1>
    <p>ℹ️ <i> We will inform you of an estimated pickup time window 1 day beforehand</i></p>
    <p>
      <strong>Pick-up reference number</strong> ${shipmentNumber}<br/>
      <strong>Pick-up date</strong>: ${pickupDate}<br/>
      <strong>Tracking number</strong>: (${trackingNumber})<br/>
      <strong>Amount of packages</strong>: ${shipmentAmount}<br/>
      <strong>Pickup address</strong>: ${shipmentAddressFrom}<br/>
      <strong>API Calls for generate shipment number and pickup date</strong>: Y-E-S<br/>
      <strong>Address</strong>: ${shipmentAddressTo}
    </p>
    <p>
      <a href="https://fedex.com/en-gb/customer-support.html"><strong>Click here</strong> to confirm your pickup.</a>
    </p>`
  const result = {
    actionRecommendation: 'VA',
    trackingNr: trackingNumber,
    addressFrom: shipmentAddressFrom,
    addressTo: shipmentAddressTo,
    amount: shipmentAmount,
    confirmationMessage: confirmationMessage,
    pickupDate: pickupDate,
    returnCode: 0,
    shipmentNumber: shipmentNumber
  }

  const notificationSubject = `Pickup Confirmation for tracking number ${trackingNumber}`
  sendNotificationEmail(notificationSubject, confirmationEmail)
  sendTeamsNotification(notificationSubject, confirmationMessage)

  res.json(result)
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`)
})
