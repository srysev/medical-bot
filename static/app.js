// static/app.js - Medical consultation frontend for AgentOS backend
const $messages = document.getElementById("messages");
const $form = document.getElementById("composer");
const $input = document.getElementById("input");
const $send = document.getElementById("send");
const $typing = document.getElementById("typing");

// Translation system
const translations = {
    de: {
        title: "Medizinische Beratung - Dr. Hausarzt",
        headerTitle: "Dr. Hausarzt",
        headerSubtitle: "Europäische Hausarztpraxis",
        welcomeMessage: `<strong>Willkommen in der Praxis von Dr. Hausarzt!</strong><br><br>
            Ich bin Ihr digitaler Hausarzt und arbeite mit einem Team von 5 Spezialisten zusammen:<br>
            • Triage-Spezialist für Dringlichkeitsbewertung<br>
            • Klinischer Diagnostiker für Symptomanalyse<br>
            • Differential-Diagnostiker für mögliche Diagnosen<br>
            • Untersuchungs-Spezialist für Testempfehlungen<br>
            • Behandlungs-Spezialist für Therapieempfehlungen<br><br>
            <strong>⚠️ Wichtiger Hinweis:</strong> Diese Anwendung dient nur zu Informationszwecken und ersetzt nicht den Besuch bei einem Arzt. Bei ernsten Beschwerden wenden Sie sich sofort an einen Arzt oder den Notdienst.<br><br>
            Beschreiben Sie bitte Ihre Symptome oder Beschwerden...`,
        inputPlaceholder: "Beschreiben Sie Ihre Symptome oder Beschwerden...",
        sendLabel: "Senden",
        errorMessage: "⚠️ Verbindung zum medizinischen Team fehlgeschlagen. Bitte versuchen Sie es erneut oder wenden Sie sich bei dringenden Fällen an einen Arzt.",
        consoleMessage: "Medizinische Beratung gesendet mit session_id",
        usernamePrompt: "Willkommen! Wie sollen wir Sie nennen?",
        usernameEditLabel: "ändern",
        usernamePlaceholder: "Ihr Name",
        usernameConfirm: "Bestätigen",
        usernameCancel: "Abbrechen",
        treatingLabel: "Behandelt:"
    },
    ru: {
        title: "Медицинская консультация - Доктор Хаусарцт",
        headerTitle: "Доктор Хаусарцт",
        headerSubtitle: "Врач общей практики",
        welcomeMessage: `<strong>Добро пожаловать в кабинет доктора Хаусарцт!</strong><br><br>
            Я ваш цифровой семейный врач и работаю с командой из 5 специалистов:<br>
            • Специалист по триажу для оценки срочности<br>
            • Клинический диагност для анализа симптомов<br>
            • Дифференциальный диагност для возможных диагнозов<br>
            • Специалист по обследованиям для рекомендаций тестов<br>
            • Специалист по лечению для терапевтических рекомендаций<br><br>
            <strong>⚠️ Важное замечание:</strong> Это приложение предназначено только для информационных целей и не заменяет визит к врачу. При серьезных жалобах немедленно обратитесь к врачу или в службу экстренной помощи.<br><br>
            Пожалуйста, опишите ваши симптомы или жалобы...`,
        inputPlaceholder: "Опишите ваши симптомы или жалобы...",
        sendLabel: "Отправить",
        errorMessage: "⚠️ Соединение с медицинской командой не удалось. Повторите попытку или обратитесь к врачу в срочных случаях.",
        consoleMessage: "Медицинская консультация отправлена с session_id",
        usernamePrompt: "Добро пожаловать! Как нам вас называть?",
        usernameEditLabel: "изменить",
        usernamePlaceholder: "Ваше имя",
        usernameConfirm: "Подтвердить",
        usernameCancel: "Отмена",
        treatingLabel: "Лечит:"
    }
};

let currentLang = 'de';
let currentUserName = null;

// Language detection and initialization
function detectLanguage() {
    // Check URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const urlLang = urlParams.get('lang');
    if (urlLang && translations[urlLang]) {
        return urlLang;
    }

    // Check localStorage
    const savedLang = localStorage.getItem('medical_app_language');
    if (savedLang && translations[savedLang]) {
        return savedLang;
    }

    // Check browser language
    const browserLang = navigator.language.substr(0, 2);
    if (translations[browserLang]) {
        return browserLang;
    }

    // Default to German
    return 'de';
}

function updateLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('medical_app_language', lang);

    // Update document title
    document.title = translations[lang].title;

    // Update header
    document.querySelector('.title').textContent = translations[lang].headerTitle;
    document.querySelector('.subtitle').textContent = translations[lang].headerSubtitle;

    // Update welcome message
    document.querySelector('.welcome-message .bubble').innerHTML = translations[lang].welcomeMessage;

    // Update input placeholder
    $input.placeholder = translations[lang].inputPlaceholder;

    // Update send button aria-label
    $send.setAttribute('aria-label', translations[lang].sendLabel);

    // Update language toggle button text
    const $langToggle = document.getElementById('langToggle');
    if ($langToggle) {
        $langToggle.textContent = lang === 'de' ? 'RU' : 'DE';
        $langToggle.title = lang === 'de' ? 'Переключить на русский' : 'Auf Deutsch wechseln';
    }

    // Update username display
    updateUsernameDisplay();

    // Update URL without reload
    const url = new URL(window.location);
    url.searchParams.set('lang', lang);
    window.history.replaceState({}, '', url);
}

function switchLanguage() {
    const newLang = currentLang === 'de' ? 'ru' : 'de';
    updateLanguage(newLang);
}

// Username management functions
function getUserName() {
    const savedName = localStorage.getItem('medical_user_name');
    return savedName ? savedName.trim() : null;
}

function setUserName(name) {
    if (name && name.trim()) {
        const trimmedName = name.trim();
        localStorage.setItem('medical_user_name', trimmedName);
        currentUserName = trimmedName;
        updateUsernameDisplay();
        updatePersonalizedWelcome();
        // Update session ID to include username
        sessionId = getSessionId();
        return true;
    }
    return false;
}

function promptForUsername() {
    const modal = document.getElementById('usernameModal');
    const input = document.getElementById('usernameInput');
    const promptText = document.getElementById('usernamePromptText');
    const confirmBtn = document.getElementById('usernameConfirm');
    const cancelBtn = document.getElementById('usernameCancel');

    if (!modal) return;

    // Update modal text based on current language
    promptText.textContent = translations[currentLang].usernamePrompt;
    input.placeholder = translations[currentLang].usernamePlaceholder;
    confirmBtn.textContent = translations[currentLang].usernameConfirm;
    cancelBtn.textContent = translations[currentLang].usernameCancel;

    modal.style.display = 'flex';
    input.focus();
}

function hideUsernameModal() {
    const modal = document.getElementById('usernameModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function confirmUsername() {
    const input = document.getElementById('usernameInput');
    const name = input.value.trim();

    if (name) {
        setUserName(name);
        hideUsernameModal();
        input.value = '';
    } else {
        input.focus();
    }
}

function editUsername() {
    const newName = prompt(
        translations[currentLang].usernamePrompt,
        currentUserName || ''
    );

    if (newName !== null) {
        if (setUserName(newName)) {
            // Success - name updated
        } else if (newName.trim() === '') {
            // User entered empty name, ask again
            editUsername();
        }
    }
}

function updateUsernameDisplay() {
    const usernameDisplay = document.getElementById('usernameDisplay');
    const usernameText = document.getElementById('usernameText');
    const editLink = document.getElementById('usernameEdit');

    if (usernameDisplay && usernameText && editLink) {
        if (currentUserName) {
            usernameText.textContent = `${translations[currentLang].treatingLabel} ${currentUserName}`;
            editLink.textContent = translations[currentLang].usernameEditLabel;
            usernameDisplay.style.display = 'block';
        } else {
            usernameDisplay.style.display = 'none';
        }
    }
}

function updatePersonalizedWelcome() {
    const welcomeBubble = document.querySelector('.welcome-message .bubble');
    if (welcomeBubble && currentUserName) {
        // Add personalized greeting to welcome message
        let welcomeMsg = translations[currentLang].welcomeMessage;
        const greeting = currentLang === 'de'
            ? `<strong>Hallo ${currentUserName}!</strong><br><br>`
            : `<strong>Здравствуйте, ${currentUserName}!</strong><br><br>`;

        welcomeMsg = welcomeMsg.replace(/^<strong>[^<]+<\/strong><br><br>/, greeting);
        welcomeBubble.innerHTML = welcomeMsg;
    }
}

function uuid() {
    if (crypto && crypto.randomUUID) return crypto.randomUUID();
    return "xxxxxx".replace(/x/g, () => ((Math.random() * 36) | 0).toString(36));
}

function getUserSessionId() {
    let id = localStorage.getItem("medical_user_session_id");
    if (!id) {
        id = uuid();
        localStorage.setItem("medical_user_session_id", id);
    }
    return id;
}

function getSessionId() {
    const userSessionId = getUserSessionId();
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD format
    const userName = currentUserName || 'anonymous';
    return `web:${userName}:${userSessionId}:${today}`;
}

let sessionId = getSessionId();

function scrollToBottom() {
    window.requestAnimationFrame(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    });
}

function bubble(text, who = "bot", { markdown = false } = {}) {
    const div = document.createElement("div");
    div.className = `bubble ${who}`;

    if (markdown && who === "bot") {
        // Use marked.js to parse markdown for bot messages
        div.innerHTML = marked.parse(text);
    } else {
        // Plain text for user messages or non-markdown content
        div.textContent = text;
    }

    $messages.appendChild(div);
    scrollToBottom();
    return div;
}

function setLoading(loading) {
    $send.disabled = loading || !$input.value.trim();
    $typing.classList.toggle("hidden", !loading);
}

$input.addEventListener("input", () => {
    $send.disabled = !$input.value.trim();
});

$form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = $input.value.trim();
    if (!text) return;

    // User message bubble
    bubble(text, "user");
    $input.value = "";
    setLoading(true);

    try {
        // Log session usage for medical consultation
        console.log(`${translations[currentLang].consoleMessage}: ${sessionId}`);

        // Use the known agent ID for Dr. Hausarzt
        const agentId = "dr.-hausarzt";

        // Make the run request to the specific agent using FormData (as required by AgentOS)
        const formData = new FormData();
        formData.append("message", text);
        formData.append("session_id", sessionId);
        formData.append("stream", "false");

        // Add user_id for personalization and memory functionality
        if (currentUserName) {
            formData.append("user_id", currentUserName);
        }

        const runRes = await fetch(`/agents/${agentId}/runs`, {
            method: "POST",
            body: formData
        });

        if (!runRes.ok) {
            throw new Error(`HTTP ${runRes.status}`);
        }

        const data = await runRes.json();
        const responseText = data?.content || data?.message || data?.response || JSON.stringify(data);
        bubble(responseText, "bot", { markdown: true });

    } catch (err) {
        console.error("Medical consultation error:", err);
        bubble(translations[currentLang].errorMessage, "bot");
    } finally {
        setLoading(false);
        $input.focus();
    }
});

// Initialize language and focus input on page load
document.addEventListener("DOMContentLoaded", () => {
    // Initialize language
    const detectedLang = detectLanguage();
    updateLanguage(detectedLang);

    // Initialize username
    currentUserName = getUserName();
    if (currentUserName) {
        updateUsernameDisplay();
        updatePersonalizedWelcome();
    } else {
        // Show username prompt for first-time users
        setTimeout(() => promptForUsername(), 500);
    }

    $input.focus();
});

// Handle Enter key in input
$input.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        $form.dispatchEvent(new Event("submit"));
    }
});

// Handle Enter key in username modal
document.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        const modal = document.getElementById('usernameModal');
        if (modal && modal.style.display !== 'none') {
            e.preventDefault();
            confirmUsername();
        }
    }
});