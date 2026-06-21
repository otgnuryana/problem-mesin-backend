const express = require('express');
const router = express.Router();

router.get('/chart', (req, res) => {

    res.json([
    {
        mesin: 'T9-01',
        aktual: 14,
        target: 20
    },
    {
        mesin: 'T9-02',
        aktual: 5,
        target: 15
    },
    {
        mesin: 'T9-03',
        aktual: 12,
        target: 18
    },
    {
        mesin: 'T9-04',
        aktual: 8,
        target: 15
    },
    {
        mesin: 'T9-05',
        aktual: 16,
        target: 20
    },
    {
        mesin: 'T9-06',
        aktual: 10,
        target: 15
    },
    {
        mesin: 'T9-07',
        aktual: 7,
        target: 12
    },
    {
        mesin: 'T9-08',
        aktual: 13,
        target: 18
    },
    {
        mesin: 'T9-09',
        aktual: 15,
        target: 20
    },
    {
        mesin: 'T9-10',
        aktual: 9,
        target: 15
    },
    {
        mesin: 'T9-11',
        aktual: 11,
        target: 16
    },
    {
        mesin: 'T9-12',
        aktual: 17,
        target: 22
    },
    {
        mesin: 'T9-13',
        aktual: 6,
        target: 12
    },
    {
        mesin: 'T9-14',
        aktual: 14,
        target: 18
    },
    {
        mesin: 'T9-15',
        aktual: 18,
        target: 25
    },
    {
        mesin: 'T9-16',
        aktual: 10,
        target: 15
    },
    {
        mesin: 'T9-17',
        aktual: 8,
        target: 14
    },
    {
        mesin: 'T9-18',
        aktual: 16,
        target: 20
    },
    {
        mesin: 'T9-19',
        aktual: 12,
        target: 18
    },
    {
        mesin: 'T9-20',
        aktual: 7,
        target: 10
    },
    {
        mesin: 'T9-21',
        aktual: 13,
        target: 18
    },
    {
        mesin: 'T9-22',
        aktual: 15,
        target: 20
    },
    {
        mesin: 'T9-23',
        aktual: 9,
        target: 14
    },
    {
        mesin: 'T9-24',
        aktual: 11,
        target: 16
    },
    {
        mesin: 'T9-25',
        aktual: 19,
        target: 25
    },
    {
        mesin: 'T9-26',
        aktual: 8,
        target: 12
    },
    {
        mesin: 'T9-27',
        aktual: 14,
        target: 18
    },
    {
        mesin: 'T9-28',
        aktual: 10,
        target: 15
    },
    {
        mesin: 'T9-29',
        aktual: 17,
        target: 22
    },
    {
        mesin: 'T9-30',
        aktual: 12,
        target: 18
    }
]);

});

module.exports = router;