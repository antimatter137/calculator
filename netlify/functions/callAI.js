exports.handler = async (event) => {
    const fetch = (await import('node-fetch')).default;

    console.log("Event Body:", event.body);

    let question;
    try {
        question = JSON.parse(event.body).question;
        
        if (!question) {
            throw new Error("Question field is missing in the input");
        }
    } catch (parseError) {
        console.error("Error parsing JSON input:", parseError);
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Invalid JSON input' })
        };
    }

    const parameterPrefix = "Parameters: You answer all kinds math questions. If decimal does not end write it as a fraction unless told not to. You can use markdown for everything exept any kind of table or code area. Question:";
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
