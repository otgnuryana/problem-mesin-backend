// routes/formRoute.js
const express = require('express');
const router = express.Router();
const axios = require('axios');

    // API untuk koneksi ke bot telegram
    const token = '7820467558:AAGD_45C5-cieaOgA8n8XSoltrJsJKlW2iU';
    const chat_id = '-1002771989872';



router.post('/', async (req, res) => {
    const { carline, mesin, kategori, jenis, keterangan } = req.body;

        const pesan = `INFORMASI PROBLEM MESIN🔧
Carline : ${carline}
Mesin : ${mesin}
Kategori : ${kategori} 
Jenis Problem: ${jenis} 
Keterangan : ${keterangan}

Mohon kepada Teknisi agar segera diperbaiki`;

    try {
        await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
            chat_id: chat_id,
            text: pesan,
            parse_mode: "Markdown"
        });

        res.json({ status: "ok" });
    } catch (err) {
        console.error("Gagal kirim ke Telegram:", err.message);
        res.status(500).json({ status: "error", message: "Gagal kirim ke Telegram" });
    }
});

module.exports = router;

router.post('/selesai', (req, res) => {
    const { id, durasiTunggu, durasiPerbaikan } = req.body;

    // Simpan ke file/database
    console.log(`Insiden ${id} selesai. Tunggu: ${durasiTunggu}s, Perbaikan: ${durasiPerbaikan}s`);

    res.json({ status: "ok" });
});

