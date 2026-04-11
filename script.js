// ============================================
// ДАННЫЕ
// ============================================
const cyberQuestions = [
    { question: "Что такое фишинг?", answers: ["Попытка мошенничества с целью получения конфиденциальной информации", "Разновидность вредоносного вируса", "Способ шифрования данных сетевого протокола"], correct: 0, category: "Основы безопасности" },
    { question: "Какой пароль наиболее безопасен?", answers: ["123456", "password", "qwerty123", "G7$mK9@pL2!v"], correct: 3, category: "Парольная безопасность" },
    { question: "Что означает HTTPS в адресе сайта?", answers: ["Высокоскоростной протокол", "Гипертекстовый протокол с шифрованием", "Протокол для изображений", "Протокол для мобильных"], correct: 1, category: "Веб-безопасность" },
    { question: "Что такое двухфакторная аутентификация?", answers: ["Два разных пароля", "Пароль + дополнительный фактор", "Двойное шифрование", "Две учетные записи"], correct: 1, category: "Аутентификация" },
    { question: "Как определить фишинговую ссылку?", answers: ["Проверить HTTPS", "Проверить домен", "Обратить внимание на опечатки", "Все вышеперечисленное"], correct: 3, category: "Фишинг" },
    { question: "Что такое ransomware?", answers: ["Программа-шифровальщик с требованием выкупа", "Антивирусное ПО", "Сетевой протокол", "Тип брандмауэра"], correct: 0, category: "Вредоносное ПО" },
    { question: "Как защититься от вредоносного ПО?", answers: ["Официальные источники", "Не открывать подозрительные вложения", "Обновлять систему", "Все вышеперечисленное"], correct: 3, category: "Защита системы" },
    { question: "Что такое социальная инженерия?", answers: ["Метод взлома", "Манипуляция людьми для получения информации", "Способ защиты", "Тип шифрования"], correct: 1, category: "Человеческий фактор" },
    { question: "Что делать при взломе аккаунта?", answers: ["Сменить пароль", "Уведомить поддержку", "Проверить активность", "Все вышеперечисленное"], correct: 3, category: "Реагирование" },
    { question: "Какие символы в надежном пароле?", answers: ["Только буквы", "Только цифры", "Буквы и цифры", "Буквы, цифры и спецсимволы"], correct: 3, category: "Парольная безопасность" },
    { question: "Что делать после перехода по фишинговой ссылке?", answers: ["Ничего", "Сменить пароли и проверить аккаунты", "Удалить браузер", "Написать мошенникам"], correct: 1, category: "Реагирование" },
    { question: "Какой адрес наиболее подозрителен?", answers: ["https://www.sberbank.ru", "https://sberbank-security-verify.ru", "https://online.sberbank.ru", "https://www.sberbank.com"], correct: 1, category: "Фишинг" },
    { question: "Как мошенники используют вашу фотографию?", answers: ["Для мемов", "Для фейковых аккаунтов", "Фото не опасны", "Только с геолокацией"], correct: 1, category: "Цифровой след" },
    { question: "Что такое «цифровой след»?", answers: ["След на экране", "Вся информация о вас в интернете", "История поиска", "Забытый пароль"], correct: 1, category: "Цифровая гигиена" }
];

const videoData = [
    { id: "real1", title: "Новостной репортаж", description: "Видео A - Новостной репортаж (30 сек)", isAI: false, embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
    { id: "ai1", title: "Интервью", description: "Видео B - Интервью (45 сек)", isAI: true, embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
    { id: "real2", title: "Пресс-конференция", description: "Видео C - Пресс-конференция (60 сек)", isAI: false, embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" }
];

const achievements = [
    { id: 'first_test', name: 'Первый шаг', icon: '🎯', description: 'Пройти первый тест', requirement: 1 },
    { id: 'perfect_score', name: 'Эксперт', icon: '🏆', description: '100% в тесте', requirement: 100 },
    { id: 'password_pro', name: 'Защитник', icon: '🔐', description: 'Создать 5 паролей', requirement: 5 },
    { id: 'week_streak', name: 'Неделя', icon: '🔥', description: '7 дней подряд', requirement: 7 },
    { id: 'breach_check', name: 'Осторожный', icon: '⚠️', description: 'Проверить email', requirement: 1 }
];

let currentQuestion = 0;
let userAnswers = Array(cyberQuestions.length).fill(null);
let testCompleted = false;
let videoIndex = 0;
let videoScore = 0;

// ============================================
// ОБЩИЕ ФУНКЦИИ
// ============================================
function showNotification(message, type = "info") {
    const notification = document.createElement("div");
    notification.textContent = message;
    notification.style.cssText = `position: fixed; top: 20px; left: 50%; transform: translateX(-50%); padding: 18px 30px; border-radius: 12px; font-weight: bold; z-index: 3000; color: white; text-align: center; box-shadow: 0 8px 25px rgba(0,0,0,0.3); font-size: 1.1rem;`;
    
    if (type === "success") notification.style.background = "var(--neon-green)";
    else if (type === "error") notification.style.background = "var(--neon-red)";
    else notification.style.background = "var(--neon-blue)";
    
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.style.opacity = "0";
        setTimeout(() => { if (notification.parentNode) document.body.removeChild(notification); }, 300);
    }, 3000);
}

function setCookie(name, value, days) {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
}

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function initCookies() {
    if (!getCookie('cyberguard_visited')) {
        setCookie('cyberguard_visited', 'true', 365);
        console.log('Куки установлены.');
    }
}

function initTabs() {
    const navLinks = document.querySelectorAll('.nav-link');
    const tabSections = document.querySelectorAll('.tab-section');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            tabSections.forEach(section => section.classList.remove('active'));
            const targetTab = this.getAttribute('data-tab');
            const target = document.getElementById(targetTab);
            if (target) target.classList.add('active');
        });
    });
}

function initTheme() {
    const savedTheme = localStorage.getItem("cyberguard-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    if (savedTheme === "light") setTheme("light");
    else if (savedTheme === "dark") setTheme("dark");
    else if (prefersDark) setTheme("dark");
    else setTheme("light");
    
    const themeToggle = document.getElementById("theme-toggle");
    if (themeToggle) themeToggle.addEventListener("click", toggleTheme);
}

function toggleTheme() {
    const current = document.documentElement.getAttribute("data-theme") || "dark";
    setTheme(current === "light" ? "dark" : "light");
}

function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    const themeIcon = document.getElementById("theme-toggle");
    if (themeIcon) themeIcon.textContent = theme === "light" ? "☀️" : "🌙";
    try { localStorage.setItem("cyberguard-theme", theme); } catch (e) {}
}

// ============================================
// ЛИЧНЫЙ КАБИНЕТ
// ============================================
function getUserData() {
    const stored = localStorage.getItem('cyberguard-user-data');
    if (stored) return JSON.parse(stored);
    return { username: 'Гость', level: 'Новичок', xp: 0, maxXp: 1000, testsCompleted: 0, averageScore: 0, streak: 0, lastVisit: null, achievements: [], history: [], passwordsGenerated: 0 };
}

function saveUserData(data) { localStorage.setItem('cyberguard-user-data', JSON.stringify(data)); }

function initDashboard() {
    const userData = getUserData();
    updateDashboardUI(userData);
    loadAchievements(userData);
    loadHistory(userData);
}

function updateDashboardUI(data) {
    const elUser = document.getElementById('dashboard-username');
    if (elUser) elUser.textContent = data.username;
    
    const elLvl = document.getElementById('dashboard-level');
    if (elLvl) elLvl.textContent = `Уровень: ${data.level}`;
    
    const elInit = document.getElementById('user-avatar-initial');
    if (elInit) elInit.textContent = data.username.charAt(0).toUpperCase();
    
    const xpPercent = (data.xp / data.maxXp) * 100;
    const xpBar = document.getElementById('xp-progress');
    if (xpBar) xpBar.style.width = `${xpPercent}%`;
    
    const xpText = document.getElementById('xp-text');
    if (xpText) xpText.textContent = `${data.xp} / ${data.maxXp} XP`;
    
    const statTests = document.getElementById('stat-tests');
    if (statTests) statTests.textContent = data.testsCompleted;
    
    const statAch = document.getElementById('stat-achievements');
    if (statAch) statAch.textContent = data.achievements.length;
    
    const statAvg = document.getElementById('stat-average');
    if (statAvg) statAvg.textContent = `${data.averageScore}%`;
    
    const statStreak = document.getElementById('stat-streak');
    if (statStreak) statStreak.textContent = data.streak;
}

function loadAchievements(data) {
    const container = document.getElementById('achievements-list');
    if (!container) return;
    container.innerHTML = '';
    achievements.forEach(ach => {
        const unlocked = data.achievements.includes(ach.id);
        const card = document.createElement('div');
        card.className = `achievement-card ${unlocked ? 'unlocked' : ''}`;
        card.innerHTML = `<div class="achievement-icon">${ach.icon}</div><div class="achievement-name">${ach.name}</div>`;
        container.appendChild(card);
    });
}

function loadHistory(data) {
    const container = document.getElementById('activity-history');
    if (!container) return;
    container.innerHTML = '';
    if (data.history.length === 0) { container.innerHTML = '<div style="text-align:center;opacity:0.7">История пуста</div>'; return; }
    data.history.slice(0, 10).forEach(item => {
        const div = document.createElement('div');
        div.className = 'history-item';
        div.innerHTML = `<div class="history-date">${item.date}</div><div class="history-action">${item.action}</div>${item.score ? `<div style="color:var(--neon-blue)">Результат: ${item.score}%</div>` : ''}`;
        container.appendChild(div);
    });
}

function addHistory(action, score = null) {
    const data = getUserData();
    const today = new Date().toLocaleDateString('ru-RU');
    data.history.unshift({ date: today, action: action, score: score, timestamp: Date.now() });
    if (data.history.length > 50) data.history = data.history.slice(0, 50);
    saveUserData(data);
    loadHistory(data);
}

function addXP(amount) {
    const data = getUserData();
    data.xp += amount;
    if (data.xp >= data.maxXp) {
        data.xp = data.xp - data.maxXp;
        data.maxXp = Math.floor(data.maxXp * 1.5);
        const levels = ['Новичок', 'Ученик', 'Практик', 'Специалист', 'Эксперт', 'Мастер', 'Легенда'];
        const index = levels.indexOf(data.level);
        if (index < levels.length - 1) data.level = levels[index + 1];
        showNotification(`🎉 Новый уровень: ${data.level}!`, 'success');
    }
    saveUserData(data);
    updateDashboardUI(data);
}

function unlockAchievement(id) {
    const data = getUserData();
    if (!data.achievements.includes(id)) {
        data.achievements.push(id);
        saveUserData(data);
        loadAchievements(data);
        const ach = achievements.find(a => a.id === id);
        if (ach) showAchievementPopup(ach);
        addXP(100);
    }
}

function showAchievementPopup(achievement) {
    const popup = document.getElementById('achievement-popup');
    const nameEl = document.getElementById('achievement-name');
    const iconEl = document.getElementById('achievement-icon');
    const descEl = document.getElementById('achievement-desc');
    if (!popup || !nameEl) return;
    nameEl.textContent = achievement.name;
    if (iconEl) iconEl.textContent = achievement.icon;
    if (descEl) descEl.textContent = achievement.description;
    popup.style.display = 'block';
    setTimeout(() => {
        popup.style.display = 'none';
    }, 4000);
}

function updateStreak() {
    const data = getUserData();
    const today = new Date().toDateString();
    const lastVisit = data.lastVisit ? new Date(data.lastVisit).toDateString() : null;
    if (lastVisit !== today) {
        const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
        if (lastVisit === yesterday.toDateString()) data.streak++;
        else data.streak = 1;
        data.lastVisit = new Date().toISOString();
        saveUserData(data);
        if (data.streak >= 7) unlockAchievement('week_streak');
    }
}

function clearAllData() {
    if (confirm('Вы уверены? Все данные будут удалены безвозвратно!')) {
        localStorage.removeItem('cyberguard-user-data');
        localStorage.removeItem('cyberguard-cert-data');
        localStorage.removeItem('cyberguard-theme');
        location.reload();
    }
}

// ============================================
// ТЕСТ
// ============================================
function initCyberTest() {
    loadCertificateData();
    if (!testCompleted) {
        initTestProgress();
        loadQuestion();
    }
}

function initTestProgress() {
    const progressContainer = document.getElementById("test-progress");
    if (!progressContainer) return;
    progressContainer.innerHTML = "";
    for (let i = 0; i < cyberQuestions.length; i++) {
        const dot = document.createElement("div");
        dot.className = "progress-dot";
        dot.id = `test-dot-${i}`;
        progressContainer.appendChild(dot);
    }
}

function updateTestProgress() {
    for (let i = 0; i < cyberQuestions.length; i++) {
        const dot = document.getElementById(`test-dot-${i}`);
        if (!dot) continue;
        if (i < currentQuestion) dot.className = "progress-dot completed";
        else if (i === currentQuestion) dot.className = "progress-dot active";
        else dot.className = "progress-dot";
    }
    const questionNumberEl = document.getElementById("question-number");
    if (questionNumberEl) questionNumberEl.textContent = `Вопрос ${currentQuestion + 1} из ${cyberQuestions.length}`;
}

function loadQuestion() {
    const questionText = document.getElementById("question-text");
    const answersContainer = document.getElementById("answers-container");
    const nextBtn = document.getElementById("next-btn");
    const submitBtn = document.getElementById("submit-btn");
    const prevBtn = document.getElementById("prev-btn");
    if (!questionText || !answersContainer) return;
    
    const question = cyberQuestions[currentQuestion];
    questionText.textContent = question.question;
    answersContainer.innerHTML = "";
    
    question.answers.forEach((answer, index) => {
        const answerElement = document.createElement("div");
        answerElement.className = "answer-option";
        answerElement.innerHTML = `<span class="answer-letter">${String.fromCharCode(65 + index)}</span> ${answer}`;
        answerElement.dataset.index = index;
        if (userAnswers[currentQuestion] === index) answerElement.classList.add("selected");
        
        answerElement.addEventListener("click", function() {
            document.querySelectorAll(".answer-option").forEach(el => el.classList.remove("selected"));
            this.classList.add("selected");
            userAnswers[currentQuestion] = index;
            if (nextBtn) nextBtn.disabled = false;
            
            if (currentQuestion === cyberQuestions.length - 1) {
                if (nextBtn) nextBtn.style.display = "none";
                if (submitBtn) submitBtn.style.display = "inline-block";
            } else {
                if (nextBtn) { nextBtn.style.display = "inline-block"; nextBtn.disabled = false; }
                if (submitBtn) submitBtn.style.display = "none";
            }
        });
        answersContainer.appendChild(answerElement);
    });
    
    if (prevBtn) prevBtn.disabled = currentQuestion === 0;
    if (nextBtn) {
        nextBtn.disabled = userAnswers[currentQuestion] === null;
        if (currentQuestion === cyberQuestions.length - 1) nextBtn.style.display = "none";
        else nextBtn.style.display = "inline-block";
    }
    if (submitBtn) {
        if (currentQuestion === cyberQuestions.length - 1) submitBtn.style.display = "inline-block";
        else submitBtn.style.display = "none";
    }
    updateTestProgress();
}

function nextQuestion() { if (currentQuestion < cyberQuestions.length - 1) { currentQuestion++; loadQuestion(); } }
function prevQuestion() { if (currentQuestion > 0) { currentQuestion--; loadQuestion(); } }

function submitTest() {
    testCompleted = true;
    const correctCount = calculateCorrectAnswers();
    const percentage = Math.round((correctCount / cyberQuestions.length) * 100);
    
    document.getElementById("cyber-test").style.display = "none";
    document.getElementById("results-page").style.display = "block";
    document.getElementById("restart-test").style.display = "block";
    
    document.getElementById("score-percentage").textContent = `${percentage}%`;
    document.getElementById("score-value").textContent = correctCount;
    
    let levelDescription, levelColor;
    if (percentage >= 90) { levelDescription = "Экспертный уровень"; levelColor = "var(--neon-green)"; }
    else if (percentage >= 75) { levelDescription = "Продвинутый уровень"; levelColor = "var(--neon-green)"; }
    else if (percentage >= 60) { levelDescription = "Средний уровень"; levelColor = "#f59e0b"; }
    else { levelDescription = "Начальный уровень"; levelColor = "var(--neon-red)"; }
    
    const scoreDescriptionEl = document.getElementById("score-description");
    if (scoreDescriptionEl) { scoreDescriptionEl.textContent = levelDescription; scoreDescriptionEl.style.color = levelColor; }
    
    showCategoryBreakdown();
    
    const userData = getUserData();
    userData.testsCompleted++;
    userData.averageScore = Math.round((userData.averageScore * (userData.testsCompleted - 1) + percentage) / userData.testsCompleted);
    saveUserData(userData);
    updateDashboardUI(userData);
    addHistory('Пройден тест по кибербезопасности', percentage);
    addXP(200);
    
    if (percentage === 100) unlockAchievement('perfect_score');
    else if (userData.testsCompleted === 1) unlockAchievement('first_test');
}

function calculateCorrectAnswers() {
    let correct = 0;
    userAnswers.forEach((answer, index) => { if (answer === cyberQuestions[index].correct) correct++; });
    return correct;
}

function showCategoryBreakdown() {
    const categoryList = document.getElementById("category-list");
    if (!categoryList) return;
    categoryList.innerHTML = "";
    const categories = {};
    cyberQuestions.forEach((q, index) => {
        if (!categories[q.category]) categories[q.category] = { total: 0, correct: 0 };
        categories[q.category].total++;
        if (userAnswers[index] === q.correct) categories[q.category].correct++;
    });
    Object.keys(categories).forEach((category) => {
        const { total, correct } = categories[category];
        const percentage = Math.round((correct / total) * 100);
        const item = document.createElement("li");
        item.style.margin = "8px 0"; item.style.padding = "5px 10px";
        item.style.borderLeft = `3px solid ${percentage >= 70 ? "var(--neon-green)" : "var(--neon-red)"}`;
        item.style.backgroundColor = `rgba(${percentage >= 70 ? "0, 255, 170" : "255, 0, 85"}, 0.1)`;
        item.style.borderRadius = "5px"; item.style.textAlign = "center";
        item.innerHTML = `${category}: <span style="color: ${percentage >= 70 ? "var(--neon-green)" : "var(--neon-red)"}; float: right;">${correct}/${total} (${percentage}%)</span>`;
        categoryList.appendChild(item);
    });
}

// ============================================
// СЕРТИФИКАТ
// ============================================
function saveCertificateData() {
    try {
        const nameEl = document.getElementById("user-name");
        const surnameEl = document.getElementById("user-surname");
        const styleEl = document.querySelector(".certificate-style-option.active");
        const scoreEl = document.getElementById("score-percentage");
        const levelEl = document.getElementById("score-description");
        if (!nameEl || !surnameEl || !scoreEl || !levelEl) return;
        const data = { name: nameEl.value.trim(), surname: surnameEl.value.trim(), style: styleEl ? styleEl.dataset.style : "classic", score: scoreEl.textContent, level: levelEl.textContent, completed: true, timestamp: new Date().toISOString() };
        localStorage.setItem("cyberguard-cert-data", JSON.stringify(data));
    } catch (e) { console.error(e); }
}

function loadCertificateData() {
    try {
        const storedData = localStorage.getItem("cyberguard-cert-data");
        if (storedData) {
            const data = JSON.parse(storedData);
            if (data && data.completed) {
                const nameEl = document.getElementById("user-name");
                const surnameEl = document.getElementById("user-surname");
                if (nameEl) nameEl.value = data.name || "";
                if (surnameEl) surnameEl.value = data.surname || "";
                if (data.style) setCertificateStyle(data.style);
                document.getElementById("score-percentage").textContent = data.score || "0%";
                document.getElementById("score-description").textContent = data.level || "Начальный уровень";
                document.getElementById("cyber-test").style.display = "none";
                document.getElementById("results-page").style.display = "block";
                document.getElementById("restart-test").style.display = "block";
                document.getElementById("certificate-preview").style.display = "block";
                document.getElementById("cert-name").textContent = `${data.name} ${data.surname}`;
                document.getElementById("cert-score").textContent = data.score || "0%";
                document.getElementById("cert-level").textContent = data.level || "Начальный";
                document.getElementById("cert-date").textContent = new Date().toLocaleDateString("ru-RU", { year: "numeric", month: "long", day: "numeric" });
                testCompleted = true;
            }
        }
    } catch (e) {}
}

function generateCertificate() {
    const nameEl = document.getElementById("user-name");
    const surnameEl = document.getElementById("user-surname");
    if (!nameEl || !surnameEl || !nameEl.value.trim() || !surnameEl.value.trim()) {
        showNotification("Пожалуйста, введите имя и фамилию", "error"); return;
    }
    document.getElementById("cert-name").textContent = `${nameEl.value} ${surnameEl.value}`;
    const percentage = Math.round((calculateCorrectAnswers() / cyberQuestions.length) * 100);
    document.getElementById("cert-score").textContent = `${percentage}%`;
    let level = "Начальный";
    if (percentage >= 90) level = "Эксперт";
    else if (percentage >= 75) level = "Продвинутый";
    else if (percentage >= 60) level = "Средний";
    document.getElementById("cert-level").textContent = level;
    document.getElementById("cert-date").textContent = new Date().toLocaleDateString("ru-RU", { year: "numeric", month: "long", day: "numeric" });
    document.getElementById("certificate-preview").style.display = "block";
    saveCertificateData();
}

function downloadCertificate() {
    const certificate = document.getElementById("certificate-template");
    if (!certificate) { showNotification("Ошибка: шаблон сертификата не найден", "error"); return; }
    if (typeof html2canvas === "undefined") {
        showNotification("Загрузка компонента для создания сертификата...", "info");
        const script = document.createElement("script");
        script.src = "https://html2canvas.hertzen.com/dist/html2canvas.min.js";
        script.onload = function() { downloadCertificate(); };
        document.head.appendChild(script);
        return;
    }
    const btn = document.getElementById("download-certificate");
    const originalText = btn.innerHTML;
    btn.innerHTML = '⏳ Создание...'; btn.disabled = true;
    const exportContainer = document.createElement("div");
    exportContainer.style.position = "fixed"; exportContainer.style.top = "-9999px";
    exportContainer.style.left = "-9999px"; exportContainer.style.width = "800px";
    exportContainer.style.background = "#ffffff"; exportContainer.style.padding = "20px";
    const certClone = certificate.cloneNode(true);
    exportContainer.appendChild(certClone); document.body.appendChild(exportContainer);
    setTimeout(function() {
        html2canvas(exportContainer, { scale: 2, useCORS: true, logging: false, backgroundColor: "#ffffff" })
        .then(function(canvas) {
            const link = document.createElement("a");
            link.download = `Certificate_${Date.now()}.png`;
            link.href = canvas.toDataURL("image/png"); link.click();
            document.body.removeChild(exportContainer);
            btn.innerHTML = originalText; btn.disabled = false;
            showNotification("Сертификат сохранен!", "success");
        }).catch(function(err) {
            console.error(err); document.body.removeChild(exportContainer);
            btn.innerHTML = originalText; btn.disabled = false;
            showNotification("Ошибка при создании", "error");
        });
    }, 100);
}

function restartTest() {
    currentQuestion = 0;
    userAnswers = Array(cyberQuestions.length).fill(null);
    testCompleted = false;
    document.getElementById("results-page").style.display = "none";
    document.getElementById("restart-test").style.display = "none";
    document.getElementById("cyber-test").style.display = "block";
    document.getElementById("certificate-preview").style.display = "none";
    localStorage.removeItem("cyberguard-cert-data");
    loadQuestion();
}

function setCertificateStyle(style) {
    const cert = document.getElementById("certificate-template");
    if (!cert) return;
    cert.className = cert.className.replace(/classic|tech|green|purple/g, "").trim();
    cert.classList.add(style);
    document.querySelectorAll(".certificate-style-option").forEach(opt => {
        opt.classList.toggle("active", opt.dataset.style === style);
    });
}

// ============================================
// AI vs Real
// ============================================
function initVideoGame() {
    videoScore = 0; videoIndex = 0; loadVideo();
}

function loadVideo() {
    if (videoIndex >= videoData.length) {
        document.getElementById("game-result").textContent = `Игра завершена! Счёт: ${videoScore} из ${videoData.length}`;
        document.getElementById("btn-next-video").style.display = "none";
        return;
    }
    const video = videoData[videoIndex];
    document.getElementById("video-player").src = video.embedUrl;
    document.getElementById("video-description").textContent = video.description;
    document.getElementById("video-score-value").textContent = videoScore;
    document.getElementById("video-total").textContent = videoData.length;
    document.getElementById("game-result").textContent = "";
    document.getElementById("btn-next-video").style.display = "none";
    document.getElementById("btn-ai").style.display = "inline-block";
    document.getElementById("btn-real").style.display = "inline-block";
}

function submitVideoAnswer(isAI) {
    const video = videoData[videoIndex];
    const resultEl = document.getElementById("game-result");
    if ((isAI && video.isAI) || (!isAI && !video.isAI)) {
        videoScore++;
        resultEl.textContent = "✅ Правильно!"; resultEl.style.color = "var(--neon-green)";
        addXP(30);
    } else {
        resultEl.textContent = "❌ Неправильно!"; resultEl.style.color = "var(--neon-red)";
    }
    document.getElementById("video-score-value").textContent = videoScore;
    document.getElementById("btn-next-video").style.display = "inline-block";
    document.getElementById("btn-ai").style.display = "none";
    document.getElementById("btn-real").style.display = "none";
}

// ============================================
// ПАРОЛИ
// ============================================
function analyzePassword(password) {
    const reqs = {
        length: document.getElementById("length-req"),
        upper: document.getElementById("upper-req"),
        lower: document.getElementById("lower-req"),
        number: document.getElementById("number-req"),
        special: document.getElementById("special-req"),
        common: document.getElementById("common-req")
    };
    const strengthFill = document.getElementById("password-strength-fill");
    const feedback = document.getElementById("password-feedback");
    if (!strengthFill || !feedback) return;
    if (!password) {
        document.querySelectorAll(".requirement").forEach(el => el.classList.remove("valid"));
        strengthFill.style.width = "0%"; return;
    }
    const checks = {
        length: password.length >= 12,
        upper: /[A-Z]/.test(password),
        lower: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[^A-Za-z0-9]/.test(password),
        common: !["123456", "password", "qwerty", "admin"].includes(password.toLowerCase())
    };
    if (reqs.length) reqs.length.classList.toggle("valid", checks.length);
    if (reqs.upper) reqs.upper.classList.toggle("valid", checks.upper);
    if (reqs.lower) reqs.lower.classList.toggle("valid", checks.lower);
    if (reqs.number) reqs.number.classList.toggle("valid", checks.number);
    if (reqs.special) reqs.special.classList.toggle("valid", checks.special);
    if (reqs.common) reqs.common.classList.toggle("valid", checks.common);
    let score = Object.values(checks).filter(Boolean).length * (100/6);
    strengthFill.style.width = `${score}%`;
    if (score < 50) { strengthFill.style.background = "var(--neon-red)"; feedback.innerHTML = '<strong style="color: var(--neon-red);">СЛАБЫЙ</strong>'; }
    else if (score < 80) { strengthFill.style.background = "#f59e0b"; feedback.innerHTML = '<strong style="color: #f59e0b;">СРЕДНИЙ</strong>'; }
    else { strengthFill.style.background = "var(--neon-green)"; feedback.innerHTML = '<strong style="color: var(--neon-green);">ОТЛИЧНО</strong>'; }
}

function generatePassword() {
    const length = parseInt(document.getElementById("password-length").value);
    const includeUpper = document.getElementById("include-upper").checked;
    const includeLower = document.getElementById("include-lower").checked;
    const includeNumbers = document.getElementById("include-numbers").checked;
    const includeSpecial = document.getElementById("include-special").checked;
    let charSet = "";
    if (includeUpper) charSet += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (includeLower) charSet += "abcdefghijklmnopqrstuvwxyz";
    if (includeNumbers) charSet += "0123456789";
    if (includeSpecial) charSet += "!@#$%^&*()_+-=";
    if (charSet === "") charSet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let password = "";
    const array = new Uint32Array(length); crypto.getRandomValues(array);
    for (let i = 0; i < length; i++) password += charSet[array[i] % charSet.length];
    document.getElementById("generated-password").value = password;
    analyzePassword(password);
    const data = getUserData();
    data.passwordsGenerated++; saveUserData(data);
    if (data.passwordsGenerated >= 5) unlockAchievement('password_pro');
}

function copyPassword() {
    const pwd = document.getElementById("generated-password").value;
    if (pwd) {
        navigator.clipboard.writeText(pwd).then(() => showNotification("Скопировано!", "success"));
    }
}

// ============================================
// ССЫЛКИ
// ============================================
function checkLinkSafety() {
    const url = document.getElementById("link-input").value.trim();
    const res = document.getElementById("link-result");
    if (!url) { showNotification("Введите URL", "error"); return; }
    res.classList.add("show");
    const isHttps = url.startsWith("https");
    const isPhishing = url.includes("sberbank-security") || url.includes("gospohi");
    document.getElementById("link-domain").textContent = `Домен: ${url.split('/')[2] || "Неизвестно"}`;
    const safetyLevel = document.getElementById("safety-level");
    if (isPhishing) {
        safetyLevel.className = "link-safety-level safety-low"; safetyLevel.textContent = "НИЗКАЯ БЕЗОПАСНОСТЬ";
    } else if (isHttps) {
        safetyLevel.className = "link-safety-level safety-high"; safetyLevel.textContent = "ВЫСОКАЯ БЕЗОПАСНОСТЬ";
    } else {
        safetyLevel.className = "link-safety-level safety-low"; safetyLevel.textContent = "НЕ ЗАЩИЩЕНО";
    }
}

// ============================================
// УТЕЧКИ
// ============================================
function checkBreach() {
    const email = document.getElementById("breach-email").value.trim();
    const res = document.getElementById("breach-result");
    if (!email) return;
    res.style.display = "block";
    res.className = "breach-result";
    document.getElementById("breach-text").textContent = "Проверка...";
    setTimeout(() => {
        const isLeak = email.includes("test") || Math.random() > 0.5;
        if (isLeak) {
            res.className = "breach-result danger";
            document.getElementById("breach-text").textContent = "Утечки найдены!";
            unlockAchievement('breach_check');
        } else {
            res.className = "breach-result safe";
            document.getElementById("breach-text").textContent = "Утечек не найдено.";
        }
        addXP(30);
    }, 1000);
}

// ============================================
// СКАНЕР ФАЙЛОВ
// ============================================
function initFileScanner() {
    const uploadArea = document.getElementById("upload-area");
    const fileInput = document.getElementById("file-input");
    if(uploadArea) uploadArea.addEventListener('click', () => fileInput.click());
    if(fileInput) fileInput.addEventListener('change', (e) => { if(e.target.files.length) scanFile(e.target.files[0]); });
    const deleteBtn = document.getElementById("btn-delete-file");
    if(deleteBtn) deleteBtn.addEventListener('click', () => {
        document.getElementById("scan-result").style.display = "none";
        if(uploadArea) uploadArea.style.display = "block";
        if(fileInput) fileInput.value = "";
    });
}

function scanFile(file) {
    const uploadArea = document.getElementById("upload-area");
    const scanProgress = document.getElementById("scan-progress");
    if(uploadArea) uploadArea.style.display = "none";
    if(scanProgress) scanProgress.style.display = "block";
    const bar = document.getElementById("scan-bar");
    let prog = 0;
    const intv = setInterval(() => {
        prog += 20;
        if(bar) bar.style.width = prog + "%";
        if (prog >= 100) {
            clearInterval(intv);
            completeScan(file);
        }
    }, 200);
}

function completeScan(file) {
    const scanProgress = document.getElementById("scan-progress");
    const scanResult = document.getElementById("scan-result");
    if(scanProgress) scanProgress.style.display = "none";
    if(scanResult) scanResult.style.display = "block";
    if (Math.random() > 0.3) {
        scanResult.className = "scan-result safe";
        document.getElementById("file-name").textContent = file.name;
    } else {
        scanResult.className = "scan-result danger";
        document.getElementById("file-name").textContent = "Угроза обнаружена в " + file.name;
    }
    addXP(20);
}

// ============================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================
document.addEventListener("DOMContentLoaded", function() {
    initCookies(); initTheme(); initTabs(); initDashboard(); updateStreak(); initCyberTest(); initFileScanner(); initVideoGame();
    
    document.getElementById("btn-generate")?.addEventListener("click", generatePassword);
    document.getElementById("btn-copy")?.addEventListener("click", copyPassword);
    document.getElementById("check-link-btn")?.addEventListener("click", checkLinkSafety);
    document.getElementById("check-breach-btn")?.addEventListener("click", checkBreach);
    document.getElementById("clear-data-btn")?.addEventListener("click", clearAllData);
    document.getElementById("next-btn")?.addEventListener("click", nextQuestion);
    document.getElementById("prev-btn")?.addEventListener("click", prevQuestion);
    document.getElementById("submit-btn")?.addEventListener("click", submitTest);
    document.getElementById("generate-certificate")?.addEventListener("click", generateCertificate);
    document.getElementById("download-certificate")?.addEventListener("click", downloadCertificate);
    document.getElementById("restart-test")?.addEventListener("click", restartTest);
    document.getElementById("btn-ai")?.addEventListener("click", () => submitVideoAnswer(true));
    document.getElementById("btn-real")?.addEventListener("click", () => submitVideoAnswer(false));
    document.getElementById("btn-next-video")?.addEventListener("click", () => { videoIndex++; loadVideo(); });
    
    document.getElementById("password-input")?.addEventListener("input", function() { analyzePassword(this.value); });
    document.getElementById("toggle-password")?.addEventListener("click", function() {
        const inp = document.getElementById("password-input");
        if(inp) { inp.type = inp.type === "password" ? "text" : "password"; this.textContent = inp.type === "password" ? "👁️" : "🙈"; }
    });
    document.getElementById("password-length")?.addEventListener("input", function() {
        document.getElementById("length-value").textContent = this.value;
    });
    document.querySelectorAll(".certificate-style-option").forEach(opt => {
        opt.addEventListener("click", function() { setCertificateStyle(this.dataset.style); });
    });
    generatePassword();
});