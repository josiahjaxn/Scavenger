import { Redis } from '@upstash/redis'

const redis = Redis.fromEnv()

export default async function handler(req, res) {
  try {
    const { method } = req;
    
    // 1. GET: Fetch the leaderboard
    if (method === 'GET') {
      const list = await redis.zrange('leaderboard', 0, 9, { withScores: true });
      const formatted = [];
      // Upstash returns objects like { member: "name", score: 123 }
      for (let i = 0; i < list.length; i++) {
        formatted.push({ 
            member: list[i].member || list[i], 
            score: list[i].score || 0 
        });
      }
      return res.status(200).json({ leaderboard: formatted });
    }

    // 2. POST: Code check or Name save
    if (method === 'POST') {
      const { code, step, name } = req.body;

      if (code) {
        const cleanedInput = code.replace(/\s+/g, '').toUpperCase();
        const answers = { 1: "TWENTYTWO", 2: "OPUS" };
        if (cleanedInput === answers[step]) return res.status(200).json({ success: true });
        return res.status(401).json({ success: false });
      }

      if (name) {
        const score = Date.now(); 
        await redis.zadd('leaderboard', { score: score, member: name });
        
        const newList = await redis.zrange('leaderboard', 0, 9, { withScores: true });
        return res.status(200).json({ leaderboard: newList });
      }
    }
  } catch (error) {
    console.error("Upstash Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
