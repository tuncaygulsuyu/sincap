import { initializeApp } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js";
import { getFirestore, doc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js";

// Firebase Bağlantı Bilgileri
const firebaseConfig = {
  apiKey: "AIzaSyCi3RVc9AvcI-1ZH9uRWBtFsmW2GuSdMvI",
  authDomain: "sincap-v2.firebaseapp.com",
  projectId: "sincap-v2",
  storageBucket: "sincap-v2.firebasestorage.app",
  messagingSenderId: "985716748362",
  appId: "1:985716748362:web:980a879cab98c40afdf6b3",
  measurementId: "G-PF628J6GDF"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const RELATIONSHIP_START = new Date("2026-08-15T00:00:00");
let currentPin = localStorage.getItem("sincap_pin") || "1508";
let enteredPinBuffer = "";
let selectedUser = null;
let currentMoodIndex = 2;

const moods = [
    { emoji: "😠", text: "Sinirli" },
    { emoji: "😢", text: "Üzgün" },
    { emoji: "😊", text: "Mutlu / Huzurlu" },
    { emoji: "😍", text: "Aşık" },
    { emoji: "⚡", text: "Enerjik Bomba Gibi" }
];

let appState = {
    todos: JSON.parse(localStorage.getItem("sincap_todos")) || [
        { text: "Birlikte kahve içmek ☕", done: false },
        { text: "Yıldönümünü kutlamak ✨", done: true }
    ],
    songs: JSON.parse(localStorage.getItem("sincap_songs")) || [
        { title: "Sen Olurdun Yine", artist: "Ajda Pekkan" },
        { title: "Beni Unutma", artist: "Sezen Aksu" }
    ],
    events: JSON.parse(localStorage.getItem("sincap_events")) || {
        "2026-08-15": [{ title: "Masalımızın Başlangıcı", desc: "İlk adımımız ❤️" }]
    },
    photos: JSON.parse(localStorage.getItem("sincap_photos")) || [
        { url: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=600&auto=format&fit=crop", caption: "Masalımızın ilk gününden...", date: "2026-08-15" }
    ],
    wheelOptions: ["Kahve İç", "Film İzle", "Yürüyüş Yap", "Tatlı Ye", "Sarılsınlar", "Masal Anlat"],
    logs: JSON.parse(localStorage.getItem("sincap_logs")) || []
};

window.addEventListener("DOMContentLoaded", () => {
    initClock();
    initNavigation();
    initWelcomeScreen();
    initPinScreen();
    initProfileScreen();
    initRelationshipTimer();
    initMemoryAndGallery();
    initQuickLinkModals();
    initDecisionWheel();
    initTodoList();
    initSongsList();
    initCalendar();
    initSettingsAndModals();
    initFirebaseSync();
});

function initClock() {
    const clockEl = document.getElementById("current-time-clock");
    setInterval(() => {
        const now = new Date();
        clockEl.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }, 1000);
}

function switchScreen(screenId) {
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    document.getElementById(screenId).classList.add("active");
}

function initWelcomeScreen() {
    document.getElementById("start-btn").addEventListener("click", () => {
        switchScreen("pin-screen");
    });
}

function initPinScreen() {
    const dots = document.querySelectorAll(".pin-dots .dot");
    const errorText = document.getElementById("pin-error");

    document.querySelectorAll(".keypad .key").forEach(btn => {
        btn.addEventListener("click", () => {
            const val = btn.getAttribute("data-val");
            if (val === "clear") enteredPinBuffer = "";
            else if (val === "del") enteredPinBuffer = enteredPinBuffer.slice(0, -1);
            else if (enteredPinBuffer.length < 4) enteredPinBuffer += val;

            updateDots(dots);

            if (enteredPinBuffer.length === 4) {
                if (enteredPinBuffer === currentPin) {
                    errorText.textContent = "";
                    switchScreen("profile-screen");
                    setDynamicGreeting();
                } else {
                    errorText.textContent = "Hatalı şifre! (Varsayılan: 1508)";
                    setTimeout(() => {
                        enteredPinBuffer = "";
                        updateDots(dots);
                        errorText.textContent = "";
                    }, 800);
                }
            }
        });
    });
}

function updateDots(dots) {
    dots.forEach((dot, index) => {
        if (index < enteredPinBuffer.length) dot.classList.add("filled");
        else dot.classList.remove("filled");
    });
}

function setDynamicGreeting() {
    const hour = new Date().getHours();
    const greetingEl = document.getElementById("dynamic-greeting");
    if (hour < 12) greetingEl.textContent = "Günaydın Sevgilim ☀️";
    else if (hour < 18) greetingEl.textContent = "Tünaydın Sevgilim 🌸";
    else greetingEl.textContent = "İyi Akşamlar Sevgilim 🌙";
}

function initProfileScreen() {
    const cards = document.querySelectorAll(".profile-card");
    const saveBtn = document.getElementById("save-profile-btn");
    const slider = document.getElementById("mood-slider");
    const emojiSpan = document.getElementById("mood-emoji");
    const textSpan = document.getElementById("mood-text");

    cards.forEach(card => {
        card.addEventListener("click", () => {
            cards.forEach(c => c.classList.remove("selected"));
            card.classList.add("selected");
            selectedUser = card.getAttribute("data-user");
            saveBtn.disabled = false;
        });
    });

    slider.addEventListener("input", (e) => {
        currentMoodIndex = parseInt(e.target.value);
        emojiSpan.textContent = moods[currentMoodIndex].emoji;
        textSpan.textContent = moods[currentMoodIndex].text;
    });

    const proceed = () => {
        if (!selectedUser) selectedUser = "Sincap";
        appState.logs.unshift({
            user: selectedUser,
            mood: moods[currentMoodIndex].text + " " + moods[currentMoodIndex].emoji,
            time: new Date().toLocaleString()
        });
        saveAndSync();
        switchScreen("main-app");
        playAutoMusic();
    };

    saveBtn.addEventListener("click", proceed);
    document.getElementById("skip-profile-btn").addEventListener("click", proceed);
}

function initNavigation() {
    document.querySelectorAll(".bottom-nav .nav-item").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".bottom-nav .nav-item").forEach(i => i.classList.remove("active"));
            document.querySelectorAll(".tab-content").forEach(t => t.classList.remove("active"));
            
            btn.classList.add("active");
            const target = btn.getAttribute("data-target");
            document.getElementById(target).classList.add("active");
        });
    });
}

function initRelationshipTimer() {
    const timerEl = document.getElementById("relationship-timer");
    setInterval(() => {
        const now = new Date();
        const diff = now - RELATIONSHIP_START;
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / 1000 / 60) % 60);
        const seconds = Math.floor((diff / 1000) % 60);

        timerEl.textContent = `${days} Gün ${hours} Saat ${minutes} Dakika ${seconds} Saniyedir Birlikteyiz`;
    }, 1000);
}

function initMemoryAndGallery() {
    renderGallery();
    updateFeaturedMemory();

    const fileInput = document.getElementById("photo-file-input");
    fileInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                const base64Str = event.target.result;
                const todayStr = new Date().toISOString().split('T')[0];
                appState.photos.unshift({ url: base64Str, caption: "Özel bir anı ✨", date: todayStr });
                saveAndSync();
                renderGallery();
                updateFeaturedMemory();
            };
            reader.readAsDataURL(file);
        }
    });

    document.getElementById("camera-capture-btn").addEventListener("click", () => {
        fileInput.click();
    });
}

function updateFeaturedMemory() {
    if (appState.photos.length > 0) {
        const latest = appState.photos[0];
        document.getElementById("featured-memory-img").src = latest.url;
        document.getElementById("featured-memory-date").textContent = latest.date || "2026-08-15";
    }
}

function renderGallery() {
    const grid = document.getElementById("gallery-grid");
    grid.innerHTML = "";
    appState.photos.forEach((photo, index) => {
        const div = document.createElement("div");
        div.className = "gallery-item";
        div.innerHTML = `<img src="${photo.url}" alt="Galeri Foto">`;
        div.addEventListener("click", () => openPhotoViewer(photo, index));
        grid.appendChild(div);
    });
}

function openPhotoViewer(photo, index) {
    const modal = document.getElementById("photo-viewer-modal");
    document.getElementById("viewer-img").src = photo.url;
    document.getElementById("viewer-caption").textContent = photo.caption;
    modal.classList.add("active");

    document.getElementById("delete-photo-btn").onclick = () => {
        appState.photos.splice(index, 1);
        saveAndSync();
        renderGallery();
        updateFeaturedMemory();
        modal.classList.remove("active");
    };

    document.getElementById("share-photo-btn").onclick = () => {
        if (navigator.share) {
            navigator.share({ title: 'Tuncay & Özge Masalı', text: photo.caption, url: photo.url }).catch(()=>{});
        } else {
            alert("Paylaşım bu tarayıcıda desteklenmiyor.");
        }
    };
}

function initQuickLinkModals() {
    document.getElementById("goto-songs-tab").addEventListener("click", () => {
        document.getElementById("songs-modal").classList.add("active");
    });
    document.getElementById("goto-todos-tab").addEventListener("click", () => {
        document.getElementById("todos-modal").classList.add("active");
    });
    document.getElementById("goto-wheel-tab").addEventListener("click", () => {
        document.getElementById("wheel-modal").classList.add("active");
    });
}

function initDecisionWheel() {
    const canvas = document.getElementById("decision-wheel");
    const ctx = canvas.getContext("2d");
    let angle = 0;
    const spinBtn = document.getElementById("spin-wheel-btn");

    function drawWheel() {
        const options = appState.wheelOptions;
        const total = options.length;
        const arc = (2 * Math.PI) / total;
        const radius = canvas.width / 2;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(radius, radius);
        ctx.rotate(angle);

        const colors = ["#f43f5e", "#fb7185", "#fda4af", "#e11d48", "#be123c", "#f43f5e"];

        options.forEach((opt, i) => {
            const startAngle = i * arc;
            const endAngle = (i + 1) * arc;

            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.arc(0, 0, radius - 4, startAngle, endAngle);
            ctx.fillStyle = colors[i % colors.length];
            ctx.fill();
            ctx.strokeStyle = "rgba(255,255,255,0.2)";
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.save();
            ctx.rotate(startAngle + arc / 2);
            ctx.fillStyle = "#fff";
            ctx.font = "bold 10px sans-serif";
            ctx.fillText(opt, radius / 2.2, 3);
            ctx.restore();
        });

        ctx.restore();
    }

    drawWheel();

    spinBtn.addEventListener("click", () => {
        if (spinBtn.disabled) return;
        spinBtn.disabled = true;

        let spinAngle = Math.random() * 1000 + 2000;
        let start = null;
        const duration = 2500;

        function animateSpin(timestamp) {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            const easeOut = 1 - Math.pow(1 - Math.min(progress / duration, 1), 3);
            
            angle = (spinAngle * easeOut * Math.PI) / 180;
            drawWheel();

            if (progress < duration) {
                requestAnimationFrame(animateSpin);
            } else {
                spinBtn.disabled = false;
                const total = appState.wheelOptions.length;
                const arc = (2 * Math.PI) / total;
                const normalizedAngle = (2 * Math.PI - (angle % (2 * Math.PI))) + Math.PI / 2;
                const winningIndex = Math.floor(normalizedAngle / arc) % total;
                alert(`🎉 Çarkın Seçimi: ${appState.wheelOptions[winningIndex]}`);
            }
        }

        requestAnimationFrame(animateSpin);
    });
}

function initTodoList() {
    const ul = document.getElementById("todos-list-ul");
    const input = document.getElementById("new-todo-input");
    const addBtn = document.getElementById("add-todo-btn");

    function renderTodos() {
        ul.innerHTML = "";
        appState.todos.forEach((todo, index) => {
            const li = document.createElement("li");
            if (todo.done) li.className = "completed";
            li.innerHTML = `<span>${todo.text}</span><button>🗑️</button>`;
            
            li.querySelector("span").addEventListener("click", () => {
                todo.done = !todo.done;
                saveAndSync();
                renderTodos();
            });

            li.querySelector("button").addEventListener("click", (e) => {
                e.stopPropagation();
                appState.todos.splice(index, 1);
                saveAndSync();
                renderTodos();
            });

            ul.appendChild(li);
        });
    }

    renderTodos();

    addBtn.addEventListener("click", () => {
        if (input.value.trim()) {
            appState.todos.push({ text: input.value.trim(), done: false });
            input.value = "";
            saveAndSync();
            renderTodos();
        }
    });
}

function initSongsList() {
    const ul = document.getElementById("songs-list-ul");
    const input = document.getElementById("new-song-input");
    const addBtn = document.getElementById("add-song-btn");

    function renderSongs() {
        ul.innerHTML = "";
        appState.songs.forEach((song, index) => {
            const li = document.createElement("li");
            li.style.cssText = "background:rgba(0,0,0,0.03); padding:8px 10px; border-radius:8px; display:flex; justify-content:space-between; align-items:center; font-size:12px;";
            li.innerHTML = `<span>🎵 <strong>${song.title}</strong> - <small>${song.artist}</small></span><button style="background:transparent; border:none; cursor:pointer;">🗑️</button>`;
            
            li.querySelector("button").addEventListener("click", () => {
                appState.songs.splice(index, 1);
                saveAndSync();
                renderSongs();
            });
            ul.appendChild(li);
        });
    }

    renderSongs();

    addBtn.addEventListener("click", () => {
        if (input.value.trim()) {
            appState.songs.push({ title: input.value.trim(), artist: "Özel Şarkı" });
            input.value = "";
            saveAndSync();
            renderSongs();
        }
    });
}

let calDate = new Date(2026, 7, 1);
let selectedDateStr = "2026-08-15";

function initCalendar() {
    renderCalendarGrid();

    document.getElementById("prev-month").addEventListener("click", () => {
        calDate.setMonth(calDate.getMonth() - 1);
        renderCalendarGrid();
    });

    document.getElementById("next-month").addEventListener("click", () => {
        calDate.setMonth(calDate.getMonth() + 1);
        renderCalendarGrid();
    });

    document.getElementById("open-add-event-modal").addEventListener("click", () => {
        document.getElementById("event-date-input").value = selectedDateStr;
        document.getElementById("event-modal").classList.add("active");
    });

    document.getElementById("save-event-btn").addEventListener("click", () => {
        const date = document.getElementById("event-date-input").value;
        const title = document.getElementById("event-title-input").value;
        const desc = document.getElementById("event-desc-input").value;

        if (date && title) {
            if (!appState.events[date]) appState.events[date] = [];
            appState.events[date].push({ title, desc });
            saveAndSync();
            renderCalendarGrid();
            renderSelectedDayEvents(date);
            document.getElementById("event-modal").classList.remove("active");
            document.getElementById("event-title-input").value = "";
            document.getElementById("event-desc-input").value = "";
        }
    });
}

function renderCalendarGrid() {
    const grid = document.getElementById("cal-days-grid");
    const monthYearEl = document.getElementById("cal-month-year");
    grid.innerHTML = "";

    const year = calDate.getFullYear();
    const month = calDate.getMonth();
    const months = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
    monthYearEl.textContent = `${months[month]} ${year}`;

    const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7;
    const totalDays = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDayIndex; i++) {
        grid.appendChild(document.createElement("div"));
    }

    for (let d = 1; d <= totalDays; d++) {
        const dayDiv = document.createElement("div");
        dayDiv.className = "cal-day";
        const mStr = String(month + 1).padStart(2, '0');
        const dStr = String(d).padStart(2, '0');
        const dateKey = `${year}-${mStr}-${dStr}`;

        dayDiv.textContent = d;
        if (appState.events[dateKey]) dayDiv.classList.add("has-event");
        if (dateKey === selectedDateStr) dayDiv.classList.add("selected");

        dayDiv.addEventListener("click", () => {
            document.querySelectorAll(".cal-day").forEach(el => el.classList.remove("selected"));
            dayDiv.classList.add("selected");
            selectedDateStr = dateKey;
            renderSelectedDayEvents(dateKey);
        });

        grid.appendChild(dayDiv);
    }

    renderSelectedDayEvents(selectedDateStr);
}

function renderSelectedDayEvents(dateKey) {
    const container = document.getElementById("selected-day-events");
    container.innerHTML = "";
    const events = appState.events[dateKey] || [];
    if (events.length === 0) {
        container.innerHTML = `<p class="timer-sub" style="font-size:11px; color:var(--text-muted);">Bu tarihte etkinlik yok.</p>`;
        return;
    }
    events.forEach(ev => {
        const div = document.createElement("div");
        div.className = "event-item-mini";
        div.innerHTML = `<strong>${ev.title}</strong><br><small>${ev.desc || ''}</small>`;
        container.appendChild(div);
    });
}

function initSettingsAndModals() {
    document.querySelectorAll(".close-modal").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".modal").forEach(m => m.classList.remove("active"));
        });
    });

    document.getElementById("open-lyrics-modal").addEventListener("click", () => {
        document.getElementById("lyrics-modal").classList.add("active");
    });

    const audio = document.getElementById("bg-audio");
    const miniPlayBtn = document.getElementById("mini-play-btn");
    let isPlaying = false;

    miniPlayBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (isPlaying) {
            audio.pause();
            miniPlayBtn.textContent = "▶️";
            isPlaying = false;
        } else {
            audio.play().catch(()=>{});
            miniPlayBtn.textContent = "⏸️";
            isPlaying = true;
        }
    });

    const darkModeToggle = document.getElementById("dark-mode-toggle");
    darkModeToggle.addEventListener("change", (e) => {
        if (e.target.checked) document.documentElement.setAttribute("data-theme", "dark");
        else document.documentElement.setAttribute("data-theme", "light");
    });

    document.getElementById("change-pin-trigger").addEventListener("click", () => {
        document.getElementById("pin-change-modal").classList.add("active");
    });

    document.getElementById("save-new-pin-btn").addEventListener("click", () => {
        const oldPin = document.getElementById("old-pin-input").value;
        const newPin = document.getElementById("new-pin-input").value;

        if (oldPin === currentPin && newPin.length === 4) {
            currentPin = newPin;
            localStorage.setItem("sincap_pin", currentPin);
            alert("Şifre başarıyla değiştirildi! 🔑");
            document.getElementById("pin-change-modal").classList.remove("active");
        } else {
            alert("Mevcut şifre yanlış veya yeni şifre 4 haneli değil!");
        }
    });

    document.getElementById("view-logs-trigger").addEventListener("click", () => {
        const container = document.getElementById("logs-list-container");
        container.innerHTML = "";
        appState.logs.forEach(log => {
            const div = document.createElement("div");
            div.className = "log-item";
            div.innerHTML = `<strong>${log.user}</strong>: ${log.mood} <br><small>${log.time}</small>`;
            container.appendChild(div);
        });
        document.getElementById("logs-modal").classList.add("active");
    });

    document.getElementById("logout-btn").addEventListener("click", () => {
        enteredPinBuffer = "";
        audio.pause();
        switchScreen("pin-screen");
    });
}

function playAutoMusic() {
    const autoMusicToggle = document.getElementById("auto-music-toggle");
    if (autoMusicToggle && autoMusicToggle.checked) {
        const audio = document.getElementById("bg-audio");
        audio.play().catch(()=>{});
    }
}

// Bellek Korumalı & Güvenli Bulut Senkronizasyonu (Firestore)
function initFirebaseSync() {
    const statusEl = document.getElementById("sync-status-text");
    const docRef = doc(db, "sincap_data", "main_state");

    // Canlı dinleyici (onSnapshot)
    onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
            const cloudData = docSnap.data();
            if (cloudData.todos) appState.todos = cloudData.todos;
            if (cloudData.songs) appState.songs = cloudData.songs;
            if (cloudData.events) appState.events = cloudData.events;
            if (cloudData.photos) appState.photos = cloudData.photos;
            if (cloudData.logs) appState.logs = cloudData.logs;

            // Arayüzü tazele
            saveToLocalStorageLocally();
            renderGallery();
            updateFeaturedMemory();
            statusEl.textContent = "🟢 Buluta Bağlı & Senkronize";
        } else {
            // İlk kez boşsa mevcut lokal veriyi buluta yaz
            saveAndSync();
        }
    }, (error) => {
        console.error("Firebase Senkronizasyon Hatası:", error);
        statusEl.textContent = "🔴 Bağlantı Hatası (Lokal Mod)";
    });
}

function saveAndSync() {
    saveToLocalStorageLocally();
    safeSyncToCloud();
}

function saveToLocalStorageLocally() {
    localStorage.setItem("sincap_todos", JSON.stringify(appState.todos));
    localStorage.setItem("sincap_songs", JSON.stringify(appState.songs));
    localStorage.setItem("sincap_events", JSON.stringify(appState.events));
    localStorage.setItem("sincap_photos", JSON.stringify(appState.photos));
    localStorage.setItem("sincap_logs", JSON.stringify(appState.logs));
}

async function safeSyncToCloud() {
    try {
        const docRef = doc(db, "sincap_data", "main_state");
        // Bellek şişmesini önlemek için sadece yapısal veriler gönderilir
        await setDoc(docRef, {
            todos: appState.todos,
            songs: appState.songs,
            events: appState.events,
            photos: appState.photos,
            logs: appState.logs,
            updatedAt: new Date().toISOString()
        });
    } catch (err) {
        console.error("Buluta veri yazılırken hata:", err);
    }
}