<!DOCTYPE html>
<html>
<head>
    <title>ENTRANCE</title>
    <style>
        body { background: black; color: white; display: flex; height: 100vh; align-items: center; justify-content: center; margin: 0; font-family: monospace; }
        input { background: transparent; border: none; color: white; font-size: 2rem; text-align: center; outline: none; animation: blink 1s infinite; }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
    </style>
</head>
<body>
    <input type="text" id="codeField" placeholder="ENTER CODE" autofocus>

    <script>
        let currentStep = 1;
        const input = document.getElementById('codeField');

        input.addEventListener('keypress', async (e) => {
            if (e.key === 'Enter') {
                const response = await fetch('/api/check', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ code: input.value, step: currentStep })
                });

                if (response.ok) {
                    if (currentStep === 1) {
                        currentStep = 2;
                        input.value = "";
                        input.placeholder = "NEXT CODE";
                    } else {
                        // CHANGE THIS TO YOUR FINAL YOUTUBE LINK
                        window.location.href = "https://www.youtube.com/watch?v=YOUR_VIDEO_ID";
                    }
                } else {
                    input.value = "";
                    input.placeholder = "WRONG. TRY AGAIN.";
                }
            }
        });
    </script>
</body>
</html>
