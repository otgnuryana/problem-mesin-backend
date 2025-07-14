const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3000;

app.use (bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/perbaikan', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/perbaikan.html'));
});

const formRoute = require('./routes/formRoute');
app.use('/kirim', formRoute);

app.listen(PORT, () => {
    console.log(`Server aktif di http://localhost:${PORT}`);
});
