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

// Kalp Efekti
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

// Ana Müzik Elemanları
const muzik = document.getElementById("bgMusic");
const playBtn = document.getElementById("playBtn");
const muteBtn = document.getElementById("muteBtn");
const volumeSlider = document.getElementById("volumeSlider");

// Varsayılan Ses Seviyesini %20 (0.2) Yap
if (muzik) {
    muzik.volume = 0.2;
}

// Kayıtlı Şarkı Linkleri Listesi (Tarayıcı Hafızasından Alınır)
let sarkiListesi = JSON.parse(localStorage.getItem("sincapEklenenSarkilar")) || [];

function muzikOynatDuraklat() {
    if (!muzik) return;
    if (muzik.paused) {
        muzik.play().then(() => {
            playBtn.innerText = "⏸️";
        }).catch(err => console.log("Oynatma hatası:", err));
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

// İleri / Geri butonları eklenen linkler arasında gezsin
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

// Menüdeki Şarkı Listesini Aç / Kapat & Çiz
function sarkiListesiAcKapat() {
    const container = document.getElementById("playlistContainer");
    container.classList.toggle("acik");
    sarkiListesiniCiz();
}

function sarkiListesiniCiz() {
    const listDiv = document.getElementById("songList");
    listDiv.innerHTML = "";

    if (sarkiListesi.length === 0) {
        listDiv.innerHTML = `<div style="font-size:11px; opacity:0.7; padding:5px;">Henüz eklenmiş ortak şarkı linki yok 🎵</div>`;
        return;
    }

    sarkiListesi.forEach((sarki, index) => {
        const item = document.createElement("div");
        item.classList.add("song-item");
        
        item.innerHTML = `
            <span class="song-title-click" onclick="linkAc('${sarki.src}')">
                🔗 ${sarki.title}
            </span>
            <button class="delete-song-btn" onclick="sarkiSil(${index})">🗑️</button>
        `;
        listDiv.appendChild(item);
    });
}

function linkAc(url) {
    window.open(url, "_blank");
}

function sarkiEkleModalAcKapat() {
    const modal = document.getElementById("addSongModal");
    modal.classList.toggle("acik");
}

function sarkiEkle() {
    const nameInput = document.getElementById("newSongName");
    const urlInput = document.getElementById("newSongUrl");

    if (nameInput.value.trim() === "" || urlInput.value.trim() === "") {
        alert("Lütfen hem şarkı adını hem de linki girin!");
        return;
    }

    sarkiListesi.push({
        title: nameInput.value,
        src: urlInput.value
    });

    localStorage.setItem("sincapEklenenSarkilar", JSON.stringify(sarkiListesi));

    nameInput.value = "";
    urlInput.value = "";
    sarkiListesiniCiz();
    sarkiEkleModalAcKapat();
}

function sarkiSil(index) {
    sarkiListesi.splice(index, 1);
    localStorage.setItem("sincapEklenenSarkilar", JSON.stringify(sarkiListesi));
    sarkiListesiniCiz();
}

// Dinamik Otomatik Fotoğraf Galerisi
const toplamFotografSayisi = 16;

function galeriAcKapat() {
    const modal = document.getElementById("galleryModal");
    modal.classList.toggle("acik");
    if (modal.classList.contains("acik")) {
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
        
        // Uzantı kontrolü ve yüklenemeyen resmi gizleme
        img.onerror = function() {
            if (this.src.endsWith(".jpg")) {
                this.src = this.src.replace(".jpg", ".png");
            } else if (this.src.endsWith(".png")) {
                this.src = this.src.replace(".png", ".jpeg");
            } else {
                // Eğer hiçbir şekilde bulunamazsa kırık ikon gösterme, tamamen gizle
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