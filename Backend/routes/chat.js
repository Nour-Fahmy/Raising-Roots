const express = require('express');
const axios = require('axios');
const router = express.Router();

router.post('/', async (req, res) => {
  const userQuestion = req.body.question;


  const allowedTopics = [
    'baby', 'child', 'sleep', 'newborn', 'feeding', 'mother', 'parent', 'pregnant',
    'طفل', 'مولود', 'بنتي', 'ابني', 'نوم', 'رضاعة', 'حامل', 'أم', 'البيبي'
  ];
  
  const isRelevant = allowedTopics.some(topic => userQuestion.toLowerCase().includes(topic));

  if (!isRelevant) {
    return res.json({
      answer: "I'm here to help with baby care, parenting, and motherhood topics only 😊\nأنا هنا لمساعدتك في أمور رعاية الأطفال والأمومة فقط."
    });
  }
  

  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'openai/gpt-3.5-turbo',
        messages: [
            { 
                role: 'system',
                content: 'You are a helpful assistant who only answers questions related to baby care, parenting, and health for newborns (0–2 years). You can respond in either Arabic or English depending on the user\'s language.'
              },
            
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
