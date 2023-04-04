const axios = require('axios');

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
