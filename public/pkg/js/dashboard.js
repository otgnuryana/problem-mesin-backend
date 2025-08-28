// Saat halaman dibuka, isi tanggal default hari ini
    document.getElementById("tanggal").value = new Date().toISOString().split('T')[0];

function formatDate(dateString) {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleString("id-ID", {
      timeZone: "Asia/Jakarta",
      hour12: false,
    });
  }

  function formatDuration(ms) {
    if (!ms || isNaN(ms)) return "00:00:00";
    const totalSeconds = Math.floor(ms / 1000);
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
    const seconds = String(totalSeconds % 60).padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  }

  async function fetchData() {
    const tanggal = document.getElementById("tanggal").value;
    const shift = document.getElementById("shift").value;
    const belumSelesai = document.getElementById("belum_selesai").checked;

    const url = `/data?tanggal=${tanggal}&shift=${shift}&belum_selesai=${belumSelesai}`;
    const tbody = document.querySelector("#dataTable tbody");
      tbody.innerHTML = "";
      
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      
      const data = await res.json();
      
      
      if (!Array.isArray(data)) {
        console.error("Bukan array:", data);
        tbody.innerHTML = "<tr><td colspan='7'>❌ Format data salah</td></tr>";
        return;
      }

      if (data.length === 0) {
        tbody.innerHTML = "<tr><td colspan='7'>📭 Tidak ada data</td></tr>";
        return;
      }

      let totalSemua = 0;

      data.forEach(item => {
        const row = document.createElement("tr");

        // tentukan class highlight
        if (!item.repair_start_time) {
          row.classList.add("highlight-pending"); // class saat belum mulai perbaikan
        } else if (item.repair_start_time && !item.end_time) {
          row.classList.add("highlight-repair"); // class saat sedang perbaikan
        }

let colTungguPart = "-"; // default

if (item.repair_start_time) {
  if (item.end_time) {
    //  Sudah ada selesai perbaikan
    if (item.part_wait_start && item.part_wait_end) {
      // Ada data tunggu part → tampilkan durasi
      colTungguPart = formatDuration(item.durasi_tunggu_part);
    } 
    // Kalau tidak ada data tunggu part → tetap "-"
  } else {
    //  Masih dalam mode perbaikan (belum selesai)
    if (item.part_wait_start && item.part_wait_end) {
      colTungguPart = formatDuration(item.durasi_tunggu_part);
    } else if (item.part_wait_start && !item.part_wait_end) {
      colTungguPart = `
        <button class="btn btn-success" disabled>Mulai</button>
        <button class="btn btn-danger" onclick="finishPartWait('${item.mesin}', '${item.carline}')">Selesai</button>
      `;
    } else {
      colTungguPart = `
        <button class="btn btn-success" onclick="startPartWait('${item.mesin}', '${item.carline}')">Mulai</button>
      `;
    }
  }
}


  row.innerHTML = `
    <td>${item.mesin}</td>
    <td>${item.carline}</td>
    <td>${formatDate(item.start_time)}</td>
    <td>${formatDate(item.repair_start_time)}</td>
    <td>${formatDuration(item.durasi_tunggu)}</td>
    <td>${formatDate(item.end_time)}</td>
    <td>${formatDuration(item.durasi_perbaikan)}</td>
    <td>${colTungguPart}</td>   <!-- 👈 Tambahan di sini -->
    <td>${formatDuration(item.total_perbaikan)}</td>
  `;
        tbody.appendChild(row);
        if (item.end_time && item.durasi_perbaikan) {
        totalSemua += item.total_perbaikan;
      }
      });
      document.getElementById('total-semua').innerText = formatDuration(totalSemua);
      document.getElementById('status').innerText =
        '✅ Terakhir diperbarui: ' + new Date().toLocaleTimeString();
    } catch (err) {
      console.error("Gagal ambil data:", err);
      document.querySelector("#dataTable tbody").innerHTML = 
        "<tr><td colspan='8'>❌ Gagal ambil data</td></tr>";
    }
  }

// Fungsi tampilkan notifikasi Sukses
function showNotif(message, type = "success") {
  const notifArea = document.getElementById("notifArea");
  const wrapper = document.createElement("div");

  wrapper.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show shadow" role="alert">
      ${message}
    </div>
  `;

  notifArea.appendChild(wrapper);

  // Auto hilang setelah 3 detik
  setTimeout(() => {
    wrapper.remove();
  }, 3000);
}

async function startPartWait(mesin, carline) {
  try {
    const res = await fetch('/downtime/part-wait-start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mesin, carline })
    });
    const data = await res.json();
    showNotif("Tunggu part dimulai untuk mesin " + mesin);
    // ✅ reload data dashboard
    fetchData();

  } catch (err) {
    console.error(err);
      showNotif("Gagal memulai Tunggu Part!", "danger");
  }
}


async function finishPartWait(mesin, carline) {
  try {
    const res = await fetch('/downtime/part-wait-finish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mesin, carline })
    });
    const data = await res.json();
  showNotif("Waktu tunggu part selesai dicatat !")

  } catch (err) {
    console.error(err);
  showNotif("Gagal mencatat Tunggu Part!", "danger");
  }
}


 
    // Helper untuk format detik → hh:mm:ss
    function formatDuration(seconds) {
      if (!seconds && seconds !== 0) return '-';
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = seconds % 60;
      return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
    }



    

      // export ke excel
      function exportExcel() {
        const tanggal = document.getElementById("tanggal").value;
        const shift = document.getElementById("shift").value;

        let url = `/export?tanggal=${tanggal}&shift=${shift}`;
        window.location.href = url;
      }


    // Auto-refresh tiap 5 detik
    fetchData(); // Panggil pertama kali
    setInterval(fetchData, 3000);