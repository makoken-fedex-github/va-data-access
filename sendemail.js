
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