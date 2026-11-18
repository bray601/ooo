# Software Requirements Specification (SRS)
## Social Media Intelligence & SNA Dashboard

- **Versi dokumen:** 0.1 (Draft)
- **Status:** Baseline kebutuhan awal
- **Jenis aplikasi:** Web lokal / self-hosted
- **Bahasa implementasi awal:** JavaScript/TypeScript dengan Node.js
- **Deployment:** Docker Compose

---

## 1. Introduction

### 1.1 Purpose
Dokumen ini mendefinisikan kebutuhan fungsional, non-fungsional, data, antarmuka, integrasi, dan kriteria penerimaan untuk aplikasi Social Media Intelligence & SNA Dashboard. Dokumen menjadi acuan product owner, analis sistem, UI/UX designer, backend/frontend developer, database engineer, dan QA.

### 1.2 Product scope
Produk merupakan dashboard tunggal untuk:
- Mengambil data media sosial melalui provider EnsembleData.
- Mengelola akun, postingan, komentar, hashtag, dan interaksi.
- Membentuk graf jaringan dari relasi yang teramati.
- Menghitung metrik Social Network Analysis.
- Menampilkan graf interaktif dengan node, edge, animasi, filter, dan detail.
- Menyimpan proyek, dataset, konfigurasi, hasil analisis, serta laporan.

Aplikasi tidak boleh mengklaim dapat mengambil semua data dari semua platform. Cakupan ditentukan oleh endpoint, izin, paket, rate limit, dan ketentuan provider/platform.

### 1.3 Definitions
| Istilah | Definisi |
|---|---|
| SNA | Social Network Analysis, analisis struktur jaringan |
| Node | Entitas dalam graf, misalnya akun atau hashtag |
| Edge | Relasi antar node |
| Directed graph | Graf dengan arah relasi |
| Weighted graph | Graf dengan bobot pada edge |
| Betweenness | Centrality berdasarkan shortest paths |
| Dataset | Kumpulan data hasil pengambilan atau impor |
| Collection job | Proses asinkron untuk mengambil data |
| Snapshot | Representasi data/graf pada waktu tertentu |
| Provider | Layanan eksternal sumber data, dalam hal ini EnsembleData |

### 1.4 References and assumptions
- API EnsembleData akan mengikuti dokumentasi resmi dan kredensial yang disediakan pemilik aplikasi.
- Format data internal bersifat provider-agnostic.
- Aplikasi tahap awal dijalankan lokal melalui Docker Compose.
- PostgreSQL menjadi database utama; Redis untuk queue/cache.
- Pengguna memiliki hak dan dasar yang sah untuk mengakses dan menganalisis data.

---

## 2. Overall description

### 2.1 Product perspective
Sistem menggunakan arsitektur modular monolith dengan proses worker terpisah untuk tugas berat.

```text
Browser
  |
  v
Nginx (localhost:8080)
  |
  +--> React Dashboard
  |
  +--> Node.js REST API
          |
          +--> PostgreSQL
          +--> Redis / BullMQ
          +--> EnsembleData Adapter
          |
          +--> Worker: collection + normalization + SNA
```

### 2.2 User classes
| Role | Hak akses |
|---|---|
| Administrator | Mengelola konfigurasi, pengguna, provider, seluruh project |
| Analyst | Membuat project, collection, graf, analisis, dan laporan |
| Viewer | Melihat dashboard, graf, dan laporan yang diizinkan |

Untuk MVP satu pengguna lokal dapat menjadi default. Role-based access control wajib tersedia sebelum aplikasi dipakai bersama.

### 2.3 Operating environment
- OS host: Windows, macOS, atau Linux yang mendukung Docker.
- Browser modern: Chrome, Edge, Firefox, Safari versi yang masih didukung.
- Container: web, API, worker, PostgreSQL, Redis, Nginx.
- Akses default: localhost; akses LAN tidak aktif secara default.

### 2.4 Design constraints
- Backend awal menggunakan Node.js.
- Seluruh layanan harus dapat dijalankan dengan Docker Compose.
- API key provider tidak boleh terekspos di browser.
- Collection dan analisis berat berjalan asynchronous.
- Graf besar harus dibatasi, difilter, atau disampling untuk menjaga responsivitas.
- Integrasi provider harus melalui adapter agar tidak mengunci domain ke satu vendor.

### 2.5 Assumptions and dependencies
- Pengguna menyediakan API key dan dokumentasi EnsembleData.
- Provider mengizinkan jenis collection yang dipilih.
- Tidak semua platform menyediakan data trending, komentar, follower, atau interaksi yang sama.
- Fitur tertentu bergantung pada kuota dan kemampuan endpoint provider.

---

## 3. Functional requirements

Prioritas: **P0** = wajib MVP, **P1** = penting setelah MVP, **P2** = pengembangan lanjutan.

### FR-001 — Dashboard utama (P0)
Sistem harus menyediakan satu dashboard terpadu sebagai pintu masuk seluruh modul.
- Menampilkan jumlah project, dataset, akun, postingan, interaksi, collection job, dan analisis.
- Menampilkan job terbaru beserta status.
- Menampilkan ringkasan hasil analisis terakhir.
- Menyediakan navigasi ke collection, data explorer, graph explorer, analysis, dan reports.

**Acceptance:** setelah login/akses lokal, pengguna dapat melihat ringkasan dan membuka modul utama dari dashboard yang sama.

### FR-002 — Project management (P0)
- Pengguna dapat membuat, melihat, mengubah, dan mengarsipkan project.
- Project memiliki nama, deskripsi, pemilik, waktu dibuat, dan status.
- Dataset dan analisis dapat dikaitkan ke project.

### FR-003 — Data source configuration (P0)
- Administrator dapat mengatur provider dan status koneksi.
- Secret disimpan pada environment/secret store, tidak dikirim ke frontend.
- Sistem menyediakan uji koneksi jika didukung API provider.
- Sistem menampilkan status konfigurasi tanpa membocorkan secret.

### FR-004 — Collection by target account (P0)
- Pengguna dapat memasukkan identifier akun sesuai format provider.
- Pengguna dapat memilih platform/provider jika tersedia lebih dari satu.
- Pengguna dapat menentukan rentang waktu dan batas data bila endpoint mendukung.
- Sistem membuat collection job dan menampilkan status serta log ringkas.

### FR-005 — Collection by keyword/topic/hashtag (P0)
- Pengguna dapat memasukkan satu atau lebih keyword, topik, atau hashtag.
- Pengguna dapat memilih filter waktu, platform, dan batas hasil sesuai kemampuan provider.
- Sistem menyimpan query dan parameter collection sebagai provenance.

### FR-006 — Trending discovery (P1)
- Sistem menyediakan collection berbasis trending hanya jika endpoint provider mendukungnya.
- Pengguna dapat memilih wilayah, platform, kategori, atau periode jika tersedia.
- Jika provider tidak mendukung parameter tertentu, UI harus menonaktifkan opsi dan menjelaskan keterbatasannya.

### FR-007 — Collection job processing (P0)
- Job memiliki status queued, running, succeeded, partial, failed, cancelled.
- Sistem menyimpan waktu mulai/selesai, parameter, jumlah hasil, error summary, dan retry count.
- Sistem mendukung retry yang aman dan tidak menggandakan record.
- Sistem menangani rate limit, timeout, pagination, dan error provider secara terkontrol.
- Job dapat dibatalkan jika aman dan didukung worker.

### FR-008 — Data normalization and deduplication (P0)
- Sistem menormalisasi akun, postingan, komentar, hashtag, dan interaksi ke skema internal.
- Sistem menyimpan external ID dan provider/platform.
- Sistem mencegah duplikasi berdasarkan kunci eksternal.
- Payload mentah boleh disimpan dalam JSONB sesuai izin dan kebijakan retensi.
- Record menyimpan sumber, collection job, dan waktu pengambilan.

### FR-009 — Data explorer (P0)
- Pengguna dapat menelusuri akun, postingan, komentar, hashtag, dan interaksi.
- Pengguna dapat mencari dan memfilter berdasarkan project, dataset, platform, tanggal, dan tipe.
- Detail record menampilkan provenance dan atribut yang tersedia.
- Pengguna dapat mengekspor data terpilih ke CSV/JSON sesuai hak akses.

### FR-010 — Graph configuration (P0)
Sebelum graf dibangun, pengguna dapat menentukan:
- Jenis node: account, post, hashtag, atau kombinasi.
- Jenis edge: mention, reply, repost/share, comment, follow (jika tersedia), co-occurrence.
- Arah graf: directed atau undirected.
- Bobot: unweighted atau weighted; definisi bobot harus ditampilkan.
- Rentang waktu dan filter dataset.
- Batas node/edge serta opsi filter/sampling.

Sistem harus menjelaskan semantik edge. Contoh: mention A→B berarti A menyebut B, bukan berarti A mengikuti B.

### FR-011 — Graph generation and snapshot (P0)
- Sistem membentuk node dan edge berdasarkan konfigurasi.
- Sistem menyimpan snapshot graf dan parameter pembentukannya.
- Sistem menampilkan jumlah node, edge, komponen, arah, dan status.
- Sistem menangani node/edge duplikat sesuai aturan graf.
- Sistem memberi peringatan jika graf kosong, terlalu besar, atau tidak cocok untuk metrik tertentu.

### FR-012 — SNA metric selection (P0)
Pengguna dapat memilih satu atau lebih metrik yang tersedia:
1. Degree centrality (in/out/total).
2. Betweenness centrality.
3. Closeness centrality atau harmonic closeness.
4. Eigenvector centrality.
5. PageRank.
6. Density.
7. Connected components.
8. Modularity/community detection.
9. Clustering coefficient.
10. Reciprocity untuk graf berarah.

Sistem harus:
- Menjelaskan arti singkat setiap metrik.
- Menampilkan prasyarat dan kompatibilitas directed/undirected serta weighted/unweighted.
- Memvalidasi graf sebelum perhitungan.
- Menyimpan versi algoritma, parameter, dan konfigurasi.
- Menyajikan hasil graf-level dan/atau node-level sesuai metrik.
- Menampilkan status/peringatan bila metrik tidak dapat dihitung.

### FR-013 — SNA execution (P0)
- Perhitungan dilakukan sebagai background job untuk dataset/graf yang melewati ambang ukuran.
- Sistem menyimpan status, durasi, parameter, dan error.
- Pengguna dapat membuka hasil analisis sebelumnya.
- Hasil harus terkait dengan graph snapshot tertentu agar reproducible.

### FR-014 — Graph visualization (P0)
Graph explorer harus menyediakan:
- Node dan edge yang dapat dipilih.
- Zoom, pan, fit-to-screen, dan reset layout.
- Tooltip/side panel untuk detail node/edge.
- Search node berdasarkan nama/ID.
- Filter berdasarkan tipe node, tipe edge, komunitas, dan metrik.
- Legend warna dan ukuran.
- Styling node size/color dan edge width/color berdasarkan atribut atau metrik.
- Layout force-directed minimal.

### FR-015 — Graph animation (P1)
- Animasi transisi layout dan perubahan style.
- Playback temporal jika data memiliki timestamp yang memadai.
- Play, pause, reset, dan pengaturan kecepatan.
- Animasi tidak boleh menghalangi aksesibilitas atau membuat graf tidak dapat digunakan.
- Sediakan mode reduced-motion atau opsi mematikan animasi.

### FR-016 — Community analysis (P1)
- Sistem dapat menjalankan algoritma komunitas yang didukung engine.
- Setiap komunitas memiliki ID, ukuran, dan ringkasan anggota.
- Graf dapat diberi warna berdasarkan komunitas.
- Nama/label komunitas bersifat deskriptif otomatis dan tidak boleh dipresentasikan sebagai fakta tanpa validasi.

### FR-017 — Saved graph views (P1)
- Pengguna dapat menyimpan filter, layout, metric overlay, dan konfigurasi tampilan.
- Saved view dapat dibuka kembali pada snapshot yang sama.

### FR-018 — Reports and export (P1)
- Sistem menyediakan ringkasan project, collection, graf, dan metrik.
- Ekspor CSV/JSON untuk tabel.
- Ekspor gambar graf jika didukung browser/library.
- PDF report dapat menjadi iterasi lanjutan.
- Laporan mencantumkan sumber, rentang waktu, parameter, dan keterbatasan.

### FR-019 — User and access management (P1)
- Sistem mendukung role Administrator, Analyst, Viewer.
- Endpoint dan tampilan dibatasi sesuai role.
- Sesi dan kredensial dilindungi.

### FR-020 — Audit and operational logs (P1)
- Sistem mencatat aktivitas penting: collection, perubahan konfigurasi, analisis, ekspor, dan penghapusan.
- Log tidak boleh mencatat API key atau secret.
- Administrator dapat melihat error operasional.

---

## 4. Non-functional requirements

### NFR-001 Performance
- Dashboard umum menampilkan konten awal dalam target 3 detik pada lingkungan lokal yang memenuhi spesifikasi.
- API CRUD umum memiliki target p95 < 1 detik untuk dataset MVP berukuran wajar.
- Job collection dan SNA berjalan asynchronous; UI menampilkan progress/status.
- Graph explorer menerapkan batas default dan progressive rendering untuk graf besar.
- Angka performa final ditetapkan setelah benchmark dataset representatif.

### NFR-002 Scalability
- Worker dapat ditambah jumlahnya tanpa mengubah API contract.
- Collection dan SNA diproses melalui queue.
- Query database menggunakan indeks pada foreign key, external ID, timestamp, dan kolom filter umum.

### NFR-003 Security
- Secret provider hanya berada di backend/secret environment.
- Validasi input di server.
- CORS dibatasi ke origin aplikasi.
- Rate limit pada endpoint sensitif.
- Autentikasi dan otorisasi diterapkan sebelum multi-user.
- Container berjalan dengan privilege minimum jika memungkinkan.
- Database tidak diekspos ke jaringan publik.

### NFR-004 Privacy and compliance
- Data diambil hanya melalui akses yang diizinkan.
- Sistem menyimpan provenance dan mendukung penghapusan data.
- Retensi dapat dikonfigurasi.
- Hindari menyimpulkan identitas, afiliasi, atau atribut sensitif individu dari metrik jaringan.
- Tampilkan bahwa centrality bukan bukti otomatis tentang kredibilitas, niat, atau pengaruh kausal.

### NFR-005 Reliability
- Job gagal tidak boleh merusak data yang sudah tersimpan.
- Retry harus idempotent.
- Database memiliki prosedur backup/restore.
- Health check tersedia untuk layanan inti.

### NFR-006 Maintainability
- Modul collection, provider, graph, SNA, dan reporting dipisahkan.
- API memiliki versioning dan dokumentasi.
- TypeScript direkomendasikan untuk mengurangi kesalahan kontrak data.
- Test unit, integration, dan end-to-end disediakan.

### NFR-007 Usability and accessibility
- Satu dashboard menjadi entry point utama.
- Istilah metrik disertai penjelasan singkat.
- Warna graf memiliki legend dan tidak menjadi satu-satunya pembeda.
- Keyboard navigation dan reduced-motion diperhatikan.

### NFR-008 Portability
- Aplikasi dapat dijalankan pada host yang mendukung Docker.
- Konfigurasi dilakukan melalui `.env`.
- Data persisten menggunakan Docker volumes.

---

## 5. External interface requirements

### 5.1 User interface
Menu utama:
1. Overview
2. Projects
3. Data Collection
4. Data Explorer
5. Graph Builder
6. SNA Analysis
7. Graph Explorer
8. Reports
9. Settings

Alur inti:
`Project → Collection → Dataset → Graph Builder → Metric Selection → Run Analysis → Graph Explorer → Report`

### 5.2 Provider interface
Adapter provider minimal memiliki operasi konseptual:
- `searchPosts(input)`
- `getAccount(input)`
- `getAccountPosts(input)` bila didukung
- `getTrending(input)` bila didukung
- `getPostDetails(input)` bila didukung

Nama operasi di atas adalah kontrak internal aplikasi, bukan klaim nama endpoint resmi EnsembleData. Pemetaan endpoint aktual harus dilakukan setelah dokumentasi provider diverifikasi.

### 5.3 Internal API (proposed)
| Method | Endpoint | Fungsi |
|---|---|---|
| GET | `/api/v1/health` | Health check |
| GET/POST | `/api/v1/projects` | Daftar/buat project |
| GET/POST | `/api/v1/collection-jobs` | Daftar/buat job |
| GET | `/api/v1/collection-jobs/:id` | Status job |
| GET | `/api/v1/datasets/:id` | Detail dataset |
| GET | `/api/v1/accounts` | Cari akun |
| GET | `/api/v1/posts` | Cari postingan |
| POST | `/api/v1/graphs/build` | Membentuk graf |
| GET | `/api/v1/graphs/:id` | Detail snapshot graf |
| POST | `/api/v1/analyses` | Menjalankan analisis |
| GET | `/api/v1/analyses/:id` | Hasil analisis |
| GET | `/api/v1/graphs/:id/metrics` | Hasil metrik |

Endpoint adalah rancangan awal; finalisasi mengikuti implementasi dan kebutuhan UI.

---

## 6. Data requirements

### 6.1 Recommended entities
| Entity/table | Keterangan | Relasi utama |
|---|---|---|
| users | Pengguna lokal | projects |
| projects | Ruang kerja | datasets, jobs, analyses |
| data_sources | Provider/platform | jobs |
| collection_jobs | Job pengambilan | datasets, raw records |
| datasets | Kumpulan data | accounts, posts, interactions |
| accounts | Akun sosial | posts, interactions |
| posts | Postingan | accounts, comments, hashtags |
| comments | Komentar/reply | posts, accounts |
| hashtags | Hashtag | post_hashtags |
| post_hashtags | Junction post-hashtag | posts, hashtags |
| interactions | Relasi teramati | accounts/posts |
| mentions | Mention eksplisit | accounts, posts/comments |
| graph_snapshots | Snapshot graf | graph_nodes, graph_edges |
| graph_nodes | Node graf | snapshot, source entity |
| graph_edges | Edge graf | snapshot, source/target node |
| analysis_runs | Eksekusi SNA | snapshot, metric_results |
| metric_results | Nilai metrik | analysis, node |
| communities | Komunitas | analysis |
| community_members | Keanggotaan | communities, nodes |
| saved_graph_views | Tampilan tersimpan | snapshot, user |
| audit_logs | Audit | user/project |

### 6.2 Data integrity
- Internal primary key menggunakan UUID.
- External identity menggunakan kombinasi provider/platform/external_id.
- Timestamp menggunakan UTC.
- Foreign key dan unique constraint wajib diterapkan.
- Interaksi menyimpan jenis relasi dan arah.
- Bobot edge harus memiliki definisi yang eksplisit.
- Graph snapshot harus immutable setelah analisis selesai; perubahan membentuk snapshot baru.

### 6.3 Initial SQL
Lihat `database/schema.sql` pada paket dokumentasi. SQL tersebut merupakan rancangan awal yang perlu disesuaikan dengan bentuk payload provider dan migrasi ORM.

---

## 7. SNA methodology requirements

### 7.1 Graph semantics
Sebelum analisis, pengguna wajib memilih:
- Unit node.
- Definisi edge.
- Directed/undirected.
- Weighted/unweighted.
- Rentang waktu.
- Filter dataset.

### 7.2 Metric catalogue
| Metrik | Level | Kegunaan | Catatan |
|---|---|---|---|
| Degree centrality | Node | Banyaknya koneksi | Pisahkan in/out pada directed graph |
| Betweenness | Node | Peran pada shortest path | Mahal pada graf besar; dapat memakai aproksimasi |
| Closeness | Node | Jarak rata-rata ke node lain | Graf terputus perlu harmonic closeness/penanganan |
| Eigenvector | Node | Terhubung ke node yang juga penting | Konvergensi dan komponen perlu diperhatikan |
| PageRank | Node | Skor berdasarkan struktur link berarah | Parameter damping harus dicatat |
| Density | Graph | Kepadatan jaringan | Interpretasi berbeda menurut arah/self-loop |
| Modularity | Graph/community | Kualitas partisi komunitas | Bergantung algoritma dan resolusi |
| Clustering coefficient | Node/graph | Kecenderungan tetangga saling terhubung | Definisi directed/weighted dapat berbeda |
| Components | Graph/node | Komponen terhubung | Weak/strong components untuk directed |
| Reciprocity | Graph | Timbal balik edge | Relevan untuk graf berarah |

### 7.3 Reproducibility
Setiap `analysis_run` wajib menyimpan:
- graph snapshot ID.
- metrik yang dipilih.
- parameter algoritma.
- versi engine/library.
- timestamp mulai/selesai.
- status dan error.
- mode exact/approximate jika relevan.

### 7.4 Interpretation safeguards
UI harus membedakan hasil kuantitatif dari interpretasi. Contoh: betweenness tinggi menunjukkan posisi perantara pada jaringan yang dimodelkan, bukan otomatis membuktikan akun sebagai aktor pengendali, sumber informasi, atau pihak yang berpengaruh secara kausal.

---

## 8. Docker and deployment requirements

### 8.1 Services
- `web`: frontend React.
- `api`: backend Express.
- `worker`: BullMQ worker.
- `postgres`: database.
- `redis`: queue/cache.
- `nginx`: reverse proxy.

### 8.2 Persistence
- PostgreSQL menggunakan named volume.
- File ekspor disimpan pada volume/folder lokal.
- `.env` tidak boleh dimasukkan ke version control.
- Backup database dilakukan berkala.

### 8.3 Local ports
- `8080`: aplikasi melalui Nginx.
- `5432`: PostgreSQL, idealnya hanya bind localhost atau tidak dipublikasikan.
- `6379`: Redis, idealnya tidak dipublikasikan ke host.

---

## 9. Error handling

Sistem minimal menangani:
- Invalid input.
- Provider authentication failure.
- Provider rate limit.
- Provider timeout/unavailable.
- Pagination interruption.
- Partial data response.
- Duplicate record.
- Empty graph.
- Unsupported metric configuration.
- SNA computation timeout/memory limit.
- Database/Redis unavailable.

Pesan untuk pengguna harus ringkas dan tidak membocorkan stack trace atau secret. Detail teknis dicatat di log.

---

## 10. Acceptance criteria for MVP

MVP diterima jika seluruh hal berikut dapat didemonstrasikan:

1. `docker compose up --build` menjalankan layanan inti.
2. Dashboard lokal dapat dibuka melalui satu URL.
3. Pengguna dapat membuat project.
4. Pengguna dapat mengirim collection job berdasarkan target akun dan keyword melalui adapter provider yang sudah diverifikasi.
5. Job menampilkan status, log ringkas, dan jumlah data.
6. Data akun/postingan/interaksi tersimpan tanpa duplikasi.
7. Pengguna dapat memilih dataset dan konfigurasi graf.
8. Graf menampilkan node dan edge sesuai definisi relasi.
9. Pengguna dapat memilih dan menjalankan Degree, Betweenness, Closeness, PageRank, Density, dan Modularity jika prasyaratnya terpenuhi.
10. Node dapat diberi ukuran/warna berdasarkan metrik.
11. Graph explorer mendukung zoom, pan, search, filter, dan detail.
12. Hasil analisis tersimpan dan dapat dibuka kembali.
13. API key tidak terlihat di browser atau log.
14. Pengguna mendapat peringatan untuk metrik yang tidak kompatibel dengan graf.
15. README menjelaskan konfigurasi, startup, shutdown, dan backup dasar.

---

## 11. Risks and open questions

| Risiko/pertanyaan | Dampak | Tindak lanjut |
|---|---|---|
| Endpoint dan kemampuan EnsembleData belum diverifikasi | Fitur collection dapat berbeda | Minta dokumentasi API, contoh payload, dan API key |
| Platform sosial memiliki batas akses berbeda | Data tidak lengkap | Buat capability matrix per endpoint/platform |
| Graf sangat besar | Browser dan SNA lambat | Filtering, sampling, worker, batas graf |
| Semantik edge ambigu | Kesimpulan analisis keliru | Wajib definisi relasi dan provenance |
| Perubahan API provider | Integrasi rusak | Adapter, contract test, versioning |
| Kebijakan privasi/retensi | Risiko kepatuhan | Tetapkan tujuan, dasar akses, retensi, dan penghapusan |

### Open questions for implementation
1. Platform sosial apa yang menjadi prioritas MVP?
2. Apakah EnsembleData yang dimaksud adalah layanan/provider tertentu? Mohon dokumentasi API atau contoh respons.
3. Apakah aplikasi hanya dipakai satu pengguna lokal atau beberapa pengguna melalui LAN?
4. Berapa kisaran ukuran dataset/graf yang ditargetkan?
5. Apakah perlu ekspor PDF pada MVP atau cukup CSV/JSON?

---

## 12. Recommended implementation roadmap

| Fase | Deliverable |
|---|---|
| 1. Foundation | Docker Compose, React shell, Express API, PostgreSQL, Redis |
| 2. Provider | Adapter EnsembleData, collection jobs, normalization |
| 3. Data layer | Project/dataset explorer dan relasi data |
| 4. Graph builder | Konfigurasi node-edge dan snapshot |
| 5. SNA engine | Metrik, community detection, metric result |
| 6. Visualization | Cytoscape explorer, styling, filter, animation |
| 7. Reporting | Ekspor, audit, backup, hardening |

**Dokumen ini merupakan SRS draft 0.1.** Detail endpoint, field payload, kuota, dan cakupan data EnsembleData harus dikonfirmasi sebelum estimasi final dan implementasi integrasi.
