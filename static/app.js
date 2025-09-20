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
        consoleMessage: "Medizinische Beratung gesendet mit session_id"
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
        consoleMessage: "Медицинская консультация отправлена с session_id"
    }
};

let currentLang = 'de';

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

    // Update URL without reload
    const url = new URL(window.location);
    url.searchParams.set('lang', lang);
    window.history.replaceState({}, '', url);
}

function switchLanguage() {
    const newLang = currentLang === 'de' ? 'ru' : 'de';
    updateLanguage(newLang);
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
    return `web:${userSessionId}:${today}`;
}

const sessionId = getSessionId();

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

    $input.focus();
});

// Handle Enter key in input
$input.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        $form.dispatchEvent(new Event("submit"));
    }
});