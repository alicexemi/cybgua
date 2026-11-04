// Константа для получения элемента по ID
const $ = id => document.getElementById(id);

// --- Навигация ---
function showPage(pid) {
    if (ADV_PAGES.includes(pid) && getTier() < 2) { tierLockedNotice(); return; }
    // Деактивировать все страницы
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const pageElement = $('page-' + pid);
    if (pageElement) {
        pageElement.classList.add('active');
    }
    
    // Деактивировать все элементы навигации
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    
    // Активировать элемент навигации
    document.querySelectorAll('.nav-item').forEach(item => {
        const onclickAttr = item.getAttribute('onclick');
        if (onclickAttr && onclickAttr.includes("'" + pid + "'")) {
            item.classList.add('active');
        }
    });

    // Специфичные функции при открытии страниц
    if (pid === 'cabinet') updateCabinet();
    if (['memo', 'scammers', 'phishing', 'threats'].includes(pid)) saveSetting('seen_' + pid, true);
    if (pid === 'home') updateProgress();
    if (pid === 'quiz' && !window.quizStarted) startQuiz();
    if (pid === 'ai-vs-real') initAiGame();
    if (pid === 'phishing') initPhishingGame();
    if (pid === 'threats') initThreatGame();
    
    closeSidebar();
}

// --- Сайдбар и Тема ---
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
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    html.setAttribute('data-theme', newTheme);
    $('themeIcon').className = newTheme === 'dark' ? 'bi bi-sun' : 'bi bi-moon-stars';
    saveSetting('theme', newTheme);
}

// --- LocalStorage с обработкой ошибок ---
function saveSetting(key, value) {
    try {
        localStorage.setItem('cg_' + key, JSON.stringify(value));
    } catch (e) {
        console.error("Ошибка сохранения:", e);
    }
}

function loadSetting(key, defaultValue) {
    try {
        const storedValue = localStorage.getItem('cg_' + key);
        return storedValue ? JSON.parse(storedValue) : defaultValue;
    } catch (e) {
        console.error("Ошибка чтения:", e);
        return defaultValue;
    }
}

function acceptCookies() {
    saveSetting('cookiesAccepted', true);
    $('cookieBanner').classList.remove('show');
}

function declineCookies() {
    $('cookieBanner').classList.remove('show');
}

// Инициализация при загрузке
(function() {
    const savedTheme = loadSetting('theme', 'dark');
    document.documentElement.setAttribute('data-theme', savedTheme);
    $('themeIcon').className = savedTheme === 'dark' ? 'bi bi-sun' : 'bi bi-moon-stars';
    if (loadSetting('cookiesAccepted', false)) {
        $('cookieBanner').classList.remove('show');
    }
})();

// --- ТЕСТ (QUIZ) ---
const QUIZ_BASIC = [
    { q: "Что такое фишинг?", opts: ["Вид рыбалки", "Поддельные письма/сайты для кражи данных", "Антивирусная программа", "Социальная сеть"], correct: 1 },
    { q: "Какой пароль самый надёжный?", opts: ["12345678", "qwerty", "K#9mP$xL2vQ!nR", "password123"], correct: 2 },
    { q: "Что такое двухфакторная аутентификация (2FA)?", opts: ["Вход по двум паролям", "Дополнительная проверка при входе", "Два аккаунта", "Двойное шифрование"], correct: 1 },
    { q: "Что делать, если друг просит деньги в сообщении?", opts: ["Сразу перевести", "Позвонить и подтвердить личность", "Заблокировать друга", "Написать в полицию"], correct: 1 },
    { q: "Что означает HTTPS в адресной строке?", opts: ["Сайт бесплатный", "Соединение зашифровано", "Сайт проверен полицией", "Сайт принадлежит правительству"], correct: 1 },
    { q: "Какой из признаков фишингового письма?", opts: ["Грамотный текст", "Официальный логотип", "Срочность и угрозы блокировки", "Адрес из домена компании"], correct: 2 },
    { q: "Что такое deepfake?", opts: ["Глубокая заморозка", "Поддельное видео/аудио, созданное ИИ", "Новый браузер", "Вид вируса"], correct: 1 },
    { q: "Можно ли скачивать программы с торрентов?", opts: ["Да, всегда безопасно", "Нет, высокий риск вирусов", "Только в выходные", "Только для студентов"], correct: 1 },
    { q: "Что делать при подозрении на вирус?", opts: ["Игнорировать", "Запустить антивирус и отключить интернет", "Удалить браузер", "Перезагрузить роутер"], correct: 1 },
    { q: "Как часто нужно обновлять пароли?", opts: ["Никогда", "Раз в 10 лет", "При подозрении на утечку или каждые 3-6 месяцев", "Каждый день"], correct: 2 },
    { q: "Что такое социальная инженерия?", opts: ["Изучение общества", "Манипуляция людьми для получения информации", "Строительство социальных объектов", "Вид программирования"], correct: 1 },
    { q: "Зачем нужна VPN?", opts: ["Для ускорения интернета", "Для шифрования трафика и смены IP", "Для защиты от вирусов", "Для взлома Wi-Fi"], correct: 1 },
    { q: "Что такое ботнет?", opts: ["Сеть роботов-пылесосов", "Сеть зараженных компьютеров под контролем хакера", "Социальная сеть для ботов", "Программа для автоматизации"], correct: 1 },
    { q: "Какое расширение файла может быть опасным?", opts: [".jpg", ".txt", ".exe", ".pdf"], correct: 2 },
    { q: "Что делать, если потерял телефон?", opts: ["Купить новый", "Позвонить оператору для блокировки SIM и сменить пароли", "Написать объявление", "Ничего, он найдется"], correct: 1 }
];

let quizQuestions = QUIZ_BASIC;
let quizStarted = false, currentQ = 0, quizAnswers = [], quizPicked = [];

function startQuiz() {
    quizStarted = true; 
    currentQ = 0; 
    quizAnswers = []; quizPicked = [];
    $('quizResult').style.display = 'none';
    $('quizContent').style.display = 'block';
    renderQuestion();
}

function renderQuestion() {
    const question = quizQuestions[currentQ];
    $('quizProgress').style.width = ((currentQ / quizQuestions.length) * 100) + '%';
    
    const contentDiv = $('quizContent');
    contentDiv.innerHTML = ''; 

    const header = document.createElement('div');
    header.className = 'quiz-header';
    header.style.marginBottom = '10px';
    header.style.color = 'var(--text-secondary)';
    header.textContent = `Вопрос ${currentQ + 1} из ${quizQuestions.length}`;
    contentDiv.appendChild(header);

    const questionText = document.createElement('div');
    questionText.className = 'quiz-question';
    questionText.innerHTML = `<h3>${question.q}</h3>`;
    contentDiv.appendChild(questionText);

    const optionsDiv = document.createElement('div');
    optionsDiv.className = 'quiz-options';
    
    const letterLabels = ['А', 'Б', 'В', 'Г'];
    question.opts.forEach((option, index) => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'quiz-option';
        optionDiv.onclick = () => selectAnswer(index);

        const letterSpan = document.createElement('span');
        letterSpan.className = 'letter';
        letterSpan.textContent = letterLabels[index];

        optionDiv.appendChild(letterSpan);
        optionDiv.appendChild(document.createTextNode(option));
        optionsDiv.appendChild(optionDiv);
    });
    contentDiv.appendChild(optionsDiv);
}

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
    quizPicked.push(idx);
    
    setTimeout(() => {
        currentQ++;
        if (currentQ < quizQuestions.length) renderQuestion();
        else showQuizResult();
    }, 1200);
}

function showQuizResult() {
    $('quizProgress').style.width = '100%';
    $('quizContent').style.display = 'none';
    const correct = quizAnswers.filter(Boolean).length, total = quizQuestions.length;
    const pct = Math.round(correct / total * 100);
    const items = quizQuestions.map((q, i) => ({ q: q.q, mine: q.opts[quizPicked[i]], right: q.opts[q.correct], ok: quizAnswers[i] })).filter(x => !x.ok);
    addHistory('quiz', `Тест: ${correct}/${total} (${pct}%)`);
    if (getTier() === 2) saveSetting('adv_quiz_done', true);
    const next = pct < 70
        ? `<button class="btn btn-secondary" onclick="showPage('memo')">Открыть памятку</button>`
        : `<button class="btn btn-secondary" onclick="showPage('phishing')">Дальше: фишинг</button>`;
    $('quizResult').style.display = 'block';
    $('quizResult').innerHTML = summaryHTML({
        title: 'тест по безопасности', correct, total, items,
        next: `<button class="btn btn-primary" onclick="showCertInput()">Получить сертификат</button><button class="btn btn-secondary" onclick="startQuiz()">Пройти заново</button>${next}`
    }) + '<div id="certArea"></div><div id="certOutput"></div>';
    checkAchievements(pct);
    if (pct >= 80) launchConfetti();
}

function showCertInput() {
    $('certArea').innerHTML = `
        <div class="input-group" style="margin-top: 20px;">
            <label>Введите ваше ФИО для сертификата</label>
            <input type="text" id="certName" placeholder="Иванов Иван Иванович">
            <button class="btn btn-primary" style="margin-top: 10px;" onclick="generateCertificate()">Сгенерировать</button>
        </div>
    `;
}

function generateCertificate() {
    const name = $('certName').value.trim();
    if (!name) {
        showNotification('Введи ФИО');
        return;
    }
    
    const correctCount = quizAnswers.filter(a => a).length;
    const totalCount = quizQuestions.length;
    const percentage = Math.round((correctCount / totalCount) * 100);
    const date = new Date().toLocaleDateString('ru-RU');
    
    const canvas = document.createElement('canvas');
    canvas.width = 800; 
    canvas.height = 560;
    const ctx = canvas.getContext('2d');
    
    // Фон
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 800, 560);
    
    // Рамка
    ctx.strokeStyle = '#6c5ce7';
    ctx.lineWidth = 10;
    ctx.strokeRect(0, 0, 800, 560);
    
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 4;
    ctx.strokeRect(20, 20, 760, 520);
    
    // Текст
    ctx.fillStyle = '#6c5ce7';
    ctx.font = 'bold 30px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('CYBER GUARD', 400, 80);
    
    ctx.fillStyle = '#1a1a2e';
    ctx.font = 'bold 40px monospace';
    ctx.fillText('СЕРТИФИКАТ', 400, 140);
    
    ctx.fillStyle = '#6b7280';
    ctx.font = '18px monospace';
    ctx.fillText('об успешном прохождении теста по кибербезопасности', 400, 180);
    if (getTier() === 2) { ctx.fillStyle = '#6c5ce7'; ctx.font = 'bold 16px monospace'; ctx.fillText('Продвинутый уровень', 400, 208); }
    
    ctx.fillStyle = '#6c5ce7';
    ctx.font = 'bold 32px monospace';
    ctx.fillText(name, 400, 250);
    
    ctx.strokeStyle = '#6c5ce7';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(200, 270);
    ctx.lineTo(600, 270);
    ctx.stroke();
    
    ctx.fillStyle = '#1a1a2e';
    ctx.font = '20px monospace';
    ctx.fillText(`Результат: ${correctCount} из ${totalCount} правильных ответов`, 400, 320);
    
    ctx.fillStyle = '#6c5ce7';
    ctx.font = 'bold 36px monospace';
    ctx.fillText(percentage + '%', 400, 370);
    
    ctx.fillStyle = '#6b7280';
    ctx.font = '14px monospace';
    ctx.fillText('Дата: ' + date, 400, 420);
    
    // Печать
    ctx.beginPath();
    ctx.arc(400, 490, 40, 0, Math.PI * 2);
    ctx.strokeStyle = '#6c5ce7';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = '#6c5ce7';
    ctx.font = 'bold 24px monospace';
    ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(384, 490); ctx.lineTo(396, 502); ctx.lineTo(418, 476); ctx.stroke();
    
    const dataURL = canvas.toDataURL('image/png');
    const filename = 'CyberGuard_Certificate_' + name.replace(/[^a-zA-Zа-яА-Я0-9]/g, '_') + '.png';
    
    $('certOutput').innerHTML = `
        <img src="${dataURL}" style="max-width:100%; border-radius:16px; margin:15px 0; box-shadow:0 4px 20px rgba(0,0,0,0.1);">
        <div style="display:flex; gap:10px; justify-content:center;">
            <a href="${dataURL}" download="${filename}" class="btn btn-primary">Скачать PNG</a>
            <button class="btn btn-secondary" onclick="printCertificate('${dataURL}')">Печать</button>
        </div>
    `;
    addHistory('certificate', `Сертификат: ${name} — ${percentage}%`);
}

function printCertificate(dataUrl) {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        showNotification("Разрешите всплывающие окна для печати");
        return;
    }
    printWindow.document.write(`
        <html>
        <head><title>Печать сертификата</title></head>
        <body style="margin:0; display:flex; justify-content:center; align-items:center; height:100vh;">
            <img src="${dataUrl}" style="max-width:100%;">
            <script>window.onload = function() { window.print(); }<\/script>
        </body>
        </html>
    `);
    printWindow.document.close();
}

// --- Уведомления ---
function showNotification(message) {
    document.querySelectorAll('.notification-popup').forEach(x => x.remove());
    const notification = document.createElement('div');
    notification.className = 'notification-popup';
    notification.setAttribute('role', 'status');
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3500);
}

// --- AI VS REAL ---
const aiGames = [
    { title: "Портрет девушки", desc: "Реальное фото или ИИ?", isAI: false, img: "https://avatars.mds.yandex.net/i?id=fd746422af0d2578e8779149c789ca9321e5a262-12527616-images-thumbs&n=13", clue: "Обрати внимание на текстуру кожи и блики в глазах" },
    { title: "Пейзаж с водой", desc: "Реальное фото или генерация?", isAI: true, img: "https://avatars.mds.yandex.net/i?id=26332d7382dfd8fcbe26cc0cc69501bf919d0983-5331839-images-thumbs&n=13", clue: "Проверь отражения в воде и детали листвы" },
    { title: "Городской кадр", desc: "Фото или нейросеть?", isAI: false, img: "https://avatars.mds.yandex.net/i?id=27bfbb3e10cd4d076b3daab2325f9045d006da66-4949521-images-thumbs&n=13", clue: "Посмотри на архитектуру и тени" },
    { title: "Кот", desc: "Реальное или сгенерированное?", isAI: true, img: "https://avatars.mds.yandex.net/i?id=ba6aebf9a076850f236e434c3e54fa47682ef8bf-4577889-images-thumbs&n=13", clue: "Обрати внимание на лапы и усы" }
];

let aiIdx = 0, aiScore = 0, aiGameStarted = false, aiMiss = [];

function initAiGame() {
    if (aiGameStarted) return;
    aiGameStarted = true; 
    aiIdx = 0; 
    aiScore = 0; aiMiss = [];
    renderAiGame();
}

function renderAiGame() {
    if (aiIdx >= aiGames.length) {
        const percentage = Math.round((aiScore / aiGames.length) * 100);
        addHistory('ai-vs-real', `AI vs Real: ${aiScore}/${aiGames.length} (${percentage}%)`);
        $('aiGameArea').innerHTML = summaryHTML({ title: 'AI vs Real', correct: aiScore, total: aiGames.length, items: aiMiss,
            next: '<button class="btn btn-primary" onclick="aiGameStarted=false; initAiGame()">Играть заново</button><button class="btn btn-secondary" onclick="showPage(\'phishing\')">Симулятор фишинга</button>' });
        checkAchievements(percentage);
        return;
    }
    
    const game = aiGames[aiIdx];
    const area = $('aiGameArea');
    area.innerHTML = '';
    
    const img = document.createElement('img');
    img.src = game.img;
    img.style.maxWidth = '100%';
    img.style.borderRadius = '12px';
    img.style.marginBottom = '15px';
    img.style.boxShadow = 'var(--shadow)';
    area.appendChild(img);
    
    const title = document.createElement('h3');
    title.textContent = game.title;
    area.appendChild(title);
    
    const desc = document.createElement('p');
    desc.textContent = game.desc;
    desc.style.color = 'var(--text-secondary)';
    area.appendChild(desc);
    
    const clue = document.createElement('div');
    clue.style.margin = '10px 0';
    clue.style.fontSize = '13px';
    clue.style.color = 'var(--accent)';
    clue.innerHTML = '<i class="bi bi-lightbulb"></i> Подсказка: ' + game.clue;
    area.appendChild(clue);
    
    const actionsDiv = document.createElement('div');
    actionsDiv.style.display = 'flex';
    actionsDiv.style.gap = '10px';
    actionsDiv.style.justifyContent = 'center';
    
    const aiBtn = document.createElement('button');
    aiBtn.className = 'btn btn-danger';
    aiBtn.textContent = 'Это ИИ';
    aiBtn.onclick = () => aiAnswer(true);
    
    const realBtn = document.createElement('button');
    realBtn.className = 'btn btn-success';
    realBtn.textContent = 'Это реальное';
    realBtn.onclick = () => aiAnswer(false);
    
    actionsDiv.appendChild(aiBtn);
    actionsDiv.appendChild(realBtn);
    area.appendChild(actionsDiv);
}

function aiAnswer(userChoice) {
    const game = aiGames[aiIdx];
    const isCorrect = userChoice === game.isAI;
    if (isCorrect) aiScore++;
    else aiMiss.push({ q: game.title, mine: userChoice ? 'ИИ' : 'Реальное фото', right: game.isAI ? 'ИИ' : 'Реальное фото' });
    
    $('aiGameArea').innerHTML = `
        <div class="result-box ${isCorrect ? 'success' : 'danger'}">
            <h3>${isCorrect ? '<i class="bi bi-check-circle"></i> Правильно!' : '<i class="bi bi-x-circle"></i> Неверно!'}</h3>
            <p>Правильный ответ: ${game.isAI ? 'Это было сгенерировано ИИ' : 'Это было реальное изображение'}</p>
            <button class="btn btn-primary" onclick="aiIdx++; renderAiGame()">Далее</button>
        </div>
    `;
}

// --- ГЕНЕРАТОР ПАРОЛЕЙ ---
function updatePassLength() { 
    $('passLenVal').textContent = $('passLength').value; 
}

function toggleCb(element) { 
    element.classList.toggle('active'); 
}

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
        showNotification('Выбери хотя бы один набор символов');
        return;
    }

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

function calcStrength(password) {
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (password.length >= 16) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;
    
    const levelIndex = Math.min(Math.floor(score / 2), 4);
    const levels = ['Очень слабый', 'Слабый', 'Средний', 'Сильный', 'Очень сильный'];
    const colors = ['weak', 'weak', 'medium', 'strong', 'strong'];

    let strengthBarHTML = '';
    for (let i = 0; i < 5; i++) {
        const isActive = i < levelIndex ? 'active' : '';
        const colorClass = i < levelIndex ? colors[levelIndex] : '';
        strengthBarHTML += `<div class="strength-bar ${isActive} ${colorClass}"></div>`;
    }

    $('passStrength').innerHTML = strengthBarHTML;
    $('passStrengthText').textContent = 'Надёжность: ' + levels[levelIndex];
}

function copyPassword() {
    navigator.clipboard.writeText($('generatedPass').textContent).then(
        () => showNotification('Пароль скопирован!'),
        () => showNotification('Не удалось скопировать')
    );
}

// --- ПРОВЕРКА ССЫЛОК ---
const suspiciousDomains = ['g0ogle.com', 'faceb00k.com', 'vk0ntakte.ru', 'sberbank-secure.ru', 'apple-id-verify.com'];

function checkLink() {
    const url = $('linkInput').value.trim();
    if (!url) {
        showNotification('Введи ссылку');
        return;
    }
    
    try {
        const parsedUrl = new URL(url.startsWith('http') ? url : 'https://' + url);
        const domain = parsedUrl.hostname.replace('www.', '').toLowerCase();
        const isHttps = url.startsWith('https');
        const isSuspicious = suspiciousDomains.some(x => domain.includes(x));
        
        let riskLevel = 0;
        const riskFactors = [];
        
        if (isSuspicious) { riskLevel += 3; riskFactors.push('Подозрительный домен'); }
        if (!isHttps) { riskLevel += 2; riskFactors.push('Нет HTTPS шифрования'); }
        if (domain.length > 30) { riskLevel += 1; riskFactors.push('Слишком длинный домен'); }
        
        const isDangerous = riskLevel >= 2;
        const resultDiv = $('linkResult');
        resultDiv.style.display = 'block';
        resultDiv.className = `link-result ${isDangerous ? 'danger' : 'safe'}`;
        
        let resultHTML = `
            <div class="lr-icon">${isDangerous ? '<i class="bi bi-exclamation-triangle"></i>' : '<i class="bi bi-shield-check"></i>'}</div>
            <div class="lr-text">
                <h4>${isDangerous ? 'Ссылка подозрительная!' : 'Ссылка выглядит безопасной'}</h4>
                <p>${riskFactors.length ? riskFactors.join('. ') : 'Явных угроз не обнаружено'}</p>
            </div>
        `;
        resultDiv.innerHTML = resultHTML;
        
        addHistory('links', `Проверка: ${isDangerous ? 'опасная' : 'безопасная'}`);
        saveSetting('linkChecked', true);
    } catch (e) {
        $('linkResult').style.display = 'block';
        $('linkResult').innerHTML = '<div class="lr-text"><h4>Ошибка</h4><p>Неверный формат ссылки</p></div>';
    }
}

// --- СКАНЕР ФАЙЛОВ ---
(function() {
    const dropZone = $('scannerDrop');
    if (!dropZone) return;
    
    dropZone.addEventListener('click', () => $('fileInput').click());
    dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('dragover'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
    dropZone.addEventListener('drop', e => {
        e.preventDefault(); 
        dropZone.classList.remove('dragover');
        if (e.dataTransfer.files.length) scanFile(e.dataTransfer.files[0]);
    });
})();

function scanFile(file) {
    if (!file) return;
    $('scannerDrop').style.display = 'none';
    $('scannerResult').style.display = 'block';
    
    $('scannerResult').innerHTML = `
        <div class="file-info" style="margin-bottom: 15px;">${file.name} (${(file.size / 1024).toFixed(1)} КБ)</div>
        <div class="scanner-progress">
            <div class="scanner-bar"><div id="scanFill" class="scanner-fill" style="width: 0%"></div></div>
            <div id="scanStatus" style="margin-top: 10px; color: var(--text-secondary);">Инициализация...</div>
        </div>
    `;

    const steps = [
        { progress: 20, text: 'Анализ заголовка...' },
        { progress: 40, text: 'Проверка сигнатур...' },
        { progress: 60, text: 'Эвристический анализ...' },
        { progress: 80, text: 'Сравнение с базой угроз...' },
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
            const isClean = Math.random() > 0.3; // 70% шанс чистого файла
            
            let resultHTML = '';
            if (isClean) {
                resultHTML = '<div class="result-box success"><i class="bi bi-shield-check"></i> Угроз не обнаружено. Файл безопасен.</div>';
            } else {
                resultHTML = '<div class="result-box danger"><i class="bi bi-exclamation-triangle"></i> Обнаружена потенциальная угроза: Trojan.GenericKD</div>';
            }
            resultHTML += '<button class="btn btn-secondary" onclick="resetScanner()" style="margin-top: 15px;">Проверить другой файл</button>';
            
            $('scannerResult').innerHTML += resultHTML;
            addHistory('scanner', `${file.name}: ${isClean ? 'чистый' : 'угроза'}`);
            saveSetting('scannerUsed', true);
        }
    }, 600);
}

function resetScanner() {
    $('scannerDrop').style.display = 'block';
    $('scannerResult').style.display = 'none';
    $('scannerResult').innerHTML = '';
    $('fileInput').value = '';
}

// --- ФИШИНГ СИМУЛЯТОР ---
const PHISH_BASIC = [
    { 
        from: "support@g0ogle.com", 
        fromName: "Google Security", 
        subject: "Ваш аккаунт будет заблокирован", 
        body: "Мы обнаружили подозрительную активность. Перейдите по ссылке и введите данные. Аккаунт будет заблокирован через 24 часа.", 
        isPhishing: true, 
        hints: ["Подозрительный домен: g0ogle.com", "Угроза блокировки", "Запрос данных"] 
    },
    { 
        from: "noreply@vk.com", 
        fromName: "ВКонтакте", 
        subject: "Новые рекомендации для вас", 
        body: "Привет! Мы подготовили для вас персональные рекомендации сообществ. Заходите в приложение.", 
        isPhishing: false, 
        hints: ["Официальный домен vk.com", "Нет запроса данных", "Нет угроз"] 
    },
    { 
        from: "prize@amazon-gift.org", 
        fromName: "Amazon Prize", 
        subject: "ВЫ ВЫИГРАЛИ iPhone 15 Pro!", 
        body: "Поздравляем! Для получения приза оплатите доставку 299₽ и укажите данные карты.", 
        isPhishing: true, 
        hints: ["Неофициальный домен", "Просят оплату и данные карты", "Слишком хорошее предложение"] 
    }
];

let phishingEmails = PHISH_BASIC;
let phIdx = 0, phScore = 0, phGameStarted = false, phMiss = [];

function initPhishingGame() {
    if (phGameStarted) return;
    phGameStarted = true; 
    phIdx = 0; 
    phScore = 0; phMiss = [];
    renderPhishing();
}

function renderPhishing() {
    if (phIdx >= phishingEmails.length) {
        const percentage = Math.round((phScore / phishingEmails.length) * 100);
        addHistory('phishing', `Фишинг: ${phScore}/${phishingEmails.length} (${percentage}%)`);
        if (getTier() === 2) saveSetting('adv_phish_done', true);
        $('phishingGame').innerHTML = summaryHTML({ title: 'симулятор фишинга', correct: phScore, total: phishingEmails.length, items: phMiss,
            next: '<button class="btn btn-primary" onclick="phGameStarted=false; initPhishingGame()">Играть заново</button><button class="btn btn-secondary" onclick="showPage(\'quiz\')">К тесту</button>' });
        checkAchievements(percentage);
        return;
    }
    
    const email = phishingEmails[phIdx];
    const gameDiv = $('phishingGame');
    gameDiv.innerHTML = `
        <div class="phishing-email">
            <div class="email-header">
                <div class="email-meta">
                    <h4>${email.fromName}</h4>
                    <p>${email.from}</p>
                </div>
            </div>
            <div class="email-body">
                <h4 style="margin-bottom: 10px;">Тема: ${email.subject}</h4>
                <p>${email.body}</p>
            </div>
            <div class="email-actions">
                <button class="btn btn-danger" onclick="phishAnswer(true)">Это фишинг</button>
                <button class="btn btn-success" onclick="phishAnswer(false)">Это настоящее</button>
            </div>
            <div id="phishFeedback" style="display: none; margin-top: 15px;"></div>
        </div>
    `;
}

function phishAnswer(userChoice) {
    const email = phishingEmails[phIdx];
    const isCorrect = userChoice === email.isPhishing;
    if (isCorrect) phScore++;
    else phMiss.push({ q: email.fromName + ' <' + email.from + '>', mine: userChoice ? 'фишинг' : 'настоящее', right: email.isPhishing ? 'фишинг' : 'настоящее' });
    
    const feedbackDiv = $('phishFeedback');
    feedbackDiv.style.display = 'block';
    feedbackDiv.innerHTML = `
        <div class="result-box ${isCorrect ? 'success' : 'danger'}">
            <h4>${isCorrect ? '<i class="bi bi-check-circle"></i> Верно!' : '<i class="bi bi-x-circle"></i> Ошибка!'}</h4>
            <p>Это ${email.isPhishing ? 'действительно фишинговое письмо' : 'настоящее письмо'}</p>
            <ul style="text-align: left; margin-top: 10px; font-size: 13px;">
                ${email.hints.map(h => `<li>${h}</li>`).join('')}
            </ul>
            <button class="btn btn-primary" style="margin-top: 10px;" onclick="phIdx++; renderPhishing()">Далее</button>
        </div>
    `;
    document.querySelector('.email-actions').style.display = 'none';
}

// --- ОБЩИЕ ФУНКЦИИ ---
function showMemoTab(tabId, btn) {
    const parent = btn.closest('.page');
    parent.querySelectorAll('.memo-tab').forEach(t => t.style.display = 'none');
    const tab = $(`memoTab-${tabId}`); tab.style.display = tab.classList.contains('tips-grid') ? 'flex' : 'block';
    
    parent.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    if (tabId === 'threat-real') saveSetting('seen_threat_real', true);
    if (tabId === 'threat-plan') saveSetting('seen_threat_plan', true);
}

function addHistory(type, description) {
    const history = loadSetting('history', []);
    history.unshift({ type, desc: description, date: new Date().toLocaleString('ru-RU') });
    saveSetting('history', history.slice(0, 50));
    touchStreak();
    const fx = { password: 5, links: 5, scanner: 5, certificate: 15 }[type];
    if (fx) {
        const d = loadSetting('xpday', { date: '', t: [] });
        if (d.date !== dayKey()) { d.date = dayKey(); d.t = []; }
        if (!d.t.includes(type)) { d.t.push(type); saveSetting('xpday', d); addXP(fx); }
    }
}

function checkAchievements(score) {
    const achievements = loadSetting('achievements', []);
    const tests = loadSetting('tests', []);
    
    if (score !== undefined) {
        tests.push(score);
        saveSetting('tests', tests);
    }
    
    const achievementList = [
        { id: 'first_test', title: 'Первый шаг', desc: 'Пройди первый тест', icon: '<i class="bi bi-bullseye"></i>' },
        { id: 'perfect', title: 'Перфекционист', desc: '100% в тесте', icon: '<i class="bi bi-patch-check"></i>' },
        { id: 'good_score', title: 'Отличник', desc: '80%+ в тесте', icon: '<i class="bi bi-stars"></i>' },
        { id: 'pass_gen', title: 'Криптограф', desc: 'Сгенерируй пароль', icon: '<i class="bi bi-key"></i>' },
        { id: 'link_check', title: 'Инспектор', desc: 'Проверь ссылку', icon: '<i class="bi bi-link-45deg"></i>' },
        { id: 'scanner_user', title: 'Аналитик', desc: 'Просканируй файл', icon: '<i class="bi bi-folder2-open"></i>' }
    ];

    let newUnlock = false;
    achievementList.forEach(ach => {
        if (achievements.includes(ach.id)) return;
        
        let unlocked = false;
        if (ach.id === 'first_test' && tests.length >= 1) unlocked = true;
        if (ach.id === 'perfect' && tests.some(v => v === 100)) unlocked = true;
        if (ach.id === 'good_score' && tests.some(v => v >= 80)) unlocked = true;
        if (ach.id === 'pass_gen' && loadSetting('passGenerated', false)) unlocked = true;
        if (ach.id === 'link_check' && loadSetting('linkChecked', false)) unlocked = true;
        if (ach.id === 'scanner_user' && loadSetting('scannerUsed', false)) unlocked = true;

        if (unlocked) {
            achievements.push(ach.id);
            showBadgePopup(ach.icon, ach.title, ach.desc);
            newUnlock = true;
        }
    });
    
    if (newUnlock) saveSetting('achievements', achievements);
}

function showBadgePopup(icon, title, desc) {
    $('bpIcon').innerHTML = icon;
    $('bpTitle').textContent = title;
    $('bpDesc').textContent = desc;
    $('badgePopup').classList.add('show');
    setTimeout(() => $('badgePopup').classList.remove('show'), 4000);
}

function updateCabinet() {
    renderGx();
    const tests = loadSetting('tests', []);
    const avgScore = tests.length ? Math.round(tests.reduce((a, b) => a + b, 0) / tests.length) : 0;
    const achievements = loadSetting('achievements', []);
    const history = loadSetting('history', []);
    
    $('statTests').textContent = tests.length;
    $('statAvg').textContent = avgScore + '%';
    $('statAchievements').textContent = achievements.length;
    $('statTotal').textContent = history.length;

    const allAchievements = [
        { id: 'first_test', title: 'Первый шаг', desc: 'Пройди первый тест', icon: '<i class="bi bi-bullseye"></i>' },
        { id: 'perfect', title: 'Перфекционист', desc: '100% в тесте', icon: '<i class="bi bi-patch-check"></i>' },
        { id: 'good_score', title: 'Отличник', desc: '80%+ в тесте', icon: '<i class="bi bi-stars"></i>' },
        { id: 'pass_gen', title: 'Криптограф', desc: 'Сгенерируй пароль', icon: '<i class="bi bi-key"></i>' },
        { id: 'link_check', title: 'Инспектор', desc: 'Проверь ссылку', icon: '<i class="bi bi-link-45deg"></i>' },
        { id: 'scanner_user', title: 'Аналитик', desc: 'Просканируй файл', icon: '<i class="bi bi-folder2-open"></i>' }
    ];

    let achievementsHTML = '';
    allAchievements.forEach(ach => {
        const unlocked = achievements.includes(ach.id);
        achievementsHTML += `
            <div class="achievement ${unlocked ? 'unlocked' : 'locked'}">
                <div class="ach-icon" style="background: var(--bg-card-hover);">${ach.icon}</div>
                <div class="ach-info">
                    <h4>${ach.title}</h4>
                    <p>${ach.desc}</p>
                </div>
            </div>
        `;
    });
    $('achievementsGrid').innerHTML = achievementsHTML;

    let historyHTML = '';
    if (!history.length) {
        historyHTML = '<div class="result-box">Пока нет действий. Начни обучение!</div>';
    } else {
        history.forEach(entry => {
            historyHTML += `
                <div class="history-item">
                    <div class="h-info">
                        <h4>${entry.desc}</h4>
                        <p>${entry.date}</p>
                    </div>
                </div>
            `;
        });
    }
    $('historyList').innerHTML = historyHTML;
}

// --- КОНФЕТТИ (ИСПРАВЛЕНИЕ ОШИБКИ) ---
function launchConfetti() {
    const container = $('confettiContainer');
    if (!container) return; // Защита от ошибки, если элемента нет
    
    const colors = ['#6c5ce7', '#a855f7', '#06b6d4', '#10b981', '#f59e0b'];
    container.innerHTML = '';
    for (let i = 0; i < 50; i++) {
        const piece = document.createElement('div');
        piece.className = 'confetti-piece';
        piece.style.left = Math.random() * 100 + '%';
        piece.style.background = colors[Math.floor(Math.random() * colors.length)];
        piece.style.animationDelay = Math.random() * 2 + 's';
        container.appendChild(piece);
    }
    setTimeout(() => { container.innerHTML = ''; }, 4000);
}


// --- МАРШРУТ ОБУЧЕНИЯ ---
function updateProgress() {
    const t = loadSetting('tests', []), a = loadSetting('achievements', []);
    const avg = t.length ? Math.round(t.reduce((x, y) => x + y, 0) / t.length) : 0;
    const steps = getTier() === 2 ? advSteps() : [
        { id: 'memo', t: 'Прочитай памятку', d: 'Основы: пароли, 2FA, обновления', done: loadSetting('seen_memo', false) },
        { id: 'scammers', t: 'Узнай виды мошенников', d: 'Как они действуют и как им противостоять', done: loadSetting('seen_scammers', false) },
        { id: 'phishing', t: 'Потренируйся на фишинге', d: 'Отличи настоящее письмо от поддельного', done: loadSetting('seen_phishing', false) },
        { id: 'password', t: 'Создай надёжный пароль', d: 'Сгенерируй и оцени его стойкость', done: loadSetting('passGenerated', false) },
        { id: 'links', t: 'Проверь ссылку', d: 'Найди признаки опасного адреса', done: loadSetting('linkChecked', false) },
        { id: 'quiz', t: 'Сдай итоговый тест', d: 'Набери 80% и получи сертификат', done: t.length > 0 }
    ];
    const next = steps.find(s => !s.done), done = steps.filter(s => s.done).length;
    const pct = Math.round(done / steps.length * 100);
    $('pathList').innerHTML = steps.map((s, i) => `<button type="button" class="step ${s.done ? 'done' : ''} ${s === next ? 'next' : ''}" onclick="goStep('${s.id}', '${s.tab || ''}')"><span class="n">${s.done ? '<i class="bi bi-check2"></i>' : i + 1}</span><span><b>${s.t}</b><small>${s.d}</small></span><i class="bi bi-chevron-right"></i></button>`).join('');
    const go = next || { id: 'quiz', t: 'Пройти тест ещё раз' };
    $('heroCta').innerHTML = `<i class="bi bi-play-fill"></i> ${next ? (done ? 'Продолжить: ' : 'Начать: ') + go.t : go.t}`;
    $('heroCta').onclick = () => goStep(go.id, go.tab);
    $('pTests').textContent = t.length; $('pAvg').textContent = avg + '%';
    $('pAch').textContent = a.length + '/6'; $('ringVal').textContent = pct + '%';
    requestAnimationFrame(() => $('ring').style.setProperty('--p', pct));
}

// --- ПОИСК ПО РАЗДЕЛАМ ---
(function () {
    const S = [
        ['quiz', 'Тест по безопасности', 'тест экзамен сертификат вопросы', 'clipboard2-check'],
        ['phishing', 'Симулятор фишинга', 'письмо почта фишинг', 'envelope-exclamation'],
        ['ai-vs-real', 'AI vs Real', 'нейросеть фейк фото deepfake', 'robot'],
        ['password', 'Генератор паролей', 'пароль генератор', 'key'],
        ['links', 'Проверка ссылок', 'ссылка url сайт', 'link-45deg'],
        ['scanner', 'Сканер файлов', 'файл вирус сканер', 'file-earmark-lock2'],
        ['memo', 'Памятка', 'советы 2fa wifi правила', 'journal-bookmark'],
        ['scammers', 'Виды мошенников', 'мошенники дропперы смишинг', 'incognito'],
        ['threats', 'Докс и сваттинг', 'докс сват сваттинг угроза угрожают шантаж приватность продвинутый', 'shield-exclamation'],
        ['cabinet', 'Личный кабинет', 'профиль достижения история статистика', 'person-badge']
    ];
    const inp = $('searchInput'), box = $('searchResults');
    function render() {
        const q = inp.value.trim().toLowerCase();
        const r = S.filter(s => !q || (s[1] + ' ' + s[2]).toLowerCase().includes(q));
        box.innerHTML = r.length ? r.map(s => `<button type="button" data-id="${s[0]}"><i class="bi bi-${s[3]}"></i>${s[1]}</button>`).join('')
            : '<p>Ничего не найдено. Попробуйте «пароль» или «фишинг».</p>';
        box.classList.add('show');
    }
    inp.addEventListener('input', render);
    inp.addEventListener('focus', render);
    inp.addEventListener('keydown', e => {
        if (e.key === 'Enter') { const f = box.querySelector('button'); if (f) f.click(); }
        if (e.key === 'Escape') { box.classList.remove('show'); inp.blur(); }
    });
    box.addEventListener('click', e => {
        const b = e.target.closest('button'); if (!b) return;
        showPage(b.dataset.id); inp.value = ''; box.classList.remove('show');
    });
    document.addEventListener('click', e => { if (!e.target.closest('.search')) box.classList.remove('show'); });
})();


// --- УРОВНИ, ОПЫТ И СЕРИЯ ДНЕЙ ---
const LV = [['Новичок', 0], ['Стажёр', 100], ['Страж', 250], ['Эксперт', 450], ['Мастер', 700], ['Легенда', 1000]];
const esc = s => String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const plural = n => { const m = n % 10, c = n % 100; return c > 10 && c < 15 ? 'дней' : m === 1 ? 'день' : m > 1 && m < 5 ? 'дня' : 'дней'; };
function dayKey(off = 0) { const d = new Date(); d.setDate(d.getDate() + off); return d.toLocaleDateString('sv-SE'); }

function levelInfo(xp) {
    let i = 0;
    while (i < LV.length - 1 && xp >= LV[i + 1][1]) i++;
    const lo = LV[i][1], hi = i < LV.length - 1 ? LV[i + 1][1] : null;
    return { n: i + 1, name: LV[i][0], xp, hi, pct: hi ? Math.round((xp - lo) / (hi - lo) * 100) : 100 };
}
function addXP(n) {
    const before = levelInfo(loadSetting('xp', 0)).n, xp = loadSetting('xp', 0) + n;
    saveSetting('xp', xp);
    const after = levelInfo(xp);
    if (after.n > before) showBadgePopup('<i class="bi bi-arrow-up-circle"></i>', 'Уровень ' + after.n, after.name);
    renderGx();
    renderTierBar();
    checkTierOffer();
    return after;
}
function getStreak() {
    const s = loadSetting('streak', { last: '', count: 0, best: 0, days: [] });
    const alive = s.last === dayKey() || s.last === dayKey(-1);
    return { ...s, shown: alive ? s.count : 0, today: s.last === dayKey() };
}
function touchStreak() {
    const s = loadSetting('streak', { last: '', count: 0, best: 0, days: [] });
    if (s.last === dayKey()) return;
    s.count = s.last === dayKey(-1) ? s.count + 1 : 1;
    s.last = dayKey(); s.best = Math.max(s.best || 0, s.count);
    s.days = [...(s.days || []), s.last].slice(-30);
    saveSetting('streak', s);
    renderGx();
}
function lvlImg(n) {
    return 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 70"><path d="M30 3 54 12v20c0 18-11 30-24 35C17 62 6 50 6 32V12z" fill="#5b21b6" stroke="#a3ff12" stroke-width="3"/><text x="30" y="42" text-anchor="middle" font-family="monospace" font-weight="700" font-size="24" fill="#fff">${n}</text></svg>`);
}
function gxHTML() {
    const L = levelInfo(loadSetting('xp', 0)), S = getStreak();
    const lit = Math.min(S.shown, 7), cur = S.today ? lit - 1 : lit;
    const dots = [...Array(7)].map((_, i) => `<i class="${i < lit ? 'on' : ''}${i === cur ? ' today' : ''}" style="--i:${i}"></i>`).join('');
    const hint = S.today ? 'Сегодня засчитано' : S.shown ? 'Сделай задание сегодня, чтобы не потерять серию' : 'Начни серию сегодня';
    return `<div class="gx-lv"><img src="${lvlImg(L.n)}" alt=""><div><small>Уровень ${L.n}</small><b>${L.name}</b></div></div>
        <div class="gx-bar"><span style="width:${L.pct}%"></span></div>
        <div class="gx-xp">${L.xp} XP${L.hi ? ` · до уровня ${L.n + 1}: ${L.hi - L.xp}` : ' · максимум'}</div>
        <div class="gx-streak"><i class="bi bi-fire"></i><div><b>${S.shown} ${plural(S.shown)} подряд</b><small>${hint}</small></div></div>
        <div class="gx-dots">${dots}</div>`;
}
function renderGx() {
    ['gxPanel', 'sideStats', 'gxCabinet'].forEach(id => { const e = $(id); if (e) e.innerHTML = gxHTML(); });
}

// --- ИТОГИ ПОСЛЕ ТЕСТА ---
function summaryHTML(o) {
    const pct = Math.round(o.correct / o.total * 100), wrong = o.total - o.correct;
    const before = levelInfo(loadSetting('xp', 0));
    touchStreak();
    const gain = o.correct * 10 + (pct === 100 ? 20 : 0);
    const L = addXP(gain), S = getStreak();
    const v = pct >= 90 ? ['bi-shield-check', 'Отлично! Ты настоящий кибер-страж.'] : pct >= 70 ? ['bi-hand-thumbs-up', 'Хорошо! Ещё немного практики.'] : pct >= 50 ? ['bi-book', 'Неплохо, но стоит повторить материал.'] : ['bi-exclamation-triangle', 'Нужно серьёзно поработать над знаниями.'];
    const miss = (o.items || []).map(m => `<div class="sum-miss"><b>${esc(m.q)}</b>${m.mine ? `<span class="no">Твой ответ: ${esc(m.mine)}</span><br>` : ''}<span class="yes">Верно: ${esc(m.right)}</span></div>`).join('');
    return `<div class="sum">
        <div class="sum-head"><div class="sum-pct" style="--p:${pct}"><span>${pct}%</span></div>
            <div><h2>Итоги: ${esc(o.title)}</h2><p class="sum-verdict"><i class="bi ${v[0]}"></i> ${v[1]}</p></div></div>
        <div class="sum-stats"><div><b class="ok">${o.correct}</b><small>верно</small></div><div><b class="bad">${wrong}</b><small>ошибок</small></div><div><b class="xp">+${gain}</b><small>XP</small></div></div>
        <div class="sum-gx">
            <div class="gx-lv"><img src="${lvlImg(L.n)}" alt=""><div><small>Уровень ${L.n}</small><b>${L.name}</b>${L.n > before.n ? '<br><span class="sum-up">НОВЫЙ УРОВЕНЬ</span>' : ''}</div></div>
            <div class="gx-streak"><i class="bi bi-fire"></i><div><b>${S.shown} ${plural(S.shown)} подряд</b><small>${S.shown > 1 ? 'Вернись завтра, чтобы продлить серию' : 'Серия началась, не пропускай дни'}</small></div></div>
        </div>
        <div class="gx-bar" style="margin-top:12px"><span style="width:${L.pct}%"></span></div>
        <div class="gx-xp">${L.xp} XP${L.hi ? ` · до уровня ${L.n + 1}: ${L.hi - L.xp}` : ''}</div>
        ${miss ? `<h3>Разбор ошибок</h3>${miss}` : '<p class="sum-clean"><i class="bi bi-check-circle"></i> Без ошибок, так держать.</p>'}
        <div class="sum-next">${o.next || ''}</div></div>`;
}

// --- КАРТИНКИ В ЗАГОЛОВКАХ СТРАНИЦ ---
(function () {
    const L = '#84cc16';
    const A = {
        quiz: `<rect x="42" y="30" width="66" height="90" rx="9"/><path d="M62 30v-6h26v6M56 62h38M56 80h38M56 98h18"/><path stroke="${L}" d="M82 106l7 7 14-16"/>`,
        'ai-vs-real': `<rect x="38" y="42" width="74" height="70" rx="14"/><circle cx="60" cy="72" r="6"/><circle cx="90" cy="72" r="6"/><path d="M58 94h34M75 42V28"/><circle stroke="${L}" cx="75" cy="23" r="5"/>`,
        password: `<circle cx="54" cy="75" r="20"/><path d="M74 75h48M106 75v16M120 75v11" stroke="${L}"/>`,
        links: `<rect x="22" y="60" width="58" height="30" rx="15"/><rect x="70" y="60" width="58" height="30" rx="15"/><path stroke="${L}" d="M62 75h26"/>`,
        memo: `<path d="M28 40h40q7 0 7 7v68q0-7-7-7H28zM122 40H82q-7 0-7 7v68q0-7 7-7h40z"/><path stroke="${L}" d="M40 60h24M86 60h24M86 76h24"/>`,
        scammers: `<path d="M38 72h74M52 72l8-32h30l8 32"/><circle cx="60" cy="98" r="11"/><circle cx="90" cy="98" r="11"/><path stroke="${L}" d="M71 98h8"/>`,
        scanner: `<path d="M50 28h36l20 20v74H50zM86 28v20h20"/><rect stroke="${L}" x="62" y="88" width="32" height="22" rx="4"/><path stroke="${L}" d="M69 88v-6a9 9 0 0 1 18 0v6"/>`,
        cabinet: `<circle cx="75" cy="56" r="20"/><path d="M36 122c4-28 24-38 39-38s35 10 39 38"/><path stroke="${L}" d="M62 104l8 8 18-18"/>`,
        threats: `<path d="M75 24 118 40v34c0 30-18 50-43 60C50 124 32 104 32 74V40z"/><path stroke="${L}" d="M75 58v28M75 102v.1"/>`,
        phishing: `<rect x="26" y="50" width="92" height="62" rx="10"/><path d="M26 58l46 34 46-34"/><circle stroke="${L}" cx="120" cy="42" r="11"/><path stroke="${L}" d="M120 36v6M120 48v.1"/>`
    };
    Object.entries(A).forEach(([id, body]) => {
        const hd = document.querySelector('#page-' + id + ' .header');
        if (!hd) return;
        const img = new Image();
        img.className = 'page-art'; img.alt = ''; img.setAttribute('aria-hidden', 'true');
        img.src = 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 150"><circle cx="75" cy="75" r="70" fill="#8b5cf6" fill-opacity=".12" stroke="#8b5cf6" stroke-opacity=".5" stroke-dasharray="4 7"/><g fill="none" stroke="#a78bfa" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">${body}</g></svg>`);
        hd.appendChild(img);
    });
})();

renderGx();


// --- ТЕКСТЫ, СОВЕТЫ И КНОПКИ В КАРТОЧКАХ ---
(function () {
    const DESC = {
        quiz: 'Пятнадцать вопросов по основам безопасности. После теста тебя ждёт разбор ошибок, опыт и сертификат.',
        memo: 'Короткие правила цифровой гигиены по темам. Выбери вкладку, прочитай карточки и сразу закрепи знания на практике.',
        scammers: 'Пять типов мошенников, их приёмы и способы защиты. Под каждой карточкой есть кнопка с тренажёром по теме.',
        password: 'Создай пароль, который нельзя подобрать: выбери длину и набор символов. Пароль создаётся прямо в браузере и никуда не отправляется.',
        links: 'Вставь адрес и узнай, есть ли признаки подделки. Это учебная проверка по простым правилам, она не заменяет антивирус.',
        scanner: 'Учебная имитация антивирусной проверки: показывает этапы анализа файла. Сам файл не загружается на сервер.',
        threats: 'Как работают докс и сваттинг, как отличить реальную угрозу от блефа и что делать по шагам. Раздел продвинутого уровня.',
        cabinet: 'Твой уровень, серия дней, достижения и история действий в одном месте.'
    };
    Object.entries(DESC).forEach(([id, t]) => {
        const hd = document.querySelector('#page-' + id + ' .header');
        if (!hd || hd.querySelector('.page-desc')) return;
        const p = document.createElement('p'); p.className = 'page-desc'; p.textContent = t;
        hd.querySelector('h1').after(p);
    });

    const INTRO = {
        'memoTab-basics': 'Пять правил закрывают большинство бытовых угроз. Начни с паролей и двухфакторной защиты: это самое важное.',
        'memoTab-social': 'Соцсети — главный источник данных для мошенников: по твоим постам они подбирают сценарий обмана.',
        'memoTab-data': 'Личные и платёжные данные нельзя «отдать на время»: после передачи ты их уже не контролируешь.',
        'memoTab-games': 'Игровые аккаунты и внутриигровая валюта — частая цель: их воруют, перепродают и используют против друзей.',
        'memoTab-tips': 'Нейросети быстро улучшаются, поэтому ни один признак не работает всегда. Оценивай картинку сразу по нескольким.',
        'memoTab-phish-tips': 'Фишинг давит на эмоции: страх, жадность, спешку. Остановись на десять секунд и проверь детали.'
    };
    Object.entries(INTRO).forEach(([id, t]) => {
        const tab = $(id); if (!tab) return;
        const p = document.createElement('p'); p.className = 'tab-intro'; p.textContent = t; tab.prepend(p);
    });

    // заголовок карточки: [совет, страница для кнопки, подпись кнопки]
    const M = {
        'Пароли': ['Длинная фраза из 4–5 случайных слов надёжнее короткого «сложного» пароля. Храни пароли в менеджере, а не в заметках.', 'password', 'Генератор паролей'],
        '2FA': ['Лучше всего работают приложения-аутентификаторы. SMS-коды слабее: номер можно перехватить.', 'quiz', 'Проверить себя'],
        'Обновления': ['Включи автообновление на телефоне и компьютере. Большинство взломов используют уже закрытые дыры.', 'quiz', 'Проверить себя'],
        'Загрузки': ['Скачивай программы только с официальных сайтов и из магазинов приложений. «Бесплатный взлом» чаще всего оказывается вирусом.', 'scanner', 'Сканер файлов'],
        'Wi-Fi': ['Если сеть пришлось использовать, заходи только на сайты с HTTPS и не входи в банк и почту.', 'links', 'Проверка ссылок'],
        'Приватный профиль': ['Раз в полгода просматривай список друзей и подписчиков: чужие аккаунты там оказываются незаметно.', 'scammers', 'Виды мошенников'],
        'Геолокация': ['Публикуй фото с отпуска после возвращения: пустая квартира привлекает не только друзей.', 'scammers', 'Виды мошенников'],
        'Контент навсегда': ['Прежде чем выложить пост, представь, что его прочтут родители, учителя и будущий работодатель.', 'ai-vs-real', 'AI vs Real'],
        'Адрес и телефон': ['Мошенники часто начинают с безобидного вопроса. Сначала узнай, зачем человеку твои данные.', 'phishing', 'Симулятор фишинга'],
        'Банковские данные': ['Никому не сообщай код из SMS и CVV, даже «сотруднику банка». Настоящий банк их не спрашивает.', 'phishing', 'Симулятор фишинга'],
        'Аккаунты': ['Пароль от игры не должен совпадать с паролем от почты. Включи 2FA и там.', 'password', 'Генератор паролей'],
        'Покупки': ['Если предложение выглядит слишком выгодным, это почти всегда обман. Покупай только внутри самой игры.', 'links', 'Проверка ссылок'],
        'Фишеры': ['', 'phishing', 'Тренажёр фишинга'], 'Смишеры': ['', 'links', 'Проверка ссылок'],
        'Социальные инженеры': ['', 'quiz', 'Проверить себя'], 'Deepfake': ['', 'ai-vs-real', 'AI vs Real'], 'Дропперы': ['', 'quiz', 'Проверить себя'],
        'Обрати внимание на глаза': ['Сравни блики в обоих зрачках: на настоящем фото источник света отражается одинаково.'],
        'Посмотри на руки и пальцы': ['Пересчитай пальцы и посмотри, как рука держит предмет. Сросшиеся или лишние пальцы выдают генерацию.'],
        'Проверь текст на изображении': ['Приблизь вывески, этикетки и футболки: у нейросетей вместо слов нередко получается набор похожих букв.'],
        'Фон и детали': ['Фон у ИИ часто «плывёт»: линии не стыкуются, мелкие предметы теряют форму.'],
        'Артефакты': ['Если по краям объекта видны ореолы или резкие границы, изображение могли смонтировать.'],
        'Проверяй адрес отправителя': ['Смотри не на имя отправителя, а на домен после @. Подмена одной буквы — самый частый приём.'],
        'Срочность и угрозы': ['Настоящие сервисы не требуют действовать за час. Открой сайт сам, не через ссылку из письма.'],
        'Подозрительные ссылки': ['На телефоне долгое нажатие на ссылку показывает её реальный адрес без перехода.']
    };
    document.querySelectorAll('.tip-card').forEach(card => {
        const h = card.querySelector('h4'), m = h && M[h.textContent.trim()];
        if (!m) return;
        if (m[0]) { const d = document.createElement('div'); d.className = 'tip-more'; d.innerHTML = '<span>Совет</span>' + m[0]; card.appendChild(d); }
        if (m[1]) { const b = document.createElement('button'); b.type = 'button'; b.className = 'btn btn-secondary tip-btn'; b.innerHTML = m[2] + ' <i class="bi bi-arrow-right"></i>'; b.onclick = () => showPage(m[1]); card.appendChild(b); }
    });

    // блоки «Полезно знать» под инструментами
    const INFO = {
        password: [['arrows-expand', 'Длина важнее сложности', 'Каждый лишний символ резко усложняет подбор. Ориентируйся на 16 символов и больше.'], ['shield-lock', 'Один пароль — один сервис', 'Утечка на одном сайте не должна открывать твою почту и банк.'], ['safe', 'Менеджер паролей', 'Не запоминай десятки паролей: храни их в зашифрованном менеджере.']],
        scanner: [['file-earmark-x', 'Расширение не гарантия', 'Файл счёт.pdf.exe — это программа, а не документ. Включи показ расширений в системе.'], ['download', 'Источник важнее файла', 'Кряки, «обновления» и вложения от незнакомцев — самый частый путь заражения.'], ['bug', 'Антивирус нужен настоящий', 'Учебный сканер объясняет риски, но защищает только полноценный антивирус.']]
    };
    Object.entries(INFO).forEach(([id, list]) => {
        const pg = $('page-' + id); if (!pg) return;
        const t = document.createElement('h3'); t.className = 'section-title'; t.textContent = 'Полезно знать';
        const g = document.createElement('div'); g.className = 'tips-grid';
        g.innerHTML = list.map(([i, h, p]) => `<div class="tip-card"><div class="tip-icon"><i class="bi bi-${i}"></i></div><h4>${h}</h4><p>${p}</p></div>`).join('');
        pg.append(t, g);
    });
})();


// ============================================================
// УРОВНИ ОБУЧЕНИЯ: БАЗОВЫЙ И ПРОДВИНУТЫЙ
// Продвинутый открывается на уровне TIER_UNLOCK_LV (по XP),
// затем его нужно «обновить» и можно переключаться туда-обратно.
// ============================================================
const TIER_UNLOCK_LV = 3;
const ADV_PAGES = ['threats'];
const QUIZ_DESC = {
    1: 'Пятнадцать вопросов по основам безопасности. После теста тебя ждёт разбор ошибок, опыт и сертификат.',
    2: 'Десять сложных вопросов: докс, сваттинг, целевой фишинг и защита аккаунтов. После теста тебя ждёт разбор ошибок, опыт и сертификат.'
};
const HERO_TEXT = {
    1: 'Пройди маршрут из шести шагов: от основ до итогового теста. Прогресс сохраняется автоматически.',
    2: 'Продвинутый маршрут: докс, сваттинг, целевой фишинг и сложный тест. Прогресс сохраняется автоматически.'
};

const QUIZ_ADV = [
    { q: "Что такое докс (doxing)?", opts: ["Взлом сайта через уязвимость", "Сбор и публикация личных данных человека без его согласия", "Массовая рассылка спама", "Шифрование файлов с требованием выкупа"], correct: 1 },
    { q: "Что такое сваттинг?", opts: ["Покупка и продажа игровых аккаунтов", "Взлом домашнего Wi-Fi соседей", "Ложный вызов экстренных служб по чужому адресу, чтобы туда приехали вооружённые сотрудники", "Рассылка фишинговых писем"], correct: 2 },
    { q: "Тебе написали: «Знаю, где ты живёшь, опубликую адрес». Что сделать в первую очередь?", opts: ["Сохранить скриншоты с датой и профилем автора, не вступая в спор", "Ответить и попытаться договориться", "Удалить переписку, чтобы не нервничать", "Перевести деньги, чтобы отстали"], correct: 0 },
    { q: "Что сильнее всего указывает на реальную угрозу?", opts: ["Много восклицательных знаков и ругани", "Сообщение пришло с нового аккаунта", "Точные детали, которых нет в открытом доступе: квартира, график, фото вблизи", "Требование денег в криптовалюте"], correct: 2 },
    { q: "Откуда чаще всего берут данные для докса?", opts: ["Из закрытых баз банков", "Угадывают наугад", "Из антивирусных программ", "Из открытых источников: соцсети, старые утечки, метаданные фото, игровые профили"], correct: 3 },
    { q: "Тебе угрожают ложным вызовом полиции. Как лучше подготовиться?", opts: ["Закрыться и не открывать дверь никому", "Предупредить семью, сообщить в полицию об угрозах и заранее договориться, как вести себя при приезде", "Выбежать навстречу и объяснять, что это розыгрыш", "Ничего не делать: предотвратить это невозможно"], correct: 1 },
    { q: "Твои данные уже опубликованы. Что делать?", opts: ["Сделать скриншоты, пожаловаться площадке, сообщить в полицию и близким, сменить пароли и включить 2FA", "Ничего: удалить опубликованное всё равно нельзя", "Написать автору и пообещать ответить тем же", "Удалить все свои аккаунты и скрыться"], correct: 0 },
    { q: "Что такое целевой фишинг (spear phishing)?", opts: ["Массовая рассылка одинакового письма", "Звонок с неизвестного номера", "Вирус в игровом моде", "Письмо, составленное под конкретного человека с использованием его реальных данных"], correct: 3 },
    { q: "«Сотрудник банка» называет твои ФИО и последние цифры карты. Это доказывает, что он настоящий?", opts: ["Да, эти данные знает только банк", "Нет: такие данные бывают в утечках. Нужно положить трубку и перезвонить по номеру с карты", "Да, если он говорит уверенно", "Зависит от времени суток"], correct: 1 },
    { q: "Что такое метаданные (EXIF) фотографии и чем они опасны?", opts: ["Фильтры, наложенные на фото", "Размер файла в мегабайтах", "Скрытые сведения о съёмке: время, устройство, иногда координаты", "Подпись автора на изображении"], correct: 2 }
];

const PHISH_ADV = [
    {
        from: "a.sidorov@mail-corp-docs.ru", fromName: "Алексей Сидоров (директор)", subject: "Срочно: нужна оплата счёта сегодня",
        body: "Привет! Я на переговорах и не могу говорить. Оплати счёт на 184 000 ₽ по реквизитам из вложения до 16:00, документы оформим потом. Пока не закроем сделку, никому не говори.",
        isPhishing: true, hints: ["Домен не совпадает с корпоративным", "Срочный платёж и просьба хранить тайну", "Нельзя позвонить и проверить"]
    },
    {
        from: "noreply@github.com", fromName: "GitHub", subject: "Новый вход в аккаунт",
        body: "Мы заметили вход с нового устройства (Windows, Москва). Если это были вы, ничего делать не нужно. Если нет, откройте github.com вручную и смените пароль в настройках безопасности.",
        isPhishing: false, hints: ["Официальный домен github.com", "Не просят вводить данные по ссылке", "Советуют открыть сайт самостоятельно"]
    },
    {
        from: "it-support@corp-secure-login.com", fromName: "IT-поддержка", subject: "Обновите двухфакторную защиту до пятницы",
        body: "Отсканируйте QR-код из вложения телефоном и подтвердите 2FA. Иначе доступ к почте будет закрыт.",
        isPhishing: true, hints: ["QR-код скрывает адрес, куда ведёт", "Домен не принадлежит вашей компании", "Угроза потерять доступ и срок"]
    },
    {
        from: "anon_8431@tutanota.com", fromName: "Аноним", subject: "Я знаю твой адрес",
        body: "У меня есть твой пароль «qwerty2019» из утечки и твой адрес. Переведи 0,01 BTC за 48 часов, иначе разошлю всем твоим контактам.",
        isPhishing: true, hints: ["Пароль из старой утечки не доказывает взлом", "Шаблонный текст без личных деталей", "Криптовалюта и дедлайн"]
    },
    {
        from: "orders@ozon.ru", fromName: "Ozon", subject: "Заказ №48213 передан в доставку",
        body: "Ваш заказ передан курьеру. Отслеживать его можно в личном кабинете в приложении. Оплата уже получена, ничего вводить не нужно.",
        isPhishing: false, hints: ["Официальный домен", "Нет запроса данных или оплаты", "Отслеживание через приложение, а не ссылку"]
    }
];

const THREATS = [
    { src: "Аноним в игровом чате", meta: "Новый аккаунт, после проигрыша в матче", text: "Сейчас узнаешь, кто я. Скину твой адрес всем, ты же из Москвы, да? 😂", real: false,
      why: "Названо только то, что ты мог рассказать сам. Нет деталей, срока и требований.", sig: ["Только город, без улицы и дома", "Угроза общая, без конкретного действия", "Эмоции вместо фактов"] },
    { src: "Личное сообщение", meta: "Аккаунт создан вчера", text: "Ул. Липовая, 14, кв. 52, третий подъезд. Серая Kia во дворе твоя, да? Удали пост до вечера, иначе адрес и фото подъезда окажутся в паблике.", real: true,
      why: "Здесь точные детали, которые не берутся из случайной публикации: квартира, подъезд, машина. Названы действие и срок.", sig: ["Точный адрес и квартира", "Фото подъезда как «доказательство»", "Конкретный срок и требование"] },
    { src: "Письмо на почту", meta: "Незнакомый адрес", text: "Я взломал твой компьютер. Твой пароль: qwerty2019. У меня есть записи с камеры. Переведи 0,01 BTC за 48 часов или разошлю всем контактам.", real: false,
      why: "Старые пароли берут из публичных утечек, а «запись с камеры» нигде не показана. Это массовая схема вымогательства.", sig: ["Пароль из старой утечки — не взлом", "Нет ни одного доказательства", "Криптовалюта и дедлайн"] },
    { src: "Пользователь, с которым был спор", meta: "Знаком по сообществу, писал не раз", text: "Ещё раз напишешь, и к тебе приедут. Я уже знаю, кого вызвать. Адрес у меня есть.", real: true,
      why: "Автор знаком, конфликт свежий, а угроза называет конкретное действие: ложный вызов. Для сваттинга достаточно адреса, а его можно найти. Это повод предупредить семью и сообщить в полицию.", sig: ["Конфликт с конкретным человеком", "Названо действие: вызвать службы", "Автор говорит, что знает адрес"] },
    { src: "Общий чат сообщества", meta: "Такое же сообщение получили многие", text: "Переведи 500 ₽ на карту, иначе раскрою твои данные. У тебя 1 час.", real: false,
      why: "Одинаковый шаблон получили многие, в нём нет ни одной детали о тебе. Есть только требование денег и жёсткий срок.", sig: ["Массовая рассылка по шаблону", "Нет данных о тебе", "Давление через срок"] },
    { src: "Бывший друг", meta: "Знает тебя лично", text: "Вчера в 19:40 ты заходил в подъезд с рюкзаком. Хочешь, чтобы родители узнали про всё? Напиши мне сегодня.", real: true,
      why: "Автор описывает то, что видел вживую, значит, он бывает рядом. Есть шантаж и срок. Здесь нужна помощь взрослых.", sig: ["Личные наблюдения с точным временем", "Шантаж родителями", "Автор знаком с тобой лично"] }
];

// --- состояние уровней ---
function maxTier() { return levelInfo(loadSetting('xp', 0)).n >= TIER_UNLOCK_LV ? 2 : 1; }
function getTier() { return loadSetting('tier', 1) === 2 && maxTier() >= 2 && loadSetting('tierInstalled', false) ? 2 : 1; }

function applyTier() {
    const t = getTier();
    document.documentElement.dataset.tier = t;
    quizQuestions = t === 2 ? QUIZ_ADV : QUIZ_BASIC;
    phishingEmails = t === 2 ? PHISH_ADV : PHISH_BASIC;
    quizStarted = false; phGameStarted = false;
    const qd = document.querySelector('#page-quiz .page-desc'); if (qd) qd.textContent = QUIZ_DESC[t];
    const ht = $('heroText'); if (ht) ht.textContent = HERO_TEXT[t];
    renderTierBar();
}

function renderTierBar() {
    const t = getTier(), un = maxTier() >= 2, inst = loadSetting('tierInstalled', false);
    const b1 = document.querySelector('.tier-btn[data-tier="1"]'), b2 = document.querySelector('.tier-btn[data-tier="2"]');
    if (!b1 || !b2) return;
    b1.classList.toggle('active', t === 1); b2.classList.toggle('active', t === 2);
    b1.setAttribute('aria-pressed', t === 1); b2.setAttribute('aria-pressed', t === 2);
    b2.classList.toggle('locked', !un); b2.classList.toggle('ready', un && !inst);
    b2.setAttribute('aria-disabled', String(!un));
    b2.querySelector('i').className = 'bi ' + (!un ? 'bi-lock-fill' : 'bi-2-circle');
    const lv = LV[TIER_UNLOCK_LV - 1], need = Math.max(0, lv[1] - loadSetting('xp', 0));
    $('tierHint').textContent = !un ? `Продвинутый откроется на уровне ${TIER_UNLOCK_LV} «${lv[0]}»: осталось ${need} XP`
        : !inst ? 'Доступно обновление: нажми «Продвинутый»'
        : t === 2 ? 'Продвинутый курс: докс, сваттинг, целевой фишинг'
        : 'Базовый курс: основы безопасности';
    document.querySelectorAll('.nav-item.adv').forEach(n => n.classList.toggle('locked', t < 2));
}

function tierLockedNotice() {
    const lv = LV[TIER_UNLOCK_LV - 1], need = Math.max(0, lv[1] - loadSetting('xp', 0));
    showNotification(`Продвинутый уровень откроется на уровне ${TIER_UNLOCK_LV} «${lv[0]}». Осталось ${need} XP.`);
    const b = document.querySelector('.tier-btn[data-tier="2"]');
    if (b) { b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake'); }
}

function requestTier(n) {
    if (n === 1) { setTier(1); return; }
    if (maxTier() < 2) { tierLockedNotice(); return; }
    if (!loadSetting('tierInstalled', false)) { showUpgradeModal(); return; }
    setTier(2);
}

function setTier(n, silent) {
    if (n === 2 && !(maxTier() >= 2 && loadSetting('tierInstalled', false))) return;
    if (n === getTier()) return;
    saveSetting('tier', n);
    applyTier();
    const act = document.querySelector('.page.active'), id = act && act.id;
    if (id === 'page-threats' && n === 1) showPage('home');
    else if (id === 'page-quiz') startQuiz();
    else if (id === 'page-phishing') initPhishingGame();
    updateProgress();
    if (!silent) showNotification(n === 2 ? 'Включён продвинутый уровень' : 'Включён базовый уровень');
}

// --- предложение обновиться ---
function checkTierOffer() {
    if (maxTier() >= 2 && !loadSetting('tierOffered', false)) {
        saveSetting('tierOffered', true);
        setTimeout(showUpgradeModal, 1500);
    }
}
function showUpgradeModal() {
    const m = $('upgradeModal'); if (!m || m.classList.contains('show')) return;
    m.querySelector('.up-card').classList.remove('busy');
    m.classList.add('show');
    setTimeout(() => $('upInstall') && $('upInstall').focus(), 400);
}
function closeUpgrade(force) {
    const m = $('upgradeModal'), card = m.querySelector('.up-card');
    if (card.classList.contains('busy') && !force) return;
    m.classList.remove('show'); card.classList.remove('busy'); $('upBar').style.width = '0%';
}
function installTier() {
    const card = document.querySelector('.up-card'); if (card.classList.contains('busy')) return;
    card.classList.add('busy');
    const st = ['Загрузка модулей…', 'Новые вопросы теста…', 'Сценарии фишинга 2.0…', 'Материалы про докс и сваттинг…', 'Готово!'];
    let i = 0;
    $('upBar').style.width = '0%';
    const tick = () => {
        $('upBar').style.width = Math.round((i + 1) / st.length * 100) + '%';
        $('upStatus').textContent = st[i]; i++;
        if (i < st.length) setTimeout(tick, 560);
        else setTimeout(() => {
            saveSetting('tierInstalled', true);
            closeUpgrade(true); setTier(2, true); showPage('home'); launchConfetti();
            showBadgePopup('<i class="bi bi-stars"></i>', 'Продвинутый уровень', 'Новое — в разделе «Докс и сваттинг»');
        }, 600);
    };
    setTimeout(tick, 200);
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeUpgrade(); });
$('upgradeModal').addEventListener('click', e => { if (e.target === e.currentTarget) closeUpgrade(); });

// --- переход к шагу маршрута (с нужной вкладкой) ---
function goStep(id, tab) {
    showPage(id);
    if (tab) { const b = document.querySelector(`#page-${id} .tab-btn[onclick*="'${tab}'"]`); if (b) b.click(); }
}
function advSteps() {
    return [
        { id: 'threats', tab: 'threat-about', t: 'Узнай, что такое докс и сваттинг', d: 'Как это работает и кому грозит', done: loadSetting('seen_threats', false) },
        { id: 'threats', tab: 'threat-real', t: 'Отличи реальную угрозу от блефа', d: 'Признаки серьёзной угрозы', done: loadSetting('seen_threat_real', false) },
        { id: 'threats', tab: 'threat-plan', t: 'Выучи план действий', d: 'Что делать, если угрожают', done: loadSetting('seen_threat_plan', false) },
        { id: 'threats', tab: 'threat-sim', t: 'Пройди тренажёр угроз', d: 'Угроза или блеф: шесть сообщений', done: loadSetting('threat_sim_done', false) },
        { id: 'phishing', t: 'Разбери целевой фишинг', d: 'Письма от «директора», QR-коды, вымогательство', done: loadSetting('adv_phish_done', false) },
        { id: 'quiz', t: 'Сдай продвинутый тест', d: 'Десять вопросов повышенной сложности', done: loadSetting('adv_quiz_done', false) }
    ];
}

// --- ТРЕНАЖЁР: УГРОЗА ИЛИ БЛЕФ ---
let thIdx = 0, thScore = 0, thStarted = false, thMiss = [];
function initThreatGame() {
    if (thStarted) return;
    thStarted = true; thIdx = 0; thScore = 0; thMiss = [];
    renderThreat();
}
function renderThreat() {
    const g = $('threatGame'); if (!g) return;
    if (thIdx >= THREATS.length) {
        const pct = Math.round(thScore / THREATS.length * 100);
        addHistory('threats', `Тренажёр угроз: ${thScore}/${THREATS.length} (${pct}%)`);
        saveSetting('threat_sim_done', true);
        g.innerHTML = summaryHTML({ title: 'тренажёр угроз', correct: thScore, total: THREATS.length, items: thMiss,
            next: '<button class="btn btn-primary" onclick="thStarted=false;initThreatGame()">Играть заново</button><button class="btn btn-secondary" onclick="showPage(\'quiz\')">К продвинутому тесту</button>' });
        return;
    }
    const m = THREATS[thIdx];
    g.innerHTML = `<div class="quiz-header" style="margin-bottom:10px;color:var(--text-secondary)">Сообщение ${thIdx + 1} из ${THREATS.length}</div>
        <div class="phishing-email">
            <div class="email-header"><div class="email-meta"><h4>${esc(m.src)}</h4><p>${esc(m.meta)}</p></div></div>
            <div class="email-body"><p>«${esc(m.text)}»</p></div>
            <div class="email-actions">
                <button class="btn btn-danger" onclick="threatAnswer(true)">Серьёзная угроза</button>
                <button class="btn btn-success" onclick="threatAnswer(false)">Скорее блеф</button>
            </div>
            <div id="threatFeedback" style="display:none;margin-top:15px"></div>
        </div>`;
}
function threatAnswer(choice) {
    const m = THREATS[thIdx], ok = choice === m.real;
    if (ok) thScore++;
    else thMiss.push({ q: m.src + ': «' + m.text.slice(0, 60) + (m.text.length > 60 ? '…' : '') + '»', mine: choice ? 'серьёзная угроза' : 'блеф', right: m.real ? 'серьёзная угроза' : 'скорее блеф' });
    const f = $('threatFeedback');
    f.style.display = 'block';
    f.innerHTML = `<div class="result-box ${ok ? 'success' : 'danger'}">
        <h4>${ok ? '<i class="bi bi-check-circle"></i> Верно!' : '<i class="bi bi-x-circle"></i> Не совсем'}</h4>
        <p>${m.real ? 'Это серьёзная угроза.' : 'Это скорее блеф.'} ${esc(m.why)}</p>
        <ul>${m.sig.map(s => `<li>${esc(s)}</li>`).join('')}</ul>
        <p>В любом случае: сохрани скриншоты, не отвечай и расскажи взрослым.</p>
        <button class="btn btn-primary" style="margin-top:10px" onclick="thIdx++;renderThreat()">Далее</button>
    </div>`;
    document.querySelector('#threatGame .email-actions').style.display = 'none';
}

// --- запуск ---
applyTier();
updateProgress();
checkTierOffer();
