// 411222034 - Yoga Saputra
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');
const app = express();
const port = 3000;

// ============================================================
// Koneksi Database MySQL
// ============================================================
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'nusantara_flix'
}).promise(); 

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// ============================================================
// Route untuk menampilkan index.html
// ============================================================
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ============================================================
// GET /api/media: Mengambil SEMUA media
// ============================================================
app.get('/api/media', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM media');
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Kesalahan Server' });
    }
});

// ============================================================
// GET /api/media/:id: Mengambil media berdasarkan ID
// ============================================================
app.get('/api/media/:id', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM media WHERE id_media = ?', [req.params.id]);

        if (rows.length > 0) {
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ message: 'Media tidak ditemukan' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Kesalahan Server' });
    }
});

// ============================================================
// POST /api/media: Menambahkan media baru
// ============================================================
app.post('/api/media', async (req, res) => {
    const { judul, tahun_rilis, genre } = req.body;

    if (!judul || !tahun_rilis || !genre) {
        return res.status(400).json({ message: 'Semua field (judul, tahun_rilis, genre) harus diisi' });
    }

    try {
        const sql = 'INSERT INTO media (judul, tahun_rilis, genre) VALUES (?, ?, ?)';
        const [result] = await db.query(sql, [judul, tahun_rilis, genre]);

        const newMedia = { id_media: result.insertId, judul, tahun_rilis, genre };
        res.status(201).json(newMedia);
    } catch (error) {
        res.status(500).json({ message: 'Kesalahan Server' });
    }
});

// ============================================================
// PUT /api/media/:id: Memperbarui data media
// ============================================================
app.put('/api/media/:id', async (req, res) => {
    const id = req.params.id;
    const { judul, tahun_rilis, genre } = req.body;

    if (!judul || !tahun_rilis || !genre) {
        return res.status(400).json({ message: 'Data tidak lengkap' });
    }

    try {
        const sql = 'UPDATE media SET judul = ?, tahun_rilis = ?, genre = ? WHERE id_media = ?';
        const [result] = await db.query(sql, [judul, tahun_rilis, genre, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Media tidak ditemukan untuk diperbarui' });
        }

        const updatedMedia = { id_media: parseInt(id), judul, tahun_rilis, genre };
        res.status(200).json(updatedMedia);
    } catch (error) {
        res.status(500).json({ message: 'Kesalahan Server' });
    }
});

// ============================================================
// DELETE /api/media/:id: Menghapus media
// ============================================================
app.delete('/api/media/:id', async (req, res) => {
    const id = req.params.id;

    try {
        const [result] = await db.query('DELETE FROM media WHERE id_media = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Media tidak ditemukan untuk dihapus' });
        }

        res.status(204).send(); // No Content
    } catch (error) {
        res.status(500).json({ message: 'Kesalahan Server' });
    }
});

// ============================================================
// Jalankan server
// ============================================================
app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port} Ctrl+C to stop`);
});
