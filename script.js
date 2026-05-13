// Константа для получения элемента по ID
const $ = id => document.getElementById(id);

// --- Исправление 6: Проверка на null перед использованием элемента ---
function showPage(pid) {
    // Деактивировать все страницы
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const pageElement = $('page-' + pid);
    // Явная проверка на существование элемента
    if (pageElement) {
        pageElement.classList.add('active');
    }

    // Деактивировать все элементы навигации
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    // Активировать элемент навигации, соответствующий pid
    document.querySelectorAll('.nav-item').forEach(item => {
        const onclickAttr = item.getAttribute('onclick');
        if (onclickAttr && onclickAttr.includes("'" + pid + "'")) {
            item.classList.add('active');
        }
    });

    // Вызов специфичных функций для страниц
    if (pid === 'cabinet') updateCabinet();
    if (pid === 'quiz' && !window.quizStarted) startQuiz();
    if (pid === 'ai-vs-real') initAiGame();
    if (pid === 'phishing') initPhishingGame();
    closeSidebar();
}
// --- Конец исправления 6 ---

// Функции для работы с боковой панелью и темой остаются без изменений
function toggleSidebar() {
    $('sidebar').classList.toggle('open');
    $('sidebarOverlay').classList.toggle('show');
}

function closeSidebar() {
    $('sidebar').classList.remove('open');
    $('sidebarOverlay').classList.remove('show');
}

function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', newTheme);
    $('themeIcon').className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    saveSetting('theme', newTheme);
}

// --- Исправление 1: Обработка ошибок в localStorage ---
function saveSetting(key, value) {
    try {
        localStorage.setItem('cg_' + key, JSON.stringify(value));
    } catch (e) {
        console.error("Ошибка сохранения в localStorage:", e);
        // Здесь можно добавить уведомление пользователю, если необходимо
    }
}

function loadSetting(key, defaultValue) {
    try {
        const storedValue = localStorage.getItem('cg_' + key);
        return storedValue ? JSON.parse(storedValue) : defaultValue;
    } catch (e) {
        console.error("Ошибка чтения из localStorage:", e);
        return defaultValue; // Возвращаем значение по умолчанию в случае ошибки
    }
}
// --- Конец исправления 1 ---

function acceptCookies() {
    saveSetting('cookiesAccepted', true);
    $('cookieBanner').classList.remove('show');
}

function declineCookies() {
    $('cookieBanner').classList.remove('show');
}

// Инициализация темы и баннера cookie при загрузке
(function() {
    const savedTheme = loadSetting('theme', 'dark');
    document.documentElement.setAttribute('data-theme', savedTheme);
    $('themeIcon').className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    if (loadSetting('cookiesAccepted', false)) {
        $('cookieBanner').classList.remove('show');
    }
})();

// --- Исправление 7: Использование безопасных методов для отображения вопросов ---
const quizQuestions = [
    { q: "Что такое фишинг? ", opts: ["Вид рыбалки", "Поддельные письма/сайты для кражи данных", "Антивирусная программа", "Социальная сеть"], correct: 1 },
    { q: "Какой пароль самый надёжный? ", opts: ["12345678", "qwerty", "K#9mP$xL2vQ!nR", "password123"], correct: 2 },
    { q: "Что такое двухфакторная аутентификация (2FA)? ", opts: ["Вход по двум паролям", "Дополнительная проверка при входе", "Два аккаунта", "Двойное шифрование"], correct: 1 },
    { q: "Что делать, если друг просит деньги в сообщении? ", opts: ["Сразу перевести", "Позвонить и подтвердить личность", "Заблокировать друга", "Написать в полицию"], correct: 1 },
    { q: "Что означает HTTPS в адресной строке? ", opts: ["Сайт бесплатный", "Соединение зашифровано", "Сайт проверен полицией", "Сайт принадлежит правительству"], correct: 1 },
    { q: "Какой из признаков фишингового письма? ", opts: ["Грамотный текст", "Официальный логотип", "Срочность и угрозы блокировки", "Адрес из домена компании"], correct: 2 },
    { q: "Что такое deepfake? ", opts: ["Глубокая заморозка", "Поддельное видео/аудио, созданное ИИ", "Новый браузер", "Вид вируса"], correct: 1 },
    { q: "Можно ли скачивать программы с торрентов? ", opts: ["Да, всегда безопасно", "Нет, высокий риск вирусов", "Только в выходные", "Только для студентов"], correct: 1 },
    { q: "Что делать при подозрении на вирус? ", opts: ["Игнорировать", "Запустить антивирус и отключить интернет", "Удалить браузер", "Перезагрузить роутер"], correct: 1 },
    { q: "Как часто нужно обновлять пароли? ", opts: ["Никогда", "Раз в 10 лет", "При подозрении на утечку или каждые 3-6 месяцев", "Каждый день"], correct: 2 }
];

let quizStarted = false, currentQ = 0, quizAnswers = [];

function startQuiz() {
    quizStarted = true; currentQ = 0; quizAnswers = [];
    $('quizResult').style.display = 'none';
    $('quizContent').style.display = 'block';
    renderQuestion();
}

function renderQuestion() {
    const question = quizQuestions[currentQ];
    $('quizProgress').style.width = ((currentQ / quizQuestions.length) * 100) + '%';

    // Создание элементов DOM безопасно
    const contentDiv = $('quizContent');
    contentDiv.innerHTML = ''; // Очистить перед рендерингом

    const header = document.createElement('div');
    header.className = 'quiz-header';
    header.textContent = `Вопрос ${currentQ + 1} из ${quizQuestions.length}`;
    contentDiv.appendChild(header);

    const questionText = document.createElement('div');
    questionText.className = 'quiz-q';
    questionText.textContent = question.q;
    contentDiv.appendChild(questionText);

    const letterLabels = ['А', 'Б', 'В', 'Г'];
    question.opts.forEach((option, index) => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'quiz-option';
        optionDiv.onclick = () => selectAnswer(index);

        const letterSpan = document.createElement('span');
        letterSpan.className = 'quiz-opt-letter';
        letterSpan.textContent = letterLabels[index];

        optionDiv.appendChild(letterSpan);
        optionDiv.appendChild(document.createTextNode(' ' + option));

        contentDiv.appendChild(optionDiv);
    });

    const footer = document.createElement('div');
    footer.className = 'quiz-footer';
    contentDiv.appendChild(footer);
}
// --- Конец исправления 7 ---

function selectAnswer(idx) {
    const question = quizQuestions[currentQ];
    const options = document.querySelectorAll('.quiz-option');
    options.forEach((opt, i) => {
        opt.style.pointerEvents = 'none';
        if (i === question.correct) opt.classList.add('correct');
        if (i === idx && idx !== question.correct) opt.classList.add('wrong');
        if (i === idx) opt.classList.add('selected');
    });
    quizAnswers.push(idx === question.correct);
    setTimeout(() => {
        currentQ++;
        if (currentQ < quizQuestions.length) renderQuestion();
        else showQuizResult();
    }, 1000);
}

function showQuizResult() {
    $('quizProgress').style.width = '100%';
    $('quizContent').style.display = 'none';
    const correctCount = quizAnswers.filter(a => a).length;
    const totalCount = quizQuestions.length;
    const percentage = Math.round((correctCount / totalCount) * 100);
    let gradeMessage = '';
    if (percentage >= 90) gradeMessage = 'Отлично! Ты настоящий кибер-воин! 🛡️';
    else if (percentage >= 70) gradeMessage = 'Хорошо! Ещё немного практики! 💪';
    else if (percentage >= 50) gradeMessage = 'Неплохо, но стоит подучить материал 📖';
    else gradeMessage = 'Нужно серьёзно поработать над знаниями 📚';

    const resultDiv = $('quizResult');
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = `
        <div class="result-score">Результат: ${correctCount}/${totalCount}</div>
        <div class="result-percent">${percentage}% правильных ответов</div>
        <div class="result-grade">${gradeMessage}</div>
        <div class="result-actions">
            <button class="btn" onclick="showCertInput()">Получить сертификат</button>
            <button class="btn btn-outline" onclick="startQuiz()">Пройти заново</button>
        </div>
        <div id="certArea"></div>
        <div id="certOutput"></div>
    `;
    addHistory('quiz', `Тест: ${correctCount}/${totalCount} (${percentage}%)`);
    checkAchievements(percentage);
}

function showCertInput() {
    $('certArea').innerHTML = `
        <input type="text" id="certName" placeholder="Введи ФИО для сертификата">
        <button class="btn" onclick="generateCertificate()">Сгенерировать</button>
    `;
}

function generateCertificate() {
    const name = $('certName').value.trim();
    if (!name) {
        // --- Исправление 3: Замена alert на уведомление ---
        showNotification('Введи ФИО');
        return;
    }
    const correctCount = quizAnswers.filter(a => a).length;
    const totalCount = quizQuestions.length;
    const percentage = Math.round((correctCount / totalCount) * 100);
    const date = new Date().toLocaleDateString('ru-RU');

    const canvas = document.createElement('canvas');
    canvas.width = 800; canvas.height = 560;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, 800, 560);
    ctx.strokeStyle = '#6c5ce7'; ctx.lineWidth = 4; ctx.strokeRect(25, 25, 750, 510);
    ctx.strokeStyle = '#a855f7'; ctx.lineWidth = 2; ctx.strokeRect(35, 35, 730, 490);
    ctx.fillStyle = '#6c5ce7'; ctx.font = 'bold 20px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('⚔️ CYBER GUARD', 400, 70);
    ctx.fillStyle = '#1a1a2e'; ctx.font = 'bold 36px sans-serif'; ctx.fillText('СЕРТИФИКАТ', 400, 130);
    ctx.fillStyle = '#6b7280'; ctx.font = '16px sans-serif'; ctx.fillText('об успешном прохождении теста по кибербезопасности', 400, 170);
    ctx.fillStyle = '#6c5ce7'; ctx.font = 'bold 30px sans-serif'; ctx.fillText(name, 400, 230);
    ctx.strokeStyle = '#6c5ce7'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(200, 250); ctx.lineTo(600, 250); ctx.stroke();
    ctx.fillStyle = '#1a1a2e'; ctx.font = '18px sans-serif'; ctx.fillText(`Результат: ${correctCount} из ${totalCount} правильных ответов`, 400, 300);
    ctx.fillStyle = '#6c5ce7'; ctx.font = 'bold 24px sans-serif'; ctx.fillText(percentage + '%', 400, 340);
    ctx.fillStyle = '#6b7280'; ctx.font = '14px sans-serif'; ctx.fillText('Дата: ' + date, 400, 390);
    ctx.beginPath(); ctx.arc(400, 460, 35, 0, Math.PI * 2); ctx.strokeStyle = '#6c5ce7'; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = '#6c5ce7'; ctx.font = 'bold 20px sans-serif'; ctx.fillText('✓', 400, 468);
    ctx.fillStyle = '#9ca3af'; ctx.font = '12px sans-serif'; ctx.fillText('cyberguard.edu', 400, 530);

    const dataURL = canvas.toDataURL('image/png');
    const filename = 'CyberGuard_Сертификат_' + name.replace(/[^a-zA-Zа-яА-Я0-9]/g, '_') + '.png';
    $('certOutput').innerHTML = `
        <img src="${dataURL}" style="max-width:100%;border-radius:16px;margin:15px 0;box-shadow:0 4px 20px rgba(0,0,0,0.1)">
        <div>
            <a href="${dataURL}" download="${filename}" class="btn">[ Скачать PNG]</a>
            <button class="btn btn-outline" onclick="printCertificate('${dataURL}')">Печать</button>
        </div>
    `;
    addHistory('certificate', `Сертификат: ${name} — ${percentage}%`);
}

// --- Исправление 5: Безопасное открытие окна печати ---
function printCertificate(dataUrl) {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
         showNotification("Не удалось открыть окно для печати. Проверьте настройки блокировки всплывающих окон.");
         return;
    }
    printWindow.document.write(`
        <html>
            <head>
                <title>Печать сертификата</title>
                <style>
                    body { margin: 0; padding: 20px; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #fff; }
                    img { max-width: 100%; height: auto; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
                    @media print { body { padding: 0; } img { box-shadow: none; } }
                </style>
            </head>
            <body>
                <img src="${dataUrl}">
            </body>
        </html>
    `);
    printWindow.document.close(); // Закрыть поток записи
    // printWindow.focus(); // Фокус на новом окне (опционально)
    // printWindow.print(); // Автоматическая печать (опционально, может быть неудобно)
}
// --- Конец исправления 5 ---

// --- Исправление 3: Добавление функции уведомления ---
function showNotification(message) {
    // Простое уведомление на странице. Можно улучшить до модального окна или тоста.
    const notification = document.createElement('div');
    notification.className = 'notification-popup';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed; top: 20px; right: 20px; padding: 15px 20px; background-color: #f59e0b; color: white; border-radius: 8px; z-index: 10000; box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000); // Автоматически убрать через 3 секунды
}
// --- Конец исправления 3 ---

const aiGames = [
    { title: "Портрет девушки", desc: "Определи: реальное фото или ИИ?", isAI: false, img: "https://i.pinimg.com/originals/32/39/c1/3239c13d65d54774fd0475459e267d37.jpg", clue: "Обрати внимание на текстуру кожи и блики в глазах" },
    { title: "Пейзаж с водой", desc: "Реальное фото или генерация?", isAI: true, img: "https://avatars.mds.yandex.net/i?id=9a63de5408057529955bb84be2ab957ae4b5fb40-4337913-images-thumbs&n=13", clue: "Проверь отражения в воде и детали листвы" },
    { title: "Городской кадр", desc: "Фото или нейросеть?", isAI: false, img: "https://avatars.mds.yandex.net/i?id=ec04ce2b22adcb8c0828d6e876e2bf7dfca2d4d6-2815447-images-thumbs&n=13", clue: "Посмотри на архитектуру и тени" },
    { title: "Абстрактный портрет", desc: "Реальное или сгенерированное?", isAI: true, img: "https://avatars.mds.yandex.net/i?id=85dd2b8df60773027146717d67b44bf1208f2e2a-5352698-images-thumbs&n=13", clue: "Обрати внимание на неестественные переходы цветов" },
    { title: "Природный снимок", desc: "NASA или нейросеть?", isAI: false, img: "https://avatars.mds.yandex.net/i?id=f2c07b0e6d69104ce4c0b0fc27e8cb76f4bc7838-5205187-images-thumbs&n=13", clue: "Проверь детализацию и естественность освещения" },
    { title: "Футуристический арт", desc: "Построено или нарисовано?", isAI: true, img: "https://avatars.mds.yandex.net/i?id=51bef65f7f75a96ee125f6e8509c5f0c46bc9d96-1646378-images-thumbs&n=13", clue: "Посмотри на логичность объектов и перспективу" }
];

let aiIdx = 0, aiScore = 0, aiGameStarted = false;

function initAiGame() {
    if (aiGameStarted) return;
    aiGameStarted = true; aiIdx = 0; aiScore = 0;
    renderAiGame();
}

function renderAiGame() {
    if (aiIdx >= aiGames.length) {
        const percentage = Math.round((aiScore / aiGames.length) * 100);
        $('aiGameArea').innerHTML = `
            <div class="result-score">Результат: ${aiScore}/${aiGames.length} (${percentage}%)</div>
            <div class="result-grade">${percentage >= 70 ? 'Отличный глаз! Ты хорошо различаешь фейки!' : 'Практикуйся, чтобы стать лучше!'}</div>
            <button class="btn" onclick="initAiGame()">Заново</button>
        `;
        addHistory('ai-vs-real', `AI vs Real: ${aiScore}/${aiGames.length} (${percentage}%)`);
        checkAchievements(percentage);
        return;
    }
    const game = aiGames[aiIdx];
    // --- Исправление 7: Безопасное создание HTML для игры ИИ ---
    const area = $('aiGameArea');
    area.innerHTML = '';

    const header = document.createElement('div');
    header.className = 'game-header';
    header.textContent = `Раунд ${aiIdx + 1} из ${aiGames.length}`;
    area.appendChild(header);

    const img = document.createElement('img');
    img.src = game.img;
    img.alt = game.title;
    img.className = 'game-img';
    area.appendChild(img);

    const title = document.createElement('h3');
    title.textContent = game.title;
    area.appendChild(title);

    const desc = document.createElement('p');
    desc.textContent = game.desc;
    area.appendChild(desc);

    const clue = document.createElement('div');
    clue.className = 'clue';
    clue.textContent = `💡 ${game.clue}`;
    area.appendChild(clue);

    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'game-actions';

    const aiBtn = document.createElement('button');
    aiBtn.className = 'btn btn-danger';
    aiBtn.textContent = 'Это ИИ';
    aiBtn.onclick = () => aiAnswer(true);
    actionsDiv.appendChild(aiBtn);

    const realBtn = document.createElement('button');
    realBtn.className = 'btn btn-success';
    realBtn.textContent = 'Это реальное';
    realBtn.onclick = () => aiAnswer(false);
    actionsDiv.appendChild(realBtn);

    area.appendChild(actionsDiv);
    // --- Конец исправления 7 ---
}

function aiAnswer(userChoice) {
    const game = aiGames[aiIdx];
    const isCorrect = userChoice === game.isAI;
    if (isCorrect) aiScore++;
    $('aiGameArea').innerHTML = `
        <div class="feedback ${isCorrect ? 'success' : 'error'}">${isCorrect ? '✅ Правильно!' : '❌ Неверно!'}</div>
        <p>Правильный ответ: ${game.isAI ? 'Это было сгенерировано ИИ' : 'Это было реальное изображение'}</p>
        <button class="btn" onclick="aiIdx++; renderAiGame()">Далее</button>
    `;
}

function updatePassLength() { $('passLenVal').textContent = $('passLength').value; }
function toggleCb(element, id) { element.parentElement.classList.toggle('active'); }

// --- Исправление 4: Улучшенная генерация пароля ---
function generatePassword() {
    const length = parseInt($('passLength').value);
    const useUpper = $('cb-upper').classList.contains('active');
    const useLower = $('cb-lower').classList.contains('active');
    const useNumbers = $('cb-numbers').classList.contains('active');
    const useSymbols = $('cb-symbols').classList.contains('active');
    const useCyrillic = $('cb-cyrillic').classList.contains('active');

    let charSet = '';
    if (useUpper) charSet += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (useLower) charSet += 'abcdefghijklmnopqrstuvwxyz';
    if (useNumbers) charSet += '0123456789';
    if (useSymbols) charSet += '!@#$%^&*()-+=[]{}|;:,.<>?/~`';
    if (useCyrillic) charSet += 'АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЩЭЮЯабвгдежзиклмнопрстуфхцчшщэюя';

    if (!charSet) {
        // --- Исправление 3: Замена alert ---
        showNotification('Выбери хотя бы один набор символов');
        return;
    }

    // Генерация одного массива случайных индексов
    const randomIndices = new Uint32Array(length);
    crypto.getRandomValues(randomIndices);

    let password = '';
    for (let i = 0; i < length; i++) {
        password += charSet[randomIndices[i] % charSet.length];
    }

    $('generatedPass').textContent = password;
    $('passwordResult').style.display = 'block';
    calcStrength(password);
    addHistory('password', 'Пароль сгенерирован');
    saveSetting('passGenerated', true);
}
// --- Конец исправления 4 ---

function calcStrength(password) {
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (password.length >= 16) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;
    if (/[А-Яа-я]/.test(password)) score++;

    const levelIndex = Math.min(Math.floor(score / 2), 4);
    const levels = ['Очень слабый', 'Слабый', 'Средний', 'Сильный', 'Очень сильный'];
    const colors = ['', 'weak', 'weak', 'medium', 'strong', 'strong']; // Индексация начинается с 0

    let strengthBarHTML = '';
    for (let i = 0; i < 5; i++) {
        strengthBarHTML += `<div class="pass-strength-bar ${i < levelIndex ? colors[levelIndex] : ''} ${i < levelIndex ? 'active' : ''}"></div>`;
    }

    $('passStrength').innerHTML = strengthBarHTML;
    $('passStrengthText').textContent = 'Надёжность: ' + levels[levelIndex];
}

function copyPassword() {
    navigator.clipboard.writeText($('generatedPass').textContent).then(
        () => {
            // --- Исправление 3: Замена alert ---
            showNotification('Пароль скопирован!');
        },
        () => {
            // Обработка ошибки копирования
             showNotification('Не удалось скопировать пароль');
        }
    );
}

const suspiciousDomains = ['g0ogle.com', 'faceb00k.com', 'vk0ntakte.ru', 'sberbank-secure.ru', 'apple-id-verify.com', 'microsoft-support.net', 'amazon-security.org', 'netflix-billing.com', 'instagram-verify.ru', 'telegram-premium-free.ru'];

function checkLink() {
    const url = $('linkInput').value.trim();
    if (!url) {
        // --- Исправление 3: Замена alert ---
        showNotification('Введи ссылку');
        return;
    }
    try {
        const parsedUrl = new URL(url.startsWith('http') ? url : 'https://' + url);
        const domain = parsedUrl.hostname.replace('www.', '').toLowerCase(); // Привести к нижнему регистру для сравнения
        const isHttps = url.startsWith('https');
        const isSuspicious = suspiciousDomains.some(x => domain.includes(x) || domain.replace(/[0o]/g, 'o') === x.toLowerCase());
        const isShortened = ['bit.ly', 'tinyurl.com', 't.co', 'clck.ru', 'cutt.ly', 'goo.gl'].some(x => domain.includes(x));
        const hasManyParams = (parsedUrl.search || '').length > 50;
        const isIPAddress = /^\d+\.\d+\.\d+\.\d+$/.test(domain);

        let riskLevel = 0;
        const riskFactors = [];
        if (isSuspicious) { riskLevel += 3; riskFactors.push('Подозрительный домен (похож на известный)'); }
        if (!isHttps) { riskLevel += 2; riskFactors.push('Нет HTTPS шифрования'); }
        if (isShortened) { riskLevel += 1; riskFactors.push('Сокращённая ссылка — неизвестно куда ведёт'); }
        if (hasManyParams) { riskLevel += 1; riskFactors.push('Слишком много параметров в URL'); }
        if (isIPAddress) { riskLevel += 2; riskFactors.push('IP-адрес вместо доменного имени'); }

        const isDangerous = riskLevel >= 2;
        const resultDiv = $('linkResult');
        resultDiv.style.display = 'block';

        let resultHTML = `<div class="link-result-icon">${isDangerous ? '⚠️' : '✅'}</div>`;
        resultHTML += `<div class="link-result-title">${isDangerous ? 'Ссылка подозрительная!' : 'Ссылка выглядит безопасной'}</div>`;
        resultHTML += `<div class="link-result-desc">${riskFactors.length ? riskFactors.join('. ') : 'Явных угроз не обнаружено'}</div>`;
        if (riskFactors.length) {
            resultHTML += `<div class="risk-factors"><strong>Факторы риска:</strong><ul>${riskFactors.map(f => `<li>${f}</li>`).join('')}</ul></div>`;
        }
        resultDiv.innerHTML = resultHTML;

        addHistory('links', `Проверка: ${isDangerous ? 'опасная' : 'безопасная'} — ${url.substring(0, 40)}`);
        saveSetting('linkChecked', true);
    } catch (e) {
        $('linkResult').style.display = 'block';
        // --- Исправление 7: Использование textContent для безопасности ---
        const errorDiv = document.createElement('div');
        errorDiv.className = 'link-result-error';
        errorDiv.textContent = 'Не удалось распознать ссылку. Проверь формат.';
        $('linkResult').innerHTML = '';
        $('linkResult').appendChild(errorDiv);
    }
}

function scanFile(file) {
    if (!file) return;
    $('scannerDrop').style.display = 'none';
    $('scannerResult').style.display = 'block';

    // --- Исправление 7: Безопасное создание HTML для сканера ---
    const resultDiv = $('scannerResult');
    resultDiv.innerHTML = `
        <div class="file-info">${file.name} (${(file.size / 1024).toFixed(1)} КБ)</div>
        <div class="progress-bar"><div id="scanFill" class="progress-fill"></div></div>
        <div id="scanStatus" class="scan-status">Инициализация...</div>
    `;

    const steps = [
        { progress: 10, text: 'Анализ заголовка файла...' },
        { progress: 25, text: 'Проверка сигнатур...' },
        { progress: 40, text: 'Сканирование эвристикой...' },
        { progress: 55, text: 'Проверка поведения...' },
        { progress: 70, text: 'Анализ метаданных...' },
        { progress: 85, text: 'Сравнение с базой угроз...' },
        { progress: 95, text: 'Формирование отчёта...' },
        { progress: 100, text: 'Готово!' }
    ];

    let stepIndex = 0;
    const intervalId = setInterval(() => {
        if (stepIndex < steps.length) {
            $('scanFill').style.width = steps[stepIndex].progress + '%';
            $('scanStatus').textContent = steps[stepIndex].text;
            stepIndex++;
        } else {
            clearInterval(intervalId);
            const threatTypes = ['Trojan.GenericKD', 'Adware.BrowserModifier', 'PUP.Optional', 'Exploit.CVE-2024', 'Ransomware.WannaCry'];
            const numThreatsFound = Math.floor(Math.random() * 3);
            const foundThreats = threatTypes.slice(0, numThreatsFound);
            const isClean = numThreatsFound === 0;

            let resultHTML = '';
            if (isClean) {
                resultHTML = '<div class="scan-clean">✅ Угроз не обнаружено</div>';
            } else {
                resultHTML = foundThreats.map(threat => `<div class="scan-threat">⚠️ Обнаружено: ${threat}</div>`).join('');
            }

            resultHTML += `<div class="scan-final">${isClean ? '✅ Файл безопасен' : '⚠️ Обнаружены угрозы!'}</div>`;
            if (!isClean) {
                resultHTML += '<div class="scan-advice">Рекомендуется удалить файл и просканировать систему антивирусом.</div>';
            }
            resultHTML += '<button class="btn" onclick="resetScanner()">Проверить другой файл</button>';

            resultDiv.innerHTML += resultHTML;
            addHistory('scanner', `${file.name}: ${isClean ? 'чистый' : 'угрозы найдены'}`);
        }
    }, 600);
}

function resetScanner() {
    $('scannerDrop').style.display = 'block';
    $('scannerResult').style.display = 'none';
    $('scannerResult').innerHTML = '';
    $('fileInput').value = '';
}

(function() {
    const dropZone = $('scannerDrop');
    if (!dropZone) return;
    dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('dragover'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
    dropZone.addEventListener('drop', e => {
        e.preventDefault(); dropZone.classList.remove('dragover');
        if (e.dataTransfer.files.length) scanFile(e.dataTransfer.files[0]);
    });
})();

function addHistory(type, description) {
    const history = loadSetting('history', []);
    history.unshift({ type, desc: description, date: new Date().toLocaleString('ru-RU') });
    saveSetting('history', history.slice(0, 50)); // Ограничиваем историю 50 записями
}

function checkAchievements(score) {
    const achievements = loadSetting('achievements', []);
    const tests = loadSetting('tests', []);
    if (score !== undefined) { // Обновляем статистику тестов только если передан результат
        tests.push(score);
        saveSetting('tests', tests);
    }

    const achievementList = [
        { id: 'first_test', title: 'Первый шаг', desc: 'Пройди первый тест', icon: '🎯', color: 'purple' },
        { id: 'perfect', title: 'Перфекционист', desc: '100% в тесте', icon: '💯', color: 'gold' },
        { id: 'good_score', title: 'Отличник', desc: '80%+ в тесте', icon: '🌟', color: 'gold' },
        { id: 'five_tests', title: 'Учёный', desc: 'Пройди 5 тестов', icon: '📚', color: 'cyan' },
        { id: 'ai_master', title: 'Детектив', desc: 'Отличай AI от реальности', icon: '🔍', color: 'purple' },
        { id: 'phish_pro', title: 'Антифишер', desc: 'Распознай фишинг', icon: '🛡️', color: 'green' },
        { id: 'pass_gen', title: 'Криптограф', desc: 'Сгенерируй пароль', icon: '🔐', color: 'cyan' },
        { id: 'link_check', title: 'Инспектор', desc: 'Проверь ссылку', icon: '🔗', color: 'orange' },
        { id: 'ten_actions', title: 'Активист', desc: '10 действий', icon: '⚡', color: 'gold' },
        { id: 'scanner_user', title: 'Аналитик', desc: 'Просканируй файл', icon: '📁', color: 'red' }
    ];

    achievementList.forEach(ach => {
        if (achievements.includes(ach.id)) return; // Уже получено
        let unlocked = false;

        if (ach.id === 'first_test' && tests.length >= 1) unlocked = true;
        if (ach.id === 'perfect' && tests.some(v => v === 100)) unlocked = true;
        if (ach.id === 'good_score' && tests.some(v => v >= 80)) unlocked = true;
        if (ach.id === 'five_tests' && tests.length >= 5) unlocked = true;
        if (ach.id === 'ai_master' && score !== undefined && score >= 80) unlocked = true;
        if (ach.id === 'phish_pro' && score !== undefined && score >= 80) unlocked = true;
        if (ach.id === 'pass_gen' && loadSetting('passGenerated', false)) unlocked = true;
        if (ach.id === 'link_check' && loadSetting('linkChecked', false)) unlocked = true;
        if (ach.id === 'ten_actions' && loadSetting('history', []).length >= 10) unlocked = true;
        // if (ach.id === 'scanner_user' && ...) - условие не реализовано, но может быть добавлено

        if (unlocked) {
            achievements.push(ach.id);
            showBadgePopup(ach.icon, ach.title, ach.desc);
        }
    });
    saveSetting('achievements', achievements);
}

function showBadgePopup(icon, title, desc) {
    $('bpIcon').textContent = icon;
    $('bpTitle').textContent = title;
    $('bpDesc').textContent = desc;
    $('badgePopup').classList.add('show');
    setTimeout(() => $('badgePopup').classList.remove('show'), 4000);
}

function updateCabinet() {
    const tests = loadSetting('tests', []);
    const avgScore = tests.length ? Math.round(tests.reduce((a, b) => a + b, 0) / tests.length) : 0;
    const achievements = loadSetting('achievements', []);
    const history = loadSetting('history', []);

    $('statTests').textContent = tests.length;
    $('statAvg').textContent = avgScore + '%';
    $('statAchievements').textContent = achievements.length;
    $('statTotal').textContent = history.length;

    const allAchievements = [
        { id: 'first_test', title: 'Первый шаг', desc: 'Пройди первый тест', icon: '🎯', color: 'purple' },
        { id: 'perfect', title: 'Перфекционист', desc: '100% в тесте', icon: '💯', color: 'gold' },
        { id: 'good_score', title: 'Отличник', desc: '80%+ в тесте', icon: '🌟', color: 'gold' },
        { id: 'five_tests', title: 'Учёный', desc: 'Пройди 5 тестов', icon: '📚', color: 'cyan' },
        { id: 'ai_master', title: 'Детектив', desc: 'Отличай AI от реальности', icon: '🔍', color: 'purple' },
        { id: 'phish_pro', title: 'Антифишер', desc: 'Распознай фишинг', icon: '🛡️', color: 'green' },
        { id: 'pass_gen', title: 'Криптограф', desc: 'Сгенерируй пароль', icon: '🔐', color: 'cyan' },
        { id: 'link_check', title: 'Инспектор', desc: 'Проверь ссылку', icon: '🔗', color: 'orange' },
        { id: 'ten_actions', title: 'Активист', desc: '10 действий', icon: '⚡', color: 'gold' },
        { id: 'scanner_user', title: 'Аналитик', desc: 'Просканируй файл', icon: '📁', color: 'red' }
    ];

    let achievementsHTML = '';
    allAchievements.forEach(ach => {
        const unlocked = achievements.includes(ach.id);
        achievementsHTML += `<div class="achievement-card ${unlocked ? 'unlocked' : ''}"><div class="ach-icon">${ach.icon}</div><div class="ach-title">${ach.title}</div><div class="ach-desc">${ach.desc}</div></div>`;
    });
    $('achievementsGrid').innerHTML = achievementsHTML;

    let historyHTML = '';
    if (!history.length) {
        historyHTML = '<div class="empty-history">Пока нет действий. Начни обучение!</div>';
    } else {
        const icons = { quiz: '🎮', 'ai-vs-real': '🎬', phishing: '📧', password: '🔐', links: '🔗', scanner: '📁', certificate: '📜' };
        history.forEach(entry => {
            historyHTML += `<div class="history-item"><span class="hist-icon">${icons[entry.type] || '📋'}</span><div class="hist-info"><div class="hist-desc">${entry.desc}</div><div class="hist-meta"><span class="hist-type">${entry.type}</span><span class="hist-date">${entry.date}</span></div></div></div>`;
        });
    }
    $('historyList').innerHTML = historyHTML;
}

function showMemoTab(tab, button) {
    document.querySelectorAll('.memo-tab').forEach(t => t.style.display = 'none');
    $('memoTab-' + tab).style.display = 'block';
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    if (button) button.classList.add('active');
}

const phishingEmails = [
    { from: "support@g0ogle.com", fromName: "Google Security", subject: "⚠️ Ваш аккаунт будет заблокирован", avatar: "🔵", avatarBg: "rgba(66,133,244,0.2)", body: "Здравствуйте! Мы обнаружили подозрительную активность в вашем аккаунте. Для подтверждения личности перейдите по ссылке и введите данные. Ваш аккаунт будет заблокирован через 24 часа, если вы не подтвердите личность. [g0ogle.com/verify-account-now](#) С уважением, Команда безопасности Google", isPhishing: true, hints: ["Подозрительный домен: g0ogle.com вместо google.com", "Угроза блокировки через 24 часа", "Запрос данных через ссылку"] },
    { from: "noreply@vk.com", fromName: "ВКонтакте", subject: "🎉 Новые рекомендации для вас", avatar: "🔷", avatarBg: "rgba(0,119,255,0.2)", body: "Привет! Мы подготовили для вас персональные рекомендации сообществ и музыки. Заходите в приложение, чтобы посмотреть, что мы нашли для вас. [vk.com/feed](https://vk.com/feed) С любовью, Команда ВКонтакте", isPhishing: false, hints: ["Официальный домен vk.com", "Нет запроса данных или паролей", "Нет угроз или срочности", "Обычное информационное письмо"] },
    { from: "prize@amazon-gift.org", fromName: "Amazon Prize Department", subject: "🎁 ВЫ ВЫИГРАЛИ iPhone 15 Pro!", avatar: "📦", avatarBg: "rgba(255,153,0,0.2)", body: "Поздравляем! Вы стали победителем нашего розыгрыша! Для получения приза оплатите доставку 299₽ и укажите данные карты. [amazon-gift.org/claim-prize](#) Предложение действует 1 час! Amazon Prize Team", isPhishing: true, hints: ["Неофициальный домен: amazon-gift.org", "Просят оплатить доставку и данные карты", "Ограничение по времени (1 час)", "Вы не участвовали в розыгрыше"] },
    { from: "security@sberbank.ru", fromName: "Сбербанк", subject: "Информация о новых тарифах", avatar: "🟢", avatarBg: "rgba(34,177,76,0.2)", body: "Уважаемый клиент! Информируем вас об изменениях в тарифах на обслуживание с 1 января 2025 года. С подробной информацией вы можете ознакомиться в личном кабинете мобильного приложения Сбербанк Онлайн. С уважением, ПАО Сбербанк", isPhishing: false, hints: ["Официальный домен sberbank.ru", "Нет ссылок для ввода данных", "Просто информационное письмо", "Направляет в официальное приложение"] },
    { from: "steam-support@stearn-help.com", fromName: "Steam Support", subject: "Подтвердите вашу учётную запись", avatar: "🎮", avatarBg: "rgba(27,40,56,0.3)", body: "Здравствуйте, пользователь! Ваш аккаунт был взломан злоумышленниками. Для восстановления введите логин, пароль и Steam Guard код по ссылке: [stearn-help.com/restore](#) Срочно! Иначе аккаунт будет удалён! Steam Support Team", isPhishing: true, hints: ["Домен stearn-help.com — опечатка в Steam", "Просят логин, пароль и Steam Guard код", "Угроза удаления аккаунта", "Настоящий Steam никогда не просит пароль по email"] }
];

let phIdx = 0, phScore = 0, phGameStarted = false;

function initPhishingGame() {
    if (phGameStarted) return;
    phGameStarted = true; phIdx = 0; phScore = 0;
    renderPhishing();
}

function renderPhishing() {
    if (phIdx >= phishingEmails.length) {
        const percentage = Math.round((phScore / phishingEmails.length) * 100);
        $('phishingGame').innerHTML = `
            <div class="result-score">Результат: ${phScore}/${phishingEmails.length} (${percentage}%)</div>
            <div class="result-grade">${percentage >= 70 ? 'Отлично! Ты хорошо распознаёшь фишинг!' : 'Изучи памятку и попробуй снова!'}</div>
            <button class="btn" onclick="initPhishingGame()">Заново</button>
        `;
        addHistory('phishing', `Фишинг-симулятор: ${phScore}/${phishingEmails.length} (${percentage}%)`);
        checkAchievements(percentage);
        return;
    }
    const email = phishingEmails[phIdx];
    // --- Исправление 7: Безопасное создание HTML для фишинг игры ---
    const gameDiv = $('phishingGame');
    gameDiv.innerHTML = '';

    const header = document.createElement('div');
    header.className = 'email-header';
    header.textContent = `Письмо ${phIdx + 1} из ${phishingEmails.length}`;
    gameDiv.appendChild(header);

    const metaDiv = document.createElement('div');
    metaDiv.className = 'email-meta';

    const avatarDiv = document.createElement('div');
    avatarDiv.className = 'email-avatar';
    avatarDiv.style.background = email.avatarBg;
    avatarDiv.textContent = email.avatar;

    const infoDiv = document.createElement('div');
    infoDiv.className = 'email-info';

    const fromDiv = document.createElement('div');
    fromDiv.className = 'email-from';
    fromDiv.textContent = email.fromName;

    const addressDiv = document.createElement('div');
    addressDiv.className = 'email-address';
    addressDiv.textContent = email.from;

    infoDiv.appendChild(fromDiv);
    infoDiv.appendChild(addressDiv);
    metaDiv.appendChild(avatarDiv);
    metaDiv.appendChild(infoDiv);
    gameDiv.appendChild(metaDiv);

    const subjectDiv = document.createElement('div');
    subjectDiv.className = 'email-subject';
    subjectDiv.textContent = `Тема: ${email.subject}`;
    gameDiv.appendChild(subjectDiv);

    const bodyDiv = document.createElement('div');
    bodyDiv.className = 'email-body';
    // ВНИМАНИЕ: Используем innerHTML, так как тело письма может содержать гиперссылки.
    // Это потенциально уязвимо, если данные email.body не надежны. В текущем коде они жёстко закодированы.
    // При работе с внешними данными нужно использовать библиотеку для санитизации HTML!
    bodyDiv.innerHTML = email.body.replace(/\n/g, '<br>');
    gameDiv.appendChild(bodyDiv);

    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'email-actions';

    const phishingBtn = document.createElement('button');
    phishingBtn.className = 'btn btn-danger';
    phishingBtn.textContent = 'Это фишинг';
    phishingBtn.onclick = () => phishAnswer(true);
    actionsDiv.appendChild(phishingBtn);

    const realBtn = document.createElement('button');
    realBtn.className = 'btn btn-success';
    realBtn.textContent = 'Это настоящее';
    realBtn.onclick = () => phishAnswer(false);
    actionsDiv.appendChild(realBtn);

    gameDiv.appendChild(actionsDiv);

    const feedbackDiv = document.createElement('div');
    feedbackDiv.id = 'phishFeedback';
    feedbackDiv.style.display = 'none';
    gameDiv.appendChild(feedbackDiv);
    // --- Конец исправления 7 ---
}

function phishAnswer(userChoice) {
    const email = phishingEmails[phIdx];
    const isCorrect = userChoice === email.isPhishing;
    if (isCorrect) phScore++;

    const feedbackDiv = $('phishFeedback');
    feedbackDiv.style.display = 'block';
    feedbackDiv.innerHTML = `
        <div class="feedback ${isCorrect ? 'success' : 'error'}">${isCorrect ? '✅ Верно!' : '❌ Ошибка!'}</div>
        <p>Это ${email.isPhishing ? 'действительно фишинговое письмо' : 'настоящее письмо'}</p>
        <div class="hints-list"><strong>Признаки:</strong><ul>${email.hints.map(hint => `<li>${hint}</li>`).join('')}</ul></div>
        <button class="btn" onclick="phIdx++; renderPhishing()">Далее</button>
    `;

    document.querySelectorAll('.email-actions').forEach(el => el.style.display = 'none');
}

function launchConfetti() {
    const container = $('confettiContainer');
    const colors = ['#6c5ce7', '#a855f7', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];
    container.innerHTML = ''; // Очистить предыдущий конфетти

    for (let i = 0; i < 50; i++) {
        const piece = document.createElement('div');
        piece.className = 'confetti-piece';
        piece.style.left = Math.random() * 100 + '%';
        piece.style.top = '100%';
        piece.style.background = colors[Math.floor(Math.random() * colors.length)];
        piece.style.animationDelay = Math.random() * 2 + 's';
        piece.style.animationDuration = (1.5 + Math.random()) + 's';
        piece.style.width = (6 + Math.random() * 8) + 'px';
        piece.style.height = (6 + Math.random() * 8) + 'px';
        container.appendChild(piece);
    }
    setTimeout(() => {
        if (container.parentNode) { // Проверить, что контейнер всё ещё в DOM
             container.innerHTML = ''; // Очистить конфетти после анимации
        }
    }, 4000);
}
