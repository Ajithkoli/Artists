const axios = require('axios');
const ErrorHandler = require('../utils/errorHandler');

// Simple server-side proxy to Google Generative Language API (non-streaming)
// POST /api/v1/ai/chat { message: string }
exports.chat = async (req, res, next) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return next(new ErrorHandler('GEMINI_API_KEY not configured on server.', 500));

    const { message } = req.body;
    if (!message) return next(new ErrorHandler('Message is required.', 400));

    // Dynamic model selection to ensure validity
    let model = global.cachedGeminiModel;
    if (!model) {
      try {
        const funcUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
        const modelsResp = await axios.get(funcUrl);
        const availableModels = modelsResp.data.models || [];
        const validModel = availableModels.find(m => m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent'));
        if (validModel) {
          model = validModel.name; // e.g., "models/gemini-1.5-flash"
          global.cachedGeminiModel = model;
          console.log(`[AI] Selected model: ${model}`);
        } else {
          console.warn('[AI] No model found with generateContent support. Falling back to default.');
          model = 'models/gemini-1.5-flash';
        }
      } catch (modelErr) {
        console.error('[AI] Failed to list models:', modelErr.message);
        model = 'models/gemini-1.5-flash';
      }
    }

    // URL calculation: model variable already contains "models/..." prefix if fetched dynamically, 
    // or we ensured fallback has it.
    // If fallback was 'gemini-1.5-flash' (without prefix), we should normalize.
    if (!model.startsWith('models/')) model = `models/${model}`;

    const url = `https://generativelanguage.googleapis.com/v1beta/${model}:generateContent?key=${apiKey}`;

    const body = {
      contents: [{
        parts: [{ text: message }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 512
      }
    };

    const response = await axios.post(url, body, { headers: { 'Content-Type': 'application/json' } });
    const data = response.data || {};

    // Extract text from Gemini response structure
    let text = '';
    if (data.candidates && data.candidates.length > 0) {
      const candidate = data.candidates[0];
      if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
        text = candidate.content.parts[0].text;
      }
    }

    if (!text) {
      text = "I'm sorry, I couldn't generate a response.";
    }

    return res.status(200).json({ success: true, text: text, raw: data });
  } catch (err) {
    // Log full error for debugging
    console.error('AI proxy error:', err.response?.data || err.code || err.message || err);

    // If DNS/name resolution failed, return a canned mock reply so the frontend remains functional during network outages
    const isDnsError = err.code === 'ENOTFOUND' || (err.message && err.message.includes('getaddrinfo ENOTFOUND'));
    if (isDnsError) {
      const mockText = "Hi — Crafto (offline). I can't reach the AI service right now, but I can answer basic questions about Crafto: registration, communities, products, and uploading artworks. Try asking about those.";
      return res.status(200).json({ success: true, text: mockText, raw: { error: 'DNS resolution failed (mock response returned)' } });
    }

    return next(new ErrorHandler('AI service error. ' + (err.response?.data?.error?.message || err.message), 502));
  }
};
