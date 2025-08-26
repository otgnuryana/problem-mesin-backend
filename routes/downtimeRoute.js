const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();



const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

function getFilePath(tanggal = null) {
    const dateStr = tanggal || new Date().toISOString().slice(0, 10);
    return path.join(dataDir, `${dateStr}-downtime.json`);
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
  const tanggal = req.query.tanggal;
  const shift = parseInt(req.query.shift);
  const hanyaBelumSelesai = req.query.belum_selesai === 'true';

  // Validasi query
  if (!tanggal || ![1, 2].includes(shift)) {
    return res.status(400).json({ error: 'tanggal dan shift wajib diisi' });
  }

  const filePath = getFilePath(tanggal);
  const dataHariIni = loadData(filePath);

  const dateObj = new Date(`${tanggal}T00:00:00`);
  const nextDate = new Date(dateObj);
  nextDate.setDate(dateObj.getDate() + 1);
  const besokStr = nextDate.toISOString().slice(0, 10);

  const dataBesok = shift === 2 ? loadData(getFilePath(besokStr)) : [];
  const combinedData = [...dataHariIni, ...dataBesok];

  // Hitung batas waktu shift
  const shiftStart = new Date(`${tanggal}T${shift === 1 ? '06:00:00' : '19:00:00'}`);
  const shiftEnd = shift === 1
    ? new Date(`${tanggal}T19:00:00`)
    : new Date(`${besokStr}T06:00:00`);

  // Filter berdasarkan waktu start
  let data = combinedData.filter(entry => {
    if (!entry.start_time) return false;
    const start = new Date(entry.start_time);
    return start >= shiftStart && start < shiftEnd;
  });

  // Hitung total_perbaikan
  data = data.map(entry => ({
    ...entry,
    total_perbaikan: (entry.durasi_tunggu || 0) + (entry.durasi_perbaikan || 0)
  }));

  if (hanyaBelumSelesai) {
    data = data.filter(entry => !entry.end_time);
  }

  res.json(data);
});




function getTodayDate() {
  const d = new Date();
  return d.toISOString().split('T')[0]; // YYYY-MM-DD
}


// 1️⃣ Mulai downtime
router.post('/start', (req, res) => {
    const { mesin, carline } = req.body;
    const filePath = getFilePath();
    const data = loadData(filePath);

    data.push({
        mesin,
        carline,
        start_time: new Date().toISOString()
    });

    saveData(filePath, data);
    console.log(`⏱️ Downtime mulai dicatat untuk mesin ${mesin}`);
    res.json({ status: 'ok', message: 'Downtime dimulai' });
});
// Tambah di atas
function calculateDuration(start, end) {
    const s = new Date(start);
    const e = new Date(end);
    return Math.floor((e - s) / 1000); // dalam detik
}
// 2️⃣ Mulai perbaikan
router.post('/repair-start', (req, res) => {
    const { mesin } = req.body;
    const filePath = getFilePath();
    const data = loadData(filePath);

    const lastEntry = [...data].reverse().find(e => e.mesin === mesin && !e.repair_start_time);
    if (!lastEntry) return res.status(404).json({ status: 'error', message: 'Downtime belum dimulai' });

    lastEntry.repair_start_time = new Date().toISOString();
    lastEntry.durasi_tunggu = calculateDuration(lastEntry.start_time, lastEntry.repair_start_time); // detik
    saveData(filePath, data);
    console.log(`🔧 Perbaikan dimulai untuk mesin ${mesin}`);
    res.json({ status: 'ok', message: 'Perbaikan dimulai' });
});




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

router.post('/part-wait-start', (req, res) => {
  const { mesin, carline } = req.body;
  const filePath = getFilePath();
  const data = loadData(filePath);

  let item = data.find(r => r.mesin === mesin && r.carline === carline && !r.end_time);
  if (!item) return res.status(404).json({ error: "Tidak ada downtime aktif" });

  item.part_wait_start = new Date().toISOString();
  saveData(filePath, data);

  res.json({ success: true, item });
});

// Selesai tunggu part
router.post('/part-wait-finish', (req, res) => {
  const { mesin, carline } = req.body;
  const filePath = getFilePath();
  const data = loadData(filePath);

  let item = data.find(r => r.mesin === mesin && r.carline === carline && !r.end_time);
  if (!item || !item.part_wait_start) return res.status(404).json({ error: "Belum ada tunggu part" });

  item.part_wait_end = new Date().toISOString();
  item.durasi_tunggu_part = Math.floor((new Date(item.part_wait_end) - new Date(item.part_wait_start)) / 1000);

  saveData(filePath, data);

  res.json({ success: true, item });
});


module.exports = router;
