import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  const { method } = req;
  const { code, step, name } = req.body;

  // 1. Handling Code Checks
  if (method === 'POST' && code) {
    // We clean the user's input by removing all spaces and making it Uppercase
    const cleanedInput = code.replace(/\s+/g, '').toUpperCase();

    const answers = { 
      1: "TWENTY TWO".replace(/\s+/g, ''), // Matches "TWENTY TWO" or "TWENTYTWOT"
      2: "OPUS" 
    };

    if (cleanedInput === answers[step]) {
      return res.status(200).json({ success: true });
    }
    return res.status(401).json({ success: false });
  }

  // 2. Handling Name Submission
  if (method === 'POST' && name) {
    const timestamp = Date.now();
    await kv.zadd('leaderboard', { score: timestamp, member: name });
    const fullList = await kv.zrange('leaderboard', 0, 9, { withScores: true });
    return res.status(200).json({ leaderboard: fullList });
  }

  // 3. Loading Initial Leaderboard
  if (method === 'GET') {
    const fullList = await kv.zrange('leaderboard', 0, 9, { withScores: true });
    return res.status(200).json({ leaderboard: fullList });
  }
}
