const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const ExcelJS = require('exceljs');


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

// export to excel

router.get('/export', async (req, res) => {
  try {
    const filePath = getFilePath();
    const data = loadData(filePath);

    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Downtime');

    // Header
    ws.addRow([
      "Mesin",
      "Mulai Problem",
      "Mulai Perbaikan",
      "Selesai",
      "Waktu Tunggu",
      "Waktu Perbaikan",
      "Total Downtime"
    ]);


    ws.getColumn(5).numFmt = "hh:mm:ss";
    ws.getColumn(6).numFmt = "hh:mm:ss";
    ws.getColumn(7).numFmt = "hh:mm:ss";

    data.forEach(d => {
      const wait = (d.start_time && d.repair_start_time)
        ? (new Date(d.repair_start_time) - new Date(d.start_time)) / 1000 / 86400
        : null;

      const repair = (d.repair_start_time && d.end_time)
        ? (new Date(d.end_time) - new Date(d.repair_start_time)) / 1000 / 86400
        : null;

      const total = (d.start_time && d.end_time)
        ? (new Date(d.end_time) - new Date(d.start_time)) / 1000 / 86400
        : null;

      ws.addRow([
        d.mesin || "-",
        d.start_time || "-",
        d.repair_start_time || "-",
        d.end_time || "-",
        wait,
        repair,
        total
      ]);
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="downtime-${new Date().toISOString().slice(0,10)}.xlsx"`
    );

    await wb.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("❌ Error export Excel:", err);
    res.status(500).json({ error: "Gagal export Excel" });
  }
});


module.exports = router;
