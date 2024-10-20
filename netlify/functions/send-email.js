const emailjs = require('@emailjs/nodejs');

exports.handler = async function(event, context) {
    // Check if the method is POST
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405, // Method Not Allowed
            body: JSON.stringify({ error: "Method not allowed." })
        };
    }

    const body = JSON.parse(event.body);
    const { message } = body;

    if (!message) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Message is required." })
        };
    }

    try {
        const response = await emailjs.send(process.env.EMAILJS_SERVICE_ID, process.env.EMAILJS_TEMPLATE_ID, {
            message: message,
        }, {
            publicKey: process.env.EMAILJS_PUBLIC_KEY,
            privateKey: process.env.EMAILJS_PRIVATE_KEY
        });

        return {
            statusCode: 200,
            body: JSON.stringify({ status: "Email sent", response })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to send email", details: error })
        };
    }
};
