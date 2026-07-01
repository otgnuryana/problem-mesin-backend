const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

router.get('/chart', (req, res) => {

    const tanggal = req.query.tanggal;
    if (!tanggal) {
        return res.status(400).json({
            message: 'Tanggal wajib diisi'
        });
    }

    const targetPath = path.join(__dirname, '../data/target.json');
    const downtimePath = path.join(__dirname, `../data/${tanggal}-downtime.json`);

    if (!fs.existsSync(downtimePath)) {
        return res.json([]);
    }

    const targetData = JSON.parse(
        fs.readFileSync(targetPath, 'utf8')
    );

    const downtimeData = JSON.parse(
        fs.readFileSync(downtimePath, 'utf8')
    );

    const totalDowntime = {};

    downtimeData.forEach(item => {

        const total =
            (item.durasi_tunggu || 0) +
            (item.durasi_perbaikan || 0);

        if (!totalDowntime[item.mesin]) {
            totalDowntime[item.mesin] = 0;
        }

        totalDowntime[item.mesin] += total;

    });

    const result = targetData.map(item => {
        const totalDetik =
        totalDowntime[item.mesin] || 0;

        return {
            id: item.id,
            carline: item.carline,
            mesin: item.mesin,
            target: item.target,
            
            aktual: Number(
                 totalDetik/60 
            )

        };

    });

    result.sort((a, b) => {

    if (a.carline !== b.carline) {
        return a.carline.localeCompare(b.carline);
    }

    return a.mesin.localeCompare(
        b.mesin,
        undefined,
        {
            numeric: true
        }
    );

    });
    
    res.json(result);

});

module.exports = router;