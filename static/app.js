// static/app.js - Medical consultation frontend for AgentOS backend
const $messages = document.getElementById("messages");
const $form = document.getElementById("composer");
const $input = document.getElementById("input");
const $send = document.getElementById("send");
const $typing = document.getElementById("typing");

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

function bubble(text, who = "bot", { html = false } = {}) {
    const div = document.createElement("div");
    div.className = `bubble ${who}`;
    if (html) {
        // Sanitize HTML - allow only <br>, <strong>, <em>, <ul>, <li>
        const sanitized = text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\n/g, "<br>")
            .replace(/&lt;br&gt;/g, "<br>")
            .replace(/&lt;strong&gt;/g, "<strong>")
            .replace(/&lt;\/strong&gt;/g, "</strong>")
            .replace(/&lt;em&gt;/g, "<em>")
            .replace(/&lt;\/em&gt;/g, "</em>")
            .replace(/&lt;ul&gt;/g, "<ul>")
            .replace(/&lt;\/ul&gt;/g, "</ul>")
            .replace(/&lt;li&gt;/g, "<li>")
            .replace(/&lt;\/li&gt;/g, "</li>");
        div.innerHTML = sanitized;
    } else {
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
        console.log(`Sending medical consultation with session_id: ${sessionId}`);

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
        bubble(responseText, "bot", { html: true });

    } catch (err) {
        console.error("Medical consultation error:", err);
        bubble("⚠️ Verbindung zum medizinischen Team fehlgeschlagen. Bitte versuchen Sie es erneut oder wenden Sie sich bei dringenden Fällen an einen Arzt.", "bot");
    } finally {
        setLoading(false);
        $input.focus();
    }
});

// Focus input on page load
document.addEventListener("DOMContentLoaded", () => {
    $input.focus();
});

// Handle Enter key in input
$input.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        $form.dispatchEvent(new Event("submit"));
    }
});