import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  try {
    const { method } = req;
    
    if (method === 'GET') {
      const list = await kv.zrange('leaderboard', 0, 9, { withScores: true });
      const formatted = [];
      for (let i = 0; i < list.length; i += 2) {
        formatted.push({ member: list[i], score: list[i+1] });
      }
      return res.status(200).json({ leaderboard: formatted });
    }

    if (method === 'POST') {
      const { code, step, name } = req.body;

      if (code) {
        const cleanedInput = code.replace(/\s+/g, '').toUpperCase();
        const answers = { 1: "TWENTYTWO", 2: "OPUS" };
        if (cleanedInput === answers[step]) return res.status(200).json({ success: true });
        return res.status(401).json({ success: false });
      }

      if (name) {
        // We use the current time as the score
        await kv.zadd('leaderboard', { score: Date.now(), member: name });
        
        // Fetch it back immediately to confirm
        const list = await kv.zrange('leaderboard', 0, 9, { withScores: true });
        const formatted = [];
        for (let i = 0; i < list.length; i += 2) {
          formatted.push({ member: list[i], score: list[i+1] });
        }
        return res.status(200).json({ leaderboard: formatted });
      }
    }
  } catch (error) {
    console.error("Database Error:", error.message);
    return res.status(500).json({ error: "Connection Failed" });
  }
}
