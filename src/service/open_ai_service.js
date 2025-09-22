const dotenv = require('dotenv');
const axios = require('axios');

dotenv.config();
const generateContent = async (prompt) => {
  try {
    const headers = {
      'api-key': process.env.OPENAI_API_KEY,
      'Content-Type': 'application/json',
    };

    const response = await axios.post(process.env.OPENAI_BASE_URL, {
      messages: [{ role: 'user', content: prompt }],
      model: 'gpt-4o-mini',
      temperature: 0.5,
      max_tokens: 500,
    }, { headers });

    return response?.data;
    
  } catch (error) {
    console.error("Error generating content:", error);
    throw error;
  }
}

module.exports = {
  generateContent,
}

