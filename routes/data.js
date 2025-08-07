// routes/data.js
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Fungsi untuk mendapatkan file path berdasarkan tanggal
function getFilePath(tanggal) {
  return path.join(__dirname, '..', 'data', `${tanggal}-downtime.json`);
}

// Fungsi untuk membaca file JSON
function loadData(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath);
      return JSON.parse(raw);
    } else {
      return []; // File tidak ditemukan, return array kosong
    }
  } catch (err) {
    console.error('Gagal membaca file:', err);
    return [];
  }
}

// Route utama untuk /data
router.get('/data', (req, res) => {
  const tanggal = req.query.tanggal; // contoh: 2025-08-07
  const shift = parseInt(req.query.shift); // shift 1 atau 2
  const hanyaBelumSelesai = req.query.belum_selesai === 'true';

  if (!tanggal || isNaN(shift)) {
    return res.status(400).json({ error: 'tanggal dan shift harus diberikan' });
  }

  const filePath = getFilePath(tanggal);
  const rawData = loadData(filePath);

  // Konversi batas waktu shift ke timestamp
  const shiftStart = new Date(`${tanggal}T${shift === 1 ? '06:00:00' : '19:00:00'}`);
  let shiftEnd = new Date(shiftStart);
  shiftEnd.setHours(shiftEnd.getHours() + 13); // Shift berlangsung 13 jam

  // Filter berdasarkan waktu start_time di dalam rentang shift
  const filtered = rawData.filter(entry => {
    const startTime = new Date(entry.start_time);
    const dalamShift = startTime >= shiftStart && startTime < shiftEnd;
    const belumSelesai = !entry.end_time;

    return dalamShift && (!hanyaBelumSelesai || belumSelesai);
  });

  // Hitung total_perbaikan dan kirim respons
  const data = filtered.map(entry => {
    const tunggu = typeof entry.durasi_tunggu === 'number' ? entry.durasi_tunggu : 0;
    const perbaikan = typeof entry.durasi_perbaikan === 'number' ? entry.durasi_perbaikan : 0;

    return {
      ...entry,
      total_perbaikan: tunggu + perbaikan
    };
  });

  res.json(data);
});

module.exports = router;
