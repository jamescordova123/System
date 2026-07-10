@php
    $retryAfter = null;
    if (isset($exception)) {
        $headers = $exception->getHeaders();
        $retryAfter = $headers['Retry-After'] ?? $headers['retry-after'] ?? null;
    }
    
    // Fallback to database setting if not present in header
    if (is_null($retryAfter)) {
        try {
            $settings = \App\Models\SecuritySetting::firstOrCreate([]);
            // Convert lockout duration minutes to seconds
            $retryAfter = ($settings->lockout_duration_minutes ?? 15) * 60;
        } catch (\Exception $e) {
            $retryAfter = 60; // default fallback
        }
    }
@endphp
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Too Many Requests - 429</title>
    
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&family=Plus+Jakarta+Sans:wght@400;500;700&display=swap" rel="stylesheet">

    <style>
        :root {
            --background: #f8fafc;
            --foreground: #0f172a;
            --card-bg: rgba(255, 255, 255, 0.7);
            --card-border: rgba(15, 23, 42, 0.08);
            --primary: #6366f1;
            --primary-glow: rgba(99, 102, 241, 0.15);
            --accent: #f43f5e;
            --accent-glow: rgba(244, 63, 94, 0.15);
            --muted-text: #64748b;
            --grid-color: rgba(99, 102, 241, 0.04);
            --ring-color: rgba(99, 102, 241, 0.2);
            --glow-orb-1: rgba(99, 102, 241, 0.12);
            --glow-orb-2: rgba(244, 63, 94, 0.1);
        }

        @media (prefers-color-scheme: dark) {
            :root {
                --background: #09090b;
                --foreground: #f8fafc;
                --card-bg: rgba(18, 18, 22, 0.6);
                --card-border: rgba(255, 255, 255, 0.08);
                --primary: #818cf8;
                --primary-glow: rgba(129, 140, 248, 0.25);
                --accent: #fb7185;
                --accent-glow: rgba(251, 113, 133, 0.25);
                --muted-text: #94a3b8;
                --grid-color: rgba(129, 140, 248, 0.03);
                --ring-color: rgba(129, 140, 248, 0.3);
                --glow-orb-1: rgba(129, 140, 248, 0.15);
                --glow-orb-2: rgba(251, 113, 133, 0.12);
            }
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: 'Plus Jakarta Sans', sans-serif;
            background-color: var(--background);
            color: var(--foreground);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            position: relative;
            transition: background-color 0.3s ease;
        }

        /* Ambient Glowing Background Orbs */
        .glow-orb {
            position: absolute;
            border-radius: 50%;
            filter: blur(100px);
            z-index: 1;
            pointer-events: none;
            animation: float 20s infinite alternate ease-in-out;
        }

        .orb-1 {
            width: 400px;
            height: 400px;
            background: var(--glow-orb-1);
            top: -100px;
            left: -100px;
        }

        .orb-2 {
            width: 500px;
            height: 500px;
            background: var(--glow-orb-2);
            bottom: -150px;
            right: -100px;
            animation-delay: -5s;
        }

        /* CSS Grid Overlay */
        .grid-bg {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-image: 
                linear-gradient(var(--grid-color) 1px, transparent 1px),
                linear-gradient(90deg, var(--grid-color) 1px, transparent 1px);
            background-size: 50px 50px;
            z-index: 2;
            pointer-events: none;
        }

        /* Main Glassmorphic Container */
        .card {
            background: var(--card-bg);
            border: 1px solid var(--card-border);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            padding: 3rem 2.5rem;
            border-radius: 24px;
            width: 100%;
            max-width: 540px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            text-align: center;
            z-index: 10;
            position: relative;
            transform: scale(0.95);
            opacity: 0;
            animation: fadeInUp 0.8s forwards cubic-bezier(0.16, 1, 0.3, 1);
        }

        /* Header Accent Badge */
        .badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 6px 14px;
            background: var(--accent-glow);
            border: 1px solid rgba(244, 63, 94, 0.2);
            color: var(--accent);
            border-radius: 100px;
            font-size: 0.75rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 2rem;
            animation: pulse-border 2s infinite alternate;
        }

        /* SVG Animation */
        .animation-container {
            width: 140px;
            height: 140px;
            margin: 0 auto 2rem;
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .radar-circle {
            position: absolute;
            border: 1.5px solid var(--ring-color);
            border-radius: 50%;
            animation: sonar-expand 3s infinite linear;
            opacity: 0;
        }

        .circle-1 { animation-delay: 0s; }
        .circle-2 { animation-delay: 1s; }
        .circle-3 { animation-delay: 2s; }

        .shield-icon {
            width: 76px;
            height: 76px;
            background: linear-gradient(135deg, var(--primary), var(--accent));
            border-radius: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ffffff;
            box-shadow: 0 10px 30px rgba(99, 102, 241, 0.4);
            z-index: 5;
            animation: bounce-slow 4s infinite ease-in-out;
        }

        /* Typography */
        h1 {
            font-family: 'Outfit', sans-serif;
            font-size: 4.5rem;
            font-weight: 800;
            line-height: 1;
            margin-bottom: 0.5rem;
            background: linear-gradient(135deg, var(--foreground) 30%, var(--muted-text));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            letter-spacing: -0.03em;
        }

        h2 {
            font-family: 'Outfit', sans-serif;
            font-size: 1.5rem;
            font-weight: 600;
            margin-bottom: 1rem;
            letter-spacing: -0.01em;
        }

        p.description {
            color: var(--muted-text);
            font-size: 0.95rem;
            line-height: 1.6;
            margin-bottom: 2rem;
            padding: 0 1rem;
        }

        /* Timer Circle Display */
        .timer-wrapper {
            margin-bottom: 2rem;
            display: inline-flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
        }

        .countdown-number {
            font-family: 'Outfit', sans-serif;
            font-size: 2rem;
            font-weight: 800;
            color: var(--primary);
        }

        .progress-container {
            width: 180px;
            height: 6px;
            background: rgba(129, 140, 248, 0.1);
            border-radius: 100px;
            overflow: hidden;
            position: relative;
        }

        .progress-bar {
            height: 100%;
            width: 100%;
            background: linear-gradient(90deg, var(--primary), var(--accent));
            border-radius: 100px;
            transition: width 1s linear;
        }

        /* Action Buttons */
        .btn-group {
            display: flex;
            gap: 12px;
            justify-content: center;
        }

        .btn {
            font-family: 'Plus Jakarta Sans', sans-serif;
            font-size: 0.9rem;
            font-weight: 600;
            padding: 12px 24px;
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            justify-content: center;
        }

        .btn-primary {
            background: var(--primary);
            color: #ffffff;
            border: none;
            box-shadow: 0 4px 14px var(--primary-glow);
        }

        .btn-primary:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(99, 102, 241, 0.35);
            background: #4f46e5;
        }

        .btn-primary:active:not(:disabled) {
            transform: translateY(0);
        }

        .btn-primary:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            background: var(--muted-text);
            box-shadow: none;
        }

        .btn-secondary {
            background: transparent;
            color: var(--foreground);
            border: 1px solid var(--card-border);
        }

        .btn-secondary:hover {
            background: rgba(129, 140, 248, 0.05);
            border-color: var(--primary);
        }

        /* Keyframe Animations */
        @keyframes float {
            0% { transform: translateY(0) scale(1); }
            50% { transform: translateY(-20px) scale(1.05); }
            100% { transform: translateY(10px) scale(0.95); }
        }

        @keyframes fadeInUp {
            to {
                transform: scale(1);
                opacity: 1;
            }
        }

        @keyframes bounce-slow {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-6px); }
        }

        @keyframes sonar-expand {
            0% {
                width: 60px;
                height: 60px;
                opacity: 0;
            }
            10% {
                opacity: 0.8;
            }
            100% {
                width: 160px;
                height: 160px;
                opacity: 0;
            }
        }

        @keyframes pulse-border {
            0% {
                border-color: rgba(244, 63, 94, 0.2);
                box-shadow: 0 0 0 0 rgba(244, 63, 94, 0.1);
            }
            100% {
                border-color: rgba(244, 63, 94, 0.6);
                box-shadow: 0 0 0 8px rgba(244, 63, 94, 0);
            }
        }
    </style>
</head>
<body>

    <!-- Grid Overlay -->
    <div class="grid-bg"></div>

    <!-- Background Glows -->
    <div class="glow-orb orb-1"></div>
    <div class="glow-orb orb-2"></div>

    <!-- Error Card -->
    <div class="card">
        <div class="badge">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Rate Limit Exceeded
        </div>

        <div class="animation-container">
            <div class="radar-circle circle-1"></div>
            <div class="radar-circle circle-2"></div>
            <div class="radar-circle circle-3"></div>
            <div class="shield-icon">
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    <path d="M12 8v4"/>
                    <path d="M12 16h.01"/>
                </svg>
            </div>
        </div>

        <h1>429</h1>
        <h2>Too Many Requests</h2>
        <p class="description">
            You've sent too many requests in a short period of time. Our security system has temporarily throttled your connection to ensure overall stability.
        </p>

        <div class="timer-wrapper">
            <div class="progress-container">
                <div class="progress-bar" id="progress-bar"></div>
            </div>
            <p class="description" style="margin-top: 10px; margin-bottom: 0; font-size: 0.85rem;">
                Please wait <span class="countdown-number" id="seconds-countdown">{{ $retryAfter }}</span>s before retrying.
            </p>
        </div>

        <div class="btn-group">
            <button class="btn btn-primary" id="retry-button" disabled onclick="window.location.reload();">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
                </svg>
                Cooling Down
            </button>
            <a href="/" class="btn btn-secondary">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
                Go Home
            </a>
        </div>
    </div>

    <script>
        // Intelligent countdown
        const totalDuration = parseInt("{{ $retryAfter }}") || 60;
        let timeLeft = totalDuration;
        
        const countdownEl = document.getElementById('seconds-countdown');
        const progressBar = document.getElementById('progress-bar');
        const retryBtn = document.getElementById('retry-button');

        const updateTimer = () => {
            timeLeft--;
            if (countdownEl) countdownEl.textContent = Math.max(0, timeLeft);
            
            // Progress Bar shrinks from 100% to 0%
            if (progressBar) {
                const percentage = Math.max(0, (timeLeft / totalDuration) * 100);
                progressBar.style.width = percentage + '%';
            }

            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                if (retryBtn) {
                    retryBtn.removeAttribute('disabled');
                    retryBtn.innerHTML = `
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
                        </svg>
                        Try Again
                    `;
                }
            }
        };

        const timerInterval = setInterval(updateTimer, 1000);
        // Initial call to set state
        if (progressBar) progressBar.style.width = '100%';
    </script>
</body>
</html>

