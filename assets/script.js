document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const timerDisplay = document.getElementById('timer');
    const minutesInput = document.getElementById('minutes-input');
    const secondsInput = document.getElementById('seconds-input');
    const startBtn = document.getElementById('start-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const resetBtn = document.getElementById('reset-btn');
    const pomodoroBtn = document.getElementById('pomodoro-btn');
    const fatigueBtn = document.getElementById('fatigue-btn');
    const sessionInfo = document.getElementById('session-info');
    const progressBar = document.getElementById('progress-bar');
    const focusTimeInput = document.getElementById('focus-time');
    const shortBreakInput = document.getElementById('short-break');
    const longBreakInput = document.getElementById('long-break');
    
    // Timer variables
    let timer;
    let timeLeft = 0;
    let totalTime = 0;
    let isRunning = false;
    let isPaused = false;
    let currentMode = 'pomodoro'; // 'pomodoro' or 'fatigue'
    let sessionType = 'focus'; // 'focus', 'shortBreak', 'longBreak'
    let sessionCount = 0;
    let pausedTime = 0;
    
    // Initialize timer
    resetTimer();
    
    // Event Listeners
    startBtn.addEventListener('click', startTimer);
    pauseBtn.addEventListener('click', pauseTimer);
    resetBtn.addEventListener('click', resetTimer);
    pomodoroBtn.addEventListener('click', () => switchMode('pomodoro'));
    fatigueBtn.addEventListener('click', () => switchMode('fatigue'));
    
    // Time input validation
    minutesInput.addEventListener('input', validateTimeInput);
    secondsInput.addEventListener('input', validateTimeInput);
    
    // Settings change listeners
    focusTimeInput.addEventListener('change', updateSettings);
    shortBreakInput.addEventListener('change', updateSettings);
    longBreakInput.addEventListener('change', updateSettings);
    
    // Functions
    function validateTimeInput(e) {
        const input = e.target;
        let value = input.value.replace(/\D/g, '');
        
        if (value.length > 2) {
            value = value.slice(0, 2);
        }
        
        if (input === secondsInput && parseInt(value) > 59) {
            value = '59';
        }
        
        input.value = value.padStart(2, '0');
        
        if (!isRunning && !isPaused) {
            timeLeft = (parseInt(minutesInput.value) * 60) + parseInt(secondsInput.value);
            updateDisplay();
        }
    }
    
    function switchMode(mode) {
        currentMode = mode;
        if (mode === 'pomodoro') {
            pomodoroBtn.classList.add('active');
            fatigueBtn.classList.remove('active');
        } else {
            fatigueBtn.classList.add('active');
            pomodoroBtn.classList.remove('active');
        }
        resetTimer();
    }
    
    function updateSettings() {
        resetTimer();
    }
    
    function startTimer() {
        if (isRunning) return;
        
        if (isPaused) {
            // Resuming from pause
            timeLeft = pausedTime;
            isPaused = false;
        } else {
            // Starting fresh
            setTimerForCurrentSession();
        }
        
        isRunning = true;
        startBtn.disabled = true;
        pauseBtn.disabled = false;
        resetBtn.disabled = false;
        
        timer = setInterval(() => {
            timeLeft--;
            updateDisplay();
            
            if (timeLeft <= 0) {
                clearInterval(timer);
                isRunning = false;
                startBtn.disabled = false;
                pauseBtn.disabled = true;
                
                // Play sound
                playAlertSound();
                
                // Move to next session
                nextSession();
            }
        }, 1000);
    }
    
    function pauseTimer() {
        if (!isRunning) return;
        
        clearInterval(timer);
        pausedTime = timeLeft;
        isPaused = true;
        isRunning = false;
        startBtn.disabled = false;
        pauseBtn.disabled = true;
        startBtn.textContent = 'Resume';
    }
    
    function resetTimer() {
        clearInterval(timer);
        isRunning = false;
        isPaused = false;
        startBtn.disabled = false;
        pauseBtn.disabled = true;
        resetBtn.disabled = false;
        startBtn.textContent = 'Start';
        sessionCount = 0;
        sessionType = 'focus';
        setTimerForCurrentSession();
        updateDisplay();
    }
    
    function setTimerForCurrentSession() {
        if (currentMode === 'pomodoro') {
            if (sessionType === 'focus') {
                totalTime = parseInt(focusTimeInput.value) * 60;
                sessionInfo.textContent = 'Focus Session';
            } else if (sessionType === 'shortBreak') {
                totalTime = parseInt(shortBreakInput.value) * 60;
                sessionInfo.textContent = 'Short Break';
            } else {
                totalTime = parseInt(longBreakInput.value) * 60;
                sessionInfo.textContent = 'Long Break';
            }
        } else { // Fatigue counter mode (Ultradian rhythm)
            if (sessionType === 'focus') {
                totalTime = 90 * 60; // 90 minutes focus
                sessionInfo.textContent = 'Deep Work Session';
            } else {
                totalTime = 30 * 60; // 30 minutes break (research suggests 20-30 min)
                sessionInfo.textContent = 'Recovery Break';
            }
        }
        
        timeLeft = totalTime;
        updateDisplay();
    }
    
    function nextSession() {
        if (currentMode === 'pomodoro') {
            if (sessionType === 'focus') {
                sessionCount++;
                if (sessionCount % 4 === 0) {
                    sessionType = 'longBreak';
                } else {
                    sessionType = 'shortBreak';
                }
            } else {
                sessionType = 'focus';
            }
        } else { // Fatigue counter mode (Ultradian rhythm)
            sessionType = sessionType === 'focus' ? 'shortBreak' : 'focus';
        }
        
        setTimerForCurrentSession();
        
        // Auto-start next session if not in break
        if (sessionType === 'focus') {
            setTimeout(() => {
                if (confirm('Start next focus session?')) {
                    startTimer();
                }
            }, 1000);
        }
    }
    
    function updateDisplay() {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // Update time inputs when not running
        if (!isRunning && !isPaused) {
            minutesInput.value = minutes.toString().padStart(2, '0');
            secondsInput.value = seconds.toString().padStart(2, '0');
        }
        
        // Update progress bar
        const progress = ((totalTime - timeLeft) / totalTime) * 100;
        progressBar.style.width = `${progress}%`;
        
        // Change color based on session type
        if (sessionType === 'focus') {
            progressBar.style.backgroundColor = '#4a6fa5';
        } else {
            progressBar.style.backgroundColor = '#5cb85c';
        }
    }
    
    function playAlertSound() {
        // Create a simple beep sound
        const context = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        
        oscillator.connect(gain);
        gain.connect(context.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.value = 800;
        gain.gain.exponentialRampToValueAtTime(0.1, context.currentTime + 0.5);
        
        oscillator.start();
        oscillator.stop(context.currentTime + 0.5);
    }
});