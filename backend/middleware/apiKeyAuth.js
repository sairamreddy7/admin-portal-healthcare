function validateApiKey(req, res, next) {
  try {
    const apiKey = req.headers['x-api-key'];
    
    if (!apiKey) {
      return res.status(401).json({ error: 'API key is required' });
    }

    // Check against configured API keys for different services
    const validApiKeys = [
      process.env.DOCTOR_SERVICE_API_KEY,
      process.env.PATIENT_SERVICE_API_KEY
    ].filter(Boolean); // Remove undefined values

    if (!validApiKeys.includes(apiKey)) {
      return res.status(403).json({ error: 'Invalid API key' });
    }

    // Optionally, you can identify which service is making the request
    if (apiKey === process.env.DOCTOR_SERVICE_API_KEY) {
      req.serviceType = 'DOCTOR_SERVICE';
    } else if (apiKey === process.env.PATIENT_SERVICE_API_KEY) {
      req.serviceType = 'PATIENT_SERVICE';
    }

    next();
  } catch (error) {
    console.error('API key validation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { validateApiKey };
