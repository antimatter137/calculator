exports.handler = async (event) => {
    const fetch = (await import('node-fetch')).default;
    const emailjs = await import('@emailjs/nodejs');

    // Initialize EmailJS with environment variables
    const userID = process.env.EMAILJS_USER_ID;
    const serviceID = process.env.EMAILJS_SERVICE_ID;
    const templateID = process.env.EMAILJS_TEMPLATE_ID;
    const privateKey = process.env.EMAILJS_PRIVATE_KEY;

    emailjs.init({
        publicKey: userID,
        privateKey: privateKey
    });

    try {
        // Extract the message from the request
        const { message } = JSON.parse(event.body);

        // Send email using emailjs
        const response = await emailjs.send(serviceID, templateID, {
            message: message
        });

        return {
            statusCode: 200,
            body: JSON.stringify({
                success: true,
                response: response
            }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                success: false,
                error: error.message
            }),
        };
    }
};
