 export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { data } = req.body;

    if (!data || !data.name) {
      return res.status(400).json({ error: 'Missing required data' });
    }

    // Check if API key exists
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('ANTHROPIC_API_KEY is not set');
      return res.status(500).json({ error: 'API key not configured' });
    }

    console.log('Calling Anthropic API...');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4500,
        messages: [{
          role: 'user',
          content: `You are an expert at helping career changers break into software sales. Create a comprehensive interview playbook.

CANDIDATE: ${data.name}
CURRENT ROLE: ${data.currentRole}
TARGET ROLE: ${data.targetRole}

Create sections:
1. NARRATIVE ARC (2-3 paragraphs showing their intentional path to sales)
2. EXPERIENCE TRANSLATION (how their background translates to sales skills)
3. CORE INTERVIEW RESPONSES (answers to: "Tell me about yourself", "Why sales?", "Why should we hire you?")
4. OBJECTION HANDLING (addressing lack of SaaS experience)
5. 30-60-90 DAY PLAN
6. STRATEGIC TALKING POINTS

Be specific, use their examples, make it authentic.`
        }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Anthropic API error:', response.status, errorText);
      return res.status(response.status).json({ 
        error: `API error: ${response.status}`,
        details: errorText 
      });
    }

    const responseData = await response.json();
    const narrativeContent = responseData.content
      .filter(item => item.type === 'text')
      .map(item => item.text)
      .join('\n');

    console.log('Successfully generated narrative');
    return res.status(200).json({ narrative: narrativeContent });

  } catch (error) {
    console.error('Function error:', error);
    return res.status(500).json({ 
      error: error.message,
      stack: error.stack 
    });
  }
}
