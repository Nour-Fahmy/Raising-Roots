const express = require('express');
const axios = require('axios');
const router = express.Router();

router.post('/', async (req, res) => {
  const userQuestion = req.body.question;

  // Filter by baby care topics
  const allowedTopics = ['baby', 'child', 'feeding', 'sleep', 'mother', 'newborn', 'parent', 'pregnant'];
  const isRelevant = allowedTopics.some(topic => userQuestion.toLowerCase().includes(topic));

  if (!isRelevant) {
    return res.json({
      answer: "I'm here to help with baby care, parenting, and motherhood topics only 😊"
    });
  }

  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'openai/gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a parenting support assistant who only talks about newborns, parenting, and baby health topics.' },
          { role: 'user', content: userQuestion }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'https://localhost:3000', // Required by OpenRouter
          'Content-Type': 'application/json'
        }
      }
    );

    const reply = response.data.choices[0].message.content;
    res.json({ answer: reply });

  } catch (err) {
    console.error('OpenRouter Error:', err.response?.data || err.message);
    res.status(500).json({ answer: "Something went wrong with the chatbot." });
  }
});

module.exports = router;
