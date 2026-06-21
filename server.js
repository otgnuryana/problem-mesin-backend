const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const downtimeRoute = require('./routes/downtimeRoute');
const dataRoutes = require('./routes/data');
const dashboardRoutes = require('./routes/dashboard');

const app = express();
const PORT = 3000;
app.use(express.json());
app.use('/downtime', downtimeRoute);


app.use('/', dataRoutes); // pastikan route ini di-load

app.use (bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/dashboard.html'));
});
app.get('/perbaikan', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/perbaikan.html'));
});
app.get('/grafik', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/chart.html'));
});

app.get('/target', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/target.html'));
});

const formRoute = require('./routes/formRoute');
app.use('/kirim', formRoute);

app.listen(PORT, () => {
    console.log(`Server aktif di http://localhost:${PORT}`);
});

app.use('/dashboard', dashboardRoutes);
app.use(express.static('public'));
// AdminLTE
app.use(
    '/adminlte',
    express.static(
        path.join(
            __dirname,
            'node_modules',
            'admin-lte'
        )
    )
);