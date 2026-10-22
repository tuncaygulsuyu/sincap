function goScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

// Modal arka planına tıklayınca kapatma fonksiyonu
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
    startAutoFadeInMusic();
}

document.getElementById('logoutBtn').addEventListener('click', () => {
    audioPlayer.pause();
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

document.getElementById('loveBtn').addEventListener('click', () => {
    alert("Seni çok ama çok seviyorum Yavru Sincabım! ❤️🐿️");
});

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
        
        let step = 0;
        const volumes = [0.1, 0.2, 0.3, 0.4, 0.5];
        const fadeInterval = setInterval(() => {
            if (step < volumes.length && !audioPlayer.paused) {
                audioPlayer.volume = volumes[step];
                step++;
            } else {
                clearInterval(fadeInterval);
            }
        }, 3000);
    }).catch(() => {
        console.log("Tarayıcı otomatik oynatmayı kısıtladı.");
    });
}

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

let customWheelOptions = JSON.parse(localStorage.getItem('sincapCustomWheel')) || [
    "Film İzle 🎬", "Kahve İç ☕", "Yürüyüş Yap 🌳", "Sürpriz Öpücük 💋"
];
let wheelRotationAngle = 0;

function openCustomWheelAppModal() {
    document.getElementById('customWheelAppModal').classList.add('active');
    renderWheelOptionsList();
    drawMiniWheel();
}
function closeCustomWheelAppModal() {
    document.getElementById('customWheelAppModal').classList.remove('active');
}

function renderWheelOptionsList() {
    const container = document.getElementById('wheelOptionsListContainer');
    container.innerHTML = '';
    customWheelOptions.forEach((opt, index) => {
        const div = document.createElement('div');
        div.style.cssText = "display:flex; justify-content:space-between; align-items:center; background:var(--bg-gradient); padding:6px 10px; border-radius:6px; font-size:12px; border:1px solid var(--border-color);";
        div.innerHTML = `<span>${opt}</span> <button class="delete-item-btn" onclick="deleteWheelOption(${index})" style="font-size:12px;"><i class="fa-solid fa-trash-can"></i></button>`;
        container.appendChild(div);
    });
}

function addWheelOption() {
    const inp = document.getElementById('newWheelOptionInput');
    const val = inp.value.trim();
    if (val) {
        customWheelOptions.push(val);
        localStorage.setItem('sincapCustomWheel', JSON.stringify(customWheelOptions));
        inp.value = '';
        renderWheelOptionsList();
        drawMiniWheel();
    }
}

function deleteWheelOption(index) {
    if (customWheelOptions.length <= 2) {
        alert("Çarkta en az 2 seçenek kalmalıdır!");
        return;
    }
    customWheelOptions.splice(index, 1);
    localStorage.setItem('sincapCustomWheel', JSON.stringify(customWheelOptions));
    renderWheelOptionsList();
    drawMiniWheel();
}

function drawMiniWheel() {
    const wheel = document.getElementById('dynamicInteractiveWheel');
    wheel.innerHTML = '';
    const sliceAngle = 360 / customWheelOptions.length;
    const colors = ['#ff6b81', '#ff4757', '#2ed573', '#1e90ff', '#ffa502', '#9b59b6'];

    customWheelOptions.forEach((opt, i) => {
        const slice = document.createElement('div');
        slice.style.cssText = `position:absolute; top:0; left:0; width:50%; height:50%; transform-origin:100% 100%; transform: rotate(${i * sliceAngle}deg) skewY(-30deg); background: ${colors[i % colors.length]}; display:flex; align-items:center; justify-content:center; font-size:7px; font-weight:700; color:#fff; text-align:center; padding-left:8px;`;
        slice.innerHTML = `<span>${opt}</span>`;
        wheel.appendChild(slice);
    });
}

function spinDynamicWheel() {
    if (customWheelOptions.length === 0) return;
    const wheel = document.getElementById('dynamicInteractiveWheel');
    const randomAdd = Math.floor(Math.random() * 360) + 1440;
    wheelRotationAngle += randomAdd;
    wheel.style.transform = `rotate(${wheelRotationAngle}deg)`;

    setTimeout(() => {
        const actualDeg = wheelRotationAngle % 360;
        const sliceAngle = 360 / customWheelOptions.length;
        const index = Math.floor(((360 - (actualDeg % 360)) % 360) / sliceAngle) % customWheelOptions.length;
        document.getElementById('wheelResultDisplay').textContent = `✨ Sonuç: ${customWheelOptions[index]} ✨`;
    }, 4000);
}

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

// Düzeltilmiş Galeri Yükleme Akışı
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
                galleryPhotos.push(event.target.result);
                resolve();
            };
            reader.readAsDataURL(file);
        });
    }

    localStorage.setItem('sincapGalleryPhotos', JSON.stringify(galleryPhotos));
    indicator.style.display = 'none';
    renderGallery();
    e.target.value = '';
}

document.getElementById('fileInput').addEventListener('change', (e) => handleImageUpload(e, false));
document.getElementById('cameraInput').addEventListener('change', (e) => handleImageUpload(e, true));

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

function initRandomMemory() {
    if (galleryPhotos.length > 0) {
        const randomIndex = Math.floor(Math.random() * galleryPhotos.length);
        document.getElementById('randomMemoryImg').src = galleryPhotos[randomIndex];
        document.getElementById('randomMemoryWrapper').onclick = () => openLightbox(randomIndex);
    }
}

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

        if (year === todayYear && month === todayMonth && day === todayDate) {
            span.style.background = "var(--primary)";
            span.style.color = "white";
            span.style.fontWeight = "bold";
        }

        if (specialDays.some(item => item.date.slice(5) === `${mStr}-${dStr}`)) {
            span.classList.add('has-event');
        }

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
                <p>${item.desc || item.date} (${item.date})</p>
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

// Gelişmiş Pratik Tarih Seçici (Önce Yıl/Ay, Sonra Gün)
function populateDateSelectors() {
    const yearSelect = document.getElementById('selectYear');
    const monthSelect = document.getElementById('selectMonth');
    const daySelect = document.getElementById('selectDay');

    yearSelect.innerHTML = '';
    monthSelect.innerHTML = '';

    const currentYear = realNow.getFullYear();
    for (let y = currentYear; y >= 2000; y--) {
        const opt = document.createElement('option');
        opt.value = y;
        opt.textContent = y;
        if (y === currentYear) opt.selected = true;
        yearSelect.appendChild(opt);
    }

    const monthsNames = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
    monthsNames.forEach((m, idx) => {
        const opt = document.createElement('option');
        opt.value = idx + 1;
        opt.textContent = m;
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

    const y = parseInt(yearSelect.value);
    const m = parseInt(monthSelect.value);
    const totalDays = new Date(y, m, 0).getDate();

    const selectedDayVal = daySelect.value;
    daySelect.innerHTML = '';
    for (let d = 1; d <= totalDays; d++) {
        const opt = document.createElement('option');
        opt.value = d;
        opt.textContent = d;
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
    const title = document.getElementById('specialDayTitleInput').value;
    const y = document.getElementById('selectYear').value;
    const m = String(document.getElementById('selectMonth').value).padStart(2, '0');
    const d = String(document.getElementById('selectDay').value).padStart(2, '0');
    const desc = document.getElementById('specialDayDescInput').value;

    if (title) {
        const dateStr = `${y}-${m}-${d}`;
        specialDays.push({ title, date: dateStr, desc });
        localStorage.setItem('sincapSpecialDays', JSON.stringify(specialDays));
        renderCalendar();
        renderSpecialDays();
        closeAddSpecialDayModal();
    } else {
        alert("Lütfen etkinlik adı girin!");
    }
});