// Theme toggle
const themeToggle = document.getElementById('theme-toggle');
let isDarkTheme = false;

function toggleTheme() {
    isDarkTheme = !isDarkTheme;
    document.body.classList.toggle('dark-theme', isDarkTheme);
    themeToggle.textContent = isDarkTheme ? '☀️' : '🌙';
    localStorage.setItem('theme', isDarkTheme ? 'dark' : 'light');
}

if (localStorage.getItem('theme') === 'dark') {
    isDarkTheme = true;
    document.body.classList.add('dark-theme');
    themeToggle.textContent = '☀️';
} else {
    themeToggle.textContent = '🌙';
}

themeToggle.addEventListener('click', toggleTheme);

// Navigation
const navLinks = document.querySelectorAll('.nav-link');
const screens = document.querySelectorAll('.screen');

function showScreen(screenId) {
    screens.forEach(screen => {
        screen.classList.remove('active');
    });
    
    const targetScreen = document.getElementById(`${screenId}-screen`);
    if (targetScreen) {
        targetScreen.classList.add('active');
    }
}

navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const section = link.getAttribute('data-section');
        
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        
        showScreen(section);
    });
});

// Show main screen by default
document.getElementById('main-screen').classList.add('active');

// Test functionality
let currentQuestion = 0;
const questions = [
    {
        question: "Какой минимальный срок действия пароля?",
        options: ["30 дней", "60 дней", "90 дней", "120 дней"],
        correct: 2
    },
    {
        question: "Что такое фишинг?",
        options: ["Вид рыбы", "Метод кражи данных", "Тип пароля", "Программа для проверки безопасности"],
        correct: 1
    },
    {
        question: "Какой из этих паролей самый безопасный?",
        options: ["123456", "password", "MyP@ssw0rd!2026", "qwerty"],
        correct: 2
    },
    {
        question: "Что означает HTTPS?",
        options: ["Hyper Text Preprocessor", "High Tech Protection System", "HyperText Transfer Protocol Secure", "Home Tool Private Security"],
        correct: 2
    },
    {
        question: "Что делать, если получили подозрительное письмо?",
        options: ["Немедленно нажать на все ссылки", "Проигнорировать", "Переслать друзьям", "Проверить отправителя и удалить"],
        correct: 3
    }
];

let correctAnswers = 0;

document.getElementById('next-question').addEventListener('click', () => {
    const selectedAnswer = document.querySelector('input[name="answer"]:checked');
    if (!selectedAnswer) return;
    
    const answerValue = selectedAnswer.value.charCodeAt(0) - 65; // Convert A=0, B=1, etc.
    if (answerValue === questions[currentQuestion].correct) {
        correctAnswers++;
    }
    
    currentQuestion++;
    
    if (currentQuestion < questions.length) {
        document.getElementById('question-text').textContent = questions[currentQuestion].question;
        const options = document.querySelectorAll('.options label');
        options.forEach((option, index) => {
            option.innerHTML = `<input type="radio" name="answer" value="${String.fromCharCode(65 + index)}"> ${questions[currentQuestion].options[index]}`;
        });
    } else {
        document.getElementById('question-container').style.display = 'none';
        document.getElementById('result-container').style.display = 'block';
        document.getElementById('correct-count').textContent = correctAnswers;
        document.getElementById('total-count').textContent = questions.length;
    }
});

// Certificate generation
document.getElementById('generate-certificate').addEventListener('click', () => {
    const name = document.getElementById('student-name').value;
    const surname = document.getElementById('student-surname').value;
    
    if (!name || !surname) {
        alert('Пожалуйста, введите имя и фамилию');
        return;
    }
    
    // Create certificate content
    const certificateContent = `
        <div style="font-family: Arial, sans-serif; text-align: center; padding: 40px; border: 5px solid #007bff; border-radius: 20px; max-width: 600px; margin: 20px auto; background: linear-gradient(135deg, #f5f7fa, #e4edf9);">
            <h2 style="color: #007bff;">Сертификат</h2>
            <h3 style="margin: 20px 0;">о прохождении теста по кибербезопасности</h3>
            <p style="font-size: 20px; margin: 20px 0;"><strong>${name} ${surname}</strong></p>
            <p>Успешно завершил(а) тестирование по кибербезопасности</p>
            <p style="margin: 20px 0;">Правильных ответов: ${correctAnswers} из ${questions.length}</p>
            <p>Дата: ${new Date().toLocaleDateString()}</p>
            <p style="margin-top: 30px; font-style: italic;">Cyber Guard</p>
        </div>
    `;
    
    // Create a temporary element to render the certificate
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = certificateContent;
    tempDiv.id = 'certificate';
    document.body.appendChild(tempDiv);
    
    // Generate PDF
    html2canvas(tempDiv).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 210; // A4 width in mm
        const pageHeight = 297; // A4 height in mm
        const imgHeight = canvas.height * imgWidth / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;
        
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        
        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }
        
        pdf.save(`Cyber_Guard_Certificate_${name}_${surname}.pdf`);
        
        // Remove temporary element
        document.body.removeChild(tempDiv);
    });
});

// Password generator
document.getElementById('generate-new').addEventListener('click', generatePassword);
document.getElementById('copy-password').addEventListener('click', copyPassword);

function generatePassword() {
    const includeLatin = document.getElementById('include-latin').checked;
    const includeCyrillic = document.getElementById('include-cyrillic').checked;
    const includeNumbers = document.getElementById('include-numbers').checked;
    const includeSymbols = document.getElementById('include-symbols').checked;
    const length = parseInt(document.getElementById('password-length').value);
    
    let chars = '';
    if (includeLatin) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    if (includeCyrillic) chars += 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдеёжзийклмнопрстуфхцчшщъыьэюя';
    if (includeNumbers) chars += '0123456789';
    if (includeSymbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    if (chars === '') {
        alert('Выберите хотя бы один тип символов');
        return;
    }
    
    let password = '';
    for (let i = 0; i < length; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    document.getElementById('generated-password').value = password;
}

function copyPassword() {
    const passwordInput = document.getElementById('generated-password');
    passwordInput.select();
    document.execCommand('copy');
    alert('Пароль скопирован!');
}

// Link checker
document.getElementById('check-link').addEventListener('click', () => {
    const link = document.getElementById('link-input').value;
    if (!link) {
        alert('Введите ссылку для проверки');
        return;
    }
    
    // Simulate checking
    setTimeout(() => {
        const resultContainer = document.getElementById('link-result');
        if (Math.random() > 0.3) { // 70% chance of being safe
            resultContainer.innerHTML = `<p style="color: green;">✓ Ссылка безопасна: ${link}</p>`;
        } else {
            resultContainer.innerHTML = `<p style="color: red;">⚠️ Опасная ссылка: ${link} содержит вредоносный контент!</p>`;
        }
    }, 1000);
});

// Email leak checker
document.getElementById('check-email').addEventListener('click', () => {
    const email = document.getElementById('email-input').value;
    if (!email) {
        alert('Введите email для проверки');
        return;
    }
    
    // Simulate checking
    setTimeout(() => {
        const resultContainer = document.getElementById('leak-result');
        if (Math.random() > 0.5) { // 50% chance of being compromised
            resultContainer.innerHTML = `<p style="color: red;">⚠️ Ваш email ${email} был найден в утечках данных!</p>`;
        } else {
            resultContainer.innerHTML = `<p style="color: green;">✓ Ваш email ${email} не найден в известных утечках данных.</p>`;
        }
    }, 1000);
});

// File scanner
document.getElementById('scan-file').addEventListener('click', () => {
    const fileInput = document.getElementById('file-input');
    if (!fileInput.files[0]) {
        alert('Выберите файл для проверки');
        return;
    }
    
    const fileName = fileInput.files[0].name;
    
    // Simulate scanning
    setTimeout(() => {
        const resultContainer = document.getElementById('scan-result');
        if (Math.random() > 0.7) { // 30% chance of being infected
            resultContainer.innerHTML = `<p style="color: red;">❌ Файл ${fileName} содержит вредоносное ПО!</p>`;
        } else {
            resultContainer.innerHTML = `<p style="color: green;">✓ Файл ${fileName} безопасен.</p>`;
        }
    }, 2000);
});

// Achievement animation
function animateAchievement(element) {
    element.style.transform = 'scale(1.1)';
    setTimeout(() => {
        element.style.transform = 'scale(1)';
    }, 300);
}

// Add event listeners to achievement items
document.querySelectorAll('.achievement-item').forEach(item => {
    item.addEventListener('click', () => {
        animateAchievement(item);
    });
});

// Cookie acceptance
function acceptCookies() {
    document.getElementById('cookie-banner').style.display = 'none';
    localStorage.setItem('cookiesAccepted', 'true');
}

if (localStorage.getItem('cookiesAccepted')) {
    document.getElementById('cookie-banner').style.display = 'none';
}