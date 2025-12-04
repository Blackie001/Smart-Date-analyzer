// ---------- Utilities ----------
function parseInputToDate(input) {
    input = (input || "").trim();
    if (!input) return null;

    const slash = input.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (slash) {
        const d = slash[1].padStart(2, "0");
        const m = slash[2].padStart(2, "0");
        const y = slash[3];
        return new Date(`${y}-${m}-${d}`);
    }

    const iso = input.match(/^\d{4}-\d{1,2}-\d{1,2}$/);
    if (iso) return new Date(input);

    const maybe = new Date(input);
    return isNaN(maybe) ? null : maybe;
}
function toLocalMidnight(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
function randomColor() { return '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6,'0'); }

// ---------- Data ----------
const funIdeas = [
    "Coincidence? Or destiny unfolding?",
    "Could this day mark the start of your legacy?",
    "Maybe that was the day heaven whispered something about you.",
    "Time flies—dreams shouldn't.",
    "Perhaps one day you'll look back and smile at this moment.",
    "Who knows? Maybe the stars aligned for you that day.",
    "Sometimes, the smallest dates hold the biggest memories.",
    "What if that day planted a seed only the future will reveal?",
    "Maybe that was the moment heaven started writing a new chapter about you.",
    "If only days could speak… what do you think this one would tell you?",
    "Perhaps that day holds answers to questions you've not yet asked.",
    "Maybe that was the moment your future began to shift, even unnoticed.",
    "The universe speaks in whispers—maybe that day was one of them."
];

const modes = {
    neon:  { bg: "#050014", text: "#39ff14", card: "#0c0026", accent: "#39ff14" },
    retro: { bg: "#fdf6e3", text: "#b58900", card: "#eee8d5", accent: "#b58900" },
    sunset:{ bg: "#ff9e80", text: "#4e2603", card: "#ffccbc", accent: "#ff6f3c" },
    frost: { bg: "#e0f7fa", text: "#004d40", card: "#b2ebf2", accent: "#00796b" },
    chaos: { bg: randomColor(), text: randomColor(), card: randomColor(), accent: randomColor() }
};

// ---------- Analyze date ----------
async function analyzeDate() {
    const raw = document.getElementById("dateInput").value;
    const resultEl = document.getElementById("result");
    const additionalEl = document.getElementById("additional");
    const historyEl = document.getElementById("history");

    resultEl.innerHTML = "";
    additionalEl.innerHTML = "";
    historyEl.innerHTML = "";

    if (!raw || raw.trim() === "") {
        resultEl.textContent = "Please enter a date first!";
        return;
    }

    const dateObj = parseInputToDate(raw);
    if (!dateObj || isNaN(dateObj)) {
        resultEl.textContent = "Invalid date format. Try: 21/03/2023 or 2023-03-21 or 07/02/2025";
        return;
    }

    // Day info
    const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    const dayIndex = dateObj.getDay();
    const dayName = days[dayIndex];
    let dayType = (dayIndex === 6) ? "Sabbath 🕊" : (dayIndex === 0 ? "Rest day 😊" : "Working day 💼");

    // Days passed (local-midnight)
    const todayMid = toLocalMidnight(new Date());
    const targetMid = toLocalMidnight(dateObj);
    const msPerDay = 24 * 60 * 60 * 1000;
    const diffDays = Math.round((todayMid - targetMid) / msPerDay);

    let timeMessage = (diffDays === 0) ? "That's today!"
        : (diffDays > 0) ? `It was <strong>${diffDays}</strong> day(s) ago.`
        : `It will be in <strong>${Math.abs(diffDays)}</strong> day(s).`;

    // random poem line
    const randomFun = funIdeas[Math.floor(Math.random() * funIdeas.length)];

    // show immediate results
    resultEl.innerHTML = `<strong>Date:</strong> ${dateObj.toDateString()}<br><strong>Day:</strong> ${dayName}<br><strong>Type:</strong> ${dayType}`;
    additionalEl.innerHTML = `${timeMessage}<br><em>${randomFun}</em>`;
    historyEl.innerHTML = `<small>Loading historical events...</small>`;

    // fetch history
    await fetchHistoricalEvents(targetMid.getDate(), targetMid.getMonth() + 1, historyEl);
}

// ---------- Wikipedia history ----------
async function fetchHistoricalEvents(day, month, containerEl) {
    const url = `https://en.wikipedia.org/api/rest_v1/feed/onthisday/events/${month}/${day}`;
    try {
        const resp = await fetch(url);
        if (!resp.ok) throw new Error("Network error");
        const data = await resp.json();
        if (!data || !data.events || data.events.length === 0) {
            containerEl.innerHTML = "<small>No historical events found for this date.</small>";
            return;
        }
        const items = data.events.slice(0,6).map(ev => {
            const year = ev.year ? `<strong>${ev.year}:</strong> ` : "";
            const text = (ev.text || (ev.pages?.[0]?.extract || "")).replace(/<\/?[^>]+(>|$)/g, "");
            return `<li style="margin-bottom:6px;">${year}${text}</li>`;
        }).join("");
        containerEl.innerHTML = `<h3>On this day in history</h3><ul style="padding-left:18px;">${items}</ul><small>Source: Wikipedia</small>`;
    } catch (err) {
        console.error("History fetch error:", err);
        containerEl.innerHTML = "<small>Could not load historical events.</small>";
    }
}

// ---------- Theme toggle (works & persists) ----------
function toggleTheme() {
    const body = document.body;
    const btn = document.getElementById("themeToggle");
    const isDark = body.classList.toggle("dark-mode");
    localStorage.setItem("dateAnalyzerTheme", isDark ? "dark" : "light");
    btn.textContent = isDark ? "Switch to Light" : "Switch to Dark";
}

// load saved theme on start
(function loadTheme() {
    const saved = localStorage.getItem("dateAnalyzerTheme");
    const btn = document.getElementById("themeToggle");
    if (saved === "dark") {
        document.body.classList.add("dark-mode");
        if (btn) btn.textContent = "Switch to Light";
    } else {
        document.body.classList.remove("dark-mode");
        if (btn) btn.textContent = "Switch to Dark";
    }
})();

// ---------- Random Mode ----------
function randomMode() {
    const names = Object.keys(modes);
    const pick = names[Math.floor(Math.random() * names.length)];
    const palette = modes[pick];

    // apply to CSS variables
    document.documentElement.style.setProperty('--bg', palette.bg);
    document.documentElement.style.setProperty('--card', palette.card);
    document.documentElement.style.setProperty('--text', palette.text);
    document.documentElement.style.setProperty('--accent', palette.accent);

    // update title & buttons accent color directly
    const mainTitle = document.getElementById("mainTitle");
    const analyzeBtn = document.getElementById("analyzeBtn");
    const themeToggle = document.getElementById("themeToggle");
    const funModeBtn = document.getElementById("funModeBtn");

    if (mainTitle) mainTitle.style.color = palette.accent;
    if (analyzeBtn) analyzeBtn.style.background = palette.accent;
    if (themeToggle) themeToggle.style.background = palette.accent;
    if (funModeBtn) funModeBtn.style.background = palette.accent;
}

// ---------- Color picker (applies accent & persists) ----------
function applyCustomColor(color) {
    const c = color || document.getElementById("colorPicker").value;
    document.documentElement.style.setProperty('--accent', c);

    // apply to visible elements
    const mainTitle = document.getElementById("mainTitle");
    const analyzeBtn = document.getElementById("analyzeBtn");
    const themeToggle = document.getElementById("themeToggle");
    const funModeBtn = document.getElementById("funModeBtn");

    if (mainTitle) mainTitle.style.color = c;
    if (analyzeBtn) analyzeBtn.style.background = c;
    if (themeToggle) themeToggle.style.background = c;
    if (funModeBtn) funModeBtn.style.background = c;

    try { localStorage.setItem("dateAnalyzerAccent", c); } catch(e) {}
}

// load saved accent
(function loadAccent() {
    try {
        const saved = localStorage.getItem("dateAnalyzerAccent");
        if (saved) {
            const picker = document.getElementById("colorPicker");
            if (picker) picker.value = saved;
            applyCustomColor(saved);
        }
    } catch(e) {}
})();

// ---------- Event wiring ----------
document.addEventListener("DOMContentLoaded", () => {
    const analyzeBtn = document.getElementById("analyzeBtn");
    const themeBtn = document.getElementById("themeToggle");
    const funBtn = document.getElementById("funModeBtn");
    const picker = document.getElementById("colorPicker");
    const input = document.getElementById("dateInput");

    if (analyzeBtn) analyzeBtn.addEventListener("click", analyzeDate);
    if (themeBtn) themeBtn.addEventListener("click", toggleTheme);
    if (funBtn) funBtn.addEventListener("click", randomMode);
    if (picker) picker.addEventListener("input", (e) => applyCustomColor(e.target.value));
    if (input) input.addEventListener("keydown", (e) => { if (e.key === "Enter") analyzeDate(); });
});
