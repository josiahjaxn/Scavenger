import { createClient } from '@vercel/kv';

// Force the code to use the specific REDIS_URL from your settings
const kv = createClient({
  url: process.env.REDIS_URL,
});

export default async function handler(req, res) {
  try {
    const { method } = req;
    
    // GET: Load leaderboard
    if (method === 'GET') {
      const list = await kv.zrange('leaderboard', 0, 9, { withScores: true });
      const formatted = [];
      for (let i = 0; i < list.length; i += 2) {
        formatted.push({ member: list[i], score: list[i+1] });
      }
      return res.status(200).json({ leaderboard: formatted });
    }

    // POST: Check clues OR Save name
    if (method === 'POST') {
      const { code, step, name } = req.body;

      // 1. Check Scavenger Clues
      if (code) {
        const cleanedInput = code.replace(/\s+/g, '').toUpperCase();
        const answers = { 1: "TWENTYTWO", 2: "OPUS" };

        if (cleanedInput === answers[step]) {
          return res.status(200).json({ success: true });
        }
        return res.status(401).json({ success: false });
      }

      // 2. Save Leaderboard Name
      if (name) {
        await kv.zadd('leaderboard', { score: Date.now(), member: name });
        const list = await kv.zrange('leaderboard', 0, 9, { withScores: true });
        const formatted = [];
        for (let i = 0; i < list.length; i += 2) {
          formatted.push({ member: list[i], score: list[i+1] });
        }
        return res.status(200).json({ leaderboard: formatted });
      }
    }
  } catch (error) {
    // This logs the specific error to Vercel so we can see it
    console.error("System Error:", error.message);
    return res.status(500).json({ error: "System Error" });
  }
}
