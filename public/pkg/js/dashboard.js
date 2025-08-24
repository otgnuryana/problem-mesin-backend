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
        row.innerHTML = `
          <td>${item.mesin}</td>
          <td>${formatDate(item.start_time)}</td>
          <td>${formatDate(item.repair_start_time)}</td>
          <td>${formatDate(item.end_time)}</td>
          <td>${formatDuration(item.durasi_tunggu)}</td>
          <td>${formatDuration(item.durasi_perbaikan)}</td>
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
        "<tr><td colspan='7'>❌ Gagal ambil data</td></tr>";
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
    setInterval(fetchData, 5000);