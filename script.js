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

// Firebase Başlatma
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

// 2. Cloudinary Bilgileri
const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/kokuno0e/image/upload";
const CLOUDINARY_PRESET = "sincap_cloud";

// Dynamic Passcode (PIN)
let OZEL_SIFRE = localStorage.getItem("sincapOzelSifre") || "1508"; 

const pinInputs = document.querySelectorAll('.pin-box');
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

function toggleModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.toggle("acik");
    
    const acikModalVarMi = document.querySelector('.modal.acik');
    if (acikModalVarMi) {
        document.body.classList.add("modal-open");
    } else {
        document.body.classList.remove("modal-open");
    }
}

function sifreKontrol() {
    let girilenSifre = "";
    pinInputs.forEach(input => girilenSifre += input.value);

    if (girilenSifre === OZEL_SIFRE) {
        lockScreen.classList.add("cozuldu");
        errorMsg.style.display = "none";
        document.body.classList.remove("modal-open");
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
        newPass.type = "text";
        confirmPass.type = "text";
        eyeBtn.innerText = "🙈";
    } else {
        newPass.type = "password";
        confirmPass.type = "password";
        eyeBtn.innerText = "👁️";
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

    if (oldPass !== OZEL_SIFRE) {
        errBox.innerText = "Mevcut PIN şifreniz hatalı!";
        errBox.style.display = "block";
        return;
    }
    if (newPass.length !== 4 || isNaN(newPass)) {
        errBox.innerText = "Yeni PIN 4 haneli rakam olmalıdır!";
        errBox.style.display = "block";
        return;
    }
    if (newPass !== confirmPass) {
        errBox.innerText = "Yeni şifreler birbiriyle uyuşmuyor!";
        errBox.style.display = "block";
        return;
    }

    OZEL_SIFRE = newPass;
    localStorage.setItem("sincapOzelSifre", newPass);
    alert("PIN şifreniz başarıyla değiştirildi! 🎉");
    
    document.getElementById("oldPassInput").value = "";
    document.getElementById("newPassInput").value = "";
    document.getElementById("confirmPassInput").value = "";
    sifreDegistirModalAcKapat();
}

// Live Counter
const baslangicTarihi = new Date(2026, 7, 15);

function sayaciGuncelle() {
    const simdi = new Date();
    const fark = simdi - baslangicTarihi;

    const gun = Math.floor(fark / (1000 * 60 * 60 * 24));
    const saat = Math.floor((fark / (1000 * 60 * 60)) % 24);
    const dakika = Math.floor((fark / 1000 / 60) % 60);
    const saniye = Math.floor((fark / 1000) % 60);

    document.getElementById("gun").innerText = gun;
    document.getElementById("saat").innerText = saat;
    document.getElementById("dakika").innerText = dakika;
    document.getElementById("saniye").innerText = saniye;
}

setInterval(sayaciGuncelle, 1000);
sayaciGuncelle();

// Floating Hearts
function kalpOlustur() {
    const heart = document.createElement("div");
    heart.classList.add("heart");
    heart.innerText = "❤️";
    heart.style.left = Math.random() * 100 + "vw";
    heart.style.animationDuration = Math.random() * 3 + 3 + "s";
    heart.style.fontSize = Math.random() * 15 + 15 + "px";
    
    document.getElementById("bgAnimation").appendChild(heart);
    setTimeout(() => { heart.remove(); }, 6000);
}
setInterval(kalpOlustur, 400);

function kalpPatlat() {
    for (let i = 0; i < 15; i++) { setTimeout(kalpOlustur, i * 50); }
    const panel = document.getElementById("menuPanel");
    panel.classList.toggle("acik");
}

// Music Player
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

// 🔥 FIREBASE İLE CANLI ŞARKI LİSTESİ DİNLEYİCİSİ
let sarkiListesi = [];
let secilenSarkiAdi = "";

db.collection("sarkilar").orderBy("tarih", "desc").onSnapshot((snapshot) => {
    sarkiListesi = [];
    snapshot.forEach((doc) => {
        sarkiListesi.push({ id: doc.id, ...doc.data() });
    });
    sarkiListesiniCiz();
});

let mevcutIndex = -1;
function sonrakiSarki() {
    if (sarkiListesi.length === 0) return;
    mevcutIndex = (mevcutIndex + 1) % sarkiListesi.length;
    platformSecimAc(sarkiListesi[mevcutIndex].title);
}

function oncekiSarki() {
    if (sarkiListesi.length === 0) return;
    mevcutIndex = (mevcutIndex - 1 + sarkiListesi.length) % sarkiListesi.length;
    platformSecimAc(sarkiListesi[mevcutIndex].title);
}

function sarkiListesiAcKapat() {
    toggleModal("musicModal");
    if (document.getElementById("musicModal").classList.contains("acik")) {
        sarkiListesiniCiz();
    }
}

function sarkiListesiniCiz() {
    const listDiv = document.getElementById("songList");
    if (!listDiv) return;
    listDiv.innerHTML = "";

    if (sarkiListesi.length === 0) {
        listDiv.innerHTML = `<div style="font-size:11px; opacity:0.7; padding:5px;">Henüz eklenmiş ortak şarkı yok 🎵</div>`;
        return;
    }

    sarkiListesi.forEach((sarki) => {
        const item = document.createElement("div");
        item.classList.add("song-item");
        
        item.innerHTML = `
            <span class="song-title-click" onclick="platformSecimAc('${sarki.title}')">
                🎵 ${sarki.title}
            </span>
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

function platformModalAcKapat() {
    toggleModal("platformSelectModal");
}

function openPlatform(platform) {
    const encoded = encodeURIComponent(secilenSarkiAdi);
    let url = "";

    if (platform === "spotify") {
        url = `https://open.spotify.com/search/${encoded}`;
    } else if (platform === "ytmusic") {
        url = `https://music.youtube.com/search?q=${encoded}`;
    } else if (platform === "youtube") {
        url = `https://www.youtube.com/results?search_query=${encoded}`;
    }

    window.open(url, "_blank");
    platformModalAcKapat();
}

function sarkiEkleModalAcKapat() { toggleModal("addSongModal"); }

function sarkiEkle() {
    const nameInput = document.getElementById("newSongName");

    if (nameInput.value.trim() === "") {
        alert("Lütfen şarkı/sanatçı adını girin!");
        return;
    }

    db.collection("sarkilar").add({
        title: nameInput.value,
        tarih: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        nameInput.value = "";
        sarkiEkleModalAcKapat();
    });
}

function sarkiSil(docId) {
    db.collection("sarkilar").doc(docId).delete();
}

// 🔥 FIREBASE İLE CANLI ÖZEL NOTLAR DİNLEYİCİSİ
let notlarListesi = [];

db.collection("notlar").orderBy("tarih", "desc").onSnapshot((snapshot) => {
    notlarListesi = [];
    snapshot.forEach((doc) => {
        notlarListesi.push({ id: doc.id, ...doc.data() });
    });
    notlariCiz();
});

function notlarAcKapat() {
    toggleModal("notesModal");
    if (document.getElementById("notesModal").classList.contains("acik")) {
        notlariCiz();
    }
}

function notlariCiz() {
    const listDiv = document.getElementById("notesList");
    if (!listDiv) return;
    listDiv.innerHTML = "";

    if (notlarListesi.length === 0) {
        listDiv.innerHTML = `<div style="font-size:11px; opacity:0.7; padding:5px;">Henüz özel not eklenmemiş 💌</div>`;
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

    if (noteInput.value.trim() === "") {
        alert("Lütfen bir not yazın!");
        return;
    }

    db.collection("notlar").add({
        metin: noteInput.value,
        tarih: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        noteInput.value = "";
        notEkleModalAcKapat();
    });
}

function notSil(docId) {
    db.collection("notlar").doc(docId).delete();
}

// 🔥 CLOUDINARY + FIREBASE İLE CANLI DİNAMİK FOTOĞRAF GALERİSİ
let fotograflarListesi = [];

db.collection("fotograflar").orderBy("tarih", "desc").onSnapshot((snapshot) => {
    fotograflarListesi = [];
    snapshot.forEach((doc) => {
        fotograflarListesi.push({ id: doc.id, ...doc.data() });
    });
    galeriyiCiz();
});

function galeriAcKapat() {
    toggleModal("galleryModal");
    if (document.getElementById("galleryModal").classList.contains("acik")) {
        galeriyiCiz();
    }
}

function galeriyiCiz() {
    const grid = document.getElementById("galleryGrid");
    if (!grid) return;
    grid.innerHTML = "";

    if (fotograflarListesi.length === 0) {
        grid.innerHTML = `<div style="grid-column: 1 / -1; font-size:11px; opacity:0.7; padding:10px;">Henüz fotoğraf yüklenmemiş 📸</div>`;
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

    fetch(CLOUDINARY_URL, {
        method: "POST",
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.secure_url) {
            db.collection("fotograflar").add({
                url: data.secure_url,
                tarih: firebase.firestore.FieldValue.serverTimestamp()
            }).then(() => {
                statusText.style.display = "none";
                event.target.value = "";
            });
        } else {
            alert("Fotoğraf yükleme hatası!");
            statusText.style.display = "none";
        }
    })
    .catch(error => {
        console.error("Yükleme hatası:", error);
        alert("Fotoğraf yüklenemedi!");
        statusText.style.display = "none";
    });
}

function fotografSil(docId) {
    if (!confirm("Bu fotoğrafı silmek istediğinize emin misiniz?")) return;
    db.collection("fotograflar").doc(docId).delete();
}

function resimBuyut(src) {
    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightboxImg");
    lightboxImg.src = src;
    lightbox.classList.add("acik");
}

function lightboxKapat() {
    document.getElementById("lightbox").classList.remove("acik");
}