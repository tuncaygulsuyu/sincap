function goScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

// Splash Giriş
document.getElementById('startBtn').addEventListener('click', () => {
    goScreen('pinScreen');
    document.getElementById('pinInput').focus();
});

// PIN Doğrulama
let currentPin = localStorage.getItem('sincapPin') || "1508";
const pinInput = document.getElementById('pinInput');
const dots = document.querySelectorAll('.dot');
const pinError = document.getElementById('pinError');

document.getElementById('pinScreen').addEventListener('click', () => pinInput.focus());

pinInput.addEventListener('input', (e) => {
    const val = e.target.value;
    dots.forEach((dot, index) => {
        if (index < val.length) dot.classList.add('filled');
        else dot.classList.remove('filled');
    });

    if (val.length === 4) {
        if (val === currentPin) {
            pinError.textContent = "";
            setTimeout(() => goScreen('profileScreen'), 200);
        } else {
            pinError.textContent = "Hatalı PIN! Tekrar dene.";
            setTimeout(() => {
                pinInput.value = "";
                dots.forEach(d => d.classList.remove('filled'));
            }, 400);
        }
    }
});

// Profil Seçimi & Ruh Hali
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
    { emoji: '😢', text: 'Üzgün' },
    { emoji: '😠', text: 'Sinirli' },
    { emoji: '😊', text: 'Mutlu / Huzurlu' },
    { emoji: '🥰', text: 'Aşık' },
    { emoji: '✨', text: 'Enerjik' }
];

document.getElementById('moodSlider').addEventListener('input', (e) => {
    const index = parseInt(e.target.value) - 1;
    document.getElementById('moodEmoji').textContent = moods[index].emoji;
    document.getElementById('moodText').textContent = moods[index].text;
});

document.getElementById('saveProfileBtn').addEventListener('click', () => {
    if (!selectedProfile) {
        warningTooltip.style.display = 'block';
        return;
    }
    goScreen('mainAppScreen');
    initRelationshipCounter();
    renderCalendar();
    renderSpecialDays();
});

// Alt Navigasyon Sekme Geçişleri
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

// İlişki Sayaç (Başlangıç: 15 Ağustos 2026)
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
        document.getElementById('relationshipCounter').textContent = `${days} Gün ${hours} Saat ${minutes} Dakikadır Birlikteyiz ❤️`;
    }
    updateCounter();
    setInterval(updateCounter, 60000);
}

// Aşk Çarkıfeleği
let currentRotation = 0;
document.getElementById('spinWheelBtn').addEventListener('click', () => {
    const wheel = document.getElementById('loveWheel');
    currentRotation += Math.floor(Math.random() * 360) + 1440;
    wheel.style.transform = `rotate(${currentRotation}deg)`;
});

document.getElementById('loveBtn').addEventListener('click', () => {
    alert("Seni çok ama çok seviyorum Yavru Sincabım! ❤️🐿️");
});

// Müzik Oynatıcı & Gelişmiş Widget Kontrolleri
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

miniSeekBar.addEventListener('input', (e) => {
    if (audioPlayer.duration) {
        audioPlayer.currentTime = (e.target.value / 100) * audioPlayer.duration;
    }
});

fullSeekBar.addEventListener('input', (e) => {
    if (audioPlayer.duration) {
        audioPlayer.currentTime = (e.target.value / 100) * audioPlayer.duration;
    }
});

// Şarkı Sözleri Göster/Gizle Butonu
document.getElementById('toggleLyricsBtn').addEventListener('click', () => {
    const box = document.getElementById('lyricsContainer');
    box.style.display = box.style.display === 'none' ? 'block' : 'none';
});

// Galeri Lightbox Tam Ekran
function openLightbox(imgSrc) {
    document.getElementById('lightboxImg').src = imgSrc;
    document.getElementById('lightboxModal').classList.add('active');
}
function closeLightbox() {
    document.getElementById('lightboxModal').classList.remove('active');
}

// Güvenli PIN Değiştirme (Eski şifre doğrulamalı + Göz ikonu)
const pinModal = document.getElementById('pinModal');
document.getElementById('openChangePinModal').addEventListener('click', () => pinModal.classList.add('active'));
document.getElementById('closePinModal').addEventListener('click', () => pinModal.classList.remove('active'));

const togglePasswordBtn = document.getElementById('togglePasswordBtn');
const newPinInput1 = document.getElementById('newPinInput1');
const newPinInput2 = document.getElementById('newPinInput2');

togglePasswordBtn.addEventListener('click', () => {
    const type = newPinInput1.type === 'password' ? 'text' : 'password';
    newPinInput1.type = type;
    newPinInput2.type = type;
    togglePasswordBtn.className = type === 'password' ? 'fa-solid fa-eye toggle-password' : 'fa-solid fa-eye-slash toggle-password';
});

document.getElementById('saveNewPinBtn').addEventListener('click', () => {
    const oldPin = document.getElementById('oldPinInput').value;
    const p1 = newPinInput1.value;
    const p2 = newPinInput2.value;
    const err = document.getElementById('pinChangeError');

    if (oldPin !== currentPin) {
        err.textContent = "Eski şifre hatalı!";
        return;
    }
    if (p1.length !== 4 || p1 !== p2) {
        err.textContent = "Yeni şifreler 4 haneli ve birbiriyle aynı olmalı!";
        return;
    }

    currentPin = p1;
    localStorage.setItem('sincapPin', p1);
    alert("PIN şifreniz başarıyla güncellendi!");
    pinModal.classList.remove('active');
    document.getElementById('oldPinInput').value = "";
    newPinInput1.value = "";
    newPinInput2.value = "";
    err.textContent = "";
});

// Takvim & Özel Günler Yönetimi (Ay değiştirme + Gün tıklayıp not ekleme + Artan sıralama)
let currentCalendarDate = new Date(2026, 7, 1); // Ağustos 2026

let specialDays = [
    { title: "Tanışma Yıldönümümüz", date: "2026-08-15", desc: "Her şeyin başladığı o tatlı gün" },
    { title: "İlk Sinema Buluşması", date: "2026-09-10", desc: "Heyecanlı anlar" },
    { title: "Özge'nin Doğum Günü", date: "2026-11-25", desc: "Yavru sincabımın doğduğu gün ❤️" }
];

let selectedDateStr = null;

function renderCalendar() {
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();
    
    const monthsNames = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
    document.getElementById('currentMonthYear').textContent = `${monthsNames[month]} ${year}`;

    const daysGrid = document.getElementById('calendarDaysGrid');
    daysGrid.innerHTML = '';

    const firstDayIndex = new Date(year, month, 1).getDay();
    const adjustedFirstDay = firstDayIndex === 0 ? 6 : firstDayIndex - 1; // Pazartesi başlangıç
    const totalDays = new Date(year, month + 1, 0).getDate();

    // Boşluklar
    for (let i = 0; i < adjustedFirstDay; i++) {
        const emptySpan = document.createElement('span');
        daysGrid.appendChild(emptySpan);
    }

    // Günler
    for (let day = 1; day <= totalDays; day++) {
        const span = document.createElement('span');
        span.textContent = day;

        const mStr = String(month + 1).padStart(2, '0');
        const dStr = String(day).padStart(2, '0');
        const dateKey = `${year}-${mStr}-${dStr}`;

        // Etkinlik kontrolü
        if (specialDays.some(item => item.date === dateKey)) {
            span.classList.add('has-event');
        }

        span.addEventListener('click', () => {
            selectedDateStr = dateKey;
            document.getElementById('selectedDateTitle').textContent = `${day} ${monthsNames[month]} ${year} - Özel Gün Ekle`;
            document.getElementById('dayNoteModal').classList.add('active');
        });

        daysGrid.appendChild(span);
    }
}

document.getElementById('prevMonthBtn').addEventListener('click', () => {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
    renderCalendar();
});

document.getElementById('nextMonthBtn').addEventListener('click', () => {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
    renderCalendar();
});

function renderSpecialDays() {
    // En yakın tarihten en uzağa artan sırada sırala
    specialDays.sort((a, b) => new Date(a.date) - new Date(b.date));

    const listContainer = document.getElementById('specialDaysList');
    listContainer.innerHTML = '';
    specialDays.forEach(item => {
        const div = document.createElement('div');
        div.className = 'special-day-item';
        div.innerHTML = `
            <div class="special-day-info">
                <h4>${item.title}</h4>
                <p>${item.desc || item.date}</p>
            </div>
            <span class="special-day-badge">${item.date}</span>
        `;
        listContainer.appendChild(div);
    });
}

function closeDayNoteModal() {
    document.getElementById('dayNoteModal').classList.remove('active');
    document.getElementById('noteTitleInput').value = '';
    document.getElementById('noteDescInput').value = '';
}

document.getElementById('saveDayNoteBtn').addEventListener('click', () => {
    const title = document.getElementById('noteTitleInput').value;
    const desc = document.getElementById('noteDescInput').value;

    if (title && selectedDateStr) {
        specialDays.push({ title, date: selectedDateStr, desc });
        renderCalendar();
        renderSpecialDays();
        closeDayNoteModal();
    } else {
        alert("Lütfen bir başlık girin!");
    }
});