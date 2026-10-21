// 1. Firebase Yapılandırması (Senin Projenin Birebir Bilgileri)
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

db.collection("sarkilar").onSnapshot((snapshot) => {
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
    window.open(sarkiListesi[mevcutIndex].src, "_blank");
}

function oncekiSarki() {
    if (sarkiListesi.length === 0) return;
    mevcutIndex = (mevcutIndex - 1 + sarkiListesi.length) % sarkiListesi.length;
    window.open(sarkiListesi[mevcutIndex].src, "_blank");
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
        listDiv.innerHTML = `<div style="font-size:11px; opacity:0.7; padding:5px;">Henüz eklenmiş ortak şarkı linki yok 🎵</div>`;
        return;
    }

    sarkiListesi.forEach((sarki) => {
        const item = document.createElement("div");
        item.classList.add("song-item");
        
        item.innerHTML = `
            <span class="song-title-click" onclick="linkAc('${sarki.src}')">
                🔗 ${sarki.title}
            </span>
            <button class="delete-song-btn" onclick="sarkiSil('${sarki.id}')">🗑️</button>
        `;
        listDiv.appendChild(item);
    });
}

function linkAc(url) { window.open(url, "_blank"); }
function sarkiEkleModalAcKapat() { toggleModal("addSongModal"); }

function sarkiEkle() {
    const nameInput = document.getElementById("newSongName");
    const urlInput = document.getElementById("newSongUrl");

    if (nameInput.value.trim() === "" || urlInput.value.trim() === "") {
        alert("Lütfen hem şarkı adını hem de linki girin!");
        return;
    }

    db.collection("sarkilar").add({
        title: nameInput.value,
        src: urlInput.value,
        tarih: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        nameInput.value = "";
        urlInput.value = "";
        sarkiEkleModalAcKapat();
    });
}

function sarkiSil(docId) {
    db.collection("sarkilar").doc(docId).delete();
}

// 🔥 FIREBASE İLE CANLI ÖZEL NOTLAR DİNLEYİCİSİ
let notlarListesi = [];

db.collection("notlar").onSnapshot((snapshot) => {
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

// Dynamic Photo Gallery
const toplamFotografSayisi = 16;

function galeriAcKapat() {
    toggleModal("galleryModal");
    if (document.getElementById("galleryModal").classList.contains("acik")) {
        galeriyiCiz();
    }
}

function galeriyiCiz() {
    const grid = document.getElementById("galleryGrid");
    grid.innerHTML = "";
    
    for (let i = 1; i <= toplamFotografSayisi; i++) {
        const img = document.createElement("img");
        img.src = `fotograflarimiz/${i}.jpg`;
        img.alt = "";
        
        img.onerror = function() {
            if (this.src.endsWith(".jpg")) {
                this.src = this.src.replace(".jpg", ".png");
            } else if (this.src.endsWith(".png")) {
                this.src = this.src.replace(".png", ".jpeg");
            } else {
                this.style.display = "none";
            }
        };

        img.onclick = () => resimBuyut(img.src);
        grid.appendChild(img);
    }
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