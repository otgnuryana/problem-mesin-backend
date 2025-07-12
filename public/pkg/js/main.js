  // Dropdown dependent
  document.addEventListener("DOMContentLoaded", function () {
    const carlineSelect = document.getElementById("pilihCarline");
    const mesinSelect = document.getElementById("pilihMesin");
    const judul = document.getElementById("judulProblem");

const mesinByCarline = {
    Toyota: Array.from({ length: 32 }, (_, i) => `T9-${String(i + 1).padStart(2, '0')}`),
    Daihatsu: Array.from({ length: 38 }, (_, i) => `D9-${String(i + 1).padStart(2, '0')}`),
    Honda: Array.from({ length: 15 }, (_, i) => `H9-${String(i + 1).padStart(2, '0')}`),
    MMKI: Array.from({ length: 20 }, (_, i) => `M9-${String(i + 1).padStart(2, '0')}`),
    Domestik: Array.from({ length: 4 }, (_, i) => `B9-${String(i + 1).padStart(2, '0')}`),
    TypeB: Array.from({ length: 5 }, (_, i) => `AC9B-${String(i + 1).padStart(2, '0')}`),
};

    // Saat carline berubah
    carlineSelect.addEventListener("change", function () {
        const selectedCarline = this.value;

        // Kosongkan dulu mesinSelect
        mesinSelect.innerHTML = `<option value="0" disabled selected>Pilih Mesin</option>`;

        if (mesinByCarline[selectedCarline]) {
            mesinByCarline[selectedCarline].forEach(function (mesin) {
                const opt = document.createElement("option");
                opt.value = mesin;
                opt.textContent = mesin;
                mesinSelect.appendChild(opt);
            });
        }
    });

    // Saat mesin berubah, update teks judul
    mesinSelect.addEventListener("change", function () {
        const selectedMesin = this.value;
        if (selectedMesin !== "0") {
            judul.innerHTML = `Hi, <span class="text-danger"><strong>${selectedMesin}</strong></span><br>What's Your Problem ?`;
        } else {
            judul.innerHTML = `Hi,<br>What's Your Problem?`;
        }
    });
});

  // Dropdown Jenis Problem
  document.addEventListener("DOMContentLoaded", function () {
    const jenisProblems = [
        "BELITAN WIRE", "BELMOUTH", "BEND DOWN", "BEND UP", "CACAT CRIMP",
        "CACAT STRIP (SENSOR STRIP)", "CEK BERKALA", "CETAKAN CAULKING", "CFM TIDAK TERDATA", "CH/CW",
        "CHECK SUM ERROR", "CHIP TERMINAL NUMPUK", "CORE TIDAK STABIL", "CRIMP WITH FOREIGN OBJECT", "CROSECTION NG",
        "CUT CORE", "CUTING CARRY", "CUTING LENGHT", "CYLINDER PEMISAH WIRE TIDAK FUNGSI", "DEFORM STABILIZER",
        "DEFORM TERMINAL", "DETEKSI CONTACK CONDUCTOR", "DOUBLE TERMINAL CRIMPING", "Product Master", "EXPANDED",
        "Wire Change", "FIXING PATAH", "FLASH/BUR", "FREKUENSI PEMAKAIAN CTB", "FREKUENSI PEMAKAIAN STB",
        "FRYING CORE", "GESERAN KABEL", "HIGH CONDUCTOR", "HIGH INSULATION", "HIGH TERMINAL REMINDER",
        "HMI ERROR", "1/0 GALAT ID 1/2", "INSULATION BAREL", "INSULATION TIDAK STABIL", "WIRE KARAMI",
        "KELEBIHAN LIMIT SAAT PROSES", "KESALAHAN PEMEGANG SEAL (WPAD)", "KESALAHAN TERUSAN SEAL (FH11)", "LANCE DEFORMATION", "LOW CONDUCTOR",
        "LOW INSULATION", "LOW WATER PROOF PLUG", "MONITOR MATI", "MOUSE/KEYBOARD TIDAK FUNGSI", "NO CRIMPING",
        "NO STRIPING", "NUT SUNK KENDOR", "OVERLIMIT SIDE A SUMBU S", "OVERLIMIT SIDE A SUMBU Y", "OVERLIMIT SIDE B SUMBU S",
        "OVERLIMIT SIDE B SUMBU Y", "OVERLIMIT SUMBU CUTER", "PC ERROR", "PEMOTONG PRODUCT DEFECT (CHOPER)", "PENYIMPANGAN SEAL (SENSOR SHEAL)",
        "REAR UNBALACE", "ROLLING", "SCANER/MK30", "SCRATCH CORE", "SCRATCH WIRE",
        "SCRATH TERMINAL", "SELANG ANGIN SOBEX (ANGIN BOCOR)", "DETEKSI PENGELUARAN PRODUCT", "DETEKSI SAMBUNGAN", "WIRE HABIS",
        "DISCHARGING BOCOR", "STAND CYLINDER PEMISAH WIRE PATAH", "TEKANAN UDARA BERKURANG", "TERMINAL END CUT", "TERMINAL END SQUASH",
        "TIDAK MASUK GUIDE SUNK", "TIME OUT ATAS PEMISAH WIRE", "TIME OUT KENAIKAN CLAMP A/B", "TIME OUT PEMEGANG SUMBU GUIDE KABEL",
        "TIME OUT PEMISAH WIRE", "TIME OUT KENAIKAN CLAMP A/B", "TIME OUT PENURUNAN CLAMP A/B", "TIME OUT SUMBU GUIDE CABLE", "TWIST",
        "UPS MATI", "WATER PROOF PLUG CUT", "PROBLEM LAINNYA"
    ];

    const select = document.getElementById("jenisProblem");

    jenisProblems.forEach(problem => {
        const option = document.createElement("option");
        option.value = problem;
        option.textContent = problem;
        select.appendChild(option);
    });
});

  // Kirim data inputan
  document.getElementById("kirimButton").addEventListener("click", function () {
    // Ambil data inputan
    const carline = document.getElementById("pilihCarline").value;
    const mesin = document.getElementById("pilihMesin").value;
    const kategori = document.getElementById("kategoriProblem").value;
    const jenis = document.getElementById("jenisProblem").value;
    const keterangan = document.getElementById("keteranganProblem").value;

    // Validasi jika tidak memilih opsi
  if (
        carline === "0" ||
        mesin === "0" ||
        kategori === "0" ||
        jenis === "0" ||
        keterangan === ""
    ) {
        alert("Mohon lengkapi semua kolom, termasuk keterangan problem.");
        return;
    }

    // kirim ke backend
    fetch("/kirim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ carline, mesin, kategori, jenis, keterangan })
    })
    .then(res => res.json())
    .then(res => {
        if (res.status === "ok") {
            alert("Terkirim ke Telegram!");
            // Kosongkan form
            document.getElementById("pilihCarline").value = "0";
            document.getElementById("pilihMesin").value = "0";
            document.getElementById("kategoriProblem").value = "0";
            document.getElementById("jenisProblem").value = "0";
            document.getElementById("keteranganProblem").value = "";
        } else {
            alert("Gagal mengirim.");
        }
    });

 });
