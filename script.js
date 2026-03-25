const cyberQuestions = [
    { question: "Что такое фишинг?", answers: ["Попытка мошенничества с целью получения конфиденциальной информации", "Разновидность вредоносного вируса", "Способ шифрования данных", "Тип сетевого протокола"], correct: 0, category: "Основы безопасности" },
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

// ============================================
// ДОСТИЖЕНИЯ
// ============================================
const achievements = [
    { id: 'first_test', name: 'Первый шаг', icon: '🎯', description: 'Пройти первый тест', requirement: 1 },
    { id: 'perfect_score', name: 'Эксперт', icon: '🏆', description: '100% в тесте', requirement: 100 },
    { id: 'password_pro', name: 'Защитник', icon: '🔐', description: 'Создать 5 паролей', requirement: 5 },
    { id: 'week_streak', name: 'Неделя', icon: '🔥', description: '7 дней подряд', requirement: 7 },
    { id: 'breach_check', name: 'Осторожный', icon: '⚠️', description: 'Проверить email', requirement: 1 }
];

// ============================================
// ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ
// ============================================
let currentQuestion = 0;
let userAnswers = Array(cyberQuestions.length).fill(null);
let testCompleted = false;

// ============================================
// ЛИЧНЫЙ КАБИНЕТ
// ============================================
function initDashboard() {
    const userData = getUserData();
    updateDashboardUI(userData);
    loadAchievements(userData);
    loadHistory(userData);
}

function getUserData() {
    const stored = localStorage.getItem('cyberguard-user-data');
    if (stored) {
        return JSON.parse(stored);
    }
    return {
        username: 'Гость',
        level: 'Новичок',
        xp: 0,
        maxXp: 1000,
        testsCompleted: 0,
        averageScore: 0,
        streak: 0,
        lastVisit: null,
        achievements: [],
        history: [],
        passwordsGenerated: 0
    };
}

function saveUserData(data) {
    localStorage.setItem('cyberguard-user-data', JSON.stringify(data));
}

function updateDashboardUI(data) {
    document.getElementById('dashboard-username').textContent = data.username;
    document.getElementById('dashboard-level').textContent = `Уровень: ${data.level}`;
    document.getElementById('user-avatar-initial').textContent = data.username.charAt(0).toUpperCase();
    const xpPercent = (data.xp / data.maxXp) * 100;
    document.getElementById('xp-progress').style.width = `${xpPercent}%`;
    document.getElementById('xp-text').textContent = `${data.xp} / ${data.maxXp} XP`;

    document.getElementById('stat-tests').textContent = data.testsCompleted;
    document.getElementById('stat-achievements').textContent = data.achievements.length;
    document.getElementById('stat-average').textContent = `${data.averageScore}%`;
    document.getElementById('stat-streak').textContent = data.streak;
}

function loadAchievements(data) {
    const container = document.getElementById('achievements-list');
    container.innerHTML = '';
    achievements.forEach(ach => {
        const unlocked = data.achievements.includes(ach.id);
        const card = document.createElement('div');
        card.className = `achievement-card ${unlocked ? 'unlocked' : ''}`;
        card.innerHTML = `<div class="achievement-icon">${ach.icon}</div><div class="achievement-name">${ach.name}</div>`;
        card.title = ach.description;
        container.appendChild(card);
    });
}

function loadHistory(data) {
    const container = document.getElementById('activity-history');
    container.innerHTML = '';
    if (data.history.length === 0) {
        container.innerHTML = '<p style="color: var(--text-muted); text-align: center;">История пуста</p>';
        return;
    }

    data.history.slice(0, 10).forEach(item => {
        const div = document.createElement('div');
        div.className = 'history-item';
        div.innerHTML = `
            <div class="history-date">${item.date}</div>
            <div class="history-action">${item.action}</div>
            ${item.score ? `<div class="history-score">Результат: ${item.score}%</div>` : ''}
        `;
        container.appendChild(div);
    });
}

function addHistory(action, score = null) {
    const data = getUserData();
    const today = new Date().toLocaleDateString('ru-RU');
    data.history.unshift({ date: today, action: action, score: score, timestamp: Date.now() });

    if (data.history.length > 50) {
        data.history = data.history.slice(0, 50);
    }

    saveUserData(data);
    loadHistory(data);
}

function addXP(amount) {
    const data = getUserData();
    data.xp += amount;
    if (data.xp >= data.maxXp) {
        data.xp = data.xp - data.maxXp;
        data.maxXp = Math.floor(data.maxXp * 1.5);
        data.level = getNextLevel(data.level);
        showNotification(`🎉 Новый уровень: ${data.level}!`, 'success');
    }

    saveUserData(data);
    updateDashboardUI(data);
}

function getNextLevel(current) {
    const levels = ['Новичок', 'Ученик', 'Практик', 'Специалист', 'Эксперт', 'Мастер', 'Легенда'];
    const index = levels.indexOf(current);
    return index < levels.length - 1 ? levels[index + 1] : current;
}

// ============================================
// АНИМАЦИЯ ДОСТИЖЕНИЙ
// ============================================
function unlockAchievement(id) {
    const data = getUserData();
    if (!data.achievements.includes(id)) {
        data.achievements.push(id);
        saveUserData(data);
        loadAchievements(data);
        const ach = achievements.find(a => a.id === id);
        showAchievementPopup(ach);
        addXP(100);
    }
}

function showAchievementPopup(achievement) {
    const popup = document.getElementById('achievement-popup');
    const nameEl = document.getElementById('achievement-name');
    
    if (!popup || !nameEl) return;
    
    nameEl.textContent = achievement.name;
    popup.style.display = 'block';
    
    // Автоскрытие через 4 секунды
    setTimeout(() => {
        popup.classList.add('hide');
        setTimeout(() => {
            popup.style.display = 'none';
            popup.classList.remove('hide');
        }, 500);
    }, 4000);
}

function updateStreak() {
    const data = getUserData();
    const today = new Date().toDateString();
    const lastVisit = data.lastVisit ? new Date(data.lastVisit).toDateString() : null;
    if (lastVisit !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (lastVisit === yesterday.toDateString()) {
            data.streak++;
        } else if (lastVisit !== today) {
            data.streak = 1;
        }
        
        data.lastVisit = new Date().toISOString();
        saveUserData(data);
        
        if (data.streak >= 7) {
            unlockAchievement('week_streak');
        }
    }

    document.getElementById('stat-streak').textContent = data.streak;
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
// ТЕСТ ПО КИБЕРБЕЗОПАСНОСТИ
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
    const totalEl = document.getElementById("total-questions");
    if (totalEl) totalEl.textContent = cyberQuestions.length;
}

function updateTestProgress() {
    for (let i = 0; i < cyberQuestions.length; i++) {
        const dot = document.getElementById(`test-dot-${i}`);
        if (!dot) continue;
        if (i < currentQuestion) {
            dot.className = "progress-dot completed";
        } else if (i === currentQuestion) {
            dot.className = "progress-dot active";
        } else {
            dot.className = "progress-dot";
        }
    }
    const questionNumberEl = document.getElementById("question-number");
    if (questionNumberEl) {
        questionNumberEl.textContent = `Вопрос ${currentQuestion + 1} из ${cyberQuestions.length}`;
    }
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
        
        if (userAnswers[currentQuestion] === index) {
            answerElement.classList.add("selected");
        }
        
        answerElement.addEventListener("click", function() {
            document.querySelectorAll(".answer-option").forEach((el) => {
                el.classList.remove("selected");
            });
            this.classList.add("selected");
            userAnswers[currentQuestion] = index;
            
            if (nextBtn) nextBtn.disabled = false;
            
            if (currentQuestion === cyberQuestions.length - 1) {
                 if (nextBtn) nextBtn.style.display = "none";
                if (submitBtn) submitBtn.style.display = "inline-block";
            } else {
                if (nextBtn) nextBtn.style.display = "inline-block";
                if (submitBtn) submitBtn.style.display = "none";
            }
        });
        
        answersContainer.appendChild(answerElement);
    });

    if (prevBtn) prevBtn.disabled = currentQuestion === 0;
    if (nextBtn) nextBtn.disabled = userAnswers[currentQuestion] === null;

    if (currentQuestion === cyberQuestions.length - 1) {
        if (nextBtn) nextBtn.style.display = "none";
        if (submitBtn) submitBtn.style.display = "inline-block";
    } else {
        if (nextBtn) nextBtn.style.display = "inline-block";
        if (submitBtn) submitBtn.style.display = "none";
    }

    updateTestProgress();
}

function nextQuestion() {
    if (currentQuestion < cyberQuestions.length - 1) {
        currentQuestion++;
        loadQuestion();
    }
}

function prevQuestion() {
    if (currentQuestion > 0) {
        currentQuestion--;
        loadQuestion();
    }
}

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
    if (percentage >= 90) {
        levelDescription = "Экспертный уровень";
        levelColor = "var(--neon-green)";
    } else if (percentage >= 75) {
        levelDescription = "Продвинутый уровень";
        levelColor = "var(--neon-green)";
    } else if (percentage >= 60) {
        levelDescription = "Средний уровень";
        levelColor = "#f59e0b";
    } else {
        levelDescription = "Начальный уровень";
        levelColor = "var(--neon-red)";
    }

    const scoreDescriptionEl = document.getElementById("score-description");
    if (scoreDescriptionEl) {
        scoreDescriptionEl.textContent = levelDescription;
        scoreDescriptionEl.style.color = levelColor;
    }

    showCategoryBreakdown();

    // Обновляем статистику пользователя
    const userData = getUserData();
    userData.testsCompleted++;
    userData.averageScore = Math.round((userData.averageScore * (userData.testsCompleted - 1) + percentage) / userData.testsCompleted);
    saveUserData(userData);
    updateDashboardUI(userData);
    addHistory('Пройден тест по кибербезопасности', percentage);
    addXP(200);

    if (percentage === 100) {
        unlockAchievement('perfect_score');
    } else if (userData.testsCompleted === 1) {
        unlockAchievement('first_test');
    }
}

function calculateCorrectAnswers() {
    let correct = 0;
    userAnswers.forEach((answer, index) => {
        if (answer === cyberQuestions[index].correct) {
            correct++;
        }
    });
    return correct;
}

function showCategoryBreakdown() {
    const categoryList = document.getElementById("category-list");
    if (!categoryList) return;
    categoryList.innerHTML = "";
    const categories = {};
    cyberQuestions.forEach((q, index) => {
        if (!categories[q.category]) {
            categories[q.category] = { total: 0, correct: 0 };
        }
        categories[q.category].total++;
        if (userAnswers[index] === q.correct) {
            categories[q.category].correct++;
        }
    });

    Object.keys(categories).forEach((category) => {
        const { total, correct } = categories[category];
        const percentage = Math.round((correct / total) * 100);
        const item = document.createElement("li");
        item.style.margin = "8px 0";
        item.style.padding = "5px 10px";
        item.style.borderLeft = `3px solid ${percentage >= 70 ? "var(--neon-green)" : "var(--neon-red)"}`;
        item.style.backgroundColor = `rgba(${percentage >= 70 ? "0, 255, 170" : "255, 0, 85"}, 0.1)`;
        item.style.borderRadius = "5px";
        item.style.textAlign = "center";
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
        const data = {
            name: nameEl.value.trim(),
            surname: surnameEl.value.trim(),
            style: styleEl ? styleEl.dataset.style : "classic",
            score: scoreEl.textContent,
            level: levelEl.textContent,
            completed: true,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem("cyberguard-cert-data", JSON.stringify(data));
    } catch (e) {
        console.error("Ошибка сохранения данных сертификата", e);
    }
}

function loadCertificateData() {
    try {
        const storedData = localStorage.getItem("cyberguard-cert-data");
        if (storedData) {
            const data = JSON.parse(storedData);
            if (data && data.completed) {
                const nameEl = document.getElementById("user-name");
                const surnameEl = document.getElementById("user-surname");
                const scoreEl = document.getElementById("score-percentage");
                const levelEl = document.getElementById("score-description");
                const cyberTestEl = document.getElementById("cyber-test");
                const resultsPageEl = document.getElementById("results-page");
                const restartBtnEl = document.getElementById("restart-test");
                const certPreviewEl = document.getElementById("certificate-preview");
                const certNameEl = document.getElementById("cert-name");
                const certScoreEl = document.getElementById("cert-score");
                const certLevelEl = document.getElementById("cert-level");
                const certDateEl = document.getElementById("cert-date");
                
                if (nameEl) nameEl.value = data.name || "";
                if (surnameEl) surnameEl.value = data.surname || "";
                
                if (data.style) {
                    setCertificateStyle(data.style);
                }
                
                if (scoreEl) scoreEl.textContent = data.score || "0%";
                if (levelEl) levelEl.textContent = data.level || "Начальный уровень";
                
                if (cyberTestEl) cyberTestEl.style.display = "none";
                if (resultsPageEl) resultsPageEl.style.display = "block";
                if (restartBtnEl) restartBtnEl.style.display = "block";
                if (certPreviewEl) certPreviewEl.style.display = "block";
                
                if (certNameEl) certNameEl.textContent = `${data.name} ${data.surname}`;
                if (certScoreEl) certScoreEl.textContent = data.score || "0%";
                if (certLevelEl) certLevelEl.textContent = data.level || "Начальный";
                
                if (certDateEl) {
                    const today = new Date();
                    certDateEl.textContent = today.toLocaleDateString("ru-RU", {
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                    });
                }
                
                testCompleted = true;
            }
        }
    } catch (e) {
        console.error("Ошибка загрузки данных сертификата", e);
    }
}

function clearCertificateData() {
    try {
        localStorage.removeItem("cyberguard-cert-data");
    } catch (e) {
        console.error("Ошибка очистки данных", e);
    }
}

function generateCertificate() {
    const nameEl = document.getElementById("user-name");
    const surnameEl = document.getElementById("user-surname");
    if (!nameEl || !surnameEl) {
        showNotification("Поля имени не найдены", "error");
        return;
    }
    const name = nameEl.value.trim();
    const surname = surnameEl.value.trim();
    const fullName = `${name} ${surname}`.trim();

    if (!name || !surname) {
        showNotification("Пожалуйста, введите корректное имя и фамилию", "error");
        return;
    }

    const certNameEl = document.getElementById("cert-name");
    const certScoreEl = document.getElementById("cert-score");
    const certLevelEl = document.getElementById("cert-level");
    const certDateEl = document.getElementById("cert-date");
    const certPreviewEl = document.getElementById("certificate-preview");

    if (certNameEl) certNameEl.textContent = fullName;

    const correctCount = calculateCorrectAnswers();
    const percentage = Math.round((correctCount / cyberQuestions.length) * 100);

    if (certScoreEl) certScoreEl.textContent = `${percentage}%`;

    let levelDescription;
    if (percentage >= 90) levelDescription = "Эксперт";
    else if (percentage >= 75) levelDescription = "Продвинутый";
    else if (percentage >= 60) levelDescription = "Средний";
    else levelDescription = "Начальный";

    if (certLevelEl) certLevelEl.textContent = levelDescription;

    if (certDateEl) {
        const today = new Date();
        certDateEl.textContent = today.toLocaleDateString("ru-RU", { year: "numeric", month: "long", day: "numeric" });
    }

    if (certPreviewEl) certPreviewEl.style.display = "block";
    saveCertificateData();
}

// ============================================
// СКАЧИВАНИЕ СЕРТИФИКАТА
// ============================================
function downloadCertificate() {
    const certificate = document.getElementById("certificate-template");
    if (!certificate) {
        showNotification("Сертификат не найден!", "error");
        return;
    }
    const downloadBtn = document.getElementById("download-certificate");
    const originalText = downloadBtn ? downloadBtn.innerHTML : "";

    // Проверяем, загружена ли библиотека html2canvas
    if (typeof html2canvas === "undefined") {
        showNotification("Загрузка компонента для создания сертификата...", "info");
        const script = document.createElement("script");
        script.src = "https://html2canvas.hertzen.com/dist/html2canvas.min.js";
        script.async = true;
        script.onload = function() { downloadCertificate(); };
        script.onerror = function() {
            showNotification("Не удалось загрузить библиотеку. Проверьте интернет-соединение.", "error");
            if (downloadBtn) {
                downloadBtn.innerHTML = originalText;
                downloadBtn.disabled = false;
            }
        };
        document.head.appendChild(script);
        return;
    }

    if (downloadBtn) {
        downloadBtn.innerHTML = '⏳ Создание...';
        downloadBtn.disabled = true;
    }

    const exportContainer = document.createElement("div");
    exportContainer.style.position = "fixed";
    exportContainer.style.top = "-9999px";
    exportContainer.style.left = "-9999px";
    exportContainer.style.width = "800px";
    exportContainer.style.background = "#ffffff";
    exportContainer.style.padding = "20px";
    exportContainer.style.zIndex = "-1";
    exportContainer.style.fontFamily = "Roboto, Arial, sans-serif";

    const certClone = certificate.cloneNode(true);
    certClone.style.width = "760px";
    certClone.style.margin = "0";
    certClone.style.boxShadow = "none";
    certClone.style.border = "none";
    exportContainer.appendChild(certClone);
    document.body.appendChild(exportContainer);

    setTimeout(function() {
        html2canvas(exportContainer, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: "#ffffff",
            allowTaint: true,
            foreignObjectRendering: true
        })
        .then(function(canvas) {
            const link = document.createElement("a");
            link.download = `CyberGuard_Сертификат_${Date.now()}.png`;
            link.href = canvas.toDataURL("image/png");
            link.click();
            
            document.body.removeChild(exportContainer);
            if (downloadBtn) {
                downloadBtn.innerHTML = originalText;
                downloadBtn.disabled = false;
            }
            showNotification("✅ Сертификат успешно сохранен!", "success");
        })
        .catch(function(error) {
            console.error("Ошибка при создании сертификата:", error);
            document.body.removeChild(exportContainer);
            if (downloadBtn) {
                downloadBtn.innerHTML = originalText;
                downloadBtn.disabled = false;
            }
            showNotification("❌ Ошибка при создании сертификата. Попробуйте еще раз.", "error");
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

    clearCertificateData();
    loadQuestion();
}

function setCertificateStyle(style) {
    const certificate = document.getElementById("certificate-template");
    if (!certificate) return;
    certificate.className = certificate.className.replace(/classic|tech|green|purple/g, "").trim();
    certificate.classList.add(style);

    document.querySelectorAll(".certificate-style-option").forEach((option) => {
        option.classList.remove("active");
        if (option.dataset.style === style) {
            option.classList.add("active");
        }
    });
}

// ============================================
// ПРОВЕРКА ПАРОЛЯ
// ============================================
function analyzePassword(password) {
    const requirements = {
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

    if (!password || password.trim() === "") {
        document.querySelectorAll(".requirement").forEach((el) => el.classList.remove("valid"));
        strengthFill.style.width = "0%";
        feedback.innerHTML = "Введите пароль для анализа";
        return;
    }

    const hasLength = password.length >= 12;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password); 
    const isNotCommon = !isCommonPassword(password);

    if (requirements.length) updateRequirement(requirements.length, hasLength);
    if (requirements.upper) updateRequirement(requirements.upper, hasUpper);
    if (requirements.lower) updateRequirement(requirements.lower, hasLower);
    if (requirements.number) updateRequirement(requirements.number, hasNumber);
    if (requirements.special) updateRequirement(requirements.special, hasSpecial);
    if (requirements.common) updateRequirement(requirements.common, isNotCommon);

    let score = 0;
    if (hasLength) score += 20;
    if (hasUpper) score += 20;
    if (hasLower) score += 20;
    if (hasNumber) score += 20;
    if (hasSpecial) score += 20;
    if (isNotCommon) score += 20;
    score = Math.min(score, 100); 

    strengthFill.style.width = `${score}%`;

    if (score < 40) {
        strengthFill.style.background = "var(--neon-red)";
        feedback.innerHTML = '<strong style="color: var(--neon-red);">СЛИШКОМ СЛАБЫЙ</strong>';
    } else if (score < 70) {
        strengthFill.style.background = "linear-gradient(90deg, #ef4444, #f59e0b)";
        feedback.innerHTML = '<strong style="color: #f59e0b;">СРЕДНИЙ</strong>';
    } else {
        strengthFill.style.background = "var(--neon-green)";
        feedback.innerHTML = '<strong style="color: var(--neon-green);">ОТЛИЧНО</strong>';
    }
}

function updateRequirement(element, isValid) {
    if (!element) return;
    if (isValid) element.classList.add("valid");
    else element.classList.remove("valid");
}

function isCommonPassword(password) {
    const commonPasswords = ["123456", "password", "qwerty", "admin", "123456789", "12345678", "1234567", "12345", "111111", "123123"];
    return commonPasswords.includes(password.toLowerCase().trim());
}

// ============================================
// ГЕНЕРАТОР ПАРОЛЕЙ
// ============================================
function generatePassword() {
    const lengthEl = document.getElementById("password-length");
    const output = document.getElementById("generated-password");
    if (!output || !lengthEl) return;
    const length = parseInt(lengthEl.value);
    document.getElementById("length-value").textContent = length;

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
    const array = new Uint32Array(length);
    crypto.getRandomValues(array);

    for (let i = 0; i < length; i++) {
        password += charSet[array[i] % charSet.length];
    }

    output.value = password;
    analyzePassword(password);

    const userData = getUserData();
    userData.passwordsGenerated++;
    saveUserData(userData);

    if (userData.passwordsGenerated >= 5) {
        unlockAchievement('password_pro');
    }
}

function copyPassword() {
    const output = document.getElementById("generated-password");
    const notification = document.getElementById("copy-notification");
    if (!output || !output.value) {
        showNotification("Сначала сгенерируйте пароль!", "error");
        return;
    }
    navigator.clipboard.writeText(output.value).then(() => {
        if (notification) {
            notification.classList.add("show");
            setTimeout(() => notification.classList.remove("show"), 2000);
        }
    });
}

// ============================================
// ПРОВЕРКА ССЫЛОК
// ============================================
function checkLinkSafety() {
    const linkInput = document.getElementById("link-input");
    const linkResult = document.getElementById("link-result");
    if (!linkInput || !linkResult) return;
    let url = linkInput.value.trim();
    if (!url) {
        showNotification("Введите URL для проверки", "error");
        return;
    }

    linkResult.classList.add("show");

    const safetyLevel = document.getElementById("safety-level");
    const linkDomain = document.getElementById("link-domain");
    const analysisList = document.getElementById("link-analysis");

    try {
        const urlObj = new URL(url.startsWith("http") ? url : "https://" + url);
        const domain = urlObj.hostname;
        const isHttps = urlObj.protocol === "https:";
        
        linkDomain.textContent = `Домен: ${domain}`;
        analysisList.innerHTML = "";
        
        if (isHttps) {
            const li = document.createElement("li");
            li.className = "valid";
            li.textContent = "Используется защищенное соединение HTTPS";
            analysisList.appendChild(li);
        } else {
            const li = document.createElement("li");
            li.className = "invalid";
            li.textContent = "Отсутствует HTTPS - данные могут быть перехвачены";
            analysisList.appendChild(li);
        }
        
        const phishingDomains = ["sberbank-security.ru", "gospohi.ru", "appleid-secure.com"];
        const isPhishing = phishingDomains.some(d => domain.toLowerCase().includes(d));
        
        if (isPhishing) {
            const li = document.createElement("li");
            li.className = "invalid";
            li.textContent = "ВЫСОКИЙ РИСК: Домен подозрителен на фишинг!";
            analysisList.appendChild(li);
            safetyLevel.className = "link-safety-level safety-low";
            safetyLevel.textContent = "НИЗКИЙ УРОВЕНЬ БЕЗОПАСНОСТИ";
        } else {
            const li = document.createElement("li");
            li.className = "valid";
            li.textContent = "Домен не найден в базе фишинговых сайтов";
            analysisList.appendChild(li);
            safetyLevel.className = "link-safety-level safety-high";
            safetyLevel.textContent = "ВЫСОКИЙ УРОВЕНЬ БЕЗОПАСНОСТИ";
        }
    } catch (e) {
        safetyLevel.className = "link-safety-level safety-low";
        safetyLevel.textContent = "НЕВЕРНЫЙ URL-ФОРМАТ";
        linkDomain.textContent = `Введенная строка: ${url}`;
        analysisList.innerHTML = '<li class="invalid">Ошибка: Некорректный формат URL</li>';
    }
}

// ============================================
// ПРОВЕРКА УТЕЧЕК
// ============================================
const knownBreaches = [
    { name: 'Collection #1', date: '2019-01', dataTypes: ['Email', 'Пароли'] },
    { name: 'LinkedIn', date: '2021-06', dataTypes: ['Email', 'Телефон', 'Профиль'] },
    { name: 'Facebook', date: '2021-04', dataTypes: ['Email', 'Телефон', 'ID'] },
    { name: 'Adobe', date: '2013-10', dataTypes: ['Email', 'Пароли', 'Подсказки'] }
];

function checkBreach() {
    const email = document.getElementById("breach-email").value.trim();
    const resultEl = document.getElementById("breach-result");
    if (!email || !email.includes('@')) {
        showNotification('Введите корректный email', 'error');
        return;
    }

    resultEl.style.display = 'block';
    resultEl.className = 'breach-result';

    setTimeout(() => {
        const hasBreach = email.toLowerCase().includes('test') || email.toLowerCase().includes('demo') || Math.random() > 0.5;
        
        if (hasBreach) {
            resultEl.classList.add('danger');
            document.getElementById("breach-icon").textContent = '⚠️';
            document.getElementById("breach-text").textContent = 'Найдены утечки данных!';
            
            const detailsEl = document.getElementById("breach-details");
            detailsEl.innerHTML = '';
            
            const breachCount = Math.floor(Math.random() * 3) + 1;
            for (let i = 0; i < breachCount; i++) {
                const breach = knownBreaches[Math.floor(Math.random() * knownBreaches.length)];
                const div = document.createElement('div');
                div.className = 'breach-item';
                div.innerHTML = `
                    <div class="breach-name">${breach.name}</div>
                    <div class="breach-date">Дата: ${breach.date}</div>
                    <div class="breach-date">Данные: ${breach.dataTypes.join(', ')}</div>
                `;
                detailsEl.appendChild(div);
            }
            
            const recEl = document.getElementById("recommendations-list");
            recEl.innerHTML = `
                <li>Смените пароль на этом email</li>
                <li>Включите двухфакторную аутентификацию</li>
                <li>Используйте уникальный пароль для каждого сервиса</li>
                <li>Проверьте другие аккаунты с таким же паролем</li>
            `;
            
            unlockAchievement('breach_check');
            addHistory('Проверка утечек (найдены)', 0);
        } else {
            resultEl.classList.add('safe');
            document.getElementById("breach-icon").textContent = '✅';
            document.getElementById("breach-text").textContent = 'Утечек не найдено!';
            document.getElementById("breach-details").innerHTML = '<p>Ваш email не найден в известных базах утечек.</p>';
            document.getElementById("recommendations-list").innerHTML = `
                <li>Продолжайте использовать надёжные пароли</li>
                <li>Включите 2FA где возможно</li>
                <li>Регулярно проверяйте email</li>
            `;
            
            addHistory('Проверка утечек (чисто)', 100);
        }
        
        addXP(30);
    }, 1500);
}

// ============================================
// СКАНЕР ФАЙЛОВ
// ============================================
function initFileScanner() {
    const uploadArea = document.getElementById("upload-area");
    const fileInput = document.getElementById("file-input");
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            scanFile(files[0]);
        }
    });

    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            scanFile(e.target.files[0]);
        }
    });

    document.getElementById("btn-delete-file").addEventListener('click', () => {
        document.getElementById("scan-result").style.display = 'none';
        document.getElementById("upload-area").style.display = 'block';
        fileInput.value = '';
    });
}

function scanFile(file) {
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
        showNotification('Файл слишком большой (макс. 10 MB)', 'error');
        return;
    }

    document.getElementById("upload-area").style.display = 'none';
    document.getElementById("scan-progress").style.display = 'block';

    const scanBar = document.getElementById("scan-bar");
    const scanStatus = document.getElementById("scan-status");
    let progress = 0;

    const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            completeScan(file);
        }
        
        scanBar.style.width = `${progress}%`;
        
        if (progress < 30) {
            scanStatus.textContent = 'Анализ заголовка файла...';
        } else if (progress < 60) {
            scanStatus.textContent = 'Проверка сигнатур вирусов...';
        } else if (progress < 90) {
            scanStatus.textContent = 'Эвристический анализ...';
        } else {
            scanStatus.textContent = 'Завершение...';
        }
    }, 300);
}

function completeScan(file) {
    setTimeout(() => {
        document.getElementById("scan-progress").style.display = 'none';
        document.getElementById("scan-result").style.display = 'block';
        const isSafe = Math.random() > 0.3;
        
        document.getElementById("file-name").textContent = file.name;
        document.getElementById("file-size").textContent = formatFileSize(file.size);
        document.getElementById("file-type").textContent = file.type || 'Неизвестный тип';
        
        const resultEl = document.getElementById("scan-result");
        const statusIcon = document.getElementById("file-status-icon");
        const statusText = document.getElementById("file-status-text");
        const detailsEl = document.getElementById("file-scan-details");
        const openBtn = document.getElementById("btn-open-file");
        
        if (isSafe) {
            resultEl.className = 'scan-result safe';
            statusIcon.textContent = '✅';
            statusText.textContent = 'Файл безопасен';
            statusText.style.color = 'var(--neon-green)';
            openBtn.style.display = 'inline-block';
            
            detailsEl.innerHTML = `
                <div class="scan-item"><span>Вирусы</span> <span style="color: var(--neon-green)">✓ Не найдено</span></div>
                <div class="scan-item"><span>Трояны</span> <span style="color: var(--neon-green)">✓ Не найдено</span></div>
                <div class="scan-item"><span>Шпионское ПО</span> <span style="color: var(--neon-green)">✓ Не найдено</span></div>
            `;
            
            addHistory('Сканирование файла (безопасен)', 100);
            addXP(20);
        } else {
            resultEl.className = 'scan-result danger';
            statusIcon.textContent = '🚨';
            statusText.textContent = 'Обнаружена угроза!';
            statusText.style.color = 'var(--neon-red)';
            openBtn.style.display = 'none';
            
            const threats = ['Trojan.Win32', 'Riskware', 'Suspicious Behavior'];
            const detectedThreat = threats[Math.floor(Math.random() * threats.length)];
            
            detailsEl.innerHTML = `
                <div class="scan-item"><span>Обнаруженная угроза</span> <span style="color: var(--neon-red)">${detectedThreat}</span></div>
                <div class="scan-item"><span>Уровень риска</span> <span style="color: var(--neon-red)">Высокий</span></div>
                <div class="scan-item"><span>Рекомендация</span> <span style="color: var(--neon-red)">Удалить файл</span></div>
            `;
            
            addHistory('Сканирование файла (угроза)', 0);
        }
    }, 500);
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// ============================================
// УПРАВЛЕНИЕ ТЕМАМИ
// ============================================
function initTheme() {
    const savedTheme = localStorage.getItem("cyberguard-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (savedTheme === "light") {
        setTheme("light");
    } else if (savedTheme === "dark") {
        setTheme("dark");
    } else if (prefersDark) {
        setTheme("dark");
    } else {
        setTheme("light");
    }

    const themeToggle = document.getElementById("theme-toggle");
    if (themeToggle) {
        themeToggle.addEventListener("click", toggleTheme);
    }
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute("data-theme") || "dark";
    const newTheme = currentTheme === "light" ? "dark" : "light";
    setTheme(newTheme);
}

function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    const themeIcon = document.getElementById("theme-toggle");
    if (themeIcon) {
        themeIcon.textContent = theme === "light" ? "☀️" : "🌙";
    }
    try {
        localStorage.setItem("cyberguard-theme", theme);
    } catch (e) {
        console.error("Не удалось сохранить тему", e);
    }
}

function showNotification(message, type = "info") {
    const notification = document.createElement("div");
    notification.textContent = message;
    notification.style.cssText = `position: fixed; top: 20px; left: 50%; transform: translateX(-50%); padding: 18px 30px; border-radius: 12px; font-weight: bold; z-index: 3000; color: white; text-align: center; box-shadow: 0 8px 25px rgba(0,0,0,0.3); font-size: 1.1rem;`;
    if (type === "success") {
        notification.style.background = "var(--neon-green)";
    } else if (type === "error") {
        notification.style.background = "var(--neon-red)";
    } else {
        notification.style.background = "var(--neon-blue)";
    }

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.opacity = "0";
        setTimeout(() => {
            if (notification.parentNode) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// ============================================
// AI vs Real (Упрощенная версия)
// ============================================
let videoScore = 0;
let videoIndex = 0;
const videoData = [
    { isAI: true, description: "Видео A - Новостной репортаж (30 сек)" },
    { isAI: false, description: "Видео B - Интервью (45 сек)" },
    { isAI: true, description: "Видео C - Пресс-конференция (60 сек)" },
    { isAI: false, description: "Видео D - Блогер (30 сек)" },
    { isAI: true, description: "Видео E - Реклама (25 сек)" }
];

function initVideoGame() {
    videoScore = 0;
    videoIndex = 0;
    loadVideo();
}

function loadVideo() {
    if (videoIndex >= videoData.length) {
        document.getElementById("game-result").textContent = `Игра завершена! Ваш счёт: ${videoScore} из ${videoData.length}`;
        document.getElementById("btn-next-video").style.display = "none";
        document.getElementById("btn-ai").style.display = "none";
        document.getElementById("btn-real").style.display = "none";
        return;
    }
    
    const video = videoData[videoIndex];
    document.getElementById("video-description").textContent = video.description;
    document.getElementById("video-score-value").textContent = videoScore;
    document.getElementById("video-total").textContent = videoData.length;
    document.getElementById("game-result").textContent = "";
    document.getElementById("btn-next-video").style.display = "none";
}

function submitVideoAnswer(isAI) {
    const video = videoData[videoIndex];
    const correct = (isAI && video.isAI) || (!isAI && !video.isAI);
    
    const resultEl = document.getElementById("game-result");
    if (correct) {
        videoScore++;
        resultEl.textContent = "✅ Правильно!";
        resultEl.style.color = "var(--neon-green)";
        addXP(30);
    } else {
        resultEl.textContent = "❌ Неправильно!";
        resultEl.style.color = "var(--neon-red)";
    }
    
    document.getElementById("video-score-value").textContent = videoScore;
    document.getElementById("btn-next-video").style.display = "inline-block";
}

// ============================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================
document.addEventListener("DOMContentLoaded", function() {
    initTheme();
    initDashboard();
    updateStreak();
    initCyberTest();
    initFileScanner();
    initVideoGame();
    
    const passwordInput = document.getElementById("password-input");
    const togglePassword = document.getElementById("toggle-password");

    if (togglePassword && passwordInput) {
        togglePassword.addEventListener("click", function() {
            const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
            passwordInput.setAttribute("type", type);
            this.textContent = type === "password" ? "👁️" : "🙈";
        });
        
        passwordInput.addEventListener("input", function() {
            analyzePassword(this.value);
        });
    }

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

    document.querySelectorAll(".certificate-style-option").forEach((option) => {
        option.addEventListener("click", function() {
            setCertificateStyle(this.dataset.style);
        });
    });

    document.getElementById("password-length")?.addEventListener("input", function() {
        document.getElementById("length-value").textContent = this.value;
    });

    document.getElementById("link-input")?.addEventListener("keypress", function(e) {
        if (e.key === "Enter") {
            checkLinkSafety();
        }
    });
    
    // AI vs Real кнопки
    document.getElementById("btn-ai")?.addEventListener("click", () => submitVideoAnswer(true));
    document.getElementById("btn-real")?.addEventListener("click", () => submitVideoAnswer(false));
    document.getElementById("btn-next-video")?.addEventListener("click", () => {
        videoIndex++;
        loadVideo();
    });

    generatePassword();
});
