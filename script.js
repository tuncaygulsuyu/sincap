const firebaseConfig = {
    apiKey: "AIzaSyAPcu9V4PlYJbNpNmNEdzU9IadovSUJMcw",
    authDomain: "mark2-sincap-app.firebaseapp.com",
    projectId: "mark2-sincap-app",
    storageBucket: "mark2-sincap-app.firebasestorage.app",
    messagingSenderId: "169619314278",
    appId: "1:169619314278:web:84b1306ef36dfb8753ffa7",
    measurementId: "G-S7MB741JKF"
};
function goScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

function checkOutsideClick(event, modalId) {
    if (event.target.id === modalId) {
        document.getElementById(modalId).classList.remove('active');
    }
}

const darkModeToggle = document.getElementById('darkModeToggle');
const savedTheme = localStorage.getItem('sincapTheme') || 'light';
if (savedTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    darkModeToggle.checked = true;
}
darkModeToggle.addEventListener('change', (e) => {
    if (e.target.checked) {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('sincapTheme', 'dark');
    } else {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('sincapTheme', 'light');
    }
});

document.getElementById('startBtn').addEventListener('click', () => {
    goScreen('pinScreen');
    document.getElementById('pinInput').focus();
});

let currentPin = localStorage.getItem('sincapPin') || "1508";
const pinInput = document.getElementById('pinInput');
const dots = document.querySelectorAll('.dot');
const pinError = document.getElementById('pinError');
const pinBoxContainer = document.getElementById('pinBoxContainer');

document.getElementById('pinScreen').addEventListener('click', () => pinInput.focus());

pinInput.addEventListener('focus', () => { pinBoxContainer.style.transform = "translateY(-40px)"; });
pinInput.addEventListener('blur', () => { pinBoxContainer.style.transform = "translateY(0)"; });

pinInput.addEventListener('input', (e) => {
    const val = e.target.value;
    dots.forEach((dot, index) => {
        if (index < val.length) dot.classList.add('filled');
        else dot.classList.remove('filled');
    });

    if (val.length === 4) {
        if (val === currentPin) {
            pinError.textContent = "";
            
            // Doğru PIN girildiğinde müziği %8 sesten başlatıp 10 saniyede %50'ye çıkarıyoruz
            const audioPlayer = document.getElementById('audioPlayer');
            if (audioPlayer) {
                audioPlayer.volume = 0.08;
                audioPlayer.play().then(() => {
                    const quickPlayPauseBtn = document.getElementById('quickPlayPauseBtn');
                    const modalPlayPauseBtn = document.getElementById('modalPlayPauseBtn');
                    if (quickPlayPauseBtn) quickPlayPauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
                    if (modalPlayPauseBtn) modalPlayPauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';

                    let currentVol = 0.08;
                    const targetVol = 0.50;
                    const durationMs = 10000; 
                    const intervalMs = 500;   
                    const totalSteps = durationMs / intervalMs; 
                    const volStep = (targetVol - currentVol) / totalSteps; 

                    const fadeInterval = setInterval(() => {
                        currentVol += volStep;
                        if (currentVol >= targetVol || audioPlayer.paused) {
                            audioPlayer.volume = targetVol;
                            clearInterval(fadeInterval);
                        } else {
                            audioPlayer.volume = currentVol;
                        }
                    }, intervalMs);
                }).catch(err => console.log("Müzik çalma engellendi:", err));
            }

            setTimeout(() => {
                goScreen('profileScreen');
                updateDynamicGreeting();
            }, 200);
        } else {
            pinError.textContent = "Hatalı PIN! Tekrar dene.";
            setTimeout(() => {
                pinInput.value = "";
                dots.forEach(d => d.classList.remove('filled'));
            }, 400);
        }
    }
});

function updateDynamicGreeting() {
    const hour = new Date().getHours();
    let text = "Kim Konuşuyor?";
    if (hour >= 5 && hour < 12) text = "Günaydın Yavru Sincabım ☀️";
    else if (hour >= 12 && hour < 18) text = "Tünaydın Sevgilim 🌸";
    else if (hour >= 18 && hour < 22) text = "İyi Akşamlar Aşkım 🍷";
    else text = "İyi Geceler Sincabım 🌙";
    document.getElementById('greetingText').textContent = text;
}

let selectedProfile = null;
const profileCards = document.querySelectorAll('.profile-card');
const warningTooltip = document.getElementById('profileWarning');
let moodLogs = JSON.parse(localStorage.getItem('sincapMoodLogs')) || [];

profileCards.forEach(card => {
    card.addEventListener('click', () => {
        profileCards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        selectedProfile = card.getAttribute('data-profile');
        warningTooltip.style.display = 'none';
    });
});

const moods = [
    { emoji: '😢', text: 'Üzgün' },
    { emoji: '😠', text: 'Sinirli' },
    { emoji: '😊', text: 'Mutlu / Huzurlu' },
    { emoji: '🥰', text: 'Aşık' },
    { emoji: '✨', text: 'Enerjik' }
];

// Akışkan Slider Yapısı
const moodSlider = document.getElementById('moodSlider');
moodSlider.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    const roundedIndex = Math.round(val) - 1;
    const clampedIndex = Math.max(0, Math.min(moods.length - 1, roundedIndex));
    
    document.getElementById('moodEmoji').textContent = moods[clampedIndex].emoji;
    document.getElementById('moodText').textContent = moods[clampedIndex].text;
});

moodSlider.addEventListener('change', (e) => {
    const val = parseFloat(e.target.value);
    const nearestIndex = Math.round(val);
    moodSlider.value = nearestIndex;
    
    const moodObj = moods[nearestIndex - 1];
    document.getElementById('moodEmoji').textContent = moodObj.emoji;
    document.getElementById('moodText').textContent = moodObj.text;
});

function handleLoginSave() {
    if (!selectedProfile) {
        warningTooltip.style.display = 'block';
        return;
    }
    const currentMoodIndex = parseInt(moodSlider.value) - 1;
    const moodObj = moods[currentMoodIndex];
    const now = new Date();
    const dateStr = now.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

    moodLogs.unshift({
        profile: selectedProfile,
        mood: `${moodObj.emoji} ${moodObj.text}`,
        datetime: `${dateStr} - ${timeStr}`
    });
    localStorage.setItem('sincapMoodLogs', JSON.stringify(moodLogs));
    finalizeLogin();
}

document.getElementById('saveProfileBtn').addEventListener('click', handleLoginSave);
document.getElementById('skipProfileBtn').addEventListener('click', () => {
    selectedProfile = "Misafir / Sincap";
    finalizeLogin();
});

function finalizeLogin() {
    goScreen('mainAppScreen');
    initRelationshipCounter();
    renderCalendar();
    renderSpecialDays();
    renderMoodLogs();
}

document.getElementById('logoutBtn').addEventListener('click', () => {
    const audioPlayer = document.getElementById('audioPlayer');
    if (audioPlayer) audioPlayer.pause();
    pinInput.value = "";
    dots.forEach(d => d.classList.remove('filled'));
    goScreen('pinScreen');
    pinInput.focus();
});

document.querySelectorAll('.bottom-nav .nav-item').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.bottom-nav .nav-item').forEach(b => b.classList.remove('active'));
        const targetBtn = e.currentTarget;
        targetBtn.classList.add('active');
        
        const targetTabId = targetBtn.getAttribute('data-tab');
        document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
        document.getElementById(targetTabId).classList.add('active');
    });
});

function initRelationshipCounter() {
    const startDate = new Date('2026-08-15T00:00:00');
    function updateCounter() {
        const now = new Date();
        const diff = now - startDate;
        if (diff < 0) {
            document.getElementById('relationshipCounter').textContent = "15 Ağustos 2026 bekleniyor ❤️";
            return;
        }
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / 1000 / 60) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        document.getElementById('relationshipCounter').textContent = `${days} Gün ${hours} Saat ${minutes} Dakika ${seconds} Saniyedir Birlikteyiz ❤️`;
    }
    updateCounter();
    setInterval(updateCounter, 1000);
}

const compliments = [
    "Sana her baktığımda yeniden aşık oluyorum ❤️", "Gülüşün kalbimi eritiyor 🌸", "Sen benim en güzel iyikimsin ✨",
    "Gözlerin dünyadaki en güzel manzara 🌍", "Seninle geçen her saniye çok değerli ⏳", "Yavru sincabım, iyi ki varsın 🐿️",
    "Dünyanın en şanslı insanı benim 🥰", "Ellerini tuttuğumda her şey tamamlanıyor 🤝", "Sen benim nefesimsin 🌬️",
    "Aşkınla dünyamı güzelleştiriyorsun 🎨", "Seninle yaşlanmak tek hayalim 👵👴", "Kalbim sadece senin için atıyor 💓",
    "Kusursuz kelimesinin tam karşılığısın 💎", "Bana hissettirdiğin her şeye minnettarım 🙏", "Gününümü aydınlatan tek güneşimsin ☀️"
];
let lastComplimentIdx = -1;

document.getElementById('relationshipCardWrap').addEventListener('click', () => {
    let newIdx;
    do { newIdx = Math.floor(Math.random() * compliments.length); } while(newIdx === lastComplimentIdx);
    lastComplimentIdx = newIdx;
    
    const display = document.getElementById('complimentDisplay');
    display.textContent = compliments[newIdx];
    display.style.display = 'block';
    display.style.opacity = '0';
    setTimeout(() => { display.style.opacity = '1'; }, 50);
});

const audioPlayer = document.getElementById('audioPlayer');
const musicModal = document.getElementById('musicModal');
const quickPlayPauseBtn = document.getElementById('quickPlayPauseBtn');
const modalPlayPauseBtn = document.getElementById('modalPlayPauseBtn');
const quickMuteBtn = document.getElementById('quickMuteBtn');
const miniSeekBar = document.getElementById('miniSeekBar');
const fullSeekBar = document.getElementById('fullSeekBar');

document.getElementById('openMusicModal').addEventListener('click', () => musicModal.classList.add('active'));
document.getElementById('closeMusicModal').addEventListener('click', () => musicModal.classList.remove('active'));

function togglePlay() {
    if (audioPlayer.paused) {
        audioPlayer.play();
        audioPlayer.volume = 0.5;
        quickPlayPauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
        modalPlayPauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
    } else {
        audioPlayer.pause();
        quickPlayPauseBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
        modalPlayPauseBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
    }
}
quickPlayPauseBtn.addEventListener('click', togglePlay);
modalPlayPauseBtn.addEventListener('click', togglePlay);

quickMuteBtn.addEventListener('click', () => {
    audioPlayer.muted = !audioPlayer.muted;
    quickMuteBtn.innerHTML = audioPlayer.muted ? '<i class="fa-solid fa-volume-xmark"></i>' : '<i class="fa-solid fa-volume-high"></i>';
});

audioPlayer.addEventListener('timeupdate', () => {
    if (audioPlayer.duration) {
        const percent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        miniSeekBar.value = percent;
        fullSeekBar.value = percent;
        let mins = Math.floor(audioPlayer.currentTime / 60);
        let secs = Math.floor(audioPlayer.currentTime % 60);
        document.getElementById('currentTime').textContent = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
});
miniSeekBar.addEventListener('input', (e) => { if (audioPlayer.duration) audioPlayer.currentTime = (e.target.value / 100) * audioPlayer.duration; });
fullSeekBar.addEventListener('input', (e) => { if (audioPlayer.duration) audioPlayer.currentTime = (e.target.value / 100) * audioPlayer.duration; });

document.getElementById('toggleLyricsBtn').addEventListener('click', () => {
    const box = document.getElementById('lyricsContainer');
    box.style.display = box.style.display === 'none' ? 'block' : 'none';
});

// ==========================================
// FIREBASE SENKRONIZE: Şarkılarımız Sistemi ("sarkilar")
// ==========================================
let customSongs = [];

window.addEventListener('firebase-ready', () => {
    const { collection, onSnapshot } = window.fsModules;
    onSnapshot(collection(window.db, "sarkilar"), (snapshot) => {
        customSongs = [];
        snapshot.forEach((docSnap) => {
            customSongs.push({ id: docSnap.id, ...docSnap.data() });
        });
        if (document.getElementById('songsWidgetModal').classList.contains('active')) {
            renderSongsWidgetList();
        }
    });
});

function openSongsWidgetModal() {
    document.getElementById('songsWidgetModal').classList.add('active');
    renderSongsWidgetList();
}
function closeSongsWidgetModal() {
    document.getElementById('songsWidgetModal').classList.remove('active');
}

function renderSongsWidgetList() {
    const container = document.getElementById('songsWidgetListContainer');
    if (!container) return;
    container.innerHTML = '';
    customSongs.forEach((s) => {
        const div = document.createElement('div');
        div.className = 'song-item-card';
        div.innerHTML = `
            <div class="song-item-info" onclick="openSongPlatformModal('${s.title.replace(/'/g, "\\'")}', '${s.artist.replace(/'/g, "\\'")}')">
                <i class="fa-solid fa-compact-disc"></i>
                <div>
                    <h4>${s.title}</h4>
                    <p>${s.artist}</p>
                </div>
            </div>
            <button class="delete-item-btn" onclick="deleteSong('${s.id}')"><i class="fa-solid fa-trash-can"></i></button>
        `;
        container.appendChild(div);
    });
}

async function deleteSong(id) {
    const { doc, deleteDoc } = window.fsModules;
    try {
        await deleteDoc(doc(window.db, "sarkilar", id));
    } catch (e) {
        console.error("Şarkı silinirken hata oluştu: ", e);
    }
}

function openSongPlatformModal(title, artist) {
    document.getElementById('platformModalSongTitle').textContent = title;
    document.getElementById('platformModalArtist').textContent = artist;
    const query = encodeURIComponent(`${artist} ${title}`);
    document.getElementById('spotifyOpenLink').href = `https://open.spotify.com/search/${query}`;
    document.getElementById('ytMusicOpenLink').href = `https://music.youtube.com/search?q=${query}`;
    document.getElementById('ytOpenLink').href = `https://www.youtube.com/results?search_query=${query}`;
    document.getElementById('songPlatformModal').classList.add('active');
}
function closeSongPlatformModal() {
    document.getElementById('songPlatformModal').classList.remove('active');
}

document.getElementById('openAddSongModal').addEventListener('click', () => {
    document.getElementById('addSongModal').classList.add('active');
});
function closeAddSongModal() {
    document.getElementById('addSongModal').classList.remove('active');
    document.getElementById('newSongTitleInput').value = '';
    document.getElementById('newSongArtistInput').value = '';
}

document.getElementById('saveNewSongBtn').addEventListener('click', async () => {
    const title = document.getElementById('newSongTitleInput').value.trim();
    const artist = document.getElementById('newSongArtistInput').value.trim();
    if (title && artist) {
        const { collection, addDoc } = window.fsModules;
        try {
            await addDoc(collection(window.db, "sarkilar"), { title, artist });
            closeAddSongModal();
        } catch (e) {
            console.error("Şarkı eklenirken hata: ", e);
        }
    } else {
        alert("Lütfen şarkı adı ve sanatçı girin!");
    }
});

// ==========================================
// FIREBASE SENKRONIZE: Yapılacaklar Listesi ("todolist")
// ==========================================
let todoList = [];

window.addEventListener('firebase-ready', () => {
    const { collection, onSnapshot } = window.fsModules;
    onSnapshot(collection(window.db, "todolist"), (snapshot) => {
        todoList = [];
        snapshot.forEach((docSnap) => {
            todoList.push({ id: docSnap.id, ...docSnap.data() });
        });
        if (document.getElementById('todoListModal').classList.contains('active')) {
            renderTodoList();
        }
    });
});

function openTodoListModal() { document.getElementById('todoListModal').classList.add('active'); renderTodoList(); }
function closeTodoListModal() { document.getElementById('todoListModal').classList.remove('active'); }

function renderTodoList() {
    const container = document.getElementById('todoItemsContainer');
    if (!container) return;
    container.innerHTML = '';
    todoList.forEach((todo) => {
        const div = document.createElement('div');
        div.className = 'todo-item-card';
        div.innerHTML = `<span class="todo-text ${todo.completed ? 'completed' : ''}" onclick="toggleTodo('${todo.id}', ${todo.completed})">${todo.text}</span>
            <button class="delete-item-btn" onclick="deleteTodo('${todo.id}')"><i class="fa-solid fa-trash-can"></i></button>`;
        container.appendChild(div);
    });
}

document.getElementById('addTodoBtn').addEventListener('click', async () => {
    const input = document.getElementById('todoInput'); 
    const text = input.value.trim();
    if (text) {
        const { collection, addDoc } = window.fsModules;
        await addDoc(collection(window.db, "todolist"), { text, completed: false });
        input.value = '';
    }
});

async function toggleTodo(id, currentCompleted) {
    const { doc, updateDoc } = window.fsModules;
    await updateDoc(doc(window.db, "todolist", id), { completed: !currentCompleted });
}

async function deleteTodo(id) {
    const { doc, deleteDoc } = window.fsModules;
    await deleteDoc(doc(window.db, "todolist", id));
}

// Gelişmiş Pro Özel Çark
let customWheelOptions = JSON.parse(localStorage.getItem('sincapCustomWheel')) || ["Film İzle 🎬", "Kahve İç ☕", "Yürüyüş Yap 🌳", "Sürpriz Öpücük 💋"];
let proWheelRotationAngle = 0;

function openCustomWheelAppModal() {
    document.getElementById('customWheelAppModal').classList.add('active');
    renderWheelOptionsList();
    setTimeout(drawProWheel, 50);
}
function closeCustomWheelAppModal() { document.getElementById('customWheelAppModal').classList.remove('active'); }

function renderWheelOptionsList() {
    const container = document.getElementById('wheelOptionsListContainer');
    if (!container) return;
    container.innerHTML = '';
    customWheelOptions.forEach((opt, index) => {
        const div = document.createElement('div');
        div.style.cssText = "display:flex; justify-content:space-between; align-items:center; background:var(--bg-gradient); padding:6px 10px; border-radius:6px; font-size:12px; border:1px solid var(--border-color);";
        div.innerHTML = `<span>${opt}</span> <button class="delete-item-btn" onclick="deleteWheelOption(${index})" style="font-size:12px;"><i class="fa-solid fa-trash-can"></i></button>`;
        container.appendChild(div);
    });
}
function addWheelOption() {
    const inp = document.getElementById('newWheelOptionInput'); const val = inp.value.trim();
    if (val) {
        customWheelOptions.push(val);
        localStorage.setItem('sincapCustomWheel', JSON.stringify(customWheelOptions));
        inp.value = '';
        renderWheelOptionsList();
        drawProWheel();
    }
}
function deleteWheelOption(index) {
    if (customWheelOptions.length <= 2) { alert("Çarkta en az 2 seçenek kalmalıdır!"); return; }
    customWheelOptions.splice(index, 1);
    localStorage.setItem('sincapCustomWheel', JSON.stringify(customWheelOptions));
    renderWheelOptionsList();
    drawProWheel();
}

function drawProWheel() {
    const wheel = document.getElementById('proInteractiveWheel');
    if (!wheel) return;
    const colors = ['#ff4757', '#ffa502', '#2ed573', '#1e90ff', '#9b59b6', '#ff6b81'];
    let gradientParts = [];
    const step = 360 / customWheelOptions.length;
    
    for (let i = 0; i < customWheelOptions.length; i++) {
        let color = colors[i % colors.length];
        gradientParts.push(`${color} ${i * step}deg ${(i + 1) * step}deg`);
    }
    wheel.style.background = `conic-gradient(${gradientParts.join(', ')})`;
    wheel.innerHTML = '';
    
    customWheelOptions.forEach((opt, i) => {
        const label = document.createElement('div');
        label.style.position = 'absolute';
        label.style.width = '50%';
        label.style.height = '20px';
        label.style.left = '50%';
        label.style.top = 'calc(50% - 10px)';
        label.style.transformOrigin = '0% 50%';
        label.style.transform = `rotate(${i * step + step / 2}deg)`;
        label.style.textAlign = 'right';
        label.style.paddingRight = '12px';
        label.style.color = '#fff';
        label.style.fontWeight = '700';
        label.style.fontSize = '10px';
        label.style.textShadow = '1px 1px 3px rgba(0,0,0,0.5)';
        label.style.lineHeight = '20px';
        label.style.whiteSpace = 'nowrap';
        label.style.overflow = 'hidden';
        label.textContent = opt;
        wheel.appendChild(label);
    });
}

function spinProWheel() {
    if (customWheelOptions.length === 0) return;
    const wheel = document.getElementById('proInteractiveWheel');
    const randomAdd = Math.floor(Math.random() * 360) + 1440;
    proWheelRotationAngle += randomAdd;
    wheel.style.transform = `rotate(${proWheelRotationAngle}deg)`;

    setTimeout(() => {
        const actualDeg = proWheelRotationAngle % 360;
        const step = 360 / customWheelOptions.length;
        const adjustedDeg = (360 - actualDeg + 270) % 360; 
        const index = Math.floor(adjustedDeg / step) % customWheelOptions.length;
        document.getElementById('wheelResultDisplay').textContent = `✨ Sonuç: ${customWheelOptions[index]} ✨`;
    }, 4000);
}

// ==========================================
// CLOUDINARY (sincap_cloud) & FIREBASE GALERİ ("fotograflar")
// ==========================================
let galleryPhotos = [];

const CLOUD_NAME = "kokuno0e"; 
const UPLOAD_PRESET = "sincap_cloud";

window.addEventListener('firebase-ready', () => {
    const { collection, onSnapshot } = window.fsModules;
    onSnapshot(collection(window.db, "fotograflar"), (snapshot) => {
        galleryPhotos = [];
        snapshot.forEach((docSnap) => {
            galleryPhotos.push({ id: docSnap.id, ...docSnap.data() });
        });
        renderGallery();
    });
});

function renderGallery() {
    const galleryGrid = document.getElementById('iosGalleryGrid');
    if (!galleryGrid) return;
    galleryGrid.innerHTML = '';
    
    galleryPhotos.forEach((item, index) => {
        const wrap = document.createElement('div');
        wrap.className = 'gallery-thumb-wrap';
        wrap.innerHTML = `<img src="${item.url}" alt="Anı" onclick="openLightbox(${index})">`;
        galleryGrid.appendChild(wrap);
    });
    initRandomMemory();
}

async function handleImageUpload(e) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const indicator = document.getElementById('uploadingIndicator');
    if (indicator) indicator.style.display = 'block';
    const uploadDateStr = new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', UPLOAD_PRESET);

        try {
            const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
                method: 'POST',
                body: formData
            });
            const data = await response.json();

            if (data.secure_url) {
                const { collection, addDoc } = window.fsModules;
                await addDoc(collection(window.db, "fotograflar"), {
                    url: data.secure_url,
                    date: uploadDateStr
                });
            }
        } catch (err) {
            console.error("Fotoğraf yükleme hatası:", err);
            alert("Fotoğraf yüklenirken bir hata oluştu.");
        }
    }

    if (indicator) indicator.style.display = 'none';
    e.target.value = '';
}

document.getElementById('fileInput').addEventListener('change', handleImageUpload);
document.getElementById('cameraInput').addEventListener('change', handleImageUpload);

let activeLightboxIndex = null;
function openLightbox(index) {
    activeLightboxIndex = index;
    document.getElementById('lightboxImg').src = galleryPhotos[index].url;
    document.getElementById('lightboxModal').classList.add('active');
}
function closeLightbox() { document.getElementById('lightboxModal').classList.remove('active'); activeLightboxIndex = null; }

document.getElementById('lightboxShareBtn').addEventListener('click', () => {
    if (navigator.share && activeLightboxIndex !== null) {
        navigator.share({ title: 'Tuncay & Özge Anısı', text: 'Bu harika anımıza bakın! ❤️', url: galleryPhotos[activeLightboxIndex].url }).catch(() => {});
    } else { alert("Tarayıcınız paylaşım özelliğini desteklemiyor."); }
});

document.getElementById('lightboxDeleteBtn').addEventListener('click', () => { document.getElementById('deleteConfirmModal').classList.add('active'); });
function closeDeleteConfirmModal() { document.getElementById('deleteConfirmModal').classList.remove('active'); }

document.getElementById('confirmDeletePhotoBtn').addEventListener('click', async () => {
    if (activeLightboxIndex !== null) {
        const photoToDelete = galleryPhotos[activeLightboxIndex];
        if (photoToDelete.id) {
            const { doc, deleteDoc } = window.fsModules;
            await deleteDoc(doc(window.db, "fotograflar", photoToDelete.id));
        }
        closeDeleteConfirmModal(); 
        closeLightbox();
    }
});

function initRandomMemory() {
    if (galleryPhotos.length > 0) {
        const randomIndex = Math.floor(Math.random() * galleryPhotos.length);
        const imgEl = document.getElementById('randomMemoryImg');
        const textEl = document.getElementById('randomMemoryText');
        const wrapEl = document.getElementById('randomMemoryWrapper');
        if (imgEl) imgEl.src = galleryPhotos[randomIndex].url;
        if (textEl) textEl.innerHTML = `<i class="fa-regular fa-calendar"></i> Yüklenme: ${galleryPhotos[randomIndex].date}`;
        if (wrapEl) wrapEl.onclick = () => openLightbox(randomIndex);
    }
}

document.getElementById('openMoodLogsModal').addEventListener('click', () => { document.getElementById('moodLogsModal').classList.add('active'); });
function closeMoodLogsModal() { document.getElementById('moodLogsModal').classList.remove('active'); }
function renderMoodLogs() {
    const list = document.getElementById('moodLogsListContainer');
    if (!list) return;
    list.innerHTML = '';
    if (moodLogs.length === 0) { list.innerHTML = '<p style="font-size:12px; color:#888; text-align:center;">Henüz log kaydı bulunmuyor.</p>'; return; }
    moodLogs.forEach(log => {
        const div = document.createElement('div');
        div.style.cssText = "background:var(--bg-gradient); padding:10px; border-radius:8px; font-size:12px; border:1px solid var(--border-color);";
        div.innerHTML = `<strong>${log.profile}</strong>: ${log.mood} <br><span style="font-size:10px; color:#888;"><i class="fa-regular fa-clock"></i> ${log.datetime}</span>`;
        list.appendChild(div);
    });
}

const pinModal = document.getElementById('pinModal');
document.getElementById('openChangePinModal').addEventListener('click', () => pinModal.classList.add('active'));
document.getElementById('closePinModal').addEventListener('click', () => pinModal.classList.remove('active'));
const togglePasswordBtn = document.getElementById('togglePasswordBtn');
const newPinInput1 = document.getElementById('newPinInput1');
const newPinInput2 = document.getElementById('newPinInput2');

togglePasswordBtn.addEventListener('click', () => {
    const type = newPinInput1.type === 'password' ? 'text' : 'password';
    newPinInput1.type = type; newPinInput2.type = type;
    togglePasswordBtn.className = type === 'password' ? 'fa-solid fa-eye toggle-password' : 'fa-solid fa-eye-slash toggle-password';
});

document.getElementById('saveNewPinBtn').addEventListener('click', () => {
    const oldPin = document.getElementById('oldPinInput').value; const p1 = newPinInput1.value; const p2 = newPinInput2.value; const err = document.getElementById('pinChangeError');
    if (oldPin !== currentPin) { err.textContent = "Eski şifre hatalı!"; return; }
    if (p1.length !== 4 || p1 !== p2) { err.textContent = "Yeni şifreler 4 haneli ve aynı olmalı!"; return; }
    currentPin = p1; localStorage.setItem('sincapPin', p1); alert("PIN şifreniz başarıyla güncellendi!");
    pinModal.classList.remove('active'); document.getElementById('oldPinInput').value = ""; newPinInput1.value = ""; newPinInput2.value = ""; err.textContent = "";
});

// Takvim ve Gün Seçimi
let realNow = new Date();
let currentCalendarDate = new Date(realNow.getFullYear(), realNow.getMonth(), 1);

let specialDays = JSON.parse(localStorage.getItem('sincapSpecialDays')) || [
    { title: "Tanışma Yıldönümümüz", date: "2026-08-15", desc: "Her şeyin başladığı o tatlı gün" },
    { title: "Özge'nin Doğum Günü", date: "2000-12-07", desc: "Yavru sincabımın doğduğu gün ❤️" },
    { title: "İlk Sinema Buluşması", date: "2026-09-10", desc: "Heyecanlı anlar" }
];

function renderCalendar() {
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();
    const monthsNames = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
    
    const titleEl = document.getElementById('currentMonthYear');
    if (titleEl) titleEl.textContent = `${monthsNames[month]} ${year}`;

    const daysGrid = document.getElementById('calendarDaysGrid');
    if (!daysGrid) return;
    daysGrid.innerHTML = '';

    const firstDayIndex = new Date(year, month, 1).getDay();
    const adjustedFirstDay = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
    const totalDays = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < adjustedFirstDay; i++) {
        daysGrid.appendChild(document.createElement('span'));
    }

    const todayYear = realNow.getFullYear();
    const todayMonth = realNow.getMonth();
    const todayDate = realNow.getDate();

    for (let day = 1; day <= totalDays; day++) {
        const span = document.createElement('span');
        span.textContent = day;
        const mStr = String(month + 1).padStart(2, '0');
        const dStr = String(day).padStart(2, '0');

        if (year === todayYear && month === todayMonth && day === todayDate) {
            span.style.background = "var(--primary)";
            span.style.color = "white";
            span.style.fontWeight = "bold";
        }

        if (specialDays.some(item => item.date.slice(5) === `${mStr}-${dStr}`)) {
            span.classList.add('has-event');
        }

        span.onclick = () => {
            openAddSpecialDayModal();
            const ySel = document.getElementById('selectYear');
            const mSel = document.getElementById('selectMonth');
            if (ySel) ySel.value = year;
            if (mSel) mSel.value = month + 1;
            updateDaysDropdown();
            const dSel = document.getElementById('selectDay');
            if (dSel) dSel.value = day;
        };

        daysGrid.appendChild(span);
    }
}

document.getElementById('prevMonthBtn').addEventListener('click', () => { currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1); renderCalendar(); });
document.getElementById('nextMonthBtn').addEventListener('click', () => { currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1); renderCalendar(); });

function renderSpecialDays() {
    const todayMonthDay = String(realNow.getMonth() + 1).padStart(2, '0') + '-' + String(realNow.getDate()).padStart(2, '0');
    specialDays.sort((a, b) => {
        const mdA = a.date.slice(5); const mdB = b.date.slice(5);
        const diffA = mdA < todayMonthDay ? '1-' + mdA : '0-' + mdA;
        const diffB = mdB < todayMonthDay ? '1-' + mdB : '0-' + mdB;
        return diffA.localeCompare(diffB);
    });
    const listContainer = document.getElementById('specialDaysList');
    if (!listContainer) return;
    listContainer.innerHTML = '';
    specialDays.forEach((item, index) => {
        const div = document.createElement('div'); div.className = 'special-day-item';
        div.innerHTML = `
            <div class="special-day-info"><h4>${item.title}</h4><p>${item.desc || item.date} (${item.date})</p></div>
            <div class="special-day-right"><span class="special-day-badge">${item.date}</span><button class="delete-item-btn" onclick="deleteSpecialDay(${index})"><i class="fa-solid fa-trash-can"></i></button></div>`;
        listContainer.appendChild(div);
    });
}

function deleteSpecialDay(index) { specialDays.splice(index, 1); localStorage.setItem('sincapSpecialDays', JSON.stringify(specialDays)); renderCalendar(); renderSpecialDays(); }

function populateDateSelectors() {
    const yearSelect = document.getElementById('selectYear');
    const monthSelect = document.getElementById('selectMonth');
    if (!yearSelect || !monthSelect) return;

    yearSelect.innerHTML = '';
    monthSelect.innerHTML = '';
    const currentYear = realNow.getFullYear();

    for (let y = currentYear + 10; y >= 2000; y--) {
        const opt = document.createElement('option'); opt.value = y; opt.textContent = y;
        if (y === currentYear) opt.selected = true;
        yearSelect.appendChild(opt);
    }

    const monthsNames = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
    monthsNames.forEach((m, idx) => {
        const opt = document.createElement('option'); opt.value = idx + 1; opt.textContent = m;
        if (idx === realNow.getMonth()) opt.selected = true;
        monthSelect.appendChild(opt);
    });

    updateDaysDropdown();

    yearSelect.onchange = updateDaysDropdown;
    monthSelect.onchange = updateDaysDropdown;
}

function updateDaysDropdown() {
    const yearSelect = document.getElementById('selectYear');
    const monthSelect = document.getElementById('selectMonth');
    const daySelect = document.getElementById('selectDay');
    if (!yearSelect || !monthSelect || !daySelect) return;

    const y = parseInt(yearSelect.value) || realNow.getFullYear();
    const m = parseInt(monthSelect.value) || (realNow.getMonth() + 1);
    const totalDays = new Date(y, m, 0).getDate();

    const selectedDayVal = daySelect.value || realNow.getDate();
    daySelect.innerHTML = '';
    for (let d = 1; d <= totalDays; d++) {
        const opt = document.createElement('option'); opt.value = d; opt.textContent = d;
        if (d == selectedDayVal) opt.selected = true;
        daySelect.appendChild(opt);
    }
}

function openAddSpecialDayModal() {
    document.getElementById('addSpecialDayModal').classList.add('active');
    populateDateSelectors();
}
function closeAddSpecialDayModal() {
    document.getElementById('addSpecialDayModal').classList.remove('active');
    document.getElementById('specialDayTitleInput').value = '';
    document.getElementById('specialDayDescInput').value = '';
}

document.getElementById('saveSpecialDayBtn').addEventListener('click', () => {
    const title = document.getElementById('specialDayTitleInput').value.trim();
    const y = document.getElementById('selectYear').value;
    const m = String(document.getElementById('selectMonth').value).padStart(2, '0');
    const d = String(document.getElementById('selectDay').value).padStart(2, '0');
    const desc = document.getElementById('specialDayDescInput').value.trim();

    if (title) {
        const dateStr = `${y}-${m}-${d}`;
        specialDays.push({ title, date: dateStr, desc });
        localStorage.setItem('sincapSpecialDays', JSON.stringify(specialDays));
        renderCalendar(); renderSpecialDays(); closeAddSpecialDayModal();
    } else { alert("Lütfen etkinlik adı girin!"); }
});