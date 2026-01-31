import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  try {
    const { method } = req;
    
    // GET: Load the leaderboard
    if (method === 'GET') {
      // We use 'rev: false' to show the oldest entries (first people to finish) first
      const list = await kv.zrange('leaderboard', 0, 9, { withScores: true });
      const formatted = [];
      for (let i = 0; i < list.length; i += 2) {
        formatted.push({ member: list[i], score: list[i+1] });
      }
      return res.status(200).json({ leaderboard: formatted });
    }

    // POST: Check codes OR Save name
    if (method === 'POST') {
      const { code, step, name } = req.body;

      if (code) {
        const cleanedInput = code.replace(/\s+/g, '').toUpperCase();
        const answers = { 1: "TWENTYTWO", 2: "OPUS" };
        if (cleanedInput === answers[step]) return res.status(200).json({ success: true });
        return res.status(401).json({ success: false });
      }

      if (name) {
        // Save the name using the current time as the score
        await kv.zadd('leaderboard', { score: Date.now(), member: name });
        
        // Return the updated list immediately
        const list = await kv.zrange('leaderboard', 0, 9, { withScores: true });
        const formatted = [];
        for (let i = 0; i < list.length; i += 2) {
          formatted.push({ member: list[i], score: list[i+1] });
        }
        return res.status(200).json({ leaderboard: formatted });
      }
    }
  } catch (error) {
    // This will help us see the exact error in your Vercel Logs
    console.error("Leaderboard Error:", error.message);
    return res.status(500).json({ error: "Connection Failed" });
  }
}
