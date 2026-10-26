// 🔥 1. FIREBASE & CLOUDINARY ALTYAPISI (Senkronizasyon)
const firebaseConfig = {
    apiKey: "AIzaSyAER4JxoS772x2eDkRhIj_xtzcJXy9SpU0",
    authDomain: "sincap-app-92914.firebaseapp.com",
    projectId: "sincap-app-92914",
    storageBucket: "sincap-app-92914.firebasestorage.app",
    messagingSenderId: "646513752342",
    appId: "1:646513752342:web:d5ac8ed855c4e3520af837",
    measurementId: "G-XBS4C7K40G"
};

if (!firebase.apps.length) { firebase.initializeApp(firebaseConfig); }
const db = firebase.firestore();

const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/kokuno0e/image/upload";
const CLOUDINARY_PRESET = "sincap_cloud";

// 🌙 2. TEMA VE EKRAN YÖNETİMİ
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

// 🔒 3. PIN VE GİRİŞ SİSTEMİ
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

// 🎭 4. PROFİL VE RUH HALİ (Firebase Senkronizasyonlu)
let selectedProfile = null;
const profileCards = document.querySelectorAll('.profile-card');
const warningTooltip = document.getElementById('profileWarning');

profileCards.forEach(card => {
    card.addEventListener('click', () => {
        profileCards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        selectedProfile = card.getAttribute('data-profile');
        warningTooltip.style.display = 'none';
    });
});

const moods = [
    { emoji: '😢', text: 'Üzgün' }, { emoji: '😠', text: 'Sinirli' },
    { emoji: '😊', text: 'Mutlu / Huzurlu' }, { emoji: '🥰', text: 'Aşık' }, { emoji: '✨', text: 'Enerjik' }
];

const moodSlider = document.getElementById('moodSlider');
moodSlider.addEventListener('input', (e) => {
    const index = parseInt(e.target.value) - 1;
    document.getElementById('moodEmoji').textContent = moods[index].emoji;
    document.getElementById('moodText').textContent = moods[index].text;
});

function handleLoginSave() {
    if (!selectedProfile) {
        warningTooltip.style.display = 'block';
        return;
    }
    const currentMoodIndex = parseInt(moodSlider.value) - 1;
    const moodObj = moods[currentMoodIndex];
    
    // Firebase'e log gönder
    db.collection("ruh_hali").add({
        profile: selectedProfile,
        mood: `${moodObj.emoji} ${moodObj.text}`,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        finalizeLogin();
    });
}

document.getElementById('saveProfileBtn').addEventListener('click', handleLoginSave);
document.getElementById('skipProfileBtn').addEventListener('click', () => { finalizeLogin(); });

function finalizeLogin() {
    goScreen('mainAppScreen');
    initRelationshipCounter();
    startAutoFadeInMusic();
}

// Alt Navigasyon
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

// ⏳ 5. SAYAÇ & İLTİFAT MOTORU
function initRelationshipCounter() {
    const startDate = new Date('2026-08-15T00:00:00');
    function updateCounter() {
        const now = new Date();
        const diff = now - startDate;
        if (diff < 0) { document.getElementById('relationshipCounter').textContent = "15 Ağustos 2026 bekleniyor ❤️"; return; }
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / 1000 / 60) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        document.getElementById('relationshipCounter').textContent = `${days} Gün ${hours} Saat ${minutes} Dakika ${seconds} Saniye ❤️`;
    }
    updateCounter();
    setInterval(updateCounter, 1000);
}

const compliments = [
    "Sana her baktığımda yeniden aşık oluyorum ❤️", "Sen benim en güzel iyikimsin ✨", "Yavru sincabım, iyi ki varsın 🐿️", "Gününümü aydınlatan tek güneşimsin ☀️"
];
let lastComplimentIdx = -1;
document.getElementById('relationshipCardWrap').addEventListener('click', () => {
    let newIdx; do { newIdx = Math.floor(Math.random() * compliments.length); } while(newIdx === lastComplimentIdx);
    lastComplimentIdx = newIdx;
    const display = document.getElementById('complimentDisplay');
    display.textContent = compliments[newIdx]; display.style.display = 'block'; display.style.opacity = '0';
    setTimeout(() => { display.style.opacity = '1'; }, 50);
});

// 🎵 6. MÜZİK OYNATICI
const audioPlayer = document.getElementById('audioPlayer');
const musicModal = document.getElementById('musicModal');
const quickPlayPauseBtn = document.getElementById('quickPlayPauseBtn');
const modalPlayPauseBtn = document.getElementById('modalPlayPauseBtn');
const quickMuteBtn = document.getElementById('quickMuteBtn');
const miniSeekBar = document.getElementById('miniSeekBar');
const fullSeekBar = document.getElementById('fullSeekBar');

function startAutoFadeInMusic() {
    audioPlayer.volume = 0.0;
    audioPlayer.play().then(() => {
        quickPlayPauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
        modalPlayPauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
        let step = 0; const volumes = [0.1, 0.2, 0.3, 0.4, 0.5];
        const fadeInterval = setInterval(() => {
            if (step < volumes.length && !audioPlayer.paused) { audioPlayer.volume = volumes[step]; step++; } 
            else { clearInterval(fadeInterval); }
        }, 3000);
    }).catch(() => { console.log("Otomatik oynatma kısıtlandı."); });
}

document.getElementById('openMusicModal').addEventListener('click', () => musicModal.classList.add('active'));
document.getElementById('closeMusicModal').addEventListener('click', () => musicModal.classList.remove('active'));

function togglePlay() {
    if (audioPlayer.paused) {
        audioPlayer.play(); audioPlayer.volume = 0.5;
        quickPlayPauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i>'; modalPlayPauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
    } else {
        audioPlayer.pause();
        quickPlayPauseBtn.innerHTML = '<i class="fa-solid fa-play"></i>'; modalPlayPauseBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
    }
}
quickPlayPauseBtn.addEventListener('click', togglePlay); modalPlayPauseBtn.addEventListener('click', togglePlay);
quickMuteBtn.addEventListener('click', () => {
    audioPlayer.muted = !audioPlayer.muted;
    quickMuteBtn.innerHTML = audioPlayer.muted ? '<i class="fa-solid fa-volume-xmark"></i>' : '<i class="fa-solid fa-volume-high"></i>';
});
audioPlayer.addEventListener('timeupdate', () => {
    if (audioPlayer.duration) {
        const percent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        miniSeekBar.value = percent; fullSeekBar.value = percent;
        let mins = Math.floor(audioPlayer.currentTime / 60); let secs = Math.floor(audioPlayer.currentTime % 60);
        document.getElementById('currentTime').textContent = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
});
miniSeekBar.addEventListener('input', (e) => { if (audioPlayer.duration) audioPlayer.currentTime = (e.target.value / 100) * audioPlayer.duration; });
fullSeekBar.addEventListener('input', (e) => { if (audioPlayer.duration) audioPlayer.currentTime = (e.target.value / 100) * audioPlayer.duration; });
document.getElementById('toggleLyricsBtn').addEventListener('click', () => { const box = document.getElementById('lyricsContainer'); box.style.display = box.style.display === 'none' ? 'block' : 'none'; });

// ☁️ 7. FIREBASE REAL-TIME SENKRONİZASYONLARI
// 7.1 ŞARKILAR
let customSongs = [];
db.collection("sarkilar").orderBy("tarih", "desc").onSnapshot((snapshot) => {
    customSongs = [];
    snapshot.forEach((doc) => { customSongs.push({ id: doc.id, ...doc.data() }); });
    renderSongsWidgetList();
});

function openSongsWidgetModal() { document.getElementById('songsWidgetModal').classList.add('active'); renderSongsWidgetList(); }
function closeSongsWidgetModal() { document.getElementById('songsWidgetModal').classList.remove('active'); }
function renderSongsWidgetList() {
    const container = document.getElementById('songsWidgetListContainer'); if (!container) return;
    container.innerHTML = '';
    customSongs.forEach((s) => {
        const div = document.createElement('div'); div.className = 'song-item-card';
        div.innerHTML = `
            <div class="song-item-info" onclick="openSongPlatformModal('${s.title}', '${s.artist}')">
                <i class="fa-solid fa-compact-disc"></i><div><h4>${s.title}</h4><p>${s.artist}</p></div>
            </div>
            <button class="delete-item-btn" onclick="deleteSong('${s.id}')"><i class="fa-solid fa-trash-can"></i></button>`;
        container.appendChild(div);
    });
}
function deleteSong(id) { db.collection("sarkilar").doc(id).delete(); }
document.getElementById('openAddSongModal').addEventListener('click', () => { document.getElementById('addSongModal').classList.add('active'); });
function closeAddSongModal() { document.getElementById('addSongModal').classList.remove('active'); document.getElementById('newSongTitleInput').value = ''; document.getElementById('newSongArtistInput').value = ''; }
document.getElementById('saveNewSongBtn').addEventListener('click', () => {
    const title = document.getElementById('newSongTitleInput').value.trim(); const artist = document.getElementById('newSongArtistInput').value.trim();
    if (title && artist) { db.collection("sarkilar").add({ title, artist, tarih: firebase.firestore.FieldValue.serverTimestamp() }); closeAddSongModal(); }
});

function openSongPlatformModal(title, artist) {
    document.getElementById('platformModalSongTitle').textContent = title; document.getElementById('platformModalArtist').textContent = artist;
    const query = encodeURIComponent(`${artist} ${title}`);
    document.getElementById('spotifyOpenLink').href = `https://open.spotify.com/search/${query}`;
    document.getElementById('ytMusicOpenLink').href = `https://music.youtube.com/search?q=${query}`;
    document.getElementById('ytOpenLink').href = `https://www.youtube.com/results?search_query=${query}`;
    document.getElementById('songPlatformModal').classList.add('active');
}
function closeSongPlatformModal() { document.getElementById('songPlatformModal').classList.remove('active'); }

// 7.2 YAPILACAKLAR (TODOLIST)
let todoList = [];
db.collection("todolist").orderBy("tarih", "desc").onSnapshot((snapshot) => {
    todoList = [];
    snapshot.forEach((doc) => { todoList.push({ id: doc.id, ...doc.data() }); });
    renderTodoList();
});
function openTodoListModal() { document.getElementById('todoListModal').classList.add('active'); renderTodoList(); }
function closeTodoListModal() { document.getElementById('todoListModal').classList.remove('active'); }
function renderTodoList() {
    const container = document.getElementById('todoItemsContainer'); if (!container) return; container.innerHTML = '';
    todoList.forEach((todo) => {
        const div = document.createElement('div'); div.className = 'todo-item-card';
        div.innerHTML = `<span class="todo-text ${todo.completed ? 'completed' : ''}" onclick="toggleTodo('${todo.id}', ${todo.completed})">${todo.text}</span>
            <button class="delete-item-btn" onclick="deleteTodo('${todo.id}')"><i class="fa-solid fa-trash-can"></i></button>`;
        container.appendChild(div);
    });
}
document.getElementById('addTodoBtn').addEventListener('click', () => {
    const input = document.getElementById('todoInput'); const text = input.value.trim();
    if (text) { db.collection("todolist").add({ text, completed: false, tarih: firebase.firestore.FieldValue.serverTimestamp() }); input.value = ''; }
});
function toggleTodo(id, currentStatus) { db.collection("todolist").doc(id).update({ completed: !currentStatus }); }
function deleteTodo(id) { db.collection("todolist").doc(id).delete(); }

// 7.3 ÖZEL GÜNLER VE TAKVİM
let specialDays = [];
let realNow = new Date();
let currentCalendarDate = new Date(realNow.getFullYear(), realNow.getMonth(), 1);

db.collection("ozel_gunler").onSnapshot((snapshot) => {
    specialDays = [];
    snapshot.forEach((doc) => { specialDays.push({ id: doc.id, ...doc.data() }); });
    renderCalendar(); renderSpecialDays();
});

function renderCalendar() {
    const year = currentCalendarDate.getFullYear(); const month = currentCalendarDate.getMonth();
    const monthsNames = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
    document.getElementById('currentMonthYear').textContent = `${monthsNames[month]} ${year}`;
    const daysGrid = document.getElementById('calendarDaysGrid'); if (!daysGrid) return; daysGrid.innerHTML = '';

    const firstDayIndex = new Date(year, month, 1).getDay(); const adjustedFirstDay = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
    const totalDays = new Date(year, month + 1, 0).getDate();
    for (let i = 0; i < adjustedFirstDay; i++) { daysGrid.appendChild(document.createElement('span')); }

    const todayYear = realNow.getFullYear(); const todayMonth = realNow.getMonth(); const todayDate = realNow.getDate();
    for (let day = 1; day <= totalDays; day++) {
        const span = document.createElement('span'); span.textContent = day;
        const mStr = String(month + 1).padStart(2, '0'); const dStr = String(day).padStart(2, '0');
        
        if (year === todayYear && month === todayMonth && day === todayDate) { span.style.background = "var(--primary)"; span.style.color = "white"; span.style.fontWeight = "bold"; }
        if (specialDays.some(item => item.date.slice(5) === `${mStr}-${dStr}`)) { span.classList.add('has-event'); }
        
        span.onclick = () => { openAddSpecialDayModal(); document.getElementById('selectYear').value = year; document.getElementById('selectMonth').value = month + 1; updateDaysDropdown(); document.getElementById('selectDay').value = day; };
        daysGrid.appendChild(span);
    }
}
document.getElementById('prevMonthBtn').addEventListener('click', () => { currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1); renderCalendar(); });
document.getElementById('nextMonthBtn').addEventListener('click', () => { currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1); renderCalendar(); });

function renderSpecialDays() {
    const todayMonthDay = String(realNow.getMonth() + 1).padStart(2, '0') + '-' + String(realNow.getDate()).padStart(2, '0');
    let sorted = [...specialDays].sort((a, b) => {
        const mdA = a.date.slice(5); const mdB = b.date.slice(5);
        return (mdA < todayMonthDay ? '1-'+mdA : '0-'+mdA).localeCompare(mdB < todayMonthDay ? '1-'+mdB : '0-'+mdB);
    });
    const listContainer = document.getElementById('specialDaysList'); if (!listContainer) return; listContainer.innerHTML = '';
    sorted.forEach((item) => {
        const div = document.createElement('div'); div.className = 'special-day-item';
        div.innerHTML = `<div class="special-day-info"><h4>${item.title}</h4><p>${item.desc} (${item.date})</p></div>
            <div class="special-day-right"><span class="special-day-badge">${item.date}</span><button class="delete-item-btn" onclick="deleteSpecialDay('${item.id}')"><i class="fa-solid fa-trash-can"></i></button></div>`;
        listContainer.appendChild(div);
    });
}
function deleteSpecialDay(id) { db.collection("ozel_gunler").doc(id).delete(); }

function populateDateSelectors() {
    const ySel = document.getElementById('selectYear'); const mSel = document.getElementById('selectMonth');
    ySel.innerHTML = ''; mSel.innerHTML = ''; const curYear = realNow.getFullYear();
    for (let y = curYear + 10; y >= 2000; y--) { const opt = document.createElement('option'); opt.value = y; opt.textContent = y; if(y===curYear) opt.selected=true; ySel.appendChild(opt); }
    ["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"].forEach((m, idx) => { const opt = document.createElement('option'); opt.value = idx+1; opt.textContent = m; if(idx===realNow.getMonth()) opt.selected=true; mSel.appendChild(opt); });
    updateDaysDropdown(); ySel.onchange = updateDaysDropdown; mSel.onchange = updateDaysDropdown;
}
function updateDaysDropdown() {
    const ySel = document.getElementById('selectYear').value; const mSel = document.getElementById('selectMonth').value; const dSel = document.getElementById('selectDay');
    const totalDays = new Date(ySel, mSel, 0).getDate(); const selected = dSel.value || realNow.getDate(); dSel.innerHTML = '';
    for (let d = 1; d <= totalDays; d++) { const opt = document.createElement('option'); opt.value = d; opt.textContent = d; if(d==selected) opt.selected=true; dSel.appendChild(opt); }
}
function openAddSpecialDayModal() { document.getElementById('addSpecialDayModal').classList.add('active'); populateDateSelectors(); }
function closeAddSpecialDayModal() { document.getElementById('addSpecialDayModal').classList.remove('active'); document.getElementById('specialDayTitleInput').value = ''; document.getElementById('specialDayDescInput').value = ''; }
document.getElementById('saveSpecialDayBtn').addEventListener('click', () => {
    const title = document.getElementById('specialDayTitleInput').value.trim(); const desc = document.getElementById('specialDayDescInput').value.trim();
    const y = document.getElementById('selectYear').value; const m = String(document.getElementById('selectMonth').value).padStart(2, '0'); const d = String(document.getElementById('selectDay').value).padStart(2, '0');
    if (title) { db.collection("ozel_gunler").add({ title, desc, date: `${y}-${m}-${d}` }); closeAddSpecialDayModal(); }
});

// 📸 8. GALERİ VE CLOUDINARY (Sorunsuz Görsel Altyapısı)
let galleryPhotos = [];
let activeLightboxIndex = null;

db.collection("fotograflar").orderBy("tarih", "desc").onSnapshot((snapshot) => {
    galleryPhotos = [];
    snapshot.forEach((doc) => { galleryPhotos.push({ id: doc.id, ...doc.data() }); });
    renderGallery();
});

function renderGallery() {
    const galleryGrid = document.getElementById('iosGalleryGrid'); if (!galleryGrid) return; galleryGrid.innerHTML = '';
    galleryPhotos.forEach((item, index) => {
        const wrap = document.createElement('div'); wrap.className = 'gallery-thumb-wrap';
        wrap.innerHTML = `<img src="${item.url}" alt="Anı" onclick="openLightbox(${index})">`;
        galleryGrid.appendChild(wrap);
    });
    initRandomMemory();
}

async function handleImageUpload(e) {
    const files = e.target.files; if (!files || files.length === 0) return;
    const indicator = document.getElementById('uploadingIndicator');
    if (indicator) indicator.style.display = 'block';

    for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append("file", files[i]);
        formData.append("upload_preset", CLOUDINARY_PRESET);
        try {
            const res = await fetch(CLOUDINARY_URL, { method: "POST", body: formData });
            const data = await res.json();
            if (data.secure_url) {
                await db.collection("fotograflar").add({
                    url: data.secure_url,
                    tarih: firebase.firestore.FieldValue.serverTimestamp()
                });
            }
        } catch (err) { console.log("Görsel yüklenemedi", err); }
    }
    if (indicator) indicator.style.display = 'none';
    e.target.value = '';
}
document.getElementById('fileInput').addEventListener('change', handleImageUpload);
document.getElementById('cameraInput').addEventListener('change', handleImageUpload);

function openLightbox(index) {
    activeLightboxIndex = index;
    document.getElementById('lightboxImg').src = galleryPhotos[index].url;
    document.getElementById('lightboxModal').classList.add('active');
}
function closeLightbox() { document.getElementById('lightboxModal').classList.remove('active'); activeLightboxIndex = null; }
document.getElementById('lightboxShareBtn').addEventListener('click', () => {
    if (navigator.share && activeLightboxIndex !== null) { navigator.share({ title: 'Sincap & Özge', url: galleryPhotos[activeLightboxIndex].url }).catch(()=>{}); }
});
document.getElementById('lightboxDeleteBtn').addEventListener('click', () => { document.getElementById('deleteConfirmModal').classList.add('active'); });
function closeDeleteConfirmModal() { document.getElementById('deleteConfirmModal').classList.remove('active'); }
document.getElementById('confirmDeletePhotoBtn').addEventListener('click', () => {
    if (activeLightboxIndex !== null) { db.collection("fotograflar").doc(galleryPhotos[activeLightboxIndex].id).delete(); closeDeleteConfirmModal(); closeLightbox(); }
});

function initRandomMemory() {
    if (galleryPhotos.length > 0) {
        const randomIndex = Math.floor(Math.random() * galleryPhotos.length);
        const imgEl = document.getElementById('randomMemoryImg'); const textEl = document.getElementById('randomMemoryText'); const wrapEl = document.getElementById('randomMemoryWrapper');
        if (imgEl) imgEl.src = galleryPhotos[randomIndex].url;
        if (textEl) {
            let d = galleryPhotos[randomIndex].tarih ? new Date(galleryPhotos[randomIndex].tarih.seconds*1000).toLocaleDateString('tr-TR') : "Yeni";
            textEl.innerHTML = `<i class="fa-regular fa-calendar"></i> Yüklendi: ${d}`;
        }
        if (wrapEl) wrapEl.onclick = () => openLightbox(randomIndex);
    }
}

// 🎡 9. GELİŞMİŞ ÇARK SİSTEMİ (Firebase Senkronlu)
let customWheelOptions = [];
let proWheelRotationAngle = 0;

db.collection("cark_secenekleri").onSnapshot((snapshot) => {
    customWheelOptions = [];
    snapshot.forEach(doc => customWheelOptions.push({ id: doc.id, text: doc.data().text }));
    if(customWheelOptions.length === 0) { customWheelOptions = [{id: "tmp1", text: "Film İzle"}, {id: "tmp2", text: "Kahve İç"}]; }
    renderWheelOptionsList(); drawProWheel();
});

function openCustomWheelAppModal() { document.getElementById('customWheelAppModal').classList.add('active'); renderWheelOptionsList(); setTimeout(drawProWheel, 50); }
function closeCustomWheelAppModal() { document.getElementById('customWheelAppModal').classList.remove('active'); }

function renderWheelOptionsList() {
    const container = document.getElementById('wheelOptionsListContainer'); if (!container) return; container.innerHTML = '';
    customWheelOptions.forEach((opt) => {
        const div = document.createElement('div');
        div.style.cssText = "display:flex; justify-content:space-between; align-items:center; background:var(--bg-gradient); padding:6px 10px; border-radius:6px; font-size:12px; border:1px solid var(--border-color);";
        div.innerHTML = `<span>${opt.text}</span> <button class="delete-item-btn" onclick="deleteWheelOption('${opt.id}')" style="font-size:12px;"><i class="fa-solid fa-trash-can"></i></button>`;
        container.appendChild(div);
    });
}
function addWheelOption() {
    const val = document.getElementById('newWheelOptionInput').value.trim();
    if (val) { db.collection("cark_secenekleri").add({ text: val }); document.getElementById('newWheelOptionInput').value = ''; }
}
function deleteWheelOption(id) { if(customWheelOptions.length <= 2) { alert("En az 2 seçenek olmalı!"); return; } db.collection("cark_secenekleri").doc(id).delete(); }

function drawProWheel() {
    const wheel = document.getElementById('proInteractiveWheel'); if (!wheel) return;
    const colors = ['#ff4757', '#ffa502', '#2ed573', '#1e90ff', '#9b59b6', '#ff6b81'];
    let gradientParts = []; const step = 360 / customWheelOptions.length;
    for (let i = 0; i < customWheelOptions.length; i++) { gradientParts.push(`${colors[i % colors.length]} ${i * step}deg ${(i + 1) * step}deg`); }
    wheel.style.background = `conic-gradient(${gradientParts.join(', ')})`; wheel.innerHTML = '';
    customWheelOptions.forEach((opt, i) => {
        const label = document.createElement('div'); label.style.position = 'absolute'; label.style.width = '50%'; label.style.height = '20px';
        label.style.left = '50%'; label.style.top = 'calc(50% - 10px)'; label.style.transformOrigin = '0% 50%'; label.style.transform = `rotate(${i * step + step / 2}deg)`;
        label.style.textAlign = 'right'; label.style.paddingRight = '12px'; label.style.color = '#fff'; label.style.fontWeight = '700'; label.style.fontSize = '10px';
        label.style.textShadow = '1px 1px 3px rgba(0,0,0,0.5)'; label.textContent = opt.text;
        wheel.appendChild(label);
    });
}
function spinProWheel() {
    if (customWheelOptions.length === 0) return;
    const wheel = document.getElementById('proInteractiveWheel');
    proWheelRotationAngle += Math.floor(Math.random() * 360) + 1440;
    wheel.style.transform = `rotate(${proWheelRotationAngle}deg)`;
    setTimeout(() => {
        const actualDeg = proWheelRotationAngle % 360; const step = 360 / customWheelOptions.length;
        const adjustedDeg = (360 - actualDeg + 270) % 360; const index = Math.floor(adjustedDeg / step) % customWheelOptions.length;
        document.getElementById('wheelResultDisplay').textContent = `✨ Sonuç: ${customWheelOptions[index].text} ✨`;
    }, 4000);
}

// ⚙️ 10. AYARLAR & LOGLAR
let moodLogs = [];
db.collection("ruh_hali").orderBy("timestamp", "desc").limit(20).onSnapshot(snapshot => {
    moodLogs = [];
    snapshot.forEach(doc => moodLogs.push({ id: doc.id, ...doc.data() }));
    renderMoodLogs();
});

document.getElementById('openMoodLogsModal').addEventListener('click', () => { document.getElementById('moodLogsModal').classList.add('active'); });
function closeMoodLogsModal() { document.getElementById('moodLogsModal').classList.remove('active'); }
function renderMoodLogs() {
    const list = document.getElementById('moodLogsListContainer'); if (!list) return; list.innerHTML = '';
    moodLogs.forEach(log => {
        const div = document.createElement('div');
        div.style.cssText = "background:var(--bg-gradient); padding:10px; border-radius:8px; font-size:12px; border:1px solid var(--border-color);";
        let dateStr = log.timestamp ? new Date(log.timestamp.seconds*1000).toLocaleString('tr-TR') : 'Şimdi';
        div.innerHTML = `<strong>${log.profile}</strong>: ${log.mood} <br><span style="font-size:10px; color:#888;"><i class="fa-regular fa-clock"></i> ${dateStr}</span>`;
        list.appendChild(div);
    });
}

// PIN DEĞİŞTİRME
const pinModal = document.getElementById('pinModal');
document.getElementById('openChangePinModal').addEventListener('click', () => pinModal.classList.add('active'));
document.getElementById('closePinModal').addEventListener('click', () => pinModal.classList.remove('active'));
document.getElementById('togglePasswordBtn').addEventListener('click', (e) => {
    const i1 = document.getElementById('newPinInput1'); const i2 = document.getElementById('newPinInput2');
    const type = i1.type === 'password' ? 'text' : 'password';
    i1.type = type; i2.type = type; e.target.className = type === 'password' ? 'fa-solid fa-eye toggle-password' : 'fa-solid fa-eye-slash toggle-password';
});
document.getElementById('saveNewPinBtn').addEventListener('click', () => {
    const oldPin = document.getElementById('oldPinInput').value; const p1 = document.getElementById('newPinInput1').value; const p2 = document.getElementById('newPinInput2').value;
    const err = document.getElementById('pinChangeError');
    if (oldPin !== currentPin) { err.textContent = "Eski şifre hatalı!"; return; }
    if (p1.length !== 4 || p1 !== p2) { err.textContent = "Yeni şifreler 4 haneli ve aynı olmalı!"; return; }
    currentPin = p1; localStorage.setItem('sincapPin', p1); alert("PIN başarıyla güncellendi!");
    pinModal.classList.remove('active'); document.getElementById('oldPinInput').value = ""; document.getElementById('newPinInput1').value = ""; document.getElementById('newPinInput2').value = ""; err.textContent = "";
});

// ÇIKIŞ YAP
document.getElementById('logoutBtn').addEventListener('click', () => {
    audioPlayer.pause(); document.getElementById('pinInput').value = "";
    document.querySelectorAll('.dot').forEach(d => d.classList.remove('filled'));
    goScreen('pinScreen'); document.getElementById('pinInput').focus();
});