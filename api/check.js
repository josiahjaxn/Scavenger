import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  const { method } = req;
  const { code, step, name } = req.body;

  // 1. Handling Code Checks
  if (method === 'POST' && code) {
    const answers = { 1: "TWENTY TWO", 2: "OPUS" };
    if (code.toUpperCase() === answers[step]) {
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
