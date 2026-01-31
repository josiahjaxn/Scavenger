import { createClient } from '@vercel/kv';

export default async function handler(req, res) {
  // 1. SAFETY FIRST: Handle the "Clue Check" before touching the database.
  // This guarantees "TWENTYTWO" works even if the database explodes.
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
    // If the clue check fails, something is very wrong with the data sent
    return res.status(500).json({ error: "Input Error" });
  }

  // 2. THE DATABASE: Now that the clue check is done, we try to load the leaderboard.
  // We wrap this in a separate block so it can't break the part above.
  try {
    const { method, body } = req;
    
    // Connect using the exact variable from your settings
    const kv = createClient({
      url: process.env.REDIS_URL, 
    });

    // GET: Fetch the list
    if (method === 'GET') {
      const list = await kv.zrange('leaderboard', 0, 9, { withScores: true });
      const formatted = [];
      for (let i = 0; i < list.length; i += 2) {
        formatted.push({ member: list[i], score: list[i+1] });
      }
      return res.status(200).json({ leaderboard: formatted });
    }

    // POST: Save a name
    if (method === 'POST' && body.name) {
      const score = Date.now();
      await kv.zadd('leaderboard', { score: score, member: body.name });
      
      // Return the new list immediately
      const list = await kv.zrange('leaderboard', 0, 9, { withScores: true });
      const formatted = [];
      for (let i = 0; i < list.length; i += 2) {
        formatted.push({ member: list[i], score: list[i+1] });
      }
      return res.status(200).json({ leaderboard: formatted });
    }

  } catch (error) {
    // 3. FAIL SAFE: If the database fails, we log it but don't crash the user.
    console.error("Database Error:", error.message);
    return res.status(200).json({ leaderboard: [] }); 
  }
}
