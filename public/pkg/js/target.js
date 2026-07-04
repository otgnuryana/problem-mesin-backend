let dataTarget = [];
let editId = null;
// method load data
async function loadData() {

    const response = await fetch('/api/target');

    dataTarget = await response.json();

    renderTable(dataTarget);

}
// read api tampilkan ke table
function renderTable(data) {

    const tbody = document.getElementById('tableBody');

    tbody.innerHTML = '';

    data.forEach((item, index) => {

        tbody.innerHTML += `
            <tr>
                <td>${index + 1}</td>
                <td>${item.carline}</td>
                <td>${item.mesin}</td>
                <td>${item.target}</td>
                <td>
                   <button
                        class="btn btn-warning btn-sm"
                        onclick="editTarget(${item.id})">
                        Edit
                    </button>

                    <button
                        class="btn btn-danger btn-sm"
                        onclick="deleteTarget(${item.id})">
                        Delete
                    </button>
                </td>
            </tr>
        `;

    });

}
// Method Edit
function editTarget(id) {

    editId = id;

    const data = dataTarget.find(item => item.id === id);

    document.getElementById("carline").value = data.carline;
    document.getElementById("mesin").value = data.mesin;
    document.getElementById("target").value = data.target;

    document.getElementById("modalTitle").innerText =
        "Edit Mesin";

    const modal = new bootstrap.Modal(
        document.getElementById("targetModal")
    );

    modal.show();

}

document
    .getElementById("btnTambah")
    .addEventListener("click", () => {

        editId = null;

        document.getElementById("modalTitle").innerText =
            "Tambah Mesin";

        document.getElementById("carline").selectedIndex = 0;
        document.getElementById("mesin").value = "";
        document.getElementById("target").value = "";

    });

    document
    .getElementById("btnSimpan")
    .addEventListener("click", () => {

        if (editId === null) {
            simpanTarget();
        } else {
            updateTarget();
        }

    });

async function updateTarget() {

    const response = await fetch(`/api/target/${editId}`, {

        method: "PUT",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({

            carline:
                document.getElementById("carline").value,

            mesin:
                document.getElementById("mesin").value,

            target:
                document.getElementById("target").value

        })

    });

    if (!response.ok) {

        alert("Gagal mengubah data");

        return;

    }

    bootstrap.Modal
        .getInstance(
            document.getElementById("targetModal")
        )
        .hide();

    loadData();

    alert("Data berhasil diperbarui");

}

document
    .getElementById('search')
    .addEventListener('input', function () {

        const keyword =
            this.value.toLowerCase();

        const filtered = dataTarget.filter(item =>

            item.mesin
                .toLowerCase()
                .includes(keyword)

            ||

            item.carline
                .toLowerCase()
                .includes(keyword)

        );

        renderTable(filtered);

    });




async function simpanTarget() {

    const carline =
        document.getElementById("carline").value;

    const mesin =
        document.getElementById("mesin").value.trim();

    const target =
        document.getElementById("target").value;

    const response = await fetch("/api/target", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            carline,
            mesin,
            target
        })

    });

    const result = await response.json();

    if (!response.ok) {

        alert(result.message);

        return;

    }

    alert("Data berhasil ditambahkan");
    const modal =
    bootstrap.Modal.getInstance(
        document.getElementById("targetModal")
    );

    modal.hide();
    document.getElementById("mesin").value = "";
document.getElementById("target").value = "";
document.getElementById("carline").selectedIndex = 0;

    loadData();

}
// method delete
async function deleteTarget(id) {

    const data = dataTarget.find(item => item.id === id);

    if (!data) {
        return;
    }

    const yakin = confirm(
        `Yakin ingin menghapus mesin ${data.mesin}?`
    );

    if (!yakin) {
        return;
    }

    const response = await fetch(`/api/target/${id}`, {

        method: 'DELETE'

    });

    const result = await response.json();

    if (!response.ok) {

        alert(result.message);

        return;

    }

    alert(result.message);

    loadData();

}

window.editTarget = editTarget;
window.deleteTarget = deleteTarget;

loadData();