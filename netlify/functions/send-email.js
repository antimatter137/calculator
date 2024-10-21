const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" })
    };
  }

  const body = JSON.parse(event.body);
  const { message, username, recaptchaToken } = body;

  if (!message || !username || !recaptchaToken) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Message, username, and recaptchaToken are required." })
    };
  }

  // Set up the EmailJS request data
  const data = {
    service_id: process.env.EMAILJS_SERVICE_ID,
    template_id: process.env.EMAILJS_TEMPLATE_ID,
    user_id: process.env.EMAILJS_PUBLIC_KEY,
    template_params: {
      'message': message,
    }
  };

  try {
    // Send the request to EmailJS
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    // Check if the response is OK
    if (!response.ok) {
      throw new Error(`EmailJS error: ${response.statusText}`);
    }

    const responseData = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify({ status: "Email sent", response: responseData })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to send email", details: error.message })
    };
  }
};
