const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());

// Test endpoint
app.post('/kirim', (req, res) => {
    const data = req.body;
    console.log("Data diterima dari Python:", data);

    // Balas ke Python
    res.json({ status: 'ok', message: 'Data diterima dengan sukses' });
});

app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});
