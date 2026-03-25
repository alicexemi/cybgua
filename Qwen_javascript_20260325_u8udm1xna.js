// ... (existing constants and variables remain unchanged)

// ============================================
// ТЕСТ ПО КИБЕРБЕЗОПАСНОСТИ (Updated to show certificate tab)
// ============================================

// ... (existing cyberQuestions array remains unchanged)

// ... (existing functions like calculateCorrectAnswers, loadQuestion, etc. remain unchanged)

function submitTest() {
    const allAnswered = userAnswers.every(answer => answer !== null);
    if (!allAnswered) {
        showNotification("Пожалуйста, ответьте на все вопросы.", "error");
        return;
    }

    const correctCount = calculateCorrectAnswers();
    const total = cyberQuestions.length;
    const percentage = Math.round((correctCount / total) * 100);

    // Determine level based on percentage
    let levelDescription, levelColor;
    if (percentage >= 90) {
        levelDescription = "Экспертный уровень";
        levelColor = "var(--neon-green)";
        addXP(100); // Bonus XP for high score
    } else if (percentage >= 75) {
        levelDescription = "Продвинутый уровень";
        levelColor = "var(--neon-blue)";
        addXP(70);
    } else if (percentage >= 60) {
        levelDescription = "Средний уровень";
        levelColor = "#f59e0b"; // Amber
        addXP(50);
    } else {
        levelDescription = "Начальный уровень";
        levelColor = "var(--neon-red)";
        addXP(30);
    }

    // Update results page
    document.getElementById("score-value").textContent = correctCount;
    document.getElementById("total-questions").textContent = total;
    document.getElementById("score-percentage").textContent = percentage;
    document.getElementById("score-level").textContent = levelDescription;

    // Show explanations
    const explanationList = document.getElementById("explanation-list");
    if (explanationList) {
        explanationList.innerHTML = ""; // Clear previous
        for (let i = 0; i < cyberQuestions.length; i++) {
            const q = cyberQuestions[i];
            const userAns = userAnswers[i];
            const isCorrect = userAns === q.correct;
            const item = document.createElement("div");
            item.className = `explanation-item ${isCorrect ? 'correct' : 'incorrect'}`;
            item.innerHTML = `
                <p><strong>Вопрос:</strong> ${q.question}</p>
                <p><strong>Ваш ответ:</strong> ${q.answers[userAns]}</p>
                <p><strong>${isCorrect ? 'Правильно!' : 'Неверно.'} Правильный ответ: ${q.answers[q.correct]}</strong></p>
                <p><strong>Категория:</strong> ${q.category}</p>
            `;
            explanationList.appendChild(item);
        }
    }

    // Update UI
    document.getElementById("cyber-test").style.display = "none";
    document.getElementById("results-page").style.display = "block";

    // Mark test as completed and unlock certificate tab
    testCompleted = true;
    addHistory(`Тест завершен (${percentage}%)`, percentage);

    // Show certificate tab button
    const certTabButton = document.querySelector('.cert-tab-btn');
    if (certTabButton) {
        certTabButton.style.display = 'block'; // Make the certificate tab visible
    }

    // Optional: Automatically switch to the certificate tab
    // switchTab('certificate'); // Uncomment if you want auto-switching
}

// ... (existing functions like restartTest, initCyberTest remain unchanged)

// ============================================
// СЕРТИФИКАТ (Updated to work with tabs)
// ============================================existing functions like saveCertificateData, loadCertificateData, clearCertificateData remain unchanged)

function generateCertificate() {
    const nameEl = document.getElementById("cert-name-input");
    const surnameEl = document.getElementById("cert-surname-input");
    const styleEl = document.querySelector(".certificate-style-option.active");
    const scoreEl = document.getElementById("score-percentage"); // Get from results
    const levelEl = document.getElementById("score-level");       // Get from results

    if (!nameEl || !surnameEl || !scoreEl || !levelEl) {
        console.error("Элементы формы сертификата не найдены.");
        return;
    }

    const name = nameEl.value.trim();
    const surname = surnameEl.value.trim();
    const fullName = `${name} ${surname}`.trim();

    if (!name || !surname) {
        showNotification("Пожалуйста, введите корректное имя и фамилию", "error");
        return;
    }

    // Get results data (assumes submitTest was called and results are on the page)
    const correctCount = calculateCorrectAnswers();
    const total = cyberQuestions.length;
    const percentage = Math.round((correctCount / total) * 100);
    let levelDescription;
    if (percentage >= 90) levelDescription = "Эксперт";
    else if (percentage >= 75) levelDescription = "Продвинутый";
    else if (percentage >= 60) levelDescription = "Средний";
    else levelDescription = "Начальный";

    const certNameEl = document.getElementById("cert-name");
    const certScoreEl = document.getElementById("cert-score");
    const certLevelEl = document.getElementById("cert-level");
    const certDateEl = document.getElementById("cert-date");
    const certPreviewEl = document.getElementById("certificate-preview");
    const certTemplateEl = document.getElementById("certificate-template");

    if (certNameEl) certNameEl.textContent = fullName;
    if (certScoreEl) certScoreEl.textContent = `${percentage}%`;
    if (certLevelEl) certLevelEl.textContent = levelDescription;
    if (certDateEl) {
        const today = new Date();
        certDateEl.textContent = today.toLocaleDateString("ru-RU", { year: "numeric", month: "long", day: "numeric" });
    }
    if (certTemplateEl && styleEl) {
        // Remove old style classes
        certTemplateEl.className = certTemplateEl.className.replace(/classic|tech|green|purple/g, "").trim();
        // Add new style class
        certTemplateEl.classList.add(styleEl.dataset.style);
    }
    if (certPreviewEl) certPreviewEl.style.display = "block";

    saveCertificateData();

    // Ensure the certificate tab is active when generated
    switchTab('certificate');
}

function downloadCertificate() {
    const certificate = document.getElementById("certificate-template");
    if (!certificate) {
        showNotification("Сертификат не найден!", "error");
        return;
    }

    const downloadBtn = document.getElementById("download-certificate");
    const originalText = downloadBtn ? downloadBtn.innerHTML : " ";
    if (typeof html2canvas === "undefined") {
        showNotification("Загрузка компонента для создания сертификата...", "info");
        const script = document.createElement("script");
        script.src = "https://html2canvas.hertzen.com/dist/html2canvas.min.js";
        script.async = true;
        script.onload = function() { downloadCertificate(); };
        script.onerror = function() {
            showNotification("Не удалось загрузить библиотеку. Проверьте подключение.", "error");
        };
        document.head.appendChild(script);
        return;
    }

    downloadBtn.innerHTML = "⏳ Обработка...";
    downloadBtn.disabled = true;

    const exportContainer = document.createElement("div");
    exportContainer.style.position = "absolute";
    exportContainer.style.left = "-9999px";
    exportContainer.style.top = "0";
    exportContainer.style.width = certificate.offsetWidth + "px";
    exportContainer.style.height = certificate.offsetHeight + "px";
    exportContainer.style.backgroundColor = "#ffffff";

    const certClone = certificate.cloneNode(true);
    certClone.style.position = "relative";
    certClone.style.margin = "0";
    certClone.style.borderRadius = "0";
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
            console.error("Ошибка при создании сертификата: ", error);
            document.body.removeChild(exportContainer);
            if (downloadBtn) {
                downloadBtn.innerHTML = originalText;
                downloadBtn.disabled = false;
            }
            showNotification("❌ Ошибка при создании сертификата. Попробуйте еще раз.", "error");
        });
    }, 100);
}

// ... (existing functions like setCertificateStyle remain unchanged)

// ============================================
// УПРАВЛЕНИЕ ВКЛАДКАМИ (New Functionality)
// ============================================

function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            switchTab(tabId);
        });
    });

    // Load saved active tab from localStorage or default to 'home'
    const savedTab = localStorage.getItem('activeTab') || 'home';
    switchTab(savedTab);
}

function switchTab(tabId) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });

    // Remove active class from all buttons
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });

    // Show the selected tab content
    const selectedContent = document.getElementById(tabId);
    if (selectedContent) {
        selectedContent.classList.add('active');
    }

    // Activate the corresponding button
    const selectedButton = document.querySelector(`.tab-button[data-tab="${tabId}"]`);
    if (selectedButton) {
        selectedButton.classList.add('active');
    }

    // Save the active tab to localStorage
    localStorage.setItem('activeTab', tabId);

    // Special handling: If switching to the certificate tab, ensure it's initialized
    if (tabId === 'certificate') {
        loadCertificateData(); // Load any saved data for the form
    }
}

// ... (existing functions like initTheme, initDashboard, initPhishingSimulator, initFileScanner remain unchanged)

// ============================================
// ИНИЦИАЛИЗАЦИЯ (Updated to call initTabs)
// ============================================
document.addEventListener("DOMContentLoaded", function() {
    initTheme();
    initTabs(); // Initialize the tab system
    initDashboard();
    updateStreak();
    initCyberTest();
    initPhishingSimulator();
    initFileScanner();

    // --- Updated Event Listeners ---
    // Removed direct hash-based navigation listeners for sections
    // Removed direct click listener for "Начать тест" button in HTML if using switchTab('game')

    // Attach event listeners to dynamically added elements or use delegation
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

    generatePassword();
});

// ... (rest of the existing code remains unchanged)