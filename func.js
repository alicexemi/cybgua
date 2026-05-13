const $ = (id) => document.getElementById(id);

const aiGames = [
  { title: "Портрет девушки", desc: "Определи: реальное фото или ИИ?", isAI: false, img: "https://i.pinimg.com/originals/32/39/c1/3239c13d65d54774fd0475459e267d37.jpg", clue: "Обрати внимание на текстуру кожи и блики в глазах" },
  { title: "Пейзаж с водой", desc: "Реальное фото или генерация?", isAI: true, img: "https://img.goodfon.ru/wallpaper/nbig/0/3e/gory-reka-volny-voda-oblaka-ii-art-tsifrovoe-iskusstvo-iskus.webp", clue: "Проверь отражения в воде и детали листвы" },
  { title: "Городской кадр", desc: "Фото или нейросеть?", isAI: false, img: "https://avatars.mds.yandex.net/i?id=ec04ce2b22adcb8c0828d6e876e2bf7dfca2d4d6-2815447-images-thumbs&n=13", clue: "Посмотри на архитектуру и тени" },
  { title: "Абстрактный портрет", desc: "Реальное или сгенерированное?", isAI: true, img: "https://avatars.mds.yandex.net/i?id=85dd2b8df60773027146717d67b44bf1208f2e2a-5352698-images-thumbs&n=13", clue: "Обрати внимание на неестественные переходы цветов" },
  { title: "Природный снимок", desc: "NASA или нейросеть?", isAI: false, img: "https://avatars.mds.yandex.net/i?id=f2c07b0e6d69104ce4c0b0fc27e8cb76f4bc7838-5205187-images-thumbs&n=13", clue: "Проверь детализацию и естественность освещения" },
  { title: "Футуристический арт", desc: "Построено или нарисовано?", isAI: true, img: "https://avatars.mds.yandex.net/i?id=51bef65f7f75a96ee125f6e8509c5f0c46bc9d96-1646378-images-thumbs&n=13", clue: "Посмотри на логичность объектов и перспективу" }
];

let aiIdx = 0, aiScore = 0;

function initAiGame() {
  aiIdx = 0;
  aiScore = 0;
  renderAiGame();
}

function renderAiGame() {
  const container = $('aiGameArea');
  if (!container) return;

  if (aiIdx >= aiGames.length) {
    const p = Math.round((aiScore / aiGames.length) * 100);
    const gradeText = p >= 70 ? 'Отличный глаз! Ты хорошо различаешь фейки!' : 'Практикуйся, чтобы стать лучше!';
    container.innerHTML = `
      <div class="result-score">Результат: ${aiScore}/${aiGames.length} (${p}%)</div>
      <div class="result-grade">${gradeText}</div>
      <button class="btn btn-next-round" onclick="initAiGame()">
        <i class="fas fa-redo"></i> Начать заново
      </button>
    `;
    if (typeof addHistory === 'function') addHistory('ai-vs-real', `AI vs Real: ${aiScore}/${aiGames.length} (${p}%)`);
    if (typeof checkAchievements === 'function') checkAchievements(p);
    return;
  }

  const g = aiGames[aiIdx];
  container.innerHTML = `
    <div class="game-header">Раунд ${aiIdx + 1} из ${aiGames.length}</div>
    <img src="${g.img}" alt="${g.title}" class="game-img">
    <h3 style="text-align:center; margin:16px 0 8px;">${g.title}</h3>
    <p style="text-align:center; color:var(--text-secondary); margin-bottom:16px;">${g.desc}</p>
    <div class="clue">💡 ${g.clue}</div>
    <div class="game-actions">
      <button class="btn btn-danger" onclick="aiAnswer(true)"><i class="fas fa-robot"></i> Это ИИ</button>
      <button class="btn btn-success" onclick="aiAnswer(false)"><i class="fas fa-camera"></i> Это реальное</button>
    </div>
  `;
}

function aiAnswer(u) {
  const g = aiGames[aiIdx];
  const ok = u === g.isAI;
  if (ok) aiScore++;
  const container = $('aiGameArea');
  container.innerHTML = `
    <div class="feedback ${ok ? 'success' : 'error'}">${ok ? '✅ Правильно!' : '❌ Неверно!'}</div>
    <p style="text-align:center; margin:16px 0;">Правильный ответ: ${g.isAI ? 'Это было сгенерировано ИИ' : 'Это было реальное изображение'}</p>
    <button class="btn btn-next-round" onclick="aiIdx++; renderAiGame()">
      <i class="fas fa-arrow-right"></i> Далее
    </button>
  `;
}

function showPage(pid) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const targetPage = $('page-' + pid);
  if (targetPage) {
    targetPage.classList.add('active');
    window.scrollTo(0, 0);
  }

  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.remove('active');
    const onclickAttr = btn.getAttribute('onclick');
    if (onclickAttr && onclickAttr.includes(`'${pid}'`)) {
      btn.classList.add('active');
    }
  });

  if (pid === 'cabinet' && typeof updateCabinet === 'function') updateCabinet();
  if (pid === 'quiz' && !window.quizStarted && typeof startQuiz === 'function') startQuiz();
  if (pid === 'ai-vs-real') initAiGame();
  if (pid === 'phishing' && typeof initPhishingGame === 'function') initPhishingGame();
}

// Запуск главной страницы после полной загрузки DOM
document.addEventListener('DOMContentLoaded', () => showPage('home'));
