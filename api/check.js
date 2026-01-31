import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  try {
    const { method } = req;
    
    // GET: Load the leaderboard names
    if (method === 'GET') {
      const list = await kv.zrange('leaderboard', 0, 9, { withScores: true });
      const formatted = [];
      for (let i = 0; i < list.length; i += 2) {
        formatted.push({ member: list[i], score: list[i+1] });
      }
      return res.status(200).json({ leaderboard: formatted });
    }

    // POST: Handle codes or Save name
    if (method === 'POST') {
      const { code, step, name } = req.body;

      // Check codes (TWENTYTWO / OPUS)
      if (code) {
        const cleanedInput = code.replace(/\s+/g, '').toUpperCase();
        const answers = { 1: "TWENTYTWO", 2: "OPUS" };
        if (cleanedInput === answers[step]) return res.status(200).json({ success: true });
        return res.status(401).json({ success: false });
      }

      // Save name to leaderboard
      if (name) {
        const score = Date.now(); 
        await kv.zadd('leaderboard', { score: score, member: name });
        const list = await kv.zrange('leaderboard', 0, 9, { withScores: true });
        const formatted = [];
        for (let i = 0; i < list.length; i += 2) {
          formatted.push({ member: list[i], score: list[i+1] });
        }
        return res.status(200).json({ leaderboard: formatted });
      }
    }
  } catch (error) {
    console.error("Redis Error:", error);
    return res.status(500).json({ error: "Database Connection Failed" });
  }
}
