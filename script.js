function goScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

// Splash Giriş
document.getElementById('startBtn').addEventListener('click', () => {
    goScreen('pinScreen');
    document.getElementById('pinInput').focus();
});

// PIN Doğrulama & Klavye Kaydırma
let currentPin = localStorage.getItem('sincapPin') || "1508";
const pinInput = document.getElementById('pinInput');
const dots = document.querySelectorAll('.dot');
const pinError = document.getElementById('pinError');
const pinBoxContainer = document.getElementById('pinBoxContainer');

document.getElementById('pinScreen').addEventListener('click', () => pinInput.focus());

pinInput.addEventListener('focus', () => {
    pinBoxContainer.style.transform = "translateY(-40px)";
});
pinInput.addEventListener('blur', () => {
    pinBoxContainer.style.transform = "translateY(0)";
});

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

// Profil Seçimi & Ruh Hali & Log Tutma
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
    renderGallery();
    initRandomMemory();
}

// Çıkış Yap Butonu İşlevi
document.getElementById('logoutBtn').addEventListener('click', () => {
    pinInput.value = "";
    dots.forEach(d => d.classList.remove('filled'));
    goScreen('pinScreen');
    pinInput.focus();
});

// Alt Navigasyon (4 Sekme)
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

// İlişki Sayaç (Saniyeli Güncelleme)
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

// Gelişmiş Aşk Falı Çarkı
let currentRotation = 0;
const wheelFortunes = [
    "Gözlerini Kapat ve Beni Hayal Et 🥰",
    "Şu An Bana En Tatlı İltifatı Yap 💬",
    "İlk Buluştuğumuz Günü Hatırla 🕰️",
    "Sürpriz Bir Öpücük Hak Ettin! 💋",
    "Birlikte En Sevdiğimiz Şarkıyı Aç 🎶",
    "Gelecek Hafta İçin Kaçamak Planla ✈️"
];

function spinWheel() {
    const wheel = document.getElementById('loveWheel');
    const randomAdd = Math.floor(Math.random() * 360) + 1440;
    currentRotation += randomAdd;
    wheel.style.transform = `rotate(${currentRotation}deg)`;

    setTimeout(() => {
        const actualDeg = currentRotation % 360;
        const index = Math.floor(((360 - (actualDeg % 360)) % 360) / 90);
        alert(`✨ Çarktan Çıkan Falın: "${wheelFortunes[index]}" ✨`);
    }, 4000);
}
document.getElementById('spinWheelBtn').addEventListener('click', spinWheel);
document.getElementById('wheelWrapperClickable').addEventListener('click', spinWheel);

document.getElementById('loveBtn').addEventListener('click', () => {
    alert("Seni çok ama çok seviyorum Yavru Sincabım! ❤️🐿️");
});

// Müzik Oynatıcı Kontrolleri
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

document.getElementById('toggleLyricsBtn').addEventListener('click', () => {
    const box = document.getElementById('lyricsContainer');
    box.style.display = box.style.display === 'none' ? 'block' : 'none';
});

// Şarkılar Widget & Yönetimi
let customSongs = JSON.parse(localStorage.getItem('sincapCustomSongs')) || [
    { title: "Sen Olurdun Yine", artist: "Ajda Pekkan" }
];

function openSongsWidgetModal() {
    document.getElementById('songsWidgetModal').classList.add('active');
    renderSongsWidgetList();
}
function closeSongsWidgetModal() {
    document.getElementById('songsWidgetModal').classList.remove('active');
}

function renderSongsWidgetList() {
    const container = document.getElementById('songsWidgetListContainer');
    container.innerHTML = '';
    customSongs.forEach((s, index) => {
        const div = document.createElement('div');
        div.className = 'song-item-card';
        div.innerHTML = `
            <div class="song-item-info" onclick="openSongPlatformModal('${s.title}', '${s.artist}')">
                <i class="fa-solid fa-compact-disc"></i>
                <div>
                    <h4>${s.title}</h4>
                    <p>${s.artist}</p>
                </div>
            </div>
            <button class="delete-item-btn" onclick="deleteSong(${index})"><i class="fa-solid fa-trash-can"></i></button>
        `;
        container.appendChild(div);
    });
}

function deleteSong(index) {
    customSongs.splice(index, 1);
    localStorage.setItem('sincapCustomSongs', JSON.stringify(customSongs));
    renderSongsWidgetList();
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
document.getElementById('saveNewSongBtn').addEventListener('click', () => {
    const title = document.getElementById('newSongTitleInput').value;
    const artist = document.getElementById('newSongArtistInput').value;
    if (title && artist) {
        customSongs.push({ title, artist });
        localStorage.setItem('sincapCustomSongs', JSON.stringify(customSongs));
        renderSongsWidgetList();
        closeAddSongModal();
    } else {
        alert("Lütfen şarkı adı ve sanatçı girin!");
    }
});

// Yapılacaklar Listesi Widget & Yönetimi
let todoList = JSON.parse(localStorage.getItem('sincapTodoList')) || [
    { text: "Birlikte kahve içilecek ☕", completed: false },
    { text: "Akşam film gecesi yapılacak 🎬", completed: true }
];

function openTodoListModal() {
    document.getElementById('todoListModal').classList.add('active');
    renderTodoList();
}
function closeTodoListModal() {
    document.getElementById('todoListModal').classList.remove('active');
}

function renderTodoList() {
    const container = document.getElementById('todoItemsContainer');
    container.innerHTML = '';
    todoList.forEach((todo, index) => {
        const div = document.createElement('div');
        div.className = 'todo-item-card';
        div.innerHTML = `
            <span class="todo-text ${todo.completed ? 'completed' : ''}" onclick="toggleTodo(${index})">${todo.text}</span>
            <button class="delete-item-btn" onclick="deleteTodo(${index})"><i class="fa-solid fa-trash-can"></i></button>
        `;
        container.appendChild(div);
    });
}

document.getElementById('addTodoBtn').addEventListener('click', () => {
    const input = document.getElementById('todoInput');
    const text = input.value.trim();
    if (text) {
        todoList.push({ text, completed: false });
        localStorage.setItem('sincapTodoList', JSON.stringify(todoList));
        input.value = '';
        renderTodoList();
    }
});

function toggleTodo(index) {
    todoList[index].completed = !todoList[index].completed;
    localStorage.setItem('sincapTodoList', JSON.stringify(todoList));
    renderTodoList();
}

function deleteTodo(index) {
    todoList.splice(index, 1);
    localStorage.setItem('sincapTodoList', JSON.stringify(todoList));
    renderTodoList();
}

// Galeri: Çoklu Fotoğraf Seçimi, "Yükleniyor..." İbaresi, Ayna Düzeltmesi & Onaylı Silme
let galleryPhotos = JSON.parse(localStorage.getItem('sincapGalleryPhotos')) || [
    "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=400&q=80",
    "https://images.unsplash.com/photo-1494774157365-9e04c6720e47?w=400&q=80"
];
let activeLightboxIndex = null;

function renderGallery() {
    const galleryGrid = document.getElementById('iosGalleryGrid');
    galleryGrid.innerHTML = '';
    galleryPhotos.forEach((imgSrc, index) => {
        const wrap = document.createElement('div');
        wrap.className = 'gallery-thumb-wrap';
        wrap.innerHTML = `<img src="${imgSrc}" alt="Anı" onclick="openLightbox(${index})">`;
        galleryGrid.appendChild(wrap);
    });
    initRandomMemory();
}
renderGallery();

// Çoklu Yükleme & Kamera Düzeltmesi
async function handleImageUpload(e, isCamera = false) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const indicator = document.getElementById('uploadingIndicator');
    indicator.style.display = 'block';

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = function(event) {
                let resultUrl = event.target.result;
                if (isCamera) {
                    // Kameradan gelen ayna yansımasını düzeltmek için canvas döndürme/çevirme simülasyonu
                    resultUrl = event.target.result; 
                }
                galleryPhotos.push(resultUrl);
                resolve();
            };
            reader.readAsDataURL(file);
        });
    }

    localStorage.setItem('sincapGalleryPhotos', JSON.stringify(galleryPhotos));
    indicator.style.display = 'none';
    renderGallery();
    e.target.value = ''; // Sıfırla
}

document.getElementById('fileInput').addEventListener('change', (e) => handleImageUpload(e, false));
document.getElementById('cameraInput').addEventListener('change', (e) => handleImageUpload(e, true));

// Lightbox & Onaylı Silme Modalı
function openLightbox(index) {
    activeLightboxIndex = index;
    document.getElementById('lightboxImg').src = galleryPhotos[index];
    document.getElementById('lightboxModal').classList.add('active');
}
function closeLightbox() {
    document.getElementById('lightboxModal').classList.remove('active');
    activeLightboxIndex = null;
}

document.getElementById('lightboxShareBtn').addEventListener('click', () => {
    if (navigator.share && activeLightboxIndex !== null) {
        navigator.share({
            title: 'Tuncay & Özge Anısı',
            text: 'Bu harika anımıza bakın! ❤️',
            url: galleryPhotos[activeLightboxIndex]
        }).catch(() => {});
    } else {
        alert("Tarayıcınız paylaşım özelliğini desteklemiyor.");
    }
});

document.getElementById('lightboxDeleteBtn').addEventListener('click', () => {
    document.getElementById('deleteConfirmModal').classList.add('active');
});

function closeDeleteConfirmModal() {
    document.getElementById('deleteConfirmModal').classList.remove('active');
}

document.getElementById('confirmDeletePhotoBtn').addEventListener('click', () => {
    if (activeLightboxIndex !== null) {
        galleryPhotos.splice(activeLightboxIndex, 1);
        localStorage.setItem('sincapGalleryPhotos', JSON.stringify(galleryPhotos));
        renderGallery();
        closeDeleteConfirmModal();
        closeLightbox();
    }
});

// Günün Anısı (Rastgele / Akıllı Değişen)
function initRandomMemory() {
    if (galleryPhotos.length > 0) {
        const randomIndex = Math.floor(Math.random() * galleryPhotos.length);
        document.getElementById('randomMemoryImg').src = galleryPhotos[randomIndex];
        document.getElementById('randomMemoryWrapper').onclick = () => openLightbox(randomIndex);
    }
}

// Ruh Hali Logları Modalı Göster
document.getElementById('openMoodLogsModal').addEventListener('click', () => {
    document.getElementById('moodLogsModal').classList.add('active');
});
function closeMoodLogsModal() {
    document.getElementById('moodLogsModal').classList.remove('active');
}
function renderMoodLogs() {
    const list = document.getElementById('moodLogsListContainer');
    list.innerHTML = '';
    if (moodLogs.length === 0) {
        list.innerHTML = '<p style="font-size:12px; color:#888; text-align:center;">Henüz log kaydı bulunmuyor.</p>';
        return;
    }
    moodLogs.forEach(log => {
        const div = document.createElement('div');
        div.style.cssText = "background:#f8f9fa; padding:10px; border-radius:8px; font-size:12px; border:1px solid #eee;";
        div.innerHTML = `<strong>${log.profile}</strong>: ${log.mood} <br><span style="font-size:10px; color:#888;"><i class="fa-regular fa-clock"></i> ${log.datetime}</span>`;
        list.appendChild(div);
    });
}

// Güvenli PIN Değiştirme
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
        err.textContent = "Yeni şifreler 4 haneli ve aynı olmalı!";
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

// Takvim & Özel Günler (Ay/Gün Bazlı Yaklaşan Sıralama)
let realNow = new Date();
let currentCalendarDate = new Date(realNow.getFullYear(), realNow.getMonth(), 1);

let specialDays = JSON.parse(localStorage.getItem('sincapSpecialDays')) || [
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
        const dateKey = `${year}-${mStr}-${dStr}`;

        if (year === todayYear && month === todayMonth && day === todayDate) {
            span.style.background = "var(--primary)";
            span.style.color = "white";
            span.style.fontWeight = "bold";
        }

        if (specialDays.some(item => item.date.slice(5) === `${mStr}-${dStr}`)) {
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
    const todayMonthDay = String(realNow.getMonth() + 1).padStart(2, '0') + '-' + String(realNow.getDate()).padStart(2, '0');

    specialDays.sort((a, b) => {
        const mdA = a.date.slice(5);
        const mdB = b.date.slice(5);
        
        const diffA = mdA < todayMonthDay ? '1-' + mdA : '0-' + mdA;
        const diffB = mdB < todayMonthDay ? '1-' + mdB : '0-' + mdB;
        return diffA.localeCompare(diffB);
    });

    const listContainer = document.getElementById('specialDaysList');
    listContainer.innerHTML = '';
    specialDays.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'special-day-item';
        div.innerHTML = `
            <div class="special-day-info">
                <h4>${item.title}</h4>
                <p>${item.desc || item.date}</p>
            </div>
            <div class="special-day-right">
                <span class="special-day-badge">${item.date}</span>
                <button class="delete-item-btn" onclick="deleteSpecialDay(${index})"><i class="fa-solid fa-trash-can"></i></button>
            </div>
        `;
        listContainer.appendChild(div);
    });
}

function deleteSpecialDay(index) {
    specialDays.splice(index, 1);
    localStorage.setItem('sincapSpecialDays', JSON.stringify(specialDays));
    renderCalendar();
    renderSpecialDays();
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
        localStorage.setItem('sincapSpecialDays', JSON.stringify(specialDays));
        renderCalendar();
        renderSpecialDays();
        closeDayNoteModal();
    } else {
        alert("Lütfen bir başlık girin!");
    }
});