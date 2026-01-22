export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Just return a test message
  return res.status(200).json({ 
    narrative: "TEST: If you're seeing this, the backend is working! API key: " + (process.env.ANTHROPIC_API_KEY ? "EXISTS" : "MISSING")
  });
}
