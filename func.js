// Глобальное состояние
const state = {
    quizIndex: 0,
    quizScore: 0,
    quizHistory: [],
    profileName: 'Гость',
    achievements: {
        first_quiz: false,
        half_quiz: false,
        full_quiz: false,
        theme_switched: false,
        name_set: false
    },
    actionLog: []
};

// База вопросов
const questions = [
    { img: 'https://picsum.photos/seed/real1/600/400', type: 'real', explanation: 'Это реальное фото. Естественные тени, корректная геометрия и логичные детали фона.' },
    { img: 'https://picsum.photos/seed/ai1/600/400', type: 'fake', explanation: 'Сгенерировано ИИ. Обратите внимание на неестественную текстуру и размытые элементы на заднем плане.' },
    { img: 'https://picsum.photos/seed/real2/600/400', type: 'real', explanation: 'Реальное изображение. Физически корректное освещение и отсутствие артефактов генерации.' },
    { img: 'https://picsum.photos/seed/ai2/600/400', type: 'fake', explanation: 'ИИ-генерация. Странная типографика, искаженная перспектива и "пластиковый" блеск.' }
];

const achievementDefs = [
    { id: 'first_quiz', title: 'Первый шаг', desc: 'Пройдено первое задание', icon: '🚀' },
    { id: 'half_quiz', title: 'Аналитик', desc: 'Пройдено 2 задания', icon: '🧠' },
    { id: 'full_quiz', title: 'Эксперт', desc: 'Викторина завершена', icon: '🏆' },
    { id: 'theme_switched', title: 'Стилист', desc: 'Изменена тема оформления', icon: '🎨' },
    { id: 'name_set', title: 'Идентификация', desc: 'Указано имя пользователя', icon: '🪪' }
];

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    loadState();
    setupTheme();
    setupFullscreen();
    setupProfile();
    setupQuizLoader();
    renderQuiz();
    renderAchievements();
    renderHistory();
});

// Навигация
function navigateTo(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(screenId);
    if (target) {
        target.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// Тема
function setupTheme() {
    const toggle = document.getElementById('theme-toggle');
    const saved = localStorage.getItem('cf_theme');
    if (saved === 'dark') document.body.classList.add('dark-theme');
    
    toggle?.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        const isDark = document.body.classList.contains('dark-theme');
        localStorage.setItem('cf_theme', isDark ? 'dark' : 'light');
        unlockAchievement('theme_switched');
    });
}

// Полный экран
function setupFullscreen() {
    const fullscreenToggle = document.getElementById('fullscreen-toggle');
    if (fullscreenToggle) {
        fullscreenToggle.addEventListener('click', () => {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(err => console.warn('Fullscreen blocked:', err));
            } else if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        });
    }
}

// Профиль
function setupProfile() {
    const nameInput = document.getElementById('name-input');
    if (nameInput) {
        nameInput.value = state.profileName !== 'Гость' ? state.profileName : '';
        document.getElementById('user-name').textContent = state.profileName;
        
        nameInput.addEventListener('input', (e) => {
            const val = e.target.value.trim();
            state.profileName = val || 'Гость';
            document.getElementById('user-name').textContent = state.profileName;
            if (val && !state.achievements.name_set) unlockAchievement('name_set');
            saveState();
        });
    }
}

// Загрузчик изображений
function setupQuizLoader() {
    const img = document.getElementById('quiz-img');
    const loader = document.getElementById('img-loader');
    if (img && loader) {
        img.addEventListener('load', () => loader.style.display = 'none');
        img.addEventListener('error', () => {
            loader.textContent = '⚠️ Ошибка загрузки';
            loader.style.display = 'block';
        });
    }
}

// Викторина
function renderQuiz() {
    const controls = document.getElementById('quiz-controls');
    const feedback = document.getElementById('quiz-feedback');
    const results = document.getElementById('quiz-results');
    
    if (controls) controls.style.display = 'flex';
    if (feedback) feedback.classList.add('hidden');
    if (results) results.classList.add('hidden');

    if (state.quizIndex >= questions.length) {
        if (controls) controls.style.display = 'none';
        if (feedback) feedback.classList.add('hidden');
        showQuizResults();
        return;
    }

    const q = questions[state.quizIndex];
    const quizImg = document.getElementById('quiz-img');
    const prompt = document.querySelector('.quiz-prompt');
    const buttons = document.querySelectorAll('.ans-btn');

    if (quizImg) {
        quizImg.src = q.img;
        document.getElementById('img-loader').style.display = 'block'; // Показать лоадер пока грузится
    }
    
    if (prompt) prompt.textContent = `Вопрос ${state.quizIndex + 1}: Это фото или ИИ?`;
    if (buttons) buttons.forEach(btn => btn.disabled = false);
}

function checkAnswer(choice) {
    const q = questions[state.quizIndex];
    const isCorrect = choice === q.type;
    if (isCorrect) state.quizScore++;
    
    const buttons = document.querySelectorAll('.ans-btn');
    if (buttons) buttons.forEach(btn => btn.disabled = true);

    const feedback = document.getElementById('quiz-feedback');
    const feedbackText = document.getElementById('feedback-text');

    if (feedback) feedback.classList.remove('hidden');
    if (feedbackText) {
        feedbackText.innerHTML = `
            <b>${isCorrect ? '✅ Верно!' : '❌ Неверно.'}</b><br>${q.explanation}
        `;
    }

    state.quizHistory.push({ q: `Вопрос ${state.quizIndex + 1}`, correct: isCorrect });
    logAction(`Викторина: ${isCorrect ? 'верный ответ' : 'ошибка'}`);
    saveState();
}

function nextQuestion() {
    state.quizIndex++;
    if (state.quizIndex === 1) unlockAchievement('first_quiz');
    if (state.quizIndex === 2) unlockAchievement('half_quiz');
    renderQuiz();
}

function showQuizResults() {
    const results = document.getElementById('quiz-results');
    const finalScore = document.getElementById('final-score');
    if (results) results.classList.remove('hidden');
    if (finalScore) finalScore.textContent = `Правильных ответов: ${state.quizScore} из ${questions.length}`;

    const list = document.getElementById('results-list');
    if (list) {
        list.innerHTML = state.quizHistory.map(h => `
            <div class="result-item ${h.correct ? 'correct' : 'wrong'}">
                ${h.q} – ${h.correct ? 'Верно' : 'Неверно'}
            </div>
        `).join('');
    }

    if (state.quizIndex === questions.length) unlockAchievement('full_quiz');
}

function resetQuiz() {
    state.quizIndex = 0;
    state.quizScore = 0;
    state.quizHistory = [];
    renderQuiz();
}

// Достижения и История
function renderAchievements() {
    const grid = document.getElementById('achievements-grid');
    if (!grid) return;
    // ИСПРАВЛЕНО: def = > заменено на def =>, убраны лишние пробелы в классах
    grid.innerHTML = achievementDefs.map(def => `
         <div class="achievement ${state.achievements[def.id] ? 'unlocked' : ''}">
             <span>${def.icon}</span>
             <b>${def.title}</b>
         </div>
    `).join('');
}

function unlockAchievement(id) {
    if (state.achievements[id]) return;
    state.achievements[id] = true;
    renderAchievements();
    saveState();
    const def = achievementDefs.find(a => a.id === id);
    if (def) showPopup(def);
}

function showPopup(def) {
    const popup = document.getElementById('achievement-popup');
    const title = document.getElementById('popup-title');
    const desc = document.getElementById('popup-desc');
    const icon = document.getElementById('popup-icon');
    
    if (popup) popup.classList.remove('hidden');
    if (title) title.textContent = `🎉 ${def.title}`;
    if (desc) desc.textContent = def.desc;
    if (icon) icon.textContent = def.icon;

    setTimeout(() => {
        if (popup) popup.classList.add('hidden');
    }, 3500);
}

function logAction(action) {
    const time = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    state.actionLog.unshift(`[${time}] ${action}`);
    if (state.actionLog.length > 20) state.actionLog.pop();
    renderHistory();
}

function renderHistory() {
    const historyList = document.getElementById('history-list');
    if (historyList) {
        historyList.innerHTML = state.actionLog.map(h => `<li>${h}</li>`).join('');
    }
}

// Сохранение
function loadState() {
    const saved = localStorage.getItem('cf_platform_v1');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            Object.assign(state, parsed);
        } catch (e) {
            console.error('Ошибка при загрузке состояния:', e);
        }
    }
}

function saveState() {
    try {
        localStorage.setItem('cf_platform_v1', JSON.stringify(state));
    } catch (e) {
        console.error('Ошибка при сохранении состояния:', e);
    }
}
