# Social Media Intelligence & SNA Dashboard

> Dokumentasi awal untuk aplikasi web lokal pengumpulan data media sosial dan analisis Social Network Analysis (SNA).

## 1. Ringkasan

Social Media Intelligence & SNA Dashboard adalah aplikasi web lokal berbasis satu dashboard terpadu untuk mengumpulkan, mengelola, mengeksplorasi, dan menganalisis data media sosial. Data diperoleh melalui adapter penyedia data **EnsembleData** (nama provider, endpoint, autentikasi, cakupan platform, dan batas penggunaan wajib diverifikasi terhadap dokumentasi/kontrak API yang digunakan).

Aplikasi menyajikan hasil analisis dalam bentuk graf interaktif yang terdiri dari:
- **Node**: akun, postingan, hashtag, topik, atau entitas lain.
- **Edge**: relasi seperti mention, reply, repost/share, komentar, mengikuti, atau kemunculan bersama.
- **Metric overlay**: ukuran/warna node dan ketebalan edge berdasarkan metrik yang dipilih.
- **Animation**: animasi tata letak, penelusuran relasi, dan perubahan graf dari waktu ke waktu.

Aplikasi dirancang untuk penggunaan lokal melalui Docker Compose. Penggunaan data harus mematuhi ketentuan API provider, kebijakan platform, privasi, dan hukum yang berlaku.

## 2. Tujuan

1. Menyatukan proses pengumpulan dan analisis data sosial dalam satu dashboard.
2. Memungkinkan pencarian berdasarkan akun target, kata kunci, hashtag, topik, dan trending yang tersedia dari provider.
3. Mengubah data interaksi menjadi jaringan yang dapat dianalisis.
4. Menyediakan pemilihan metrik SNA sesuai kebutuhan analisis.
5. Menyimpan proyek, dataset, konfigurasi, hasil analisis, dan laporan agar analisis dapat diulang.

## 3. Ruang lingkup fitur

### 3.1 Dashboard
- Ringkasan proyek dan dataset.
- Statistik jumlah akun, postingan, interaksi, node, dan edge.
- Riwayat pengambilan data dan status job.
- Ringkasan metrik dan grafik tren.

### 3.2 Data collection
- Input target: akun/username/URL/ID yang didukung provider.
- Input pencarian: keyword, hashtag, topik.
- Penemuan trending: hanya jika provider menyediakan endpoint dan wilayah/platform yang relevan.
- Parameter waktu, batas hasil, platform, dan jenis konten.
- Preview hasil sebelum disimpan.
- Deduplication, retry, rate-limit handling, dan pencatatan provenance.
- Status job: queued, running, succeeded, partial, failed, cancelled.

### 3.3 Data management
- Dataset dan project terpisah.
- Profil akun, postingan, komentar, hashtag, mention, dan interaksi.
- Filter berdasarkan platform, waktu, tipe relasi, dan target.
- Impor/ekspor data yang diizinkan (CSV/JSON).
- Data mentah disimpan terpisah dari data ternormalisasi.

### 3.4 SNA
Metrik yang dapat dipilih:
- Degree centrality (in-degree, out-degree, total degree).
- Betweenness centrality.
- Closeness centrality.
- Eigenvector centrality.
- PageRank.
- Density.
- Connected components.
- Modularity/community detection.
- Clustering coefficient.
- Reciprocity (untuk graf berarah).

Setiap metrik harus menjelaskan definisi, arah graf, normalisasi, kebutuhan bobot, dan keterbatasannya. Metrik yang tidak relevan untuk tipe graf tertentu dinonaktifkan atau diberi peringatan.

### 3.5 Graph explorer
- Mode node: akun, postingan, hashtag, atau campuran.
- Mode edge: mention, reply, repost/share, comment, follow, co-occurrence.
- Directed/undirected dan weighted/unweighted.
- Layout: force-directed, circular, grid, hierarchical (sesuai dukungan library).
- Node size/color dan edge width/color berdasarkan properti atau metrik.
- Search node, filter, zoom, pan, select, hover tooltip, expand neighbors.
- Community coloring, legend, detail panel.
- Animasi layout dan temporal playback.
- Batas jumlah node/edge untuk menjaga performa; opsi sampling/filter.

### 3.6 Reporting
- Simpan konfigurasi analisis.
- Ekspor ringkasan dan tabel metrik ke CSV/JSON.
- Ekspor laporan PDF pada iterasi lanjutan.
- Snapshot graf (PNG/SVG jika didukung library dan lingkungan browser).

## 4. Arsitektur yang direkomendasikan

**Modular Monolith** untuk tahap awal:
- `web`: React + Vite, dashboard dan graph explorer.
- `api`: Node.js + Express, autentikasi lokal, REST API, validasi, orkestrasi.
- `worker`: BullMQ worker untuk pengambilan data dan perhitungan SNA yang berat.
- `postgres`: penyimpanan relasional utama.
- `redis`: antrean job dan cache.
- `nginx`: reverse proxy dan satu entry point lokal.

Gunakan adapter `EnsembleDataProvider` agar integrasi provider tidak mengikat domain aplikasi ke bentuk API tertentu. Tambahkan adapter provider lain di masa depan tanpa mengubah modul SNA.

Neo4j **opsional**, bukan kebutuhan awal. PostgreSQL cukup untuk metadata, data mentah, relasi, dan dataset awal. Pertimbangkan Neo4j bila traversal graf skala besar dan query jalur menjadi kebutuhan dominan. Jangan menyimpan salinan data di dua database tanpa strategi sinkronisasi yang jelas.

## 5. Stack teknologi

| Lapisan | Rekomendasi | Alasan |
|---|---|---|
| Frontend | React + Vite | Ekosistem luas, cepat untuk dashboard |
| UI | Tailwind CSS | Konsistensi komponen |
| Graph UI | Cytoscape.js | Interaksi dan visualisasi graf |
| Backend | Node.js + Express | Sesuai preferensi dan mudah diintegrasikan |
| Validasi | Zod | Validasi request dan konfigurasi |
| Database | PostgreSQL | Relasional, JSONB, indeks kuat |
| Query layer | Prisma | Migrasi dan akses data terstruktur |
| Queue | Redis + BullMQ | Job collection dan analisis asinkron |
| SNA | Graphology + graphology-metrics | Model graf dan metrik |
| Container | Docker Compose | Lingkungan lokal konsisten |
| Reverse proxy | Nginx | Satu alamat akses lokal |

Versi package sebaiknya dikunci melalui lockfile pada saat implementasi. Jangan menganggap semua metrik tersedia di satu package; verifikasi API dan implementasi metrik yang dipilih.

## 6. Rekomendasi model data / tabel

| Tabel | Fungsi |
|---|---|
| `users` | Pengguna lokal dan role |
| `projects` | Ruang kerja analisis |
| `data_sources` | Konfigurasi provider dan platform |
| `collection_jobs` | Permintaan dan status pengambilan data |
| `datasets` | Kumpulan data hasil collection |
| `accounts` | Profil akun sosial |
| `posts` | Postingan |
| `comments` | Komentar/reply |
| `hashtags` | Hashtag |
| `post_hashtags` | Relasi postingan-hashtag |
| `interactions` | Relasi antar akun/objek |
| `mentions` | Mention akun di postingan/komentar |
| `graph_snapshots` | Snapshot node-edge untuk satu analisis |
| `graph_nodes` | Node pada snapshot graf |
| `graph_edges` | Edge pada snapshot graf |
| `analysis_runs` | Konfigurasi dan status analisis SNA |
| `metric_results` | Hasil metrik per node/graf |
| `communities` | Hasil deteksi komunitas |
| `community_members` | Anggota komunitas |
| `saved_graph_views` | Konfigurasi tampilan graf |
| `audit_logs` | Jejak aktivitas penting |

### Prinsip penyimpanan
- Gunakan UUID sebagai primary key internal.
- Simpan ID eksternal provider pada kolom terpisah dan beri unique constraint bersama platform/provider.
- Gunakan `JSONB` untuk payload mentah dan atribut provider yang bervariasi; kolom inti tetap dinormalisasi.
- Simpan timestamp dalam `TIMESTAMPTZ` (UTC).
- Simpan provenance: provider, waktu pengambilan, job, dan referensi sumber.
- Terapkan unique key untuk mencegah duplikasi akun/postingan.
- Simpan snapshot graf agar hasil analisis dapat direproduksi walaupun dataset berubah.
- Hindari menyimpan token API dalam tabel biasa; gunakan environment secret atau secret manager lokal.

Skema awal SQL berada di [`database/schema.sql`](database/schema.sql). Skema tersebut adalah fondasi, bukan migrasi produksi final.

## 7. Struktur direktori

```text
social-media-intelligence-sna/
├── README.md
├── SRS.md
├── Dockerfile
├── docker-compose.yml
├── .dockerignore
├── .env.example
├── package.json
├── nginx/
│   └── default.conf
├── apps/
│   ├── api/
│   │   └── src/
│   │       ├── modules/
│   │       │   ├── collection/
│   │       │   ├── accounts/
│   │       │   ├── posts/
│   │       │   ├── graphs/
│   │       │   ├── sna/
│   │       │   └── reports/
│   │       ├── providers/
│   │       │   └── ensembledata/
│   │       ├── middleware/
│   │       ├── config/
│   │       └── server.js
│   ├── worker/
│   │   └── src/
│   │       ├── jobs/
│   │       └── worker.js
│   └── web/
│       └── src/
│           ├── components/
│           ├── pages/
│           ├── features/
│           │   ├── dashboard/
│           │   ├── collection/
│           │   ├── graph-explorer/
│           │   └── analysis/
│           └── main.jsx
├── packages/
│   └── shared/
│       ├── schemas/
│       └── types/
├── database/
│   └── schema.sql
├── docs/
│   └── SRS.md
└── data/
    ├── postgres/
    └── exports/
```

## 8. Menjalankan dengan Docker

### Prasyarat
- Docker Desktop atau Docker Engine.
- Docker Compose plugin.
- Port lokal `8080`, `5432`, dan `6379` tidak sedang digunakan.

### Langkah awal
1. Salin `.env.example` menjadi `.env`.
2. Ganti seluruh secret/password contoh.
3. Isi kredensial EnsembleData setelah memperoleh dokumentasi dan akses API resmi.
4. Jalankan:

```bash
docker compose up --build -d
docker compose ps
docker compose logs -f
```

Akses dashboard melalui `http://localhost:8080`.

Hentikan layanan:

```bash
docker compose down
```

Hapus volume database (PERINGATAN: menghapus data lokal):

```bash
docker compose down -v
```

> File Docker pada paket ini adalah starter scaffold. Dockerfile aplikasi mengasumsikan struktur monorepo dan script package yang perlu disiapkan saat implementasi. Untuk produksi, tambahkan health check, backup, TLS, pembatasan jaringan, dan pengelolaan secret.

## 9. Integrasi EnsembleData

Implementasikan kontrak internal provider, misalnya:

```ts
interface SocialDataProvider {
  searchPosts(input: SearchInput): Promise<NormalizedPost[]>;
  getAccount(input: AccountInput): Promise<NormalizedAccount>;
  getTrending?(input: TrendingInput): Promise<TrendingItem[]>;
}
```

Adapter EnsembleData bertanggung jawab untuk:
1. Autentikasi sesuai dokumentasi provider.
2. Memetakan endpoint dan parameter yang benar.
3. Menghormati rate limit dan pagination.
4. Menyimpan payload mentah untuk audit/debug sesuai izin.
5. Menormalisasi hasil ke model internal.
6. Mencatat error, waktu pengambilan, dan provenance.

**Catatan penting:** nama provider ditulis sebagai EnsembleData mengikuti input kebutuhan. Endpoint, platform yang didukung, skema respons, kuota, dan izin penggunaan belum diasumsikan dalam dokumen ini. Verifikasi dengan dokumentasi/API key yang benar sebelum implementasi.

## 10. Prinsip analisis SNA

- Tentukan definisi node dan edge sebelum menghitung metrik.
- Bedakan graf berarah dan tidak berarah.
- Bedakan edge berbobot dan tidak berbobot.
- Contoh: edge A → B pada mention berarti akun A menyebut akun B; jangan menyimpulkan relasi follow.
- Betweenness mengukur seberapa sering node berada pada shortest path antar node lain; bukan ukuran otomatis atas kredibilitas atau kebenaran.
- PageRank/eigenvector mengukur posisi struktural berdasarkan koneksi; bukan bukti pengaruh di dunia nyata.
- Closeness dapat bermasalah pada graf terputus; gunakan harmonic closeness atau jelaskan metode penanganan.
- Catat algoritma, parameter, versi, filter, dan snapshot dataset untuk reproduksibilitas.

## 11. Keamanan, privasi, dan batasan

- Gunakan hanya API, data, dan metode akses yang diizinkan.
- Jangan melakukan bypass autentikasi, paywall, rate limit, atau kontrol platform.
- Minimalkan data personal; tetapkan retensi dan mekanisme penghapusan.
- Batasi dashboard ke localhost secara default.
- Lindungi API key dan jangan kirim ke frontend.
- Tambahkan autentikasi lokal bila aplikasi diakses oleh lebih dari satu pengguna.
- Sediakan audit log dan validasi input.
- Terapkan batas ukuran collection dan graf agar tidak menghabiskan resource.

## 12. Tahapan pengembangan

1. **MVP foundation**: Docker, PostgreSQL, Redis, API, UI shell, project/dataset.
2. **Provider integration**: verifikasi API EnsembleData, collection jobs, normalization, deduplication.
3. **Data management**: account, post, comment, hashtag, interaction.
4. **Graph builder**: definisi node-edge, filter, snapshot.
5. **SNA engine**: metrik terpilih, community detection, hasil tersimpan.
6. **Graph explorer**: layout, styling, search, animation, temporal view.
7. **Reporting & hardening**: ekspor, audit, backup, test, dokumentasi.

## 13. Kriteria MVP selesai

- Pengguna dapat membuat project dan dataset.
- Pengguna dapat mengirim collection job berdasarkan input target/keyword.
- Job memiliki status, log, dan penanganan error.
- Data yang didapat dinormalisasi dan tidak terduplikasi.
- Pengguna dapat memilih tipe node, edge, arah, dan bobot graf.
- Pengguna dapat memilih minimal Degree, Betweenness, Closeness, PageRank, Density, dan Modularity (sesuai validitas graf).
- Graf dapat di-zoom, di-pan, dicari, difilter, dan menampilkan detail node/edge.
- Konfigurasi dan hasil analisis dapat disimpan serta dijalankan ulang.
- Seluruh layanan inti dapat dijalankan melalui Docker Compose.

## 14. Dokumen terkait

- [`SRS.md`](SRS.md) — Software Requirements Specification.
- [`database/schema.sql`](database/schema.sql) — rancangan skema database awal.
