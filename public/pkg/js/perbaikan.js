const startTunggu = Date.now();
let startPerbaikan;
let timerTunggu, timerPerbaikan;

function formatTimer(sec) {
    const h = Math.floor(sec / 3600);
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function updateTunggu() {
    const diff = Math.floor((Date.now() - startTunggu) / 1000);
    document.getElementById("timerTunggu").innerText = formatTimer(diff);
}

function updatePerbaikan() {
    const diff = Math.floor((Date.now() - startPerbaikan) / 1000);
    document.getElementById("timerPerbaikan").innerText = formatTimer(diff);
}

// Mulai timer tunggu
timerTunggu = setInterval(updateTunggu, 1000);

document.getElementById("btnDatang").addEventListener("click", () => {
    if (timerPerbaikan) return; 
    clearInterval(timerTunggu);
    startPerbaikan = Date.now();
    timerPerbaikan = setInterval(updatePerbaikan, 1000);
    document.getElementById("btnSelesai").disabled = false;
    document.getElementById("btnDatang").disabled = true;
document.getElementById("judulInsiden").innerText = "Teknisi Sedang Memperbaiki...";

});

document.getElementById("btnSelesai").addEventListener("click", async () => {
    clearInterval(timerPerbaikan);

    const durasiTunggu = Math.floor((startPerbaikan - startTunggu) / 1000);
    const durasiPerbaikan = Math.floor((Date.now() - startPerbaikan) / 1000);
    const insidenId = new URLSearchParams(location.search).get("id");

    await fetch("/selesai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: insidenId, durasiTunggu, durasiPerbaikan })
    });

    alert("Perbaikan selesai!");
    window.location.href = "/";
});
