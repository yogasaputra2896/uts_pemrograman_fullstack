// 411222034 - Yoga Saputra
const API_URL = 'http://localhost:3000/api/media';
const mediaTableBody = document.getElementById('mediaTableBody');
const mediaModal = new bootstrap.Modal(document.getElementById('mediaModal'));
const mediaForm = document.getElementById('mediaForm');
const mediaIdInput = document.getElementById('mediaId');
const modalTitle = document.getElementById('mediaModalLabel');
const saveButton = document.getElementById('saveButton');
const alertMessage = document.getElementById('alertMessage');
const loadingRow = document.getElementById('loadingRow');

// =======================================================
// === 1. READ (GET) - Mengambil Data ====================
// =======================================================
async function fetchMedia() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Gagal memuat media: ' + response.statusText);
        
        const mediaList = await response.json();
        renderMedia(mediaList);
    } catch (error) {
        console.error('Error fetching media:', error);
        mediaTableBody.innerHTML = `<tr><td colspan="5" class="text-center text-danger py-5">Gagal terhubung ke API: ${error.message}</td></tr>`;
    }
}

// =======================================================
// === Render media dalam bentuk table ==================
// =======================================================
function renderMedia(mediaList) {
    mediaTableBody.innerHTML = ''; // Kosongkan tabel

    if (mediaList.length === 0) {
        mediaTableBody.innerHTML = `<tr><td colspan="5" class="text-center py-5 text-muted fs-5">Belum ada media.</td></tr>`;
        return;
    }

    mediaList.forEach(media => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${media.id_media}</td>
            <td>${media.judul}</td>
            <td>${media.tahun_rilis}</td>
            <td>${media.genre}</td>
            <td class="text-center">
                <button class="btn btn-sm btn-warning me-2" onclick="prepareEdit(${media.id_media}, '${media.judul}', ${media.tahun_rilis}, '${media.genre}')">
                    <i class="bi bi-pencil-square me-1"></i>Edit
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteMedia(${media.id_media}, '${media.judul}')">
                    <i class="bi bi-trash3 me-1"></i>Hapus
                </button>
            </td>
        `;

        mediaTableBody.appendChild(row);
    });
}

// =======================================================
// === 2. CREATE & UPDATE (POST & PUT) ===================
// =======================================================
mediaForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = mediaIdInput.value;
    const judul = document.getElementById('judul').value;
    const tahun_rilis = parseInt(document.getElementById('tahun_rilis').value);
    const genre = document.getElementById('genre').value;
    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_URL}/${id}` : API_URL;

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ judul, tahun_rilis, genre })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Gagal menyimpan media.');
        }

        const actionText = id ? 'diperbarui' : 'ditambahkan';
        showAlert(`Media berhasil ${actionText}!`, 'success');
        mediaModal.hide();
        mediaForm.reset();
        fetchMedia(); // reload tabel
    } catch (error) {
        console.error('Error saat menyimpan media:', error);
        showAlert(`Gagal menyimpan media: ${error.message}`, 'danger');
    }
});

// =======================================================
// Fungsi modal Create
// =======================================================
function prepareCreate() {
    modalTitle.textContent = 'Tambah Media Baru';
    saveButton.textContent = 'Tambah';
    mediaIdInput.value = '';
    mediaForm.reset();
}

// =======================================================
// Fungsi modal Update
// =======================================================
function prepareEdit(id, judul, tahun_rilis, genre) {
    modalTitle.textContent = 'Edit Media';
    saveButton.textContent = 'Perbarui';
    mediaIdInput.value = id;
    document.getElementById('judul').value = judul;
    document.getElementById('tahun_rilis').value = tahun_rilis;
    document.getElementById('genre').value = genre;
    mediaModal.show();
}

// =======================================================
// === 3. DELETE (DELETE) ================================
// =======================================================
async function deleteMedia(id, judul) {
    if (!confirm(`Yakin ingin menghapus media: "${judul}" (ID: ${id})?`)) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        if (response.status === 204) {
            showAlert(`Media "${judul}" berhasil dihapus.`, 'warning');
            fetchMedia();
        } else if (response.status === 404) {
            showAlert(`Media dengan ID ${id} tidak ditemukan.`, 'danger');
        } else {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Gagal menghapus media.');
        }
    } catch (error) {
        console.error('Error saat menghapus media:', error);
        showAlert(`Gagal menghapus media: ${error.message}`, 'danger');
    }
}

// =======================================================
// === UTILITAS ==========================================
// =======================================================
function showAlert(message, type) {
    alertMessage.textContent = message;
    alertMessage.className = `alert alert-${type}`;
    alertMessage.classList.remove('d-none');
    setTimeout(() => {
        alertMessage.classList.add('d-none');
    }, 3000);
}

// =======================================================
// Load media saat halaman siap
// =======================================================
document.addEventListener('DOMContentLoaded', fetchMedia);
