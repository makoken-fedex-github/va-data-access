
// // // var SibApiV3Sdk = require('sib-api-v3-sdk');
// // // var defaultClient = SibApiV3Sdk.ApiClient.instance;
// // // //# Instantiate the client\
// // // var apiKey = defaultClient.authentications['api-key'];
// // // apiKey.apiKey = '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';
// // // var apiInstance = new SibApiV3Sdk.EmailCampaignsApi();
// // // var emailCampaigns = new SibApiV3Sdk.CreateEmailCampaign();
// // // //# Define the campaign settings\
// // // emailCampaigns.name = "Campaign sent via the API";
// // // emailCampaigns.subject = "My subject";
// // // emailCampaigns.sender = {"name": "From name", "email":"anshuman.kashyap@sendinblue.com"};
// // // emailCampaigns.type = "classic";
// // // //# Content that will be sent\
// // // htmlContent =  'Congratulations! You successfully sent this example campaign via the Sendinblue API.',
// // // //# Select the recipients\
// // // //recipients =  {listIds: [2, 7]},
// // // //# Schedule the sending in one hour\
// // // //scheduledAt =  '2018-01-01 00:00:01'
// // // //}
// // // //# Make the call to the client\
// // // apiInstance.createEmailCampaign(emailCampaigns).then(function(data) {
// // // console.log('API called successfully. Returned data: ' + data);
// // // }, function(error) {
// // // console.error(error);
// // // });


const Sib = require('sib-api-v3-sdk')
require('dotenv').config()
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
        email: 'ali.koeken.osv@fedex.com',
    },
]

tranEmailApi
    .sendTransacEmail({
        sender,
        to: receivers,
        subject: 'This is a test email.',
        textContent: `
        Another email. {{params.role}} a developer.
        `,
        htmlContent: `
        <h1>Thank you!</h1>
        <a href="https://cules-coding.vercel.app/">Visit</a>
                `,
        params: {
            role: 'Frontend',
        },
    })
    .then(console.log)
    .catch(console.log)