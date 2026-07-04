const charts = {};

// method durasi
function formatDurasiMenit(nilaiMenit) {

    const totalDetik = Math.round(nilaiMenit * 60);

    const menit = Math.floor(totalDetik / 60);
    const detik = totalDetik % 60;

    if (menit === 0) {
        return `${detik} detik`;
    }

    if (detik === 0) {
        return `${menit} menit`;
    }

    return `${menit} menit ${detik} detik`;

}

// method create chart
function createChart(canvasId, data) {

    const labels = data.map(item => item.mesin);
    const actual = data.map(item => item.aktual);
    const target = data.map(item => item.target);

    const ctx = document.getElementById(canvasId);

    if (!ctx) return;

    if (charts[canvasId]) {
        charts[canvasId].destroy();
    }

    charts[canvasId] = new Chart(ctx, {

        type: "bar",

        data: {
            labels,
            datasets: [
                {
                    type: "bar",
                    label: "Downtime Aktual",
                    data: actual,
                    stack: "combined"
                },
                {
                    type: "line",
                    label: "Target (Menit)",
                    data: target
                }
            ]
        },

            options: {
                responsive: true,
                maintainAspectRatio: false,
                
                plugins: {

                    tooltip: {

                        callbacks: {

                            label(context) {

                                return `${context.dataset.label}: ${formatDurasiMenit(context.raw)}`;

                            }

                        }

                    }

                },
                

                scales: {

                    y: {

                        beginAtZero: true,

                        title: {

                            display: true,
                            text: "Menit"

                }

            }

        }

        }

    });

}

// load chart by tanggal
async function loadChartData() {

    const tanggal =
        document.getElementById("tanggal").value;

    const response =
        await fetch(`/dashboard/chart?tanggal=${tanggal}`);

    const data = await response.json();

    createChart(
        "toyotaChart",
        data.filter(item => item.carline === "Toyota")
    );

    createChart(
        "daihatsuChart",
        data.filter(item => item.carline === "Daihatsu")
    );

    createChart(
        "hondaChart",
        data.filter(item => item.carline === "Honda")
    );

    
    createChart(
        "mitsubishiChart",
        data.filter(item => item.carline === "Mitsubishi")
    );
    
    createChart(
        "domestikChart",
        data.filter(item => item.carline === "Domestik")
    );

}


const today = new Date();

document.getElementById("tanggal").value =
    today.toISOString().split("T")[0];

    document
    .getElementById("tanggal")
    .addEventListener("change", loadChartData);

loadChartData();