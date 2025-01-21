let studyStartTime = null;
let studyDuration = 0;
let timerInterval = null;
let elapsedPausedTime = 0;
let isPaused = false;

const progressBar = document.querySelector('.progress-bar');
const progress = document.getElementById('progress');
const timeRemaining = document.getElementById('timeRemaining');
const studyLogElement = document.createElement('div');
studyLogElement.id = 'studyLog';
document.body.appendChild(studyLogElement);

function startTimer(duration) {
    clearInterval(timerInterval);
    if (!isPaused) {
        studyStartTime = new Date();
        elapsedPausedTime = 0; // Reset pause time when starting new session
    }
    studyDuration = duration;
    progressBar.style.display = 'block';
    progress.style.width = '0%';

    timerInterval = setInterval(() => {
        if (!isPaused) {
            const now = new Date();
            const elapsed = Math.min((now - studyStartTime + elapsedPausedTime) / 1000, studyDuration);
            const remaining = studyDuration - elapsed;
            const percentage = (elapsed / studyDuration) * 100;

            progress.style.width = percentage + '%';
            timeRemaining.textContent = `Time remaining: ${formatTime(remaining)}`;

            if (elapsed >= studyDuration) {
                clearInterval(timerInterval);
                recordStudyTime(studyDuration);
                timeRemaining.textContent = "Session complete!";
            }
        }
    }, 1000);
}

function formatTime(seconds) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hrs}h ${mins}m ${secs}s`;
}

function recordStudyTime(duration) {
    const totalElapsed = (new Date() - studyStartTime + elapsedPausedTime) / 1000;
    const finalDuration = Math.ceil(Math.min(totalElapsed, duration));
    const today = new Date().toLocaleDateString();
    const storedData = JSON.parse(localStorage.getItem('dailyStudyLog') || '{}');

    if (storedData[today]) {
        storedData[today] += finalDuration;
    } else {
        storedData[today] = finalDuration;
    }

    localStorage.setItem('dailyStudyLog', JSON.stringify(storedData));
    updateStudyLogDisplay();
}

function updateStudyLogDisplay() {
    const storedData = JSON.parse(localStorage.getItem('dailyStudyLog') || '{}');
    const logEntries = Object.entries(storedData)
        .map(([date, seconds]) => `${date}: ${formatTime(seconds)}`)
        .join('<br>');

    studyLogElement.innerHTML = `<h2>Study Log</h2>${logEntries}`;
}

document.getElementById('startStudy').addEventListener('click', () => {
    isPaused = false;
    startTimer(4 * 3600);
});

document.getElementById('startExam').addEventListener('click', () => {
    isPaused = false;
    startTimer(8 * 3600);
});

document.getElementById('pause').addEventListener('click', () => {
    if (isPaused) {
        studyStartTime = new Date();
        isPaused = false;
    } else {
        clearInterval(timerInterval);
        elapsedPausedTime += new Date() - studyStartTime;
        isPaused = true;
    }
});

// Display the study log when the page loads
updateStudyLogDisplay();
