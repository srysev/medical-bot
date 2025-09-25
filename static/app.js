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
        treatingLabel: "Behandelt:",
        historyTitle: "Gesprächsverlauf",
        historyEmpty: "Noch keine Gespräche gespeichert",
        exportMarkdown: "Als Markdown exportieren",
        exportText: "Als Text exportieren",
        closeHistory: "Schließen",
        historyButton: "Frühere Konversationen",
        historyButtonShort: "Verlauf",
        viewButton: "Anzeigen",
        messagesCount: "Nachrichten",
        conversationFrom: "Gespräch vom",
        userLabel: "Benutzer:",
        youLabel: "Sie",
        doctorLabel: "Dr. Hausarzt",
        backButton: "← Zurück",
        noMessages: "Keine Nachrichten",
        atTime: "um",
        teamConsultation: "🔄 Medizinisches Team wird konsultiert...",
        consultationWarning: "⏳ Die Team-Konsultation kann bis zu 10 Minuten dauern. Bitte schließen Sie den Browser nicht.",
        consultationTimeout: "❌ Etwas ist schiefgelaufen. Diese Konversation ist beendet. Laden Sie die Seite neu und versuchen Sie es erneut."
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
        treatingLabel: "Лечит:",
        historyTitle: "История разговоров",
        historyEmpty: "Пока нет сохраненных разговоров",
        exportMarkdown: "Экспорт в Markdown",
        exportText: "Экспорт в текст",
        closeHistory: "Закрыть",
        historyButton: "История",
        historyButtonShort: "История",
        viewButton: "Посмотреть",
        messagesCount: "сообщений",
        conversationFrom: "Разговор от",
        userLabel: "Пользователь:",
        youLabel: "Вы",
        doctorLabel: "Доктор Хаусарцт",
        backButton: "← Назад",
        noMessages: "Нет сообщений",
        atTime: "в",
        teamConsultation: "🔄 Медицинская команда консультируется...",
        consultationWarning: "⏳ Консультация команды может занять до 10 минут. Пожалуйста, не закрывайте браузер.",
        consultationTimeout: "❌ Что-то пошло не так. Эта беседа завершена. Обновите страницу и попробуйте еще раз."
    }
};

let currentLang = 'de';
let currentUserName = null;

// Conversation storage manager
class ConversationManager {
    constructor() {
        this.storageKey = 'medical_conversations';
        this.maxConversations = 50;
    }

    getCurrentConversation() {
        const conversations = this.getAllConversations();
        if (!conversations[sessionId]) {
            conversations[sessionId] = {
                messages: [],
                startTime: new Date().toISOString(),
                userName: currentUserName || 'anonymous'
            };
            this.saveConversations(conversations);
        }
        return conversations[sessionId];
    }

    addMessage(type, text) {
        const conversations = this.getAllConversations();
        const conversation = this.getCurrentConversation();

        const message = {
            type: type, // 'user' or 'bot'
            text: text,
            timestamp: new Date().toISOString()
        };

        conversation.messages.push(message);
        conversations[sessionId] = conversation;

        this.saveConversations(conversations);
        this.cleanupOldConversations();
    }

    getAllConversations() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored) : {};
        } catch (e) {
            console.error('Error reading conversations from localStorage:', e);
            return {};
        }
    }

    saveConversations(conversations) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(conversations));
        } catch (e) {
            console.error('Error saving conversations to localStorage:', e);
        }
    }

    cleanupOldConversations() {
        const conversations = this.getAllConversations();
        const conversationIds = Object.keys(conversations);

        if (conversationIds.length > this.maxConversations) {
            // Sort by start time and keep only the most recent
            const sorted = conversationIds.sort((a, b) => {
                const timeA = conversations[a].startTime;
                const timeB = conversations[b].startTime;
                return new Date(timeB) - new Date(timeA);
            });

            // Keep only the latest maxConversations
            const toKeep = sorted.slice(0, this.maxConversations);
            const cleaned = {};

            toKeep.forEach(id => {
                cleaned[id] = conversations[id];
            });

            this.saveConversations(cleaned);
        }
    }

    exportConversation(conversationId, format = 'markdown') {
        const conversations = this.getAllConversations();
        const conversation = conversations[conversationId];

        if (!conversation) return null;

        const date = new Date(conversation.startTime).toLocaleString();
        let content = '';

        const headerTitle = currentLang === 'de' ? 'Medizinische Beratung' : 'Медицинская консультация';
        const dateLabel = currentLang === 'de' ? 'Datum:' : 'Дата:';
        const userLabel = currentLang === 'de' ? 'Benutzer:' : 'Пользователь:';

        if (format === 'markdown') {
            content = `# ${headerTitle}\n\n`;
            content += `**${dateLabel}** ${date}\n`;
            content += `**${userLabel}** ${conversation.userName}\n\n`;

            conversation.messages.forEach(msg => {
                const time = new Date(msg.timestamp).toLocaleTimeString();
                const sender = msg.type === 'user' ? translations[currentLang].youLabel : translations[currentLang].doctorLabel;
                content += `**[${time}] ${sender}:** ${msg.text}\n\n`;
            });
        } else {
            // Plain text format
            content = `${headerTitle}\n\n`;
            content += `${dateLabel} ${date}\n`;
            content += `${userLabel} ${conversation.userName}\n\n`;

            conversation.messages.forEach(msg => {
                const time = new Date(msg.timestamp).toLocaleTimeString();
                const sender = msg.type === 'user' ? translations[currentLang].youLabel : translations[currentLang].doctorLabel;
                content += `[${time}] ${sender}: ${msg.text}\n\n`;
            });
        }

        return content;
    }
}

const conversationManager = new ConversationManager();

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
    const browserLang = navigator.language.substring(0, 2);
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

    // Update history button text
    const $historyToggle = document.getElementById('historyToggle');
    const $historyTextFull = document.querySelector('.history-text-full');
    const $historyTextShort = document.querySelector('.history-text-short');
    if ($historyToggle && $historyTextFull && $historyTextShort) {
        $historyTextFull.textContent = translations[lang].historyButton;
        $historyTextShort.textContent = translations[lang].historyButtonShort;
        $historyToggle.title = translations[lang].historyTitle;
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

// Conversation history functions
function showConversationHistory() {
    const modal = document.getElementById('historyModal');
    const historyList = document.getElementById('historyList');
    const historyTitle = document.getElementById('historyTitle');
    const closeBtn = document.getElementById('closeHistoryBtn');

    // Update modal text based on current language
    historyTitle.textContent = translations[currentLang].historyTitle;
    closeBtn.textContent = translations[currentLang].closeHistory;

    // Populate conversation list
    populateConversationHistory();

    modal.style.display = 'flex';
}

function hideConversationHistory() {
    const modal = document.getElementById('historyModal');
    modal.style.display = 'none';
}

function populateConversationHistory() {
    const historyList = document.getElementById('historyList');
    const conversations = conversationManager.getAllConversations();
    const conversationIds = Object.keys(conversations);

    if (conversationIds.length === 0) {
        historyList.innerHTML = `<div class="history-empty">${translations[currentLang].historyEmpty}</div>`;
        return;
    }

    // Sort conversations by start time (newest first)
    const sorted = conversationIds.sort((a, b) => {
        const timeA = conversations[a].startTime;
        const timeB = conversations[b].startTime;
        return new Date(timeB) - new Date(timeA);
    });

    let html = '';

    sorted.forEach(conversationId => {
        const conversation = conversations[conversationId];
        const startDate = new Date(conversation.startTime);
        const dateStr = startDate.toLocaleDateString();
        const timeStr = startDate.toLocaleTimeString();
        const messageCount = conversation.messages.length;

        // Get first user message as preview
        const firstUserMessage = conversation.messages.find(msg => msg.type === 'user');
        const preview = firstUserMessage ?
            (firstUserMessage.text.length > 60 ?
                firstUserMessage.text.substring(0, 60) + '...' :
                firstUserMessage.text) :
            translations[currentLang].noMessages;

        html += `
            <div class="history-item" data-conversation-id="${conversationId}">
                <div class="history-item-header">
                    <span class="history-date">${dateStr} ${timeStr}</span>
                    <span class="history-count">${messageCount} ${translations[currentLang].messagesCount}</span>
                </div>
                <div class="history-preview">${preview}</div>
                <div class="history-actions">
                    <button onclick="viewConversation('${conversationId}')" class="history-btn">${translations[currentLang].viewButton}</button>
                    <button onclick="exportConversation('${conversationId}', 'markdown')" class="history-btn">${translations[currentLang].exportMarkdown}</button>
                    <button onclick="exportConversation('${conversationId}', 'text')" class="history-btn">${translations[currentLang].exportText}</button>
                </div>
            </div>
        `;
    });

    historyList.innerHTML = html;
}

function viewConversation(conversationId) {
    const conversations = conversationManager.getAllConversations();
    const conversation = conversations[conversationId];

    if (!conversation) return;

    const historyList = document.getElementById('historyList');
    const startDate = new Date(conversation.startTime);
    const dateStr = startDate.toLocaleDateString();
    const timeStr = startDate.toLocaleTimeString();

    let html = `
        <div class="conversation-viewer">
            <div class="conversation-header">
                <button onclick="populateConversationHistory()" class="back-btn">${translations[currentLang].backButton}</button>
                <div class="conversation-info">
                    <h4>${translations[currentLang].conversationFrom} ${dateStr} ${translations[currentLang].atTime} ${timeStr}</h4>
                    <span>${translations[currentLang].userLabel} ${conversation.userName}</span>
                </div>
            </div>
            <div class="conversation-messages">
    `;

    conversation.messages.forEach(message => {
        const msgTime = new Date(message.timestamp).toLocaleTimeString();
        const className = message.type === 'user' ? 'user-message' : 'bot-message';
        const sender = message.type === 'user' ? translations[currentLang].youLabel : translations[currentLang].doctorLabel;

        html += `
            <div class="${className}">
                <div class="message-header">
                    <span class="message-sender">${sender}</span>
                    <span class="message-time">${msgTime}</span>
                </div>
                <div class="message-content">${message.text}</div>
            </div>
        `;
    });

    html += `
            </div>
        </div>
    `;

    historyList.innerHTML = html;
}

function exportConversationToFile(conversationId, format) {
    const content = conversationManager.exportConversation(conversationId, format);
    if (!content) return;

    const conversations = conversationManager.getAllConversations();
    const conversation = conversations[conversationId];
    const startDate = new Date(conversation.startTime);
    const dateStr = startDate.toISOString().split('T')[0];

    const filename = `medical-consultation-${dateStr}-${conversationId.split(':')[2]}.${format === 'markdown' ? 'md' : 'txt'}`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// Export function wrapper for buttons
function exportConversation(conversationId, format) {
    exportConversationToFile(conversationId, format);
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
    const userName = currentUserName || 'anonymous';
    const timestamp = Date.now(); // Unique per page refresh
    return `web:${userName}:${timestamp}`;
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

    // Save message to conversation history
    conversationManager.addMessage(who, text);

    return div;
}

function setLoading(loading) {
    $send.disabled = loading || !$input.value.trim();
    $typing.classList.toggle("hidden", !loading);
}

// Auto-resize textarea function
function autoResizeTextarea() {
    $input.style.height = 'auto';
    const scrollHeight = $input.scrollHeight;
    const maxHeight = parseFloat(getComputedStyle($input).lineHeight) * 8; // 8 lines max
    $input.style.height = Math.min(scrollHeight, maxHeight) + 'px';

    // Add scrollbar if content exceeds max height
    $input.style.overflowY = scrollHeight > maxHeight ? 'auto' : 'hidden';
}

$input.addEventListener("input", () => {
    $send.disabled = !$input.value.trim();
    autoResizeTextarea();
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

        // Use new consultation API
        const formData = new FormData();
        formData.append("message", text);
        formData.append("session_id", sessionId);

        // Add user_id for personalization and memory functionality
        if (currentUserName) {
            formData.append("user_id", currentUserName);
        }

        const consultationRes = await fetch(`/api/consultation`, {
            method: "POST",
            body: formData
        });

        if (!consultationRes.ok) {
            throw new Error(`HTTP ${consultationRes.status}`);
        }

        const data = await consultationRes.json();

        // Check for team consultation code word
        if (data.status === "TEAM_CONSULTATION_STARTED") {
            console.log(`🤖 Team consultation started, run_id: ${data.run_id}`);

            // Show team consultation message
            bubble(translations[currentLang].teamConsultation, "bot");

            // Show consultation warning
            bubble(translations[currentLang].consultationWarning, "bot");

            // Start polling for results
            startConsultationPolling(data.run_id);
        } else if (data.status === "COMPLETED") {
            // Direct response (no team consultation needed)
            const responseText = data.result || "Response received.";
            bubble(responseText, "bot", { markdown: true });
            setLoading(false);
        } else {
            throw new Error(`Unexpected response status: ${data.status}`);
        }

    } catch (err) {
        console.error("Medical consultation error:", err);
        bubble(translations[currentLang].errorMessage, "bot");
        setLoading(false);
        $input.focus();
    }
});

// Polling system for team consultations
let consultationPollingInterval = null;

function startConsultationPolling(runId) {
    console.log(`📊 Starting polling for run_id: ${runId}`);

    const maxDuration = 10 * 60 * 1000; // 10 minutes max
    const pollInterval = 10 * 1000; // 10 seconds
    const startTime = Date.now();


    consultationPollingInterval = setInterval(async () => {
        try {
            // Check for timeout
            if (Date.now() - startTime > maxDuration) {
                console.log("⏱️ Polling timeout reached");
                clearInterval(consultationPollingInterval);
                
                bubble(translations[currentLang].consultationTimeout, "bot");

                setLoading(false);
                $input.focus();
                return;
            }

            // Poll for status
            const statusRes = await fetch(`/api/consultation/${runId}/status`);

            if (!statusRes.ok) {
                throw new Error(`HTTP ${statusRes.status}`);
            }

            const statusData = await statusRes.json();
            console.log(`📊 Polling status: ${statusData.status}`);

            if (statusData.status === "COMPLETED") {
                // Team consultation completed
                clearInterval(consultationPollingInterval);
                
                const resultText = statusData.result || "Team consultation completed.";
                bubble(resultText, "bot", { markdown: true });

                setLoading(false);
                $input.focus();

            } else if (statusData.status === "ERROR") {
                // Team consultation failed
                clearInterval(consultationPollingInterval);
                
                const errorText = statusData.result || "Team consultation failed.";
                bubble(errorText, "bot");

                setLoading(false);
                $input.focus();
            }
            // If status is still "RUNNING", continue polling

        } catch (err) {
            console.error("Polling error:", err);
            clearInterval(consultationPollingInterval);
            
            bubble(translations[currentLang].errorMessage, "bot");
            setLoading(false);
            $input.focus();
        }
    }, pollInterval);
}

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