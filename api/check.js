import { createClient } from 'redis';

export default async function handler(req, res) {
  // 1. CLUE CHECK (Safety First - Always works)
  try {
    const { method } = req;
    const { code, step } = req.body || {};

    if (method === 'POST' && code) {
      const cleanedInput = code.replace(/\s+/g, '').toUpperCase();
      const answers = { 1: "TWENTYTWO", 2: "OPUS" };

      if (cleanedInput === answers[step]) {
        return res.status(200).json({ success: true });
      }
      return res.status(401).json({ success: false });
    }
  } catch (e) {
    return res.status(500).json({ error: "Input Error" });
  }

  // 2. LEADERBOARD (Unlimited - Fetch Everyone)
  const client = createClient({
    url: process.env.REDIS_URL
  });

  try {
    const { method, body } = req;
    await client.connect();

    // GET: Load the ENTIRE Leaderboard (0 to -1 means "All")
    if (method === 'GET') {
      const list = await client.zRangeWithScores('leaderboard', 0, -1);
      
      // Redis returns data in a specific format, we map it to { member, score }
      const formatted = list.map(item => ({ member: item.value, score: item.score }));
      
      await client.disconnect();
      return res.status(200).json({ leaderboard: formatted });
    }

    // POST: Save Name & Return Updated List
    if (method === 'POST' && body.name) {
      const score = Date.now();
      await client.zAdd('leaderboard', { score: score, value: body.name });
      
      // Fetch the updated full list immediately
      const list = await client.zRangeWithScores('leaderboard', 0, -1);
      const formatted = list.map(item => ({ member: item.value, score: item.score }));
      
      await client.disconnect();
      return res.status(200).json({ leaderboard: formatted });
    }
    
    // Cleanup if no matching method
    if (client.isOpen) await client.disconnect();
    return res.status(200).json({ success: true });

  } catch (error) {
    console.error("Redis Error:", error);
    if (client.isOpen) await client.disconnect();
    // Return empty list instead of crashing if something goes wrong
    return res.status(200).json({ leaderboard: [] }); 
  }
}
