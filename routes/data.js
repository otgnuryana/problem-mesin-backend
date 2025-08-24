// routes/data.js
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');

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



//  Export ke Excel dengan filter shift
router.get('/export', async (req, res) => {
  try {
    const { tanggal, shift } = req.query; // ambil dari query string
    const filePath = getFilePath(tanggal);
    let data = loadData(filePath);

    // ---- Filter shift (sama logika dengan /data) ----
    if (shift) {
      const shiftNum = parseInt(shift, 10);

      data = data.filter(d => {
        if (!d.start_time) return false;
        const start = new Date(d.start_time);
        const jam = start.getHours();

        if (shiftNum === 1) {
          // Shift 1 = 06:00–19:00
          return jam >= 6 && jam < 19;
        } else if (shiftNum === 2) {
          // Shift 2 = 19:00–06:00 
          return jam >= 19 || jam < 6;
        }
        return true;
      });
    }

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

    // Format kolom durasi jadi jam:menit:detik
    ws.getColumn(5).numFmt = "hh:mm:ss";
    ws.getColumn(6).numFmt = "hh:mm:ss";
    ws.getColumn(7).numFmt = "hh:mm:ss";

    // Data rows
    data.forEach(d => {
      const wait = d.durasi_tunggu != null ? d.durasi_tunggu / 86400 : null;
      const repair = d.durasi_perbaikan != null ? d.durasi_perbaikan / 86400 : null;
      const total = (d.durasi_tunggu != null && d.durasi_perbaikan != null)
        ? (d.durasi_tunggu + d.durasi_perbaikan) / 86400
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
      `attachment; filename="downtime-${tanggal || new Date().toISOString().slice(0,10)}-shift${shift || 'all'}.xlsx"`
    );

    await wb.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("❌ Error export Excel:", err);
    res.status(500).json({ error: "Gagal export Excel" });
  }
});


module.exports = router;
