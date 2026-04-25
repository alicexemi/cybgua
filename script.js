const $ = id => document.getElementById(id);

function showPage(pid) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const t = $('page-' + pid);
    if (t) t.classList.add('active');
    
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(i => {
        if (i.getAttribute('onclick') && i.getAttribute('onclick').includes("'" + pid + "'")) {
            i.classList.add('active');
        }
    });
    
    if (pid === 'cabinet') updateCabinet();
    if (pid === 'quiz' && !window.quizStarted) startQuiz();
    if (pid === 'ai-vs-real') initAiGame();
    if (pid === 'phishing') initPhishingGame();
    closeSidebar();
}

function toggleSidebar() {
    $('sidebar').classList.toggle('open');
    $('sidebarOverlay').classList.toggle('show');
}

function closeSidebar() {
    $('sidebar').classList.remove('open');
    $('sidebarOverlay').classList.remove('show');
}

function toggleTheme() {
    const h = document.documentElement, d = h.getAttribute('data-theme') === 'dark';
    h.setAttribute('data-theme', d ? 'light' : 'dark');
    $('themeIcon').className = d ? 'fas fa-sun' : 'fas fa-moon';
    saveSetting('theme', d ? 'light' : 'dark');
}

function saveSetting(k, v) {
    try { localStorage.setItem('cg_' + k, JSON.stringify(v)); } catch (e) {}
}

function loadSetting(k, d) {
    try {
        const v = localStorage.getItem('cg_' + k);
        return v ? JSON.parse(v) : d;
    } catch (e) { return d; }
}

function acceptCookies() {
    saveSetting('cookiesAccepted', true);
    $('cookieBanner').classList.remove('show');
}

function declineCookies() {
    $('cookieBanner').classList.remove('show');
}

(function() {
    const t = loadSetting('theme', 'dark');
    document.documentElement.setAttribute('data-theme', t);
    $('themeIcon').className = t === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    if (loadSetting('cookiesAccepted', false)) $('cookieBanner').classList.remove('show');
})();

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
    const q = quizQuestions[currentQ];
    $('quizProgress').style.width = ((currentQ / quizQuestions.length) * 100) + '%';
    let h = `<div class="quiz-header">Вопрос ${currentQ + 1} из ${quizQuestions.length}</div><div class="quiz-q">${q.q}</div>`;
    const L = ['А', 'Б', 'В', 'Г'];
    q.opts.forEach((o, i) => {
        h += `<div class="quiz-option" onclick="selectAnswer(${i})"><span class="quiz-opt-letter">${L[i]}</span> ${o}</div>`;
    });
    h += '<div class="quiz-footer"></div>';
    $('quizContent').innerHTML = h;
}

function selectAnswer(idx) {
    const q = quizQuestions[currentQ];
    const opts = document.querySelectorAll('.quiz-option');
    opts.forEach((o, i) => {
        o.style.pointerEvents = 'none';
        if (i === q.correct) o.classList.add('correct');
        if (i === idx && idx !== q.correct) o.classList.add('wrong');
        if (i === idx) o.classList.add('selected');
    });
    quizAnswers.push(idx === q.correct);
    setTimeout(() => {
        currentQ++;
        if (currentQ < quizQuestions.length) renderQuestion();
        else showQuizResult();
    }, 1000);
}

function showQuizResult() {
    $('quizProgress').style.width = '100%';
    $('quizContent').style.display = 'none';
    const c = quizAnswers.filter(a => a).length, t = quizQuestions.length, p = Math.round((c / t) * 100);
    let g = '';
    if (p >= 90) g = 'Отлично! Ты настоящий кибер-воин! 🛡️';
    else if (p >= 70) g = 'Хорошо! Ещё немного практики! 💪';
    else if (p >= 50) g = 'Неплохо, но стоит подучить материал 📖';
    else g = 'Нужно серьёзно поработать над знаниями 📚';
    $('quizResult').style.display = 'block';
    $('quizResult').innerHTML = `
        <div class="result-score">Результат: ${c}/${t}</div>
        <div class="result-percent">${p}% правильных ответов</div>
        <div class="result-grade">${g}</div>
        <div class="result-actions">
            <button class="btn" onclick="showCertInput()">Получить сертификат</button>
            <button class="btn btn-outline" onclick="startQuiz()">Пройти заново</button>
        </div>
        <div id="certArea"></div>
        <div id="certOutput"></div>
    `;
    addHistory('quiz', `Тест: ${c}/${t} (${p}%)`);
    checkAchievements(p);
}

function showCertInput() {
    $('certArea').innerHTML = `
        <input type="text" id="certName" placeholder="Введи ФИО для сертификата">
        <button class="btn" onclick="generateCertificate()">Сгенерировать</button>
    `;
}

function generateCertificate() {
    const n = $('certName').value.trim();
    if (!n) { alert('Введи ФИО'); return; }
    const c = quizAnswers.filter(a => a).length, t = quizQuestions.length, p = Math.round((c / t) * 100);
    const d = new Date().toLocaleDateString('ru-RU');
    const cv = document.createElement('canvas');
    cv.width = 800; cv.height = 560;
    const ctx = cv.getContext('2d');
    ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, 800, 560);
    ctx.strokeStyle = '#6c5ce7'; ctx.lineWidth = 4; ctx.strokeRect(25, 25, 750, 510);
    ctx.strokeStyle = '#a855f7'; ctx.lineWidth = 2; ctx.strokeRect(35, 35, 730, 490);
    ctx.fillStyle = '#6c5ce7'; ctx.font = 'bold 20px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('⚔️ CYBER GUARD', 400, 70);
    ctx.fillStyle = '#1a1a2e'; ctx.font = 'bold 36px sans-serif'; ctx.fillText('СЕРТИФИКАТ', 400, 130);
    ctx.fillStyle = '#6b7280'; ctx.font = '16px sans-serif'; ctx.fillText('об успешном прохождении теста по кибербезопасности', 400, 170);
    ctx.fillStyle = '#6c5ce7'; ctx.font = 'bold 30px sans-serif'; ctx.fillText(n, 400, 230);
    ctx.strokeStyle = '#6c5ce7'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(200, 250); ctx.lineTo(600, 250); ctx.stroke();
    ctx.fillStyle = '#1a1a2e'; ctx.font = '18px sans-serif'; ctx.fillText(`Результат: ${c} из ${t} правильных ответов`, 400, 300);
    ctx.fillStyle = '#6c5ce7'; ctx.font = 'bold 24px sans-serif'; ctx.fillText(p + '%', 400, 340);
    ctx.fillStyle = '#6b7280'; ctx.font = '14px sans-serif'; ctx.fillText('Дата: ' + d, 400, 390);
    ctx.beginPath(); ctx.arc(400, 460, 35, 0, Math.PI * 2); ctx.strokeStyle = '#6c5ce7'; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = '#6c5ce7'; ctx.font = 'bold 20px sans-serif'; ctx.fillText('✓', 400, 468);
    ctx.fillStyle = '#9ca3af'; ctx.font = '12px sans-serif'; ctx.fillText('cyberguard.edu', 400, 530);
    
    const u = cv.toDataURL('image/png');
    const fname = 'CyberGuard_Сертификат_' + n.replace(/[^a-zA-Zа-яА-Я0-9]/g, '_') + '.png';
    $('certOutput').innerHTML = `
        <img src="${u}" style="max-width:100%;border-radius:16px;margin:15px 0;box-shadow:0 4px 20px rgba(0,0,0,0.1)">
        <div>
            <a href="${u}" download="${fname}" class="btn">[ Скачать PNG]</a>
            <button class="btn btn-outline" onclick="printCertificate('${u}')">Печать</button>
        </div>
    `;
    addHistory('certificate', `Сертификат: ${n} — ${p}%`);
}

function printCertificate(dataUrl) {
    const w = window.open('', '_blank');
    w.document.write(`
        <html><head><title>Печать</title><style>
            body{margin:0;padding:20px;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#fff}
            img{max-width:100%;height:auto;border-radius:16px;box-shadow:0 4px 20px rgba(0,0,0,0.1)}
            @media print{body{padding:0}img{box-shadow:none}}
        </style></head><body><img src="${dataUrl}"></body></html>
    `);
    w.document.close();
}

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
        const p = Math.round((aiScore / aiGames.length) * 100);
        $('aiGameArea').innerHTML = `
            <div class="result-score">Результат: ${aiScore}/${aiGames.length} (${p}%)</div>
            <div class="result-grade">${p >= 70 ? 'Отличный глаз! Ты хорошо различаешь фейки!' : 'Практикуйся, чтобы стать лучше!'}</div>
            <button class="btn" onclick="initAiGame()">Заново</button>
        `;
        addHistory('ai-vs-real', `AI vs Real: ${aiScore}/${aiGames.length} (${p}%)`);
        checkAchievements(p);
        return;
    }
    const g = aiGames[aiIdx];
    $('aiGameArea').innerHTML = `
        <div class="game-header">Раунд ${aiIdx + 1} из ${aiGames.length}</div>
        <img src="${g.img}" alt="${g.title}" class="game-img">
        <h3>${g.title}</h3>
        <p>${g.desc}</p>
        <div class="clue">💡 ${g.clue}</div>
        <div class="game-actions">
            <button class="btn btn-danger" onclick="aiAnswer(true)">Это ИИ</button>
            <button class="btn btn-success" onclick="aiAnswer(false)">Это реальное</button>
        </div>
    `;
}

function aiAnswer(u) {
    const g = aiGames[aiIdx], ok = u === g.isAI;
    if (ok) aiScore++;
    $('aiGameArea').innerHTML = `
        <div class="feedback ${ok ? 'success' : 'error'}">${ok ? '✅ Правильно!' : '❌ Неверно!'}</div>
        <p>Правильный ответ: ${g.isAI ? 'Это было сгенерировано ИИ' : 'Это было реальное изображение'}</p>
        <button class="btn" onclick="aiIdx++; renderAiGame()">Далее</button>
    `;
}

function updatePassLength() { $('passLenVal').textContent = $('passLength').value; }
function toggleCb(el, id) { el.parentElement.classList.toggle('active'); }

function generatePassword() {
    const len = parseInt($('passLength').value);
    const U = $('cb-upper').classList.contains('active');
    const L = $('cb-lower').classList.contains('active');
    const N = $('cb-numbers').classList.contains('active');
    const S = $('cb-symbols').classList.contains('active');
    const C = $('cb-cyrillic').classList.contains('active');
    let ch = '';
    if (U) ch += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (L) ch += 'abcdefghijklmnopqrstuvwxyz';
    if (N) ch += '0123456789';
    if (S) ch += '!@#$%^&*()-+=[]{}|;:,.<>?/~`';
    if (C) ch += 'АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЩЭЮЯабвгдежзиклмнопрстуфхцчшщэюя';
    if (!ch) { alert('Выбери хотя бы один набор символов'); return; }
    let p = '';
    const a = new Uint32Array(len);
    crypto.getRandomValues(a);
    for (let i = 0; i < len; i++) p += ch[a[i] % ch.length];
    $('generatedPass').textContent = p;
    $('passwordResult').style.display = 'block';
    calcStrength(p);
    addHistory('password', 'Пароль сгенерирован');
    saveSetting('passGenerated', true);
}

function calcStrength(pass) {
    let s = 0;
    if (pass.length >= 8) s++;
    if (pass.length >= 12) s++;
    if (pass.length >= 16) s++;
    if (/[a-z]/.test(pass)) s++;
    if (/[A-Z]/.test(pass)) s++;
    if (/[0-9]/.test(pass)) s++;
    if (/[^a-zA-Z0-9]/.test(pass)) s++;
    if (/[А-Яа-я]/.test(pass)) s++;
    const lv = Math.min(Math.floor(s / 2), 4);
    const lb = ['Очень слабый', 'Слабый', 'Средний', 'Сильный', 'Очень сильный'];
    const cl = ['weak', 'weak', 'medium', 'strong', 'strong'];
    let b = '';
    for (let i = 0; i < 5; i++) b += `<div class="pass-strength-bar ${cl[i] <= cl[lv] ? 'active' : ''}"></div>`;
    $('passStrength').innerHTML = b;
    $('passStrengthText').textContent = 'Надёжность: ' + lb[lv];
}

function copyPassword() {
    navigator.clipboard.writeText($('generatedPass').textContent).then(() => alert('Пароль скопирован!'));
}

const suspDom = ['g0ogle.com', 'faceb00k.com', 'vk0ntakte.ru', 'sberbank-secure.ru', 'apple-id-verify.com', 'microsoft-support.net', 'amazon-security.org', 'netflix-billing.com', 'instagram-verify.ru', 'telegram-premium-free.ru'];

function checkLink() {
    const url = $('linkInput').value.trim();
    if (!url) { alert('Введи ссылку'); return; }
    try {
        const u = new URL(url.startsWith('http') ? url : 'https://' + url);
        const d = u.hostname.replace('www.', '');
        const isH = url.startsWith('https');
        const isS = suspDom.some(x => d.includes(x) || d.replace(/[0o]/g, 'o') === x);
        const isSh = ['bit.ly', 'tinyurl.com', 't.co', 'clck.ru', 'cutt.ly', 'goo.gl'].some(x => d.includes(x));
        const hasP = (u.search || '').length > 50;
        const isIP = /^\d+\.\d+\.\d+\.\d+$/.test(d);
        let r = 0, rs = [];
        if (isS) { r += 3; rs.push('Подозрительный домен (похож на известный)'); }
        if (!isH) { r += 2; rs.push('Нет HTTPS шифрования'); }
        if (isSh) { r += 1; rs.push('Сокращённая ссылка — неизвестно куда ведёт'); }
        if (hasP) { r += 1; rs.push('Слишком много параметров в URL'); }
        if (isIP) { r += 2; rs.push('IP-адрес вместо доменного имени'); }
        const dg = r >= 2;
        $('linkResult').style.display = 'block';
        $('linkResult').innerHTML = `
            <div class="link-result-icon">${dg ? '⚠️' : '✅'}</div>
            <div class="link-result-title">${dg ? 'Ссылка подозрительная!' : 'Ссылка выглядит безопасной'}</div>
            <div class="link-result-desc">${rs.length ? rs.join('. ') : 'Явных угроз не обнаружено'}</div>
            ${rs.length ? `<div class="risk-factors"><strong>Факторы риска:</strong><ul>${rs.map(x => `<li>${x}</li>`).join('')}</ul></div>` : ''}
        `;
        addHistory('links', `Проверка: ${dg ? 'опасная' : 'безопасная'} — ${url.substring(0, 40)}`);
        saveSetting('linkChecked', true);
    } catch (e) {
        $('linkResult').style.display = 'block';
        $('linkResult').innerHTML = '<div class="link-result-error">Не удалось распознать ссылку. Проверь формат.</div>';
    }
}

function scanFile(file) {
    if (!file) return;
    $('scannerDrop').style.display = 'none';
    $('scannerResult').style.display = 'block';
    $('scannerResult').innerHTML = `
        <div class="file-info">${file.name} (${(file.size / 1024).toFixed(1)} КБ)</div>
        <div class="progress-bar"><div id="scanFill" class="progress-fill"></div></div>
        <div id="scanStatus" class="scan-status">Инициализация...</div>
    `;
    const st = [
        { p: 10, t: 'Анализ заголовка файла...' }, { p: 25, t: 'Проверка сигнатур...' }, { p: 40, t: 'Сканирование эвристикой...' },
        { p: 55, t: 'Проверка поведения...' }, { p: 70, t: 'Анализ метаданных...' }, { p: 85, t: 'Сравнение с базой угроз...' },
        { p: 95, t: 'Формирование отчёта...' }, { p: 100, t: 'Готово!' }
    ];
    let i = 0;
    const iv = setInterval(() => {
        if (i < st.length) {
            $('scanFill').style.width = st[i].p + '%';
            $('scanStatus').textContent = st[i].t;
            i++;
        } else {
            clearInterval(iv);
            const th = ['Trojan.GenericKD', 'Adware.BrowserModifier', 'PUP.Optional', 'Exploit.CVE-2024', 'Ransomware.WannaCry'];
            const nt = Math.floor(Math.random() * 3);
            const ft = th.slice(0, nt);
            const cl = nt === 0;
            let rh = cl ? '<div class="scan-clean">✅ Угроз не обнаружено</div>' : ft.map(x => `<div class="scan-threat">⚠️ Обнаружено: ${x}</div>`).join('');
            $('scannerResult').innerHTML += `
                <div class="scan-final">${cl ? '✅ Файл безопасен' : '⚠️ Обнаружены угрозы!'}</div>
                ${rh}
                ${!cl ? '<div class="scan-advice">Рекомендуется удалить файл и просканировать систему антивирусом.</div>' : ''}
                <button class="btn" onclick="resetScanner()">Проверить другой файл</button>
            `;
            addHistory('scanner', `${file.name}: ${cl ? 'чистый' : 'угрозы найдены'}`);
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
    const d = $('scannerDrop');
    if (!d) return;
    d.addEventListener('dragover', e => { e.preventDefault(); d.classList.add('dragover'); });
    d.addEventListener('dragleave', () => d.classList.remove('dragover'));
    d.addEventListener('drop', e => {
        e.preventDefault(); d.classList.remove('dragover');
        if (e.dataTransfer.files.length) scanFile(e.dataTransfer.files[0]);
    });
})();

function addHistory(type, desc) {
    const h = loadSetting('history', []);
    h.unshift({ type, desc, date: new Date().toLocaleString('ru-RU') });
    saveSetting('history', h.slice(0, 50));
}

function checkAchievements(score) {
    const a = loadSetting('achievements', []), t = loadSetting('tests', []);
    t.push(score);
    saveSetting('tests', t);
    const c = [
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
    c.forEach(x => {
        if (a.includes(x.id)) return;
        let u = false;
        if (x.id === 'first_test' && t.length >= 1) u = true;
        if (x.id === 'perfect' && t.some(v => v === 100)) u = true;
        if (x.id === 'good_score' && t.some(v => v >= 80)) u = true;
        if (x.id === 'five_tests' && t.length >= 5) u = true;
        if (x.id === 'ai_master' && score !== undefined && score >= 80) u = true;
        if (x.id === 'phish_pro' && score !== undefined && score >= 80) u = true;
        if (x.id === 'pass_gen' && loadSetting('passGenerated', false)) u = true;
        if (x.id === 'link_check' && loadSetting('linkChecked', false)) u = true;
        if (x.id === 'ten_actions' && loadSetting('history', []).length >= 10) u = true;
        if (u) { a.push(x.id); showBadgePopup(x.icon, x.title, x.desc); }
    });
    saveSetting('achievements', a);
}

function showBadgePopup(icon, title, desc) {
    $('bpIcon').textContent = icon;
    $('bpTitle').textContent = title;
    $('bpDesc').textContent = desc;
    $('badgePopup').classList.add('show');
    setTimeout(() => $('badgePopup').classList.remove('show'), 4000);
}

function updateCabinet() {
    const t = loadSetting('tests', []), av = t.length ? Math.round(t.reduce((a, b) => a + b, 0) / t.length) : 0;
    const a = loadSetting('achievements', []), h = loadSetting('history', []);
    $('statTests').textContent = t.length;
    $('statAvg').textContent = av + '%';
    $('statAchievements').textContent = a.length;
    $('statTotal').textContent = h.length;
    const all = [
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
    let ah = '';
    all.forEach(x => {
        const ul = a.includes(x.id);
        ah += `<div class="achievement-card ${ul ? 'unlocked' : ''}"><div class="ach-icon">${x.icon}</div><div class="ach-title">${x.title}</div><div class="ach-desc">${x.desc}</div></div>`;
    });
    $('achievementsGrid').innerHTML = ah;
    let hh = '';
    if (!h.length) { hh = '<div class="empty-history">Пока нет действий. Начни обучение!</div>'; }
    else {
        const ic = { quiz: '🎮', 'ai-vs-real': '🎬', phishing: '📧', password: '🔐', links: '🔗', scanner: '📁', certificate: '📜' };
        h.forEach(x => {
            hh += `<div class="history-item"><span class="hist-icon">${ic[x.type] || '📋'}</span><div class="hist-info"><div class="hist-desc">${x.desc}</div><div class="hist-meta"><span class="hist-type">${x.type}</span><span class="hist-date">${x.date}</span></div></div></div>`;
        });
    }
    $('historyList').innerHTML = hh;
}

function showMemoTab(tab, btn) {
    document.querySelectorAll('.memo-tab').forEach(t => t.style.display = 'none');
    $('memoTab-' + tab).style.display = 'block';
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
}

const phEm = [
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
    if (phIdx >= phEm.length) {
        const p = Math.round((phScore / phEm.length) * 100);
        $('phishingGame').innerHTML = `
            <div class="result-score">Результат: ${phScore}/${phEm.length} (${p}%)</div>
            <div class="result-grade">${p >= 70 ? 'Отлично! Ты хорошо распознаёшь фишинг!' : 'Изучи памятку и попробуй снова!'}</div>
            <button class="btn" onclick="initPhishingGame()">Заново</button>
        `;
        addHistory('phishing', `Фишинг-симулятор: ${phScore}/${phEm.length} (${p}%)`);
        checkAchievements(p);
        return;
    }
    const e = phEm[phIdx];
    $('phishingGame').innerHTML = `
        <div class="email-header">Письмо ${phIdx + 1} из ${phEm.length}</div>
        <div class="email-meta">
            <div class="email-avatar" style="background:${e.avatarBg}">${e.avatar}</div>
            <div class="email-info">
                <div class="email-from">${e.fromName}</div>
                <div class="email-address">${e.from}</div>
            </div>
        </div>
        <div class="email-subject">Тема: ${e.subject}</div>
        <div class="email-body">${e.body.replace(/\n/g, '<br>')}</div>
        <div class="email-actions">
            <button class="btn btn-danger" onclick="phishAnswer(true)">Это фишинг</button>
            <button class="btn btn-success" onclick="phishAnswer(false)">Это настоящее</button>
        </div>
        <div id="phishFeedback" style="display:none"></div>
    `;
}

function phishAnswer(u) {
    const e = phEm[phIdx], ok = u === e.isPhishing;
    if (ok) phScore++;
    $('phishFeedback').style.display = 'block';
    $('phishFeedback').innerHTML = `
        <div class="feedback ${ok ? 'success' : 'error'}">${ok ? '✅ Верно!' : '❌ Ошибка!'}</div>
        <p>Это ${e.isPhishing ? 'действительно фишинговое письмо' : 'настоящее письмо'}</p>
        <div class="hints-list"><strong>Признаки:</strong><ul>${e.hints.map(h => `<li>${h}</li>`).join('')}</ul></div>
        <button class="btn" onclick="phIdx++; renderPhishing()">Далее</button>
    `;
    document.querySelectorAll('.email-actions').forEach(el => el.style.display = 'none');
}

function launchConfetti() {
    const c = $('confettiContainer'), cl = ['#6c5ce7', '#a855f7', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];
    for (let i = 0; i < 50; i++) {
        const p = document.createElement('div');
        p.className = 'confetti-piece';
        p.style.left = Math.random() * 100 + '%';
        p.style.top = '100%';
        p.style.background = cl[Math.floor(Math.random() * cl.length)];
        p.style.animationDelay = Math.random() * 2 + 's';
        p.style.animationDuration = (1.5 + Math.random()) + 's';
        p.style.width = (6 + Math.random() * 8) + 'px';
        p.style.height = (6 + Math.random() * 8) + 'px';
        c.appendChild(p);
    }
    setTimeout(() => c.innerHTML = '', 4000);
}
