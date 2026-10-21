// 1. Firebase Yapılandırması
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

let OZEL_SIFRE = localStorage.getItem("sincapOzelSifre") || "1508"; 

const pinInputs = document.querySelectorAll('.pin-box');
const pinStage = document.getElementById("pinStage");
const taskStage = document.getElementById("taskStage");
const lockScreen = document.getElementById("lockScreen");
const errorMsg = document.getElementById("passError");

pinInputs.forEach((input, index) => {
    input.addEventListener('input', () => {
        input.value = input.value.replace(/[^0-9]/g, '');
        if (input.value !== '') {
            if (index < pinInputs.length - 1) {
                setTimeout(() => { pinInputs[index + 1].focus(); }, 10);
            } else {
                sifreKontrol();
            }
        }
    });

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && input.value === '' && index > 0) {
            setTimeout(() => { pinInputs[index - 1].focus(); }, 10);
        }
    });
});

function sifreKontrol() {
    let girilenSifre = "";
    pinInputs.forEach(input => girilenSifre += input.value);

    if (girilenSifre === OZEL_SIFRE) {
        errorMsg.style.display = "none";
        pinStage.style.display = "none";
        taskStage.style.display = "block";
        randomTaskInit();
    } else {
        errorMsg.style.display = "block";
        pinInputs.forEach(input => input.value = "");
        pinInputs[0].focus();
    }
}

function yeniSifreleriGosterGizle(eyeBtn) {
    const newPass = document.getElementById("newPassInput");
    const confirmPass = document.getElementById("confirmPassInput");
    if (newPass.type === "password") {
        newPass.type = "text"; confirmPass.type = "text"; eyeBtn.innerText = "🙈";
    } else {
        newPass.type = "password"; confirmPass.type = "password"; eyeBtn.innerText = "👁️";
    }
}

function sifreDegistirModalAcKapat() {
    toggleModal("changePassModal");
    document.getElementById("changePassError").style.display = "none";
}

function sifreGuncelle() {
    const oldPass = document.getElementById("oldPassInput").value;
    const newPass = document.getElementById("newPassInput").value;
    const confirmPass = document.getElementById("confirmPassInput").value;
    const errBox = document.getElementById("changePassError");
    errBox.style.display = "none";

    if (oldPass !== OZEL_SIFRE) { errBox.innerText = "Mevcut PIN şifreniz hatalı!"; errBox.style.display = "block"; return; }
    if (newPass.length !== 4 || isNaN(newPass)) { errBox.innerText = "Yeni PIN 4 haneli rakam olmalıdır!"; errBox.style.display = "block"; return; }
    if (newPass !== confirmPass) { errBox.innerText = "Yeni şifreler birbiriyle uyuşmuyor!"; errBox.style.display = "block"; return; }

    OZEL_SIFRE = newPass;
    localStorage.setItem("sincapOzelSifre", newPass);
    alert("PIN şifreniz başarıyla değiştirildi! 🎉");
    sifreDegistirModalAcKapat();
}

let caughtSquirrels = 0;
let currentMood = "🥰 Çok Mutluyum!";
let currentMoodPercent = 50;
let selectedUser = "Tuncay";

function selectUser(user) {
    selectedUser = user;
    document.getElementById("btnUser1").classList.toggle("active", user === 'Tuncay');
    document.getElementById("btnUser2").classList.toggle("active", user === 'Yavru Sincap');
}

function randomTaskInit() {
    const isRareCatch = Math.random() < 0.2;
    document.getElementById("taskSliderGame").style.display = "none";
    document.getElementById("taskCatchGame").style.display = "none";

    if (isRareCatch) {
        document.getElementById("taskIcon").innerText = "🐿️";
        document.getElementById("taskTitle").innerText = "Nadir Sincap Yakalama Görevi";
        document.getElementById("taskCatchGame").style.display = "block";
        spawnSquirrels();
    } else {
        document.getElementById("taskIcon").innerText = "🎭";
        document.getElementById("taskTitle").innerText = "Ruh Hali Görevi";
        document.getElementById("taskSliderGame").style.display = "block";
        checkMoodSlider(50);
    }
}

function spawnSquirrels() {
    const area = document.getElementById("catchArea");
    area.innerHTML = "";
    caughtSquirrels = 0;
    document.getElementById("catchCount").innerText = 0;

    for (let i = 0; i < 3; i++) {
        const sq = document.createElement("span");
        sq.classList.add("clickable-squirrel");
        sq.innerText = "🐿️";
        sq.style.top = Math.floor(Math.random() * 65) + "px";
        sq.style.left = Math.floor(Math.random() * 80) + "%";
        sq.onclick = function() {
            sq.remove();
            caughtSquirrels++;
            document.getElementById("catchCount").innerText = caughtSquirrels;
            if (caughtSquirrels >= 3) { setTimeout(kilitCoz, 200); }
        };
        area.appendChild(sq);
    }
}

function checkMoodSlider(val) {
    currentMoodPercent = val;
    const textEl = document.getElementById("moodStatusText");
    const percentEl = document.getElementById("moodPercentBadge");
    
    percentEl.innerText = `%${val}`;

    if (val <= 30) {
        currentMood = "😡 Çok Sinirliyim!";
        textEl.style.color = "#ff4b5c";
    } else if (val <= 70) {
        currentMood = "🥺 Biraz Üzgünüm / Kırgınım";
        textEl.style.color = "#ffdd59";
    } else {
        currentMood = "🥰 Çok Mutluyum!";
        textEl.style.color = "#02c39a";
    }
    textEl.innerText = currentMood;
}

function saveMoodAndEnter() {
    db.collection("ruh_hali").add({
        kisi: selectedUser,
        durum: currentMood,
        yuzde: currentMoodPercent,
        tarih: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => { kilitCoz(); });
}

function kilitCoz() {
    lockScreen.classList.add("cozuldu");
    document.body.classList.remove("modal-open");
}

function toggleModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.toggle("acik");
    if (document.querySelector('.modal.acik')) {
        document.body.classList.add("modal-open");
    } else {
        document.body.classList.remove("modal-open");
    }
}

// ⏳ Özel Günler
let ozelGunlerListesi = [];
db.collection("ozel_gunler").orderBy("tarih", "asc").onSnapshot((snapshot) => {
    ozelGunlerListesi = [];
    snapshot.forEach((doc) => { ozelGunlerListesi.push({ id: doc.id, ...doc.data() }); });
    ozelGunCiz();
});

function ozelGunlerAcKapat() {
    toggleModal("ozelGunModal");
    if (document.getElementById("ozelGunModal").classList.contains("acik")) { ozelGunCiz(); }
}

function ozelGunCiz() {
    const listDiv = document.getElementById("ozelGunList");
    if (!listDiv) return;
    listDiv.innerHTML = "";
    if (ozelGunlerListesi.length === 0) {
        listDiv.innerHTML = `<div style="font-size:10px; opacity:0.7; padding:4px;">Henüz özel gün eklenmemiş ⏳</div>`;
        return;
    }
    const simdi = new Date();
    ozelGunlerListesi.forEach((gun) => {
        const item = document.createElement("div");
        item.classList.add("song-item");
        let hedefTarih = new Date(gun.tarih);
        let farkGun = Math.ceil((hedefTarih - simdi) / (1000 * 60 * 60 * 24));
        let kalanStr = farkGun >= 0 ? `${farkGun} gün kaldı 🎉` : `Kutlandı ❤️`;
        item.innerHTML = `
            <div style="display:flex; flex-direction:column; text-align:left;">
                <span style="font-weight:700; font-size:11px; color:#ffdd59;">✨ ${gun.baslik}</span>
                <span style="font-size:10px; margin-top:2px;">📅 ${gun.tarih} (${kalanStr})</span>
            </div>
            <button class="delete-song-btn" onclick="ozelGunSil('${gun.id}')">🗑️</button>
        `;
        listDiv.appendChild(item);
    });
}

function ozelGunEkleModalAcKapat() { toggleModal("addOzelGunModal"); }

function ozelGunEkle() {
    const baslikInput = document.getElementById("yeniGunBaslik");
    const tarihInput = document.getElementById("yeniGunTarih");
    if (baslikInput.value.trim() === "" || !tarihInput.value) return;
    db.collection("ozel_gunler").add({
        baslik: baslikInput.value,
        tarih: tarihInput.value,
        olusturma: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        baslikInput.value = "";
        tarihInput.value = "";
        ozelGunEkleModalAcKapat();
    });
}

function ozelGunSil(docId) {
    if (!confirm("Bu özel günü silmek istediğine emin misin?")) return;
    db.collection("ozel_gunler").doc(docId).delete();
}

// 🎡 Çarkıfelek
const surpriseCards = [
    "🤗 Bugün Tuncay sana kocaman sarılma borçlu!",
    "🍰 Yavru sincap sana en sevdiğin tatlıyı ısmarlayacak!",
    "💆‍♂️ 10 dakikalık masaj hakkı kazandın!",
    "🎬 Bu akşamki filmi sen seçiyorsun!",
    "🍕 En sevdiğiniz yemeği söyleme sırası sende!",
    "💋 5 saniyelik uzun öpücük hakkı!",
    "☕ Sabah kahvesini diğeri hazırlayacak!",
    "🎵 Gün boyunca sadece senin seçtiğin şarkılar çalacak!",
    "💌 Telefonuna en tatlı iltifat mesajı yazılacak!"
];

function wheelAcKapat() { toggleModal("wheelModal"); }

let isSpinning = false;
function spinWheel() {
    if (isSpinning) return;
    isSpinning = true;
    const disk = document.getElementById("wheelDisk");
    const spinBtn = document.getElementById("spinBtn");
    const surpriseText = document.getElementById("surpriseText");
    spinBtn.disabled = true;
    surpriseText.innerText = "Çark dönüyor... 🎯";
    const randomDegree = Math.floor(Math.random() * 720) + 1080;
    disk.style.transform = `rotate(${randomDegree}deg)`;
    setTimeout(() => {
        const randomCard = surpriseCards[Math.floor(Math.random() * surpriseCards.length)];
        surpriseText.innerText = randomCard;
        spinBtn.disabled = false;
        isSpinning = false;
    }, 3000);
}

// Sayaç
const baslangicTarihi = new Date(2026, 7, 15);
function sayaciGuncelle() {
    const simdi = new Date();
    const fark = simdi - baslangicTarihi;
    document.getElementById("gun").innerText = Math.floor(fark / (1000 * 60 * 60 * 24));
    document.getElementById("saat").innerText = Math.floor((fark / (1000 * 60 * 60)) % 24);
    document.getElementById("dakika").innerText = Math.floor((fark / 1000 / 60) % 60);
    document.getElementById("saniye").innerText = Math.floor((fark / 1000) % 60);
}
setInterval(sayaciGuncelle, 1000);
sayaciGuncelle();

// Kalpler
function kalpOlustur() {
    const heart = document.createElement("div");
    heart.classList.add("heart");
    heart.innerText = "❤️";
    heart.style.left = Math.random() * 100 + "vw";
    heart.style.animationDuration = Math.random() * 3 + 2 + "s";
    document.getElementById("bgAnimation").appendChild(heart);
    setTimeout(() => { heart.remove(); }, 5000);
}
setInterval(kalpOlustur, 600);

function kalpPatlat() {
    for (let i = 0; i < 10; i++) { setTimeout(kalpOlustur, i * 40); }
    document.getElementById("menuPanel").classList.toggle("acik");
}

// Müzik
const muzik = document.getElementById("bgMusic");
const playBtn = document.getElementById("playBtn");
const muteBtn = document.getElementById("muteBtn");
const volumeSlider = document.getElementById("volumeSlider");

if (muzik) { muzik.volume = 0.2; }

function muzikOynatDuraklat() {
    if (!muzik) return;
    if (muzik.paused) {
        muzik.play().then(() => { playBtn.innerText = "⏸️"; }).catch(err => console.log(err));
    } else {
        muzik.pause();
        playBtn.innerText = "▶️";
    }
}

function sesAyarla(deger) {
    muzik.volume = deger;
    muteBtn.innerText = deger == 0 ? "🔇" : "🔊";
}

function sesSustur() {
    if (muzik.muted) {
        muzik.muted = false;
        muteBtn.innerText = "🔊";
        volumeSlider.value = muzik.volume;
    } else {
        muzik.muted = true;
        muteBtn.innerText = "🔇";
        volumeSlider.value = 0;
    }
}

// Ruh Hali Logları
let moodListesi = [];
db.collection("ruh_hali").orderBy("tarih", "desc").onSnapshot((snapshot) => {
    moodListesi = [];
    snapshot.forEach((doc) => { moodListesi.push({ id: doc.id, ...doc.data() }); });
    moodCiz();
});

function moodAcKapat() {
    toggleModal("moodModal");
    if (document.getElementById("moodModal").classList.contains("acik")) { moodCiz(); }
}

function moodCiz() {
    const listDiv = document.getElementById("moodList");
    if (!listDiv) return;
    listDiv.innerHTML = "";
    if (moodListesi.length === 0) {
        listDiv.innerHTML = `<div style="font-size:10px; opacity:0.7; padding:4px;">Kayıt yok 🎭</div>`;
        return;
    }
    moodListesi.forEach((m) => {
        const item = document.createElement("div");
        item.classList.add("song-item");
        let zamanStr = m.tarih ? new Date(m.tarih.seconds * 1000).toLocaleString('tr-TR', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' }) : 'Az önce';
        let yuzdeStr = m.yuzde !== undefined ? ` (%${m.yuzde})` : '';
        item.innerHTML = `
            <div style="display:flex; flex-direction:column; text-align:left;">
                <span style="font-weight:700; font-size:11px; color:#ffdd59;">👤 ${m.kisi || 'Sincap'}</span>
                <span style="font-size:10px; margin-top:2px;">${m.durum}${yuzdeStr}</span>
                <span style="font-size:8px; opacity:0.6; margin-top:1px;">🕒 ${zamanStr}</span>
            </div>
            <button class="delete-song-btn" onclick="moodSil('${m.id}')">🗑️</button>
        `;
        listDiv.appendChild(item);
    });
}

function moodSil(docId) { db.collection("ruh_hali").doc(docId).delete(); }

// Şarkı Listesi
let sarkiListesi = [];
let secilenSarkiAdi = "";
db.collection("sarkilar").orderBy("tarih", "desc").onSnapshot((snapshot) => {
    sarkiListesi = [];
    snapshot.forEach((doc) => { sarkiListesi.push({ id: doc.id, ...doc.data() }); });
    sarkiListesiniCiz();
});

function sarkiListesiAcKapat() {
    toggleModal("musicModal");
    if (document.getElementById("musicModal").classList.contains("acik")) { sarkiListesiniCiz(); }
}

function sarkiListesiniCiz() {
    const listDiv = document.getElementById("songList");
    if (!listDiv) return;
    listDiv.innerHTML = "";
    if (sarkiListesi.length === 0) {
        listDiv.innerHTML = `<div style="font-size:10px; opacity:0.7; padding:4px;">Şarkı yok 🎵</div>`;
        return;
    }
    sarkiListesi.forEach((sarki) => {
        const item = document.createElement("div");
        item.classList.add("song-item");
        item.innerHTML = `
            <span class="song-title-click" onclick="platformSecimAc('${sarki.title}')">🎵 ${sarki.title}</span>
            <button class="delete-song-btn" onclick="sarkiSil('${sarki.id}')">🗑️</button>
        `;
        listDiv.appendChild(item);
    });
}

function platformSecimAc(title) {
    secilenSarkiAdi = title;
    document.getElementById("selectedSongName").innerText = title;
    toggleModal("platformSelectModal");
}

function platformModalAcKapat() { toggleModal("platformSelectModal"); }

function openPlatform(platform) {
    const encoded = encodeURIComponent(secilenSarkiAdi);
    let url = "";
    if (platform === "spotify") url = `https://open.spotify.com/search/${encoded}`;
    else if (platform === "ytmusic") url = `https://music.youtube.com/search?q=${encoded}`;
    else if (platform === "youtube") url = `https://www.youtube.com/results?search_query=${encoded}`;
    window.open(url, "_blank");
    platformModalAcKapat();
}

function sarkiEkleModalAcKapat() { toggleModal("addSongModal"); }

function sarkiEkle() {
    const nameInput = document.getElementById("newSongName");
    if (nameInput.value.trim() === "") return;
    db.collection("sarkilar").add({
        title: nameInput.value,
        tarih: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        nameInput.value = "";
        sarkiEkleModalAcKapat();
    });
}

function sarkiSil(docId) { db.collection("sarkilar").doc(docId).delete(); }

// Yapılacaklar
let todoListesi = [];
db.collection("todolist").orderBy("tarih", "desc").onSnapshot((snapshot) => {
    todoListesi = [];
    snapshot.forEach((doc) => { todoListesi.push({ id: doc.id, ...doc.data() }); });
    todoCiz();
});

function todoAcKapat() {
    toggleModal("todoModal");
    if (document.getElementById("todoModal").classList.contains("acik")) { todoCiz(); }
}

function todoCiz() {
    const listDiv = document.getElementById("todoList");
    if (!listDiv) return;
    listDiv.innerHTML = "";
    if (todoListesi.length === 0) {
        listDiv.innerHTML = `<div style="font-size:10px; opacity:0.7; padding:4px;">Plan yok 📋</div>`;
        return;
    }
    todoListesi.forEach((todo) => {
        const item = document.createElement("div");
        item.classList.add("song-item");
        item.innerHTML = `
            <span class="song-title-click ${todo.tamamlandi ? 'todo-done' : ''}" onclick="todoDurumDegistir('${todo.id}', ${!todo.tamamlandi})">
                ${todo.tamamlandi ? '✅' : '📌'} ${todo.metin}
            </span>
            <button class="delete-song-btn" onclick="todoSil('${todo.id}')">🗑️</button>
        `;
        listDiv.appendChild(item);
    });
}

function todoEkleModalAcKapat() { toggleModal("addTodoModal"); }

function todoEkle() {
    const input = document.getElementById("newTodoText");
    if (input.value.trim() === "") return;
    db.collection("todolist").add({
        metin: input.value,
        tamamlandi: false,
        tarih: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        input.value = "";
        todoEkleModalAcKapat();
    });
}

function todoDurumDegistir(docId, yeniDurum) {
    db.collection("todolist").doc(docId).update({ tamamlandi: yeniDurum });
}

function todoSil(docId) { db.collection("todolist").doc(docId).delete(); }

// Özel Notlar
let notlarListesi = [];
db.collection("notlar").orderBy("tarih", "desc").onSnapshot((snapshot) => {
    notlarListesi = [];
    snapshot.forEach((doc) => { notlarListesi.push({ id: doc.id, ...doc.data() }); });
    notlariCiz();
});

function notlarAcKapat() {
    toggleModal("notesModal");
    if (document.getElementById("notesModal").classList.contains("acik")) { notlariCiz(); }
}

function notlariCiz() {
    const listDiv = document.getElementById("notesList");
    if (!listDiv) return;
    listDiv.innerHTML = "";
    if (notlarListesi.length === 0) {
        listDiv.innerHTML = `<div style="font-size:10px; opacity:0.7; padding:4px;">Not yok 💌</div>`;
        return;
    }
    notlarListesi.forEach((not) => {
        const item = document.createElement("div");
        item.classList.add("song-item");
        item.innerHTML = `
            <span class="song-title-click">${not.metin}</span>
            <button class="delete-song-btn" onclick="notSil('${not.id}')">🗑️</button>
        `;
        listDiv.appendChild(item);
    });
}

function notEkleModalAcKapat() { toggleModal("addNoteModal"); }

function notEkle() {
    const noteInput = document.getElementById("newNoteText");
    if (noteInput.value.trim() === "") return;
    db.collection("notlar").add({
        metin: noteInput.value,
        tarih: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        noteInput.value = "";
        notEkleModalAcKapat();
    });
}

function notSil(docId) { db.collection("notlar").doc(docId).delete(); }

// Galeri
let fotograflarListesi = [];
db.collection("fotograflar").orderBy("tarih", "desc").onSnapshot((snapshot) => {
    fotograflarListesi = [];
    snapshot.forEach((doc) => { fotograflarListesi.push({ id: doc.id, ...doc.data() }); });
    galeriyiCiz();
    updateDailyWidget();
});

function updateDailyWidget() {
    const imgEl = document.getElementById("dailyWidgetImg");
    if (!imgEl) return;
    if (fotograflarListesi.length > 0) {
        const randomImg = fotograflarListesi[Math.floor(Math.random() * fotograflarListesi.length)].url;
        imgEl.src = randomImg;
    }
}

function galeriAcKapat() {
    toggleModal("galleryModal");
    if (document.getElementById("galleryModal").classList.contains("acik")) { galeriyiCiz(); }
}

function galeriyiCiz() {
    const grid = document.getElementById("galleryGrid");
    if (!grid) return;
    grid.innerHTML = "";
    if (fotograflarListesi.length === 0) {
        grid.innerHTML = `<div style="grid-column: 1 / -1; font-size:10px; opacity:0.7; padding:10px;">Fotoğraf yok 📸</div>`;
        return;
    }
    fotograflarListesi.forEach((foto) => {
        const card = document.createElement("div");
        card.classList.add("gallery-card");
        card.innerHTML = `
            <img src="${foto.url}" onclick="resimBuyut('${foto.url}')">
            <button class="delete-photo-btn" onclick="fotografSil('${foto.id}')">🗑️</button>
        `;
        grid.appendChild(card);
    });
}

function fotografYukle(event) {
    const file = event.target.files[0];
    if (!file) return;
    const statusText = document.getElementById("uploadStatus");
    statusText.style.display = "block";
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_PRESET);

    fetch(CLOUDINARY_URL, { method: "POST", body: formData })
    .then(res => res.json())
    .then(data => {
        if (data.secure_url) {
            db.collection("fotograflar").add({
                url: data.secure_url,
                tarih: firebase.firestore.FieldValue.serverTimestamp()
            }).then(() => {
                statusText.style.display = "none";
                event.target.value = "";
            });
        }
    })
    .catch(() => { statusText.style.display = "none"; });
}

function fotografSil(docId) {
    if (!confirm("Silmek istediğine emin misin?")) return;
    db.collection("fotograflar").doc(docId).delete();
}

function resimBuyut(src) {
    document.getElementById("lightboxImg").src = src;
    document.getElementById("lightbox").classList.add("acik");
}

function lightboxKapat() {
    document.getElementById("lightbox").classList.remove("acik");
}