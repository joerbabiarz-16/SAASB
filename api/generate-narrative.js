export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { data } = req.body;

    // Validate data
    if (!data || !data.name) {
      return res.status(400).json({ error: 'Missing required data' });
    }

    // Call Anthropic API
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
          content: `You are an expert at helping career changers break into software sales. Your job is to analyze this person's background and create a comprehensive interview playbook that translates their non-sales experience into SaaS sales competencies.

CORE PHILOSOPHY:
- Career changers have ADVANTAGES: fresh perspective, hunger, coachability, life experience
- Don't apologize for lack of SaaS experience—reframe it as an asset
- Hiring managers want: coachability, resilience, relationship skills, and metric orientation
- The best narratives show INTENTION: this isn't desperation, it's a strategic career decision
- Use frameworks: "successful people handle change successfully" and "what you're willing to suffer for reveals true motivation"

CANDIDATE INFORMATION:
Name: ${data.name}
Current Role/Industry: ${data.currentRole}
Target Role: ${data.targetRole}
Customer Experience: ${data.customerExperience}
Achievement/Metrics: ${data.metrics}
Learning Agility Example: ${data.learning}
What They'll Push Through: ${data.resilience}
Why Sales: ${data.whySales}
Preparation Done: ${data.preparation}
Biggest Concern: ${data.concern}

YOUR TASK:
Create a comprehensive SaaS sales interview playbook with these sections:

## 1. YOUR NARRATIVE ARC (3-4 paragraphs)
- Show the intentional through-line from their background to SaaS sales
- Reframe their "non-traditional" background as a strategic advantage
- Make their career change feel inevitable, not desperate
- Use their actual language and examples

## 2. EXPERIENCE TRANSLATION GUIDE
Create a clear table/list showing:
- What they did in previous role → How it translates to sales competency
- Be specific with their examples
- Focus on: relationship building, problem solving, resilience, metric achievement, learning agility

## 3. CORE INTERVIEW RESPONSES

Craft polished 1-2 minute responses to:

**"Tell me about yourself"**
- 2-minute arc that tells their story compellingly
- Start with brief background, pivot to "why sales," end with "why here"

**"Why sales? Why now?"**
- Make it about the work, not just money
- Show they understand what sales actually involves
- Reference their preparation (books, research, etc.)

**"You don't have SaaS experience. Why should we take a chance on you?"**
- Reframe this objection as their advantage
- Fresh perspective, hunger, coachability
- Cite their learning agility example

**"Tell me about a time you dealt with rejection or failure"**
- Use their examples, tie to sales resilience

**"What's your greatest strength?"**
- Pick ONE from their background that's highly relevant to sales
- Back it with specific example

**"Where do you see yourself in 2-3 years?"**
- Show ambition but realistic progression (SDR → AE → Enterprise AE)

## 4. OBJECTION HANDLING
Pre-written responses to common concerns:
- "Can you handle a quota?"
- "This is a high-pressure environment"
- "What if you don't like it?"
- "Why leave [their current industry]?"

## 5. 30-60-90 DAY FRAMEWORK
Brief outline showing they've thought about:
- First 30 days: Learning (product, industry, sales process)
- Days 60: Ramping (first deals, getting comfortable)
- Days 90: Contributing (hitting quota, becoming productive)

## 6. STRATEGIC TALKING POINTS
5-7 themes they should weave throughout every interview:
- Coachability
- Metric-driven mindset
- Relationship building
- Resilience/grit
- Strategic career decision
- Preparation and intentionality
- Customer-centric thinking

## 7. NEXT STEPS
- How to practice these responses (not memorize, internalize)
- Questions they should ask interviewers
- Red flags to watch for in companies

FORMAT:
- Use clear markdown headers
- Be specific, not generic—use THEIR examples and language
- Make it feel authentic to them
- Aim for responses that are conversational, not robotic
- Show confidence without arrogance

Make this feel like a playbook built specifically for them, not a template.`
        }]
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Anthropic API error:', error);
      return res.status(response.status).json({ error: 'Failed to generate narrative' });
    }

    const responseData = await response.json();
    const narrativeContent = responseData.content
      .filter(item => item.type === 'text')
      .map(item => item.text)
      .join('\n');

    return res.status(200).json({ narrative: narrativeContent });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
