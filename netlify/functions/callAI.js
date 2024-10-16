exports.handler = async (event) => {
    // Dynamically import node-fetch as required by ES Modules
    const fetch = (await import('node-fetch')).default;

    // Log the incoming event body for debugging purposes
    console.log("Event Body:", event.body);

    let question;
    try {
        // Attempt to parse event.body and extract the 'question'
        question = JSON.parse(event.body).question;
        
        // Check if 'question' is valid
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
