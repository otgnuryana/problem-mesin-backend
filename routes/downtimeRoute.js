const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();


const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

function getFilePath() {
    const today = new Date().toISOString().slice(0, 10);
    return path.join(dataDir, `${today}-downtime.json`);
}

function loadData(filePath) {
    if (!fs.existsSync(filePath)) return [];
    try {
        return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch (e) {
        console.error("❌ Gagal baca file:", e);
        return [];
    }
}

function saveData(filePath, data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}


router.get('/data', (req, res) => {
    const filePath = getFilePath();
    const rawData = loadData(filePath);

    // Buat salinan & tambah total_perbaikan di setiap entri
    const data = rawData.map(entry => {
        const tunggu = typeof entry.durasi_tunggu === 'number' ? entry.durasi_tunggu : 0;
        const perbaikan = typeof entry.durasi_perbaikan === 'number' ? entry.durasi_perbaikan : 0;

        return {
            ...entry,
            total_perbaikan: tunggu + perbaikan
        };
    });

    res.json(data);
});



// 1️⃣ Mulai downtime
router.post('/start', (req, res) => {
    const { mesin } = req.body;
    const filePath = getFilePath();
    const data = loadData(filePath);

    data.push({
        mesin,
        start_time: new Date().toISOString()
    });

    saveData(filePath, data);
    console.log(`⏱️ Downtime mulai dicatat untuk mesin ${mesin}`);
    res.json({ status: 'ok', message: 'Downtime dimulai' });
});

// 2️⃣ Mulai perbaikan
router.post('/repair-start', (req, res) => {
    const { mesin } = req.body;
    const filePath = getFilePath();
    const data = loadData(filePath);

    const lastEntry = [...data].reverse().find(e => e.mesin === mesin && !e.repair_start_time);
    if (!lastEntry) return res.status(404).json({ status: 'error', message: 'Downtime belum dimulai' });

    lastEntry.repair_start_time = new Date().toISOString();
    saveData(filePath, data);
    console.log(`🔧 Perbaikan dimulai untuk mesin ${mesin}`);
    res.json({ status: 'ok', message: 'Perbaikan dimulai' });
});


// Tambah di atas
function calculateDuration(start, end) {
    const s = new Date(start);
    const e = new Date(end);
    return Math.floor((e - s) / 1000); // dalam detik
}

// Ubah endpoint /finish
router.post('/finish', (req, res) => {
    const { mesin } = req.body;
    const filePath = getFilePath();
    const data = loadData(filePath);

    const lastEntry = [...data].reverse().find(e => e.mesin === mesin && !e.end_time);
    if (!lastEntry) return res.status(404).json({ status: 'error', message: 'Perbaikan belum dimulai' });

    const now = new Date().toISOString();
    lastEntry.end_time = now;

    if (lastEntry.repair_start_time) {
        lastEntry.durasi_tunggu = calculateDuration(lastEntry.start_time, lastEntry.repair_start_time); // detik
        lastEntry.durasi_perbaikan = calculateDuration(lastEntry.repair_start_time, now); // detik
    } else {
        lastEntry.durasi_tunggu = calculateDuration(lastEntry.start_time, now);
        lastEntry.durasi_perbaikan = 0;
    }

    saveData(filePath, data);
    console.log(`✅ Perbaikan selesai untuk mesin ${mesin}`);
    res.json({ status: 'ok', message: 'Perbaikan selesai' });
});


module.exports = router;
