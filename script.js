// Firebase hazır olduğunda bulut senkronizasyonunu başlat ve verileri anında yersele işle
window.addEventListener('firebase-ready', () => {
    const db = window.db;
    const { doc, onSnapshot } = window.firebaseModules;
    const sharedDataRef = doc(db, "sincap_data", "main_state");

    // Sayfa açılır açılmaz buluttaki güncel veriyi çek ve localStorage'a bas
    onSnapshot(sharedDataRef, (docSnap) => {
        if (docSnap.exists()) {
            const cloudData = docSnap.data();
            console.log("Buluttan canlı veri alındı:", cloudData);
            
            for (const key in cloudData) {
                if (Object.prototype.hasOwnProperty.call(cloudData, key)) {
                    const val = cloudData[key];
                    localStorage.setItem(key, typeof val === 'object' ? JSON.stringify(val) : val);
                }
            }

            // Veriler güncellendiği an arayüzü yenilemek için sayfayı bir kereye mahsus güncelleyebiliriz
            // Veya ilgili render fonksiyonlarını tetikleyelim:
            if (typeof renderGallery === "function") renderGallery();
            if (typeof renderTodayMemory === "function") renderTodayMemory();
            if (typeof renderCalendar === "function") renderCalendar();
            if (typeof renderEvents === "function") renderEvents();
            if (typeof renderSongsList === "function") renderSongsList();
            if (typeof renderTodos === "function") renderTodos();
            if (typeof renderWheelTags === "function") renderWheelTags();
            if (typeof drawWheel === "function") drawWheel();
        }
    });
});

// localStorage.setItem komutunu otomatik yakalayıp Firebase'e gönderen sihirli köprü
const originalSetItem = localStorage.setItem;
localStorage.setItem = function(key, value) {
    originalSetItem.apply(this, arguments); // Normal telefonuna/tarayıcına kaydetmeye devam etsin

    // Eğer Firebase hazırsa, veriyi anında buluta da gönder
    if (window.db && window.firebaseModules) {
        try {
            const { doc, setDoc } = window.firebaseModules;
            const sharedDataRef = doc(window.db, "sincap_data", "main_state");
            
            // Tarayıcındaki TÜM localStorage verilerini tek seferde toplayıp buluta atar
            const allAppData = {};
            for (let i = 0; i < localStorage.length; i++) {
                const k = localStorage.key(i);
                try {
                    allAppData[k] = JSON.parse(localStorage.getItem(k));
                } catch (e) {
                    allAppData[k] = localStorage.getItem(k);
                }
            }

            setDoc(sharedDataRef, allAppData, { merge: true }).catch(err => {
                console.error("Buluta otomatik senkron hatası:", err);
            });
        } catch (e) {
            console.error("JSON parse hatası", e);
        }
    }
};

document.addEventListener("DOMContentLoaded", () => {
    let CORRECT_PIN = localStorage.getItem("app_pin") || "1508";
    let autoMusicEnabled = localStorage.getItem("app_auto_music") !== "false";
    const RELATIONSHIP_START = new Date("2026-08-15T00:00:00");

    let logs = JSON.parse(localStorage.getItem("app_logs")) || [];
    let galleryPhotos = JSON.parse(localStorage.getItem("app_gallery")) || [
        { id: 1, url: "https://images.unsplash.com/photo-1518173946687-a4c8392bbd9f?w=400", date: "2026-08-15" },
        { id: 2, url: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400", date: "2026-09-01" }
    ];
    let songsList = JSON.parse(localStorage.getItem("app_songs")) || [
        { id: 1, title: "Sen Olurdun Yine", artist: "Ajda Pekkan", date: "2026-08-15" }
    ];
    let todosList = JSON.parse(localStorage.getItem("app_todos")) || [
        { id: 1, text: "Birlikte kahve içilecek ☕", done: false }
    ];
    let eventsList = JSON.parse(localStorage.getItem("app_events")) || [
        { id: 1, title: "Tanışma Yıldönümümüz", desc: "Her şeyin başladığı o tatlı gün", date: "2026-08-15" }
    ];
    let wheelOptions = JSON.parse(localStorage.getItem("app_wheel")) || ["Film İzle", "Kahve İç", "Yemek Söyle", "Yürüyüş Yap"];

    let currentProfile = null;
    let currentMood = "Mutlu / Huzurlu 😊";
    let isMusicPlaying = false;
    let musicAudio = new Audio("Ajda_Pekkan_Sen_Olurdun_Yine.mp3");
    musicAudio.loop = true;

    const screens = document.querySelectorAll(".screen");
    function switchScreen(screenId) {
        screens.forEach(s => s.classList.remove("active"));
        document.getElementById(screenId).classList.add("active");
    }

    document.getElementById("go-to-pin-btn").addEventListener("click", () => {
        switchScreen("pin-screen");
    });

    let enteredPin = "";
    const pinDots = document.querySelectorAll(".dot");

    document.querySelectorAll(".keypad .key").forEach(btn => {
        btn.addEventListener("click", () => {
            const val = btn.textContent;
            if (val === "Sil") {
                enteredPin = enteredPin.slice(0, -1);
            } else if (enteredPin.length < 4) {
                enteredPin += val;
            }
            updatePinDots();
            if (enteredPin.length === 4) {
                setTimeout(checkPin, 200);
            }
        });
    });

    function updatePinDots() {
        pinDots.forEach((dot, idx) => {
            if (idx < enteredPin.length) dot.classList.add("filled");
            else dot.classList.remove("filled");
        });
    }

    function checkPin() {
        if (enteredPin === CORRECT_PIN) {
            enteredPin = "";
            updatePinDots();
            setupGreeting();
            switchScreen("profile-screen");
        } else {
            alert("Yanlış Şifre!");
            enteredPin = "";
            updatePinDots();
        }
    }

    function setupGreeting() {
        const hour = new Date().getHours();
        let greeting = "İyi Akşamlar Sevgilim 🌙";
        if (hour >= 6 && hour < 12) greeting = "Günaydın Sevgilim ☀️";
        else if (hour >= 12 && hour < 18) greeting = "Tünaydın Sevgilim 🌸";
        document.getElementById("greeting-title").textContent = greeting;
    }

    const profileCards = document.querySelectorAll(".profile-card");
    const saveLoginBtn = document.getElementById("save-login-btn");

    profileCards.forEach(card => {
        card.addEventListener("click", () => {
            profileCards.forEach(c => c.classList.remove("selected"));
            card.classList.add("selected");
            currentProfile = card.getAttribute("data-profile");
            saveLoginBtn.removeAttribute("disabled");
        });
    });

    const moodSlider = document.getElementById("mood-slider");
    const moodText = document.getElementById("mood-text");
    const moods = ["Sinirli 😠", "Üzgün 😢", "Mutlu / Huzurlu 😊", "Aşık 😍", "Enerjik Bomba Gibi ⚡"];
    
    moodSlider.addEventListener("input", (e) => {
        currentMood = moods[e.target.value];
        moodText.textContent = currentMood;
    });

    saveLoginBtn.addEventListener("click", () => {
        if (!currentProfile) {
            alert("Lütfen Tuncay veya Özge seçimini yapın!");
            return;
        }

        const now = new Date();
        logs.unshift({
            profile: currentProfile,
            time: `${String(now.getDate()).padStart(2,'0')}.${String(now.getMonth()+1).padStart(2,'0')}.${now.getFullYear()} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`,
            mood: currentMood
        });
        localStorage.setItem("app_logs", JSON.stringify(logs));

        launchApp();
    });

    document.getElementById("skip-login-btn").addEventListener("click", () => {
        if (!currentProfile) {
            alert("Lütfen önce profilinizi (Tuncay veya Özge) seçin!");
            return;
        }
        launchApp();
    });

    function launchApp() {
        switchScreen("main-app");
        if (autoMusicEnabled) {
            startSharedMusic();
        }
        initMainApp();
    }

    function startSharedMusic() {
        isMusicPlaying = true;
        document.getElementById("play-icon-sym").textContent = "⏸";
        document.getElementById("modal-play-pause").textContent = "⏸";
        
        musicAudio.volume = 0.09;
        musicAudio.play().catch(e => console.log("Otomatik oynatma engellendi"));

        let currentVol = 0.09;
        const targetVol = 0.50;
        const stepTime = 300;
        const totalSteps = 15000 / stepTime;
        const volStep = (targetVol - currentVol) / totalSteps;

        let fadeInterval = setInterval(() => {
            if (!isMusicPlaying) {
                clearInterval(fadeInterval);
                return;
            }
            currentVol += volStep;
            if (currentVol >= targetVol) {
                currentVol = targetVol;
                musicAudio.volume = currentVol;
                clearInterval(fadeInterval);
            } else {
                musicAudio.volume = currentVol;
            }
        }, stepTime);
    }

    musicAudio.addEventListener("timeupdate", () => {
        if (musicAudio.duration) {
            const progressPercent = (musicAudio.currentTime / musicAudio.duration) * 100;
            const seekBar = document.getElementById("mini-seek-bar");
            const modalSeekBar = document.getElementById("audio-scrubber");
            if (seekBar) seekBar.value = progressPercent;
            if (modalSeekBar) modalSeekBar.value = progressPercent;

            const curMin = Math.floor(musicAudio.currentTime / 60);
            const curSec = Math.floor(musicAudio.currentTime % 60);
            document.getElementById("current-time-lbl").textContent = `${curMin}:${curSec < 10 ? '0' : ''}${curSec}`;
        }
    });

    const miniSeekBar = document.getElementById("mini-seek-bar");
    if (miniSeekBar) {
        miniSeekBar.addEventListener("input", (e) => {
            if (musicAudio.duration) {
                const seekTime = (e.target.value / 100) * musicAudio.duration;
                musicAudio.currentTime = seekTime;
            }
        });
    }

    const modalSeekBar = document.getElementById("audio-scrubber");
    if (modalSeekBar) {
        modalSeekBar.addEventListener("input", (e) => {
            if (musicAudio.duration) {
                const seekTime = (e.target.value / 100) * musicAudio.duration;
                musicAudio.currentTime = seekTime;
            }
        });
    }

    function togglePlayPause() {
        if (isMusicPlaying) {
            musicAudio.pause();
            isMusicPlaying = false;
            document.getElementById("play-icon-sym").textContent = "▶";
            document.getElementById("modal-play-pause").textContent = "▶";
        } else {
            musicAudio.play();
            isMusicPlaying = true;
            document.getElementById("play-icon-sym").textContent = "⏸";
            document.getElementById("modal-play-pause").textContent = "⏸";
        }
    }

    document.getElementById("mini-play-pause").addEventListener("click", togglePlayPause);
    document.getElementById("modal-play-pause").addEventListener("click", togglePlayPause);
    document.getElementById("open-player-modal").addEventListener("click", () => document.getElementById("music-modal").classList.add("active"));
    document.getElementById("open-spotify").addEventListener("click", () => window.open("https://open.spotify.com", "_blank"));
    document.getElementById("open-ytmusic").addEventListener("click", () => window.open("https://music.youtube.com", "_blank"));
    document.getElementById("show-lyrics-btn").addEventListener("click", () => document.getElementById("lyrics-modal").classList.add("active"));

    function initMainApp() {
        updateRelationshipTimer();
        setInterval(updateRelationshipTimer, 1000);
        renderTodayMemory();
        renderGallery();
        renderCalendar();
        renderEvents();
        renderSongsList();
        renderTodos();
        renderWheelTags();
        drawWheel();
    }

    function updateRelationshipTimer() {
        const now = new Date();
        const diff = now - RELATIONSHIP_START;
        if (diff < 0) return;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / 1000 / 60) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        document.getElementById("relationship-timer-text").textContent = `${days} Gün ${hours} Saat ${minutes} Dakika ${seconds} Saniyedir Birlikteyiz ❤️`;
    }

    window.renderTodayMemory = function renderTodayMemory() {
        galleryPhotos = JSON.parse(localStorage.getItem("app_gallery")) || galleryPhotos;
        if (galleryPhotos.length > 0) {
            document.getElementById("today-memory-img").src = galleryPhotos[0].url;
            document.getElementById("today-memory-date").textContent = galleryPhotos[0].date;
        }
    };

    document.getElementById("open-today-memory").addEventListener("click", () => {
        if(galleryPhotos.length > 0) openPhotoViewer(galleryPhotos[0]);
    });

    const navItems = document.querySelectorAll(".bottom-nav .nav-item");
    navItems.forEach(item => {
        item.addEventListener("click", () => {
            navItems.forEach(i => i.classList.remove("active"));
            item.classList.add("active");
            const targetTab = item.getAttribute("data-tab");
            document.querySelectorAll(".tab-content").forEach(tc => tc.classList.remove("active"));
            document.getElementById(targetTab).classList.add("active");
        });
    });

    document.querySelectorAll(".app-card").forEach(card => {
        card.addEventListener("click", () => {
            const target = card.getAttribute("data-target-tab");
            if (target === "tab-songs") document.getElementById("songs-list-modal").classList.add("active");
            else if (target === "tab-todos") document.getElementById("todos-modal").classList.add("active");
            else if (target === "tab-wheel") document.getElementById("wheel-modal").classList.add("active");
        });
    });

    const galleryGridContainer = document.getElementById("gallery-grid-container");
    window.renderGallery = function renderGallery() {
        galleryPhotos = JSON.parse(localStorage.getItem("app_gallery")) || galleryPhotos;
        galleryGridContainer.innerHTML = "";
        galleryPhotos.forEach(photo => {
            const div = document.createElement("div");
            div.className = "gallery-thumb";
            div.innerHTML = `<img src="${photo.url}" alt="Anı">`;
            div.addEventListener("click", () => openPhotoViewer(photo));
            galleryGridContainer.appendChild(div);
        });
    };

    let activeViewerPhoto = null;
    function openPhotoViewer(photo) {
        activeViewerPhoto = photo;
        document.getElementById("viewer-img-el").src = photo.url;
        document.getElementById("viewer-date-lbl").textContent = `Yüklenme Tarihi: ${photo.date}`;
        document.getElementById("photo-viewer-modal").classList.add("active");
    }

    document.getElementById("viewer-share-btn").addEventListener("click", () => {
        if (navigator.share) navigator.share({ title: 'Anımız', url: activeViewerPhoto.url }).catch(() => {});
        else alert("Bağlantı kopyalandı!");
    });

    document.getElementById("viewer-delete-btn").addEventListener("click", () => {
        showConfirm("Bu fotoğrafı silmek istiyor musunuz?", () => {
            galleryPhotos = galleryPhotos.filter(p => p.id !== activeViewerPhoto.id);
            localStorage.setItem("app_gallery", JSON.stringify(galleryPhotos));
            document.getElementById("photo-viewer-modal").classList.remove("active");
            renderGallery();
            renderTodayMemory();
        });
    });

    document.getElementById("gallery-file-input").addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                galleryPhotos.unshift({ id: Date.now(), url: event.target.result, date: new Date().toISOString().split("T")[0] });
                localStorage.setItem("app_gallery", JSON.stringify(galleryPhotos));
                renderGallery();
                renderTodayMemory();
            };
            reader.readAsDataURL(file);
        }
    });

    document.getElementById("camera-snap-btn").addEventListener("click", () => {
        document.getElementById("camera-file-input").click();
    });

    document.getElementById("camera-file-input").addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                galleryPhotos.unshift({ id: Date.now(), url: event.target.result, date: new Date().toISOString().split("T")[0] });
                localStorage.setItem("app_gallery", JSON.stringify(galleryPhotos));
                renderGallery();
                renderTodayMemory();
            };
            reader.readAsDataURL(file);
        }
    });

    let calendarDate = new Date();
    window.renderCalendar = function renderCalendar() {
        eventsList = JSON.parse(localStorage.getItem("app_events")) || eventsList;
        const year = calendarDate.getFullYear();
        const month = calendarDate.getMonth();
        const monthNames = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
        document.getElementById("cal-month-year").textContent = `${monthNames[month]} ${year}`;

        const container = document.getElementById("cal-days-container");
        container.innerHTML = "";
        const firstDayIndex = new Date(year, month, 1).getDay() || 7;
        const totalDays = new Date(year, month + 1, 0).getDate();

        for (let i = 1; i < firstDayIndex; i++) container.appendChild(document.createElement("span"));
        const todayStr = new Date().toISOString().split("T")[0];

        for (let day = 1; day <= totalDays; day++) {
            const span = document.createElement("span");
            span.className = "cal-day";
            span.textContent = day;
            const formattedDate = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
            
            if (formattedDate === todayStr) span.classList.add("active-today");
            
            if (eventsList.some(ev => ev.date === formattedDate)) {
                span.classList.add("has-event");
            }

            span.addEventListener("click", () => {
                openEventModal(formattedDate, true);
            });

            container.appendChild(span);
        }
    };

    document.getElementById("prev-month").addEventListener("click", () => { calendarDate.setMonth(calendarDate.getMonth() - 1); renderCalendar(); });
    document.getElementById("next-month").addEventListener("click", () => { calendarDate.setMonth(calendarDate.getMonth() + 1); renderCalendar(); });

    let selectedEventDateForModal = "";
    function openEventModal(presetDate = "", isFromCalendar = false) {
        selectedEventDateForModal = presetDate || new Date().toISOString().split("T")[0];
        document.getElementById("modal-event-date").value = selectedEventDateForModal;
        document.getElementById("modal-event-name").value = "";
        document.getElementById("modal-event-desc").value = "";

        const dateGroup = document.getElementById("event-date-group");
        if (isFromCalendar) {
            dateGroup.style.display = "none";
        } else {
            dateGroup.style.display = "block";
        }

        document.getElementById("event-add-modal").classList.add("active");
    }

    document.getElementById("open-add-event-modal").addEventListener("click", () => {
        openEventModal("", false);
    });

    document.getElementById("save-new-event-btn").addEventListener("click", () => {
        const dateVal = document.getElementById("modal-event-date").value;
        const nameVal = document.getElementById("modal-event-name").value.trim();
        const descVal = document.getElementById("modal-event-desc").value.trim();

        if (!nameVal) {
            alert("Lütfen etkinlik adını girin!");
            return;
        }

        eventsList.push({
            id: Date.now(),
            title: nameVal,
            desc: descVal,
            date: dateVal || selectedEventDateForModal
        });
        localStorage.setItem("app_events", JSON.stringify(eventsList));
        renderEvents();
        renderCalendar();
        document.getElementById("event-add-modal").classList.remove("active");
    });

    window.renderEvents = function renderEvents() {
        eventsList = JSON.parse(localStorage.getItem("app_events")) || eventsList;
        const container = document.getElementById("events-list-container");
        container.innerHTML = "";
        eventsList.sort((a, b) => new Date(a.date) - new Date(b.date));
        eventsList.forEach(ev => {
            const div = document.createElement("div");
            div.className = "event-card";
            div.innerHTML = `<div><h4>${ev.title}</h4><p>${ev.desc} (${ev.date})</p></div><button class="delete-icon-btn">🗑️</button>`;
            div.querySelector(".delete-icon-btn").addEventListener("click", () => {
                showConfirm("Bu özel günü silmek istiyor musunuz?", () => {
                    eventsList = eventsList.filter(e => e.id !== ev.id);
                    localStorage.setItem("app_events", JSON.stringify(eventsList));
                    renderEvents();
                    renderCalendar();
                });
            });
            container.appendChild(div);
        });
    };

    window.renderSongsList = function renderSongsList() {
        songsList = JSON.parse(localStorage.getItem("app_songs")) || songsList;
        const container = document.getElementById("songs-list-container");
        container.innerHTML = "";
        songsList.forEach(song => {
            const div = document.createElement("div");
            div.className = "event-card";
            div.innerHTML = `<div><h4>${song.title}</h4><p>${song.artist} (${song.date})</p></div><button class="delete-icon-btn">🗑️</button>`;
            div.querySelector(".delete-icon-btn").addEventListener("click", () => {
                showConfirm("Bu şarkıyı silmek istiyor musunuz?", () => {
                    songsList = songsList.filter(s => s.id !== song.id);
                    localStorage.setItem("app_songs", JSON.stringify(songsList));
                    renderSongsList();
                });
            });
            container.appendChild(div);
        });
    };

    document.getElementById("open-add-song-modal").addEventListener("click", () => {
        document.getElementById("modal-song-title").value = "";
        document.getElementById("modal-song-artist").value = "";
        document.getElementById("song-add-modal").classList.add("active");
    });

    document.getElementById("save-new-song-btn").addEventListener("click", () => {
        const title = document.getElementById("modal-song-title").value.trim();
        const artist = document.getElementById("modal-song-artist").value.trim();

        if (!title || !artist) {
            alert("Lütfen şarkı adı ve sanatçı adını doldurun!");
            return;
        }

        songsList.unshift({
            id: Date.now(),
            title: title,
            artist: artist,
            date: new Date().toISOString().split("T")[0]
        });
        localStorage.setItem("app_songs", JSON.stringify(songsList));
        renderSongsList();
        document.getElementById("song-add-modal").classList.remove("active");
    });

    window.renderTodos = function renderTodos() {
        todosList = JSON.parse(localStorage.getItem("app_todos")) || todosList;
        const container = document.getElementById("todos-list-container");
        container.innerHTML = "";
        todosList.forEach(todo => {
            const div = document.createElement("div");
            div.className = "event-card";
            div.style.textDecoration = todo.done ? "line-through" : "none";
            div.innerHTML = `<span style="cursor:pointer; flex:1;">${todo.text}</span><button class="delete-icon-btn">🗑️</button>`;
            div.querySelector("span").addEventListener("click", () => {
                if(confirm(`"${todo.text}" yapıldı olarak işaretlensin mi?`)) {
                    todo.done = !todo.done;
                    localStorage.setItem("app_todos", JSON.stringify(todosList));
                    renderTodos();
                }
            });
            div.querySelector(".delete-icon-btn").addEventListener("click", () => {
                showConfirm("Bu görevi silmek istiyor musunuz?", () => {
                    todosList = todosList.filter(t => t.id !== todo.id);
                    localStorage.setItem("app_todos", JSON.stringify(todosList));
                    renderTodos();
                });
            });
            container.appendChild(div);
        });
    };

    document.getElementById("open-add-todo-modal").addEventListener("click", () => {
        document.getElementById("modal-todo-text").value = "";
        document.getElementById("todo-add-modal").classList.add("active");
    });

    document.getElementById("save-new-todo-btn").addEventListener("click", () => {
        const text = document.getElementById("modal-todo-text").value.trim();
        if (!text) {
            alert("Lütfen görev açıklamasını yazın!");
            return;
        }

        todosList.push({
            id: Date.now(),
            text: text,
            done: false
        });
        localStorage.setItem("app_todos", JSON.stringify(todosList));
        renderTodos();
        document.getElementById("todo-add-modal").classList.remove("active");
    });

    const canvas = document.getElementById("decision-wheel");
    const ctx = canvas.getContext("2d");
    let startAngle = 0, isSpinning = false;
    const wheelColors = ["#ff758c", "#6c5ce7", "#00cec9", "#fdcb6e", "#e17055", "#0984e3", "#fd79a8"];

    window.drawWheel = function drawWheel() {
        wheelOptions = JSON.parse(localStorage.getItem("app_wheel")) || wheelOptions;
        const arc = Math.PI / (wheelOptions.length / 2);
        const radius = canvas.width / 2;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        wheelOptions.forEach((option, i) => {
            const angle = startAngle + i * arc;
            ctx.fillStyle = wheelColors[i % wheelColors.length];
            ctx.beginPath();
            ctx.arc(radius, radius, radius, angle, angle + arc, false);
            ctx.lineTo(radius, radius);
            ctx.fill();

            ctx.save();
            ctx.fillStyle = "#fff";
            ctx.font = "bold 11px Poppins";
            ctx.translate(
                radius + Math.cos(angle + arc / 2) * (radius * 0.6),
                radius + Math.sin(angle + arc / 2) * (radius * 0.6)
            );
            ctx.rotate(angle + arc / 2 + Math.PI / 2);
            ctx.fillText(option, -ctx.measureText(option).width / 2, 0);
            ctx.restore();
        });
    };

    function spinTheWheel() {
        if (isSpinning || wheelOptions.length === 0) return;
        isSpinning = true;
        const spinAngle = Math.random() * 2000 + 3000;
        const spinTime = 2500;
        let startTime = null;

        function animateSpin(currentTime) {
            if (!startTime) startTime = currentTime;
            const elapsed = currentTime - startTime;
            if (elapsed < spinTime) {
                const progress = elapsed / spinTime;
                startAngle = (-c_easeOut(progress, 0, spinAngle, spinTime)) * (Math.PI / 180);
                drawWheel();
                requestAnimationFrame(animateSpin);
            } else {
                isSpinning = false;
                const index = Math.floor(wheelOptions.length - (startAngle % (2 * Math.PI)) / (2 * Math.PI / wheelOptions.length)) % wheelOptions.length;
                alert(`Çark Sonucu: ${wheelOptions[index]} 🎉`);
            }
        }
        requestAnimationFrame(animateSpin);
    }

    function c_easeOut(t, b, c, d) {
        t /= d;
        return -c * t*(t-2) + b;
    }

    document.getElementById("spin-wheel-btn").addEventListener("click", spinTheWheel);
    canvas.addEventListener("click", spinTheWheel);

    window.renderWheelTags = function renderWheelTags() {
        wheelOptions = JSON.parse(localStorage.getItem("app_wheel")) || wheelOptions;
        const container = document.getElementById("wheel-tags-container");
        container.innerHTML = "";
        wheelOptions.forEach((opt, idx) => {
            const badge = document.createElement("span");
            badge.className = "tag-badge";
            badge.innerHTML = `${opt} <button>&times;</button>`;
            badge.querySelector("button").addEventListener("click", () => {
                wheelOptions.splice(idx, 1);
                localStorage.setItem("app_wheel", JSON.stringify(wheelOptions));
                renderWheelTags();
                drawWheel();
            });
            container.appendChild(badge);
        });
    };

    document.getElementById("add-wheel-item-btn").addEventListener("click", () => {
        const input = document.getElementById("new-wheel-item-input");
        if (input.value.trim()) {
            wheelOptions.push(input.value.trim());
            input.value = "";
            localStorage.setItem("app_wheel", JSON.stringify(wheelOptions));
            renderWheelTags();
            drawWheel();
        }
    });

    document.getElementById("setting-change-pin").addEventListener("click", () => {
        document.getElementById("modal-current-pin").value = "";
        document.getElementById("modal-new-pin-1").value = "";
        document.getElementById("modal-new-pin-2").value = "";
        document.getElementById("pin-change-modal").classList.add("active");
    });

    document.getElementById("save-new-pin-btn").addEventListener("click", () => {
        const cur = document.getElementById("modal-current-pin").value;
        const n1 = document.getElementById("modal-new-pin-1").value;
        const n2 = document.getElementById("modal-new-pin-2").value;

        if (cur !== CORRECT_PIN) {
            alert("Mevcut şifreyi yanlış girdiniz!");
            return;
        }
        if (!n1 || n1.length !== 4) {
            alert("Yeni şifre 4 haneli olmalıdır!");
            return;
        }
        if (n1 !== n2) {
            alert("Yeni şifreler birbiriyle uyuşmuyor!");
            return;
        }

        CORRECT_PIN = n1;
        localStorage.setItem("app_pin", CORRECT_PIN);
        alert("PIN şifreniz başarıyla güncellendi! 🔑");
        document.getElementById("pin-change-modal").classList.remove("active");
    });

    document.getElementById("setting-open-logs").addEventListener("click", () => {
        logs = JSON.parse(localStorage.getItem("app_logs")) || logs;
        const container = document.getElementById("logs-list-container");
        container.innerHTML = "";
        logs.forEach((log, idx) => {
            const div = document.createElement("div");
            div.className = "event-card";
            div.innerHTML = `<div><h4>${log.profile}</h4><p>${log.time} - ${log.mood}</p></div><button class="delete-icon-btn">🗑️</button>`;
            div.querySelector(".delete-icon-btn").addEventListener("click", () => {
                logs.splice(idx, 1);
                localStorage.setItem("app_logs", JSON.stringify(logs));
                document.getElementById("setting-open-logs").click();
            });
            container.appendChild(div);
        });
        document.getElementById("logs-modal").classList.add("active");
    });

    const autoMusicToggle = document.getElementById("auto-music-toggle");
    if (autoMusicToggle) {
        autoMusicToggle.checked = autoMusicEnabled;
        autoMusicToggle.addEventListener("change", (e) => {
            autoMusicEnabled = e.target.checked;
            localStorage.setItem("app_auto_music", autoMusicEnabled);
        });
    }

    document.getElementById("logout-btn").addEventListener("click", () => {
        if (isMusicPlaying) { musicAudio.pause(); isMusicPlaying = false; }
        currentProfile = null;
        profileCards.forEach(c => c.classList.remove("selected"));
        saveLoginBtn.setAttribute("disabled", "true");
        switchScreen("welcome-screen");
    });

    document.getElementById("dark-mode-toggle").addEventListener("change", (e) => {
        if (e.target.checked) document.body.setAttribute("data-theme", "dark");
        else document.body.removeAttribute("data-theme");
    });

    document.querySelectorAll(".close-modal").forEach(btn => {
        btn.addEventListener("click", () => btn.closest(".modal").classList.remove("active"));
    });

    document.querySelectorAll(".modal").forEach(modal => {
        modal.addEventListener("click", (e) => {
            if (e.target === modal) {
                modal.classList.remove("active");
            }
        });
    });

    let confirmCallback = null;
    function showConfirm(text, callback) {
        document.getElementById("confirm-text").textContent = text;
        document.getElementById("confirm-modal").classList.add("active");
        confirmCallback = callback;
    }

    document.getElementById("confirm-yes-btn").addEventListener("click", () => {
        if (confirmCallback) confirmCallback();
        document.getElementById("confirm-modal").classList.remove("active");
    });
    document.getElementById("confirm-no-btn").addEventListener("click", () => {
        document.getElementById("confirm-modal").classList.remove("active");
    });

    initMainApp();
});