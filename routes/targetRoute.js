const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

const filePath = path.join(__dirname, '../data/target.json');

router.get('/', (req, res) => {

    const data = JSON.parse(
        fs.readFileSync(filePath, 'utf8')
    );

    res.json(data);

});

router.post('/', (req, res) => {

    const { carline, mesin, target } = req.body;

    const data = JSON.parse(
        fs.readFileSync(filePath, 'utf8')
    );

    // Validasi
    if (!mesin || target === undefined) {
        return res.status(400).json({
            message: 'Data tidak lengkap'
        });
    }

    // Cek mesin sudah ada
    const exist = data.find(item =>
        item.mesin.toLowerCase() === mesin.toLowerCase()
    );

    if (exist) {
        return res.status(400).json({
            message: 'Mesin sudah terdaftar'
        });
    }

    // Generate ID baru
    const id =
        data.length > 0
            ? Math.max(...data.map(i => i.id)) + 1
            : 1;

    const newData = {
        id,
        carline,
        mesin,
        target: Number(target)
    };

    data.push(newData);

    fs.writeFileSync(
        filePath,
        JSON.stringify(data, null, 2)
    );

    res.status(201).json(newData);

});

module.exports = router;

router.put('/:id', (req, res) => {

    const id = Number(req.params.id);

    const { carline, mesin, target } = req.body;

    const data = JSON.parse(
        fs.readFileSync(filePath, 'utf8')
    );

    const index = data.findIndex(item => item.id === id);

    if (index === -1) {

        return res.status(404).json({
            message: "Data tidak ditemukan"
        });

    }

    data[index] = {
        ...data[index],
        carline,
        mesin,
        target: Number(target)
    };

    fs.writeFileSync(
        filePath,
        JSON.stringify(data, null, 2)
    );

    res.json(data[index]);

});router.put('/:id', (req, res) => {

    const id = Number(req.params.id);

    const { carline, mesin, target } = req.body;

    const data = JSON.parse(
        fs.readFileSync(filePath, 'utf8')
    );

    const index = data.findIndex(item => item.id === id);

    if (index === -1) {

        return res.status(404).json({
            message: "Data tidak ditemukan"
        });

    }

    data[index] = {
        ...data[index],
        carline,
        mesin,
        target: Number(target)
    };

    fs.writeFileSync(
        filePath,
        JSON.stringify(data, null, 2)
    );

    res.json(data[index]);

});


router.delete('/:id', (req, res) => {

    const id = Number(req.params.id);

    let data = JSON.parse(
        fs.readFileSync(filePath, 'utf8')
    );

    const index = data.findIndex(item => item.id === id);

    if (index === -1) {
        return res.status(404).json({
            message: "Data tidak ditemukan"
        });
    }
    

    data.splice(index, 1);

    fs.writeFileSync(
        filePath,
        JSON.stringify(data, null, 2)
    );

    res.json({
        message: "Berhasil dihapus"
    });

});