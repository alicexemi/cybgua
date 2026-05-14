// Константа для получения элемента по ID
const $ = id => document.getElementById(id);

// --- Навигация ---
function showPage(pid) {
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
    if (pid === 'quiz' && !window.quizStarted) startQuiz();
    if (pid === 'ai-vs-real') initAiGame();
    if (pid === 'phishing') initPhishingGame();
    
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
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', newTheme);
    $('themeIcon').className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
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
    $('themeIcon').className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    if (loadSetting('cookiesAccepted', false)) {
        $('cookieBanner').classList.remove('show');
    }
})();

// --- ТЕСТ (QUIZ) ---
const quizQuestions = [
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

let quizStarted = false, currentQ = 0, quizAnswers = [];

function startQuiz() {
    quizStarted = true; 
    currentQ = 0; 
    quizAnswers = [];
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
    
    setTimeout(() => {
        currentQ++;
        if (currentQ < quizQuestions.length) renderQuestion();
        else showQuizResult();
    }, 1200);
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
        <div class="result-box success">
            <h2>Результат: ${correctCount}/${totalCount}</h2>
            <p style="font-size: 24px; font-weight: bold; color: var(--accent);">${percentage}%</p>
            <p>${gradeMessage}</p>
            <div style="margin-top: 20px; display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                <button class="btn btn-primary" onclick="showCertInput()">Получить сертификат</button>
                <button class="btn btn-secondary" onclick="startQuiz()">Пройти заново</button>
            </div>
        </div>
        <div id="certArea"></div>
        <div id="certOutput"></div>
    `;
    
    addHistory('quiz', `Тест: ${correctCount}/${totalCount} (${percentage}%)`);
    checkAchievements(percentage);
    if (percentage >= 80) launchConfetti(); // Теперь эта функция определена ниже
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
    ctx.font = 'bold 30px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CYBER GUARD', 400, 80);
    
    ctx.fillStyle = '#1a1a2e';
    ctx.font = 'bold 40px sans-serif';
    ctx.fillText('СЕРТИФИКАТ', 400, 140);
    
    ctx.fillStyle = '#6b7280';
    ctx.font = '18px sans-serif';
    ctx.fillText('об успешном прохождении теста по кибербезопасности', 400, 180);
    
    ctx.fillStyle = '#6c5ce7';
    ctx.font = 'bold 32px sans-serif';
    ctx.fillText(name, 400, 250);
    
    ctx.strokeStyle = '#6c5ce7';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(200, 270);
    ctx.lineTo(600, 270);
    ctx.stroke();
    
    ctx.fillStyle = '#1a1a2e';
    ctx.font = '20px sans-serif';
    ctx.fillText(`Результат: ${correctCount} из ${totalCount} правильных ответов`, 400, 320);
    
    ctx.fillStyle = '#6c5ce7';
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText(percentage + '%', 400, 370);
    
    ctx.fillStyle = '#6b7280';
    ctx.font = '14px sans-serif';
    ctx.fillText('Дата: ' + date, 400, 420);
    
    // Печать
    ctx.beginPath();
    ctx.arc(400, 490, 40, 0, Math.PI * 2);
    ctx.strokeStyle = '#6c5ce7';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = '#6c5ce7';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText('✓', 400, 500);
    
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
    const notification = document.createElement('div');
    notification.className = 'notification-popup';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed; top: 20px; right: 20px; padding: 15px 20px; 
        background-color: var(--warning); color: white; border-radius: 12px; 
        z-index: 10000; box-shadow: 0 4px 15px rgba(0,0,0,0.2); 
        font-family: 'Outfit', sans-serif; font-weight: 500;
        animation: slideUp 0.3s ease;
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
        if (notification.parentNode) notification.parentNode.removeChild(notification);
    }, 3000);
}

// --- AI VS REAL ---
const aiGames = [
    { title: "Портрет девушки", desc: "Реальное фото или ИИ?", isAI: false, img: "https://avatars.mds.yandex.net/i?id=fd746422af0d2578e8779149c789ca9321e5a262-12527616-images-thumbs&n=13", clue: "Обрати внимание на текстуру кожи и блики в глазах" },
    { title: "Пейзаж с водой", desc: "Реальное фото или генерация?", isAI: true, img: "https://avatars.mds.yandex.net/i?id=26332d7382dfd8fcbe26cc0cc69501bf919d0983-5331839-images-thumbs&n=13", clue: "Проверь отражения в воде и детали листвы" },
    { title: "Городской кадр", desc: "Фото или нейросеть?", isAI: false, img: "https://avatars.mds.yandex.net/i?id=27bfbb3e10cd4d076b3daab2325f9045d006da66-4949521-images-thumbs&n=13", clue: "Посмотри на архитектуру и тени" },
    { title: "Кот", desc: "Реальное или сгенерированное?", isAI: true, img: "https://avatars.mds.yandex.net/i?id=ba6aebf9a076850f236e434c3e54fa47682ef8bf-4577889-images-thumbs&n=13", clue: "Обрати внимание на лапы и усы" }
];

let aiIdx = 0, aiScore = 0, aiGameStarted = false;

function initAiGame() {
    if (aiGameStarted) return;
    aiGameStarted = true; 
    aiIdx = 0; 
    aiScore = 0;
    renderAiGame();
}

function renderAiGame() {
    if (aiIdx >= aiGames.length) {
        const percentage = Math.round((aiScore / aiGames.length) * 100);
        $('aiGameArea').innerHTML = `
            <div class="result-box info">
                <h3>Результат: ${aiScore}/${aiGames.length} (${percentage}%)</h3>
                <p>${percentage >= 70 ? 'Отличный глаз! Ты хорошо различаешь фейки!' : 'Практикуйся, чтобы стать лучше!'}</p>
                <button class="btn btn-primary" onclick="aiGameStarted=false; initAiGame()">Заново</button>
            </div>
        `;
        addHistory('ai-vs-real', `AI vs Real: ${aiScore}/${aiGames.length} (${percentage}%)`);
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
    clue.textContent = `💡 Подсказка: ${game.clue}`;
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
    
    $('aiGameArea').innerHTML = `
        <div class="result-box ${isCorrect ? 'success' : 'danger'}">
            <h3>${isCorrect ? '✅ Правильно!' : '❌ Неверно!'}</h3>
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
            <div class="lr-icon">${isDangerous ? '⚠️' : '✅'}</div>
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
                resultHTML = '<div class="result-box success">✅ Угроз не обнаружено. Файл безопасен.</div>';
            } else {
                resultHTML = '<div class="result-box danger">⚠️ Обнаружена потенциальная угроза: Trojan.GenericKD</div>';
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
const phishingEmails = [
    { 
        from: "support@g0ogle.com", 
        fromName: "Google Security", 
        subject: "⚠️ Ваш аккаунт будет заблокирован", 
        body: "Мы обнаружили подозрительную активность. Перейдите по ссылке и введите данные. Аккаунт будет заблокирован через 24 часа.", 
        isPhishing: true, 
        hints: ["Подозрительный домен: g0ogle.com", "Угроза блокировки", "Запрос данных"] 
    },
    { 
        from: "noreply@vk.com", 
        fromName: "ВКонтакте", 
        subject: "🎉 Новые рекомендации для вас", 
        body: "Привет! Мы подготовили для вас персональные рекомендации сообществ. Заходите в приложение.", 
        isPhishing: false, 
        hints: ["Официальный домен vk.com", "Нет запроса данных", "Нет угроз"] 
    },
    { 
        from: "prize@amazon-gift.org", 
        fromName: "Amazon Prize", 
        subject: "🎁 ВЫ ВЫИГРАЛИ iPhone 15 Pro!", 
        body: "Поздравляем! Для получения приза оплатите доставку 299₽ и укажите данные карты.", 
        isPhishing: true, 
        hints: ["Неофициальный домен", "Просят оплату и данные карты", "Слишком хорошее предложение"] 
    }
];

let phIdx = 0, phScore = 0, phGameStarted = false;

function initPhishingGame() {
    if (phGameStarted) return;
    phGameStarted = true; 
    phIdx = 0; 
    phScore = 0;
    renderPhishing();
}

function renderPhishing() {
    if (phIdx >= phishingEmails.length) {
        const percentage = Math.round((phScore / phishingEmails.length) * 100);
        $('phishingGame').innerHTML = `
            <div class="result-box info">
                <h3>Результат: ${phScore}/${phishingEmails.length} (${percentage}%)</h3>
                <p>${percentage >= 70 ? 'Отлично! Ты хорошо распознаёшь фишинг!' : 'Изучи памятку и попробуй снова!'}</p>
                <button class="btn btn-primary" onclick="phGameStarted=false; initPhishingGame()">Заново</button>
            </div>
        `;
        addHistory('phishing', `Фишинг: ${phScore}/${phishingEmails.length} (${percentage}%)`);
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
    
    const feedbackDiv = $('phishFeedback');
    feedbackDiv.style.display = 'block';
    feedbackDiv.innerHTML = `
        <div class="result-box ${isCorrect ? 'success' : 'danger'}">
            <h4>${isCorrect ? '✅ Верно!' : '❌ Ошибка!'}</h4>
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
    $(`memoTab-${tabId}`).style.display = 'block';
    
    parent.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}

function addHistory(type, description) {
    const history = loadSetting('history', []);
    history.unshift({ type, desc: description, date: new Date().toLocaleString('ru-RU') });
    saveSetting('history', history.slice(0, 50));
}

function checkAchievements(score) {
    const achievements = loadSetting('achievements', []);
    const tests = loadSetting('tests', []);
    
    if (score !== undefined) {
        tests.push(score);
        saveSetting('tests', tests);
    }
    
    const achievementList = [
        { id: 'first_test', title: 'Первый шаг', desc: 'Пройди первый тест', icon: '🎯' },
        { id: 'perfect', title: 'Перфекционист', desc: '100% в тесте', icon: '💯' },
        { id: 'good_score', title: 'Отличник', desc: '80%+ в тесте', icon: '🌟' },
        { id: 'pass_gen', title: 'Криптограф', desc: 'Сгенерируй пароль', icon: '🔐' },
        { id: 'link_check', title: 'Инспектор', desc: 'Проверь ссылку', icon: '🔗' },
        { id: 'scanner_user', title: 'Аналитик', desc: 'Просканируй файл', icon: '📁' }
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
        { id: 'first_test', title: 'Первый шаг', desc: 'Пройди первый тест', icon: '🎯' },
        { id: 'perfect', title: 'Перфекционист', desc: '100% в тесте', icon: '💯' },
        { id: 'good_score', title: 'Отличник', desc: '80%+ в тесте', icon: '🌟' },
        { id: 'pass_gen', title: 'Криптограф', desc: 'Сгенерируй пароль', icon: '🔐' },
        { id: 'link_check', title: 'Инспектор', desc: 'Проверь ссылку', icon: '🔗' },
        { id: 'scanner_user', title: 'Аналитик', desc: 'Просканируй файл', icon: '📁' }
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
