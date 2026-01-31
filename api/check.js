import { createClient } from '@vercel/kv';

// This tells the code to use the REDIS_URL we see in your settings
const kv = createClient({
  url: process.env.REDIS_URL,
});

export default async function handler(req, res) {
  try {
    const { method, body } = req;
    
    // 1. Handling Clue Checks (This lets you in!)
    if (method === 'POST' && body.code) {
      const cleanedInput = body.code.replace(/\s+/g, '').toUpperCase();
      const answers = { 1: "TWENTYTWO", 2: "OPUS" };

      if (cleanedInput === answers[body.step]) {
        return res.status(200).json({ success: true });
      }
      return res.status(401).json({ success: false });
    }

    // 2. Handling Leaderboard (Loading and Saving)
    if (method === 'GET') {
      const list = await kv.zrange('leaderboard', 0, 9, { withScores: true });
      const formatted = [];
      for (let i = 0; i < list.length; i += 2) {
        formatted.push({ member: list[i], score: list[i+1] });
      }
      return res.status(200).json({ leaderboard: formatted });
    }

    if (method === 'POST' && body.name) {
      await kv.zadd('leaderboard', { score: Date.now(), member: body.name });
      const list = await kv.zrange('leaderboard', 0, 9, { withScores: true });
      const formatted = [];
      for (let i = 0; i < list.length; i += 2) {
        formatted.push({ member: list[i], score: list[i+1] });
      }
      return res.status(200).json({ leaderboard: formatted });
    }

  } catch (error) {
    // This will show us the EXACT error in Vercel Logs if it fails again
    console.error("CRITICAL ERROR:", error.message);
    return res.status(500).json({ error: "System Error" });
  }
}
