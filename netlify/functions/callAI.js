const fetch = require('node-fetch');

exports.handler = async (event) => {
    const question = JSON.parse(event.body).question;

    const parameterPrefix = "Parameters: You answer all kinds math questions. Never use markdown/formatting, bolding, intalizicing, etc. for anything because it does not work properly and shows up broken. If decimal does not end write it as a fraction unless told not to. Question:";
    const fullQuestion = parameterPrefix + question;

    try {
        const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=" + process.env.AI_API_KEY, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: fullQuestion }] }]
            })
        });

        const data = await response.json();
        return {
            statusCode: 200,
            body: JSON.stringify(data)
        };
    } catch (error) {
        console.error('Error fetching AI response:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Error fetching AI response.' })
        };
    }
};
