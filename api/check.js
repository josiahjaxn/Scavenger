export default function handler(req, res) {
  try {
    const { method } = req;
    const { code, step } = req.body || {};

    // 1. If the website asks for the leaderboard, give an empty list (Temporary)
    if (method === 'GET') {
      return res.status(200).json({ leaderboard: [] });
    }

    // 2. If the user enters a CODE, check it
    if (method === 'POST' && code) {
      // Remove spaces and make uppercase
      const cleanedInput = code.replace(/\s+/g, '').toUpperCase();
      
      const answers = { 
        1: "TWENTYTWO", 
        2: "OPUS" 
      };

      // If it matches, let them in!
      if (cleanedInput === answers[step]) {
        return res.status(200).json({ success: true });
      }
      return res.status(401).json({ success: false });
    }

    // 3. If the user enters a NAME, just say "OK" (Temporary)
    if (method === 'POST' && req.body.name) {
      return res.status(200).json({ leaderboard: [] });
    }

    // Fallback
    return res.status(200).json({ success: false });

  } catch (error) {
    console.error("Logic Error:", error);
    return res.status(500).json({ error: "System Error" });
  }
}
