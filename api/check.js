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

  // 2. LEADERBOARD (Using the new Redis client)
  const client = createClient({
    url: process.env.REDIS_URL
  });

  try {
    const { method, body } = req;

    // We must "connect" before we can send data
    await client.connect();

    // GET: Load Leaderboard
    if (method === 'GET') {
      const list = await client.zRangeWithScores('leaderboard', 0, 9);
      // Redis returns keys differently, we format them here
      const formatted = list.map(item => ({ member: item.value, score: item.score }));
      
      await client.disconnect();
      return res.status(200).json({ leaderboard: formatted });
    }

    // POST: Save Name
    if (method === 'POST' && body.name) {
      const score = Date.now();
      await client.zAdd('leaderboard', { score: score, value: body.name });
      
      const list = await client.zRangeWithScores('leaderboard', 0, 9);
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
    // Return empty list instead of crashing
    return res.status(200).json({ leaderboard: [] }); 
  }
}
