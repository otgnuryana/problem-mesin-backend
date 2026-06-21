let chart;

async function loadChartData() {

    const response = await fetch('/dashboard/chart');
    const data = await response.json();

    const labels = data.map(item => item.mesin);
    const actual = data.map(item => item.aktual);
    const target = data.map(item => item.target);

    const ctx = document.getElementById('downtimeChart');

    if (chart) {
        chart.destroy();
    }

    chart = new Chart(ctx, {
        data: {
            labels: labels,
            datasets: [
                {
                    type: 'bar',
                    label: 'Downtime Aktual',
                    data: actual
                },
                {
                    type: 'line',
                    label: 'Target',
                    data: target
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });

}

loadChartData();