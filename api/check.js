export default function handler(req, res) {
  const { code, step } = req.body;

  // This is where your secret codes live!
  const answers = {
    1: "TWENTY TWO",
    2: "OPUS" 
  };

  // This checks if the user's guess matches your secret (ignoring caps)
  if (code && code.toUpperCase() === answers[step]) {
    res.status(200).json({ success: true });
  } else {
    res.status(401).json({ success: false });
  }
}
