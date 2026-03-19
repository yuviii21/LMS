const express = require('express');
const router = express.Router();
const { HfInference } = require('@huggingface/inference');

router.post('/chat', async (req, res) => {
    try {
        const { message, history } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        const hfToken = process.env.HF_TOKEN;
        if (!hfToken) {
            return res.status(500).json({ error: 'HF_TOKEN is not configured in backend' });
        }

        const hf = new HfInference(hfToken);
        
        const formattedHistory = Array.isArray(history) ? history.map(msg => ({
            role: msg.role === 'ai' ? 'assistant' : 'user',
            content: msg.content
        })) : [];

        const messages = [
            { role: "system", content: "You are a helpful AI tutor for the OneEight Learning Management System. Be concise, polite, and educational in your responses. Answer the student's question." },
            ...formattedHistory,
            { role: "user", content: message }
        ];

        const out = await hf.chatCompletion({
            model: "meta-llama/Llama-3.2-1B-Instruct",
            messages: messages,
            max_tokens: 300,
            temperature: 0.7,
        });

        const generatedText = out.choices && out.choices[0] && out.choices[0].message ? out.choices[0].message.content : '';

        res.json({ text: generatedText });

    } catch (error) {
        console.error('AI Chat Error:', error.message);
        res.status(500).json({ error: error.message || 'Internal server error while calling AI' });
    }
});

module.exports = { router };
