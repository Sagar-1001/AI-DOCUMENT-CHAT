const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const askGemini = async (documentText, question) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `
You are a helpful assistant that answers questions based on the provided document.

Document Content:
${documentText}

User Question: ${question}

Important Rules:
- Answer ONLY based on the document content above
- If the answer is not in the document say "I cannot find this information in the document"
- Keep your answer clear and concise
- Do not make up information
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();

  } catch (err) {
    throw new Error('Failed to get response from Gemini: ' + err.message);
  }
};

module.exports = askGemini;