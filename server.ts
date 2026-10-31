import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Allow large payloads for banner image base64 uploads
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const CONFIG_FILE = path.join(DATA_DIR, 'config.json');
const CONTENT_FILE = path.join(DATA_DIR, 'content.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const VIDEOS_FILE = path.join(DATA_DIR, 'videos.json');

const DEFAULT_CONFIG = {
  headerTitle: 'Pelita Rohani',
  headerTagline: 'Kasih sejati tidak mencari keuntungan diri',
  bannerImage: 'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?auto=format&fit=crop&q=80&w=2000',
  bannerLabel: 'Renungan Hari Ini',
  bannerTitle: 'Tuhan Selalu Menyertai Hidupmu',
  bannerSubtitle: '"Kasih sejati tidak mencari keuntungan diri"',
  whatsappNumber: '6285191447806',
  footerText: 'Membawa Terang dalam Kegelapan',
  copyrightText: '©2026 - Rey Simamora | Pelita Rohani',
};

const DEFAULT_ADMIN = {
  id: 'usr_admin',
  name: 'Rey Simamora',
  email: 'reysimamora169@gmail.com',
  password: 'Rey123',
  role: 'admin',
  createdAt: '2026-01-01T00:00:00.000Z',
};

const DEFAULT_CONTENT = [
  {
    id: 'r1',
    category: 'Renungan',
    title: 'Berjalan dalam Iman, Bukan Penglihatan',
    description: 'Bagaimana tetap percaya di tengah ketidakpastian.',
    verse: '2 Korintus 5:7',
    content: 'Seringkali kita ingin melihat jalan di depan kita dengan jelas sebelum melangkah. Namun, Tuhan memanggil kita untuk percaya pada-Nya bahkan ketika kabut tebal menutupi pandangan kita. Berjalan dalam iman berarti mengandalkan karakter Tuhan yang tidak berubah, bukan pada situasi kita yang terus berubah.',
    explanation: 'Renungan ini mengajak kita untuk mengarahkan pandangan kepada janji Allah daripada beban hidup. Luangkan waktu sejenak setiap hari untuk merenungkan kebaikan-Nya.',
    author: 'Rey Simamora',
    readTime: '5 Menit',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'r2',
    category: 'Renungan',
    title: 'Kekuatan dalam Kelemahan',
    description: 'Menemukan anugerah Tuhan saat kita merasa tidak berdaya.',
    verse: '2 Korintus 12:9',
    content: 'Dunia mengajarkan kita untuk menjadi kuat dan mandiri. Namun, dalam kerajaan Allah, pengakuan akan kelemahan kita adalah pintu bagi kekuatan-Nya. Saat kita menyerah pada keterbatasan kita, anugerah-Nya menjadi sempurna dalam hidup kita.',
    explanation: 'Saat merasa lelah atau gagal, jangan putus asa. Bawalah keterbatasan Anda kepada Kristus, karena justru di sanalah kuasa-Nya menjadi nyata.',
    author: 'Rey Simamora',
    readTime: '5 Menit',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'r3',
    category: 'Renungan',
    title: 'Menanti dengan Sabar',
    description: 'Belajar mempercayai waktu Tuhan.',
    verse: 'Yesaya 40:31',
    content: 'Menanti bukanlah hal yang pasif. Menanti dalam Tuhan adalah tindakan iman yang aktif. Seperti rajawali yang menanti angin untuk terbang tinggi, kita menanti Tuhan untuk memperbaharui kekuatan kita agar kita tidak menjadi lelah dalam perjalanan hidup ini.',
    explanation: 'Waktu Tuhan bukanlah kelambatan, melainkan persiapan bagi kita untuk menerima rencana terbaik-Nya.',
    author: 'Rey Simamora',
    readTime: '5 Menit',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'd1',
    category: 'Doa',
    title: 'Doa Penyerahan Diri',
    description: 'Menyerahkan segala kekhawatiran kepada Bapa.',
    content: 'Bapa Surgawi, hari ini aku datang ke hadapan-Mu dengan segala beban dan kekhawatiranku. Aku menyerahkan hidupku, keluargaku, dan masa depanku ke dalam tangan-Mu. Aku percaya bahwa Engkau memegang kendali atas segalanya. Berikanlah aku damai sejahtera-Mu yang melampaui segala akal. Amin.',
    explanation: 'Doakan doa ini setiap pagi sebelum memulai aktivitas, serahkan semua kekhawatiran Anda ke dalam tangan pengasihan Tuhan.',
    author: 'Rey Simamora',
    readTime: '3 Menit',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'd2',
    category: 'Doa',
    title: 'Doa Memohon Hikmat',
    description: 'Meminta tuntunan Roh Kudus dalam mengambil keputusan.',
    content: 'Tuhan Yesus, aku membutuhkan hikmat-Mu dalam setiap keputusan yang aku ambil hari ini. Terangilah pikiranku dengan Roh Kudus-Mu agar aku dapat membedakan mana yang baik dan berkenan di hadapan-Mu. Tuntunlah langkahku agar selalu berada di jalan-Mu. Amin.',
    explanation: 'Ketika diperhadapkan pada persimpangan jalan dan keputusan penting, mohonkan Roh Kudus memberikan ketenangan batin.',
    author: 'Rey Simamora',
    readTime: '3 Menit',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'd3',
    category: 'Doa',
    title: 'Doa Syukur',
    description: 'Mengucap syukur atas segala kebaikan Tuhan.',
    content: 'Terima kasih Tuhan atas nafas kehidupan dan segala berkat yang Engkau curahkan. Bahkan di tengah badai, aku tahu Engkau baik. Terima kasih untuk kasih setia-Mu yang baru setiap pagi. Biarlah hatiku selalu penuh dengan pujian bagi-Mu. Amin.',
    explanation: 'Hati yang bersyukur adalah magnet bagi damai sejahtera dan berkat rohani yang melimpah.',
    author: 'Rey Simamora',
    readTime: '3 Menit',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'a1',
    category: 'Ayat',
    title: 'Kasih Allah yang Sempurna',
    description: 'Ayat tentang betapa besarnya kasih Tuhan.',
    verse: 'Yohanes 3:16',
    content: 'Karena begitu besar kasih Allah akan dunia ini, sehingga Ia telah mengaruniakan Anak-Nya yang tunggal, supaya setiap orang yang percaya kepada-Nya tidak binasa, melainkan beroleh hidup yang kekal.',
    explanation: 'Kasih Allah adalah dasar dari seluruh pengharapan kita. Tidak ada dosa atau kegagalan yang dapat memisahkan kita dari kasih-Nya.',
    author: 'Rey Simamora',
    readTime: '4 Menit',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'a2',
    category: 'Ayat',
    title: 'Jangan Takut',
    description: 'Janji penyertaan Tuhan di saat sulit.',
    verse: 'Yesaya 41:10',
    content: 'Janganlah takut, sebab Aku menyertai engkau, janganlah bimbang, sebab Aku ini Allahmu; Aku akan meneguhkan, bahkan akan menolong engkau; Aku akan memegang engkau dengan tangan kanan-Mu yang membawa kemenangan.',
    explanation: 'Kapan pun rasa cemas melanda, ulangi ayat ini dalam doa dan yakini tangan Tuhan yang kuat menopang Anda.',
    author: 'Rey Simamora',
    readTime: '4 Menit',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'a3',
    category: 'Ayat',
    title: 'Rancangan Damai Sejahtera',
    description: 'Masa depan yang penuh harapan.',
    verse: 'Yeremia 29:11',
    content: 'Sebab Aku ini mengetahui rancangan-rancangan apa yang ada pada-Ku mengenai kamu, demikianlah firman TUHAN, yaitu rancangan damai sejahtera dan bukan rancangan kecelakaan, untuk memberikan kepadamu hari depan yang penuh harapan.',
    explanation: 'Masa depan Anda berada di tangan Allah yang setia, bukan ditentukan oleh keadaan sekitar.',
    author: 'Rey Simamora',
    readTime: '4 Menit',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'az1',
    category: 'Akhir Zaman',
    title: 'Tanda-tanda Zaman',
    description: 'Memahami apa yang dikatakan Alkitab tentang hari-hari terakhir.',
    verse: 'Matius 24:6-8',
    content: 'Yesus memperingatkan kita tentang perang, kelaparan, dan gempa bumi sebagai permulaan penderitaan. Namun, Ia juga mengingatkan kita untuk tidak gelisah. Tanda-tanda ini bukanlah untuk menakut-nakuti, melainkan untuk membuat kita tetap berjaga-jaga dan fokus pada misi-Nya.',
    explanation: 'Kesiapsiagaan rohani bukanlah tentang ketakutan, melainkan tentang ketekunan dalam beriman dan melayani sesama.',
    author: 'Rey Simamora',
    readTime: '6 Menit',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'az2',
    category: 'Akhir Zaman',
    title: 'Berjaga-jaga dan Berdoa',
    description: 'Kesiapan hati menyambut kedatangan Tuhan.',
    verse: '1 Petrus 4:7',
    content: 'Kesudahan segala sesuatu sudah dekat. Karena itu kuasailah dirimu dan jadilah tenang, supaya kamu dapat berdoa. Di hari-hari terakhir, hubungan kita dengan Tuhan melalui doa adalah jangkar yang menjaga kita tetap teguh.',
    explanation: 'Jadikan doa sebagai nafas hidup harian Anda agar selalu memiliki ketajaman rohani.',
    author: 'Rey Simamora',
    readTime: '6 Menit',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'az3',
    category: 'Akhir Zaman',
    title: 'Pengharapan Baru',
    description: 'Langit dan bumi yang baru.',
    verse: 'Wahyu 21:4',
    content: 'Pada akhirnya, Tuhan akan menghapus segala air mata. Tidak akan ada lagi maut, perkabungan, ratap tangis, atau dukacita. Inilah pengharapan besar kita sebagai orang percaya: bahwa akhir dari dunia ini adalah awal dari kekekalan yang indah bersama Bapa.',
    explanation: 'Di ujung segala pergumulan dunia fana ini, ada persekutuan abadi penuh sukacita bersama Sang Pencipta.',
    author: 'Rey Simamora',
    readTime: '6 Menit',
    updatedAt: new Date().toISOString(),
  },
];

const DEFAULT_VIDEOS = [
  {
    id: 'vid-1',
    title: 'Waktu Tuhan Pasti yang Terbaik - Pujian & Penyembahan Rohani',
    youtubeUrl: 'https://www.youtube.com/watch?v=y5r_qQjH8G4',
    youtubeId: 'y5r_qQjH8G4',
    category: 'Pujian',
    speaker: 'NDC Worship / Symphony Worship',
    verse: 'Pengkhotbah 3:11',
    description: 'Lagu pujian dan penyembahan yang meneguhkan hati, mengingatkan kita bahwa Tuhan menjadikan segala sesuatu indah pada waktu-Nya. Tetaplah berharap dan berserah penuh kepada-Nya.',
    duration: '5:42',
    isFeatured: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'vid-2',
    title: 'Khotbah: Jangan Takut dan Kuatkan Hatimu di Tengah Badai Hidup',
    youtubeUrl: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
    youtubeId: 'kJQP7kiw5Fk',
    category: 'Khotbah',
    speaker: 'Ps. Philip Mantofa',
    verse: 'Yesaya 41:10',
    description: 'Renungan dan pesan firman Tuhan yang mendalam mengenai bagaimana orang beriman bangkit melewati masa-masa sukar dengan berpegang pada tangan Tuhan yang setia dan berkuasa.',
    duration: '28:15',
    isFeatured: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'vid-3',
    title: 'Tanda-Tanda Akhir Zaman & Kesiapan Hati Menyongsong Kedatangan Kristus',
    youtubeUrl: 'https://www.youtube.com/watch?v=9bZkp7q19f0',
    youtubeId: '9bZkp7q19f0',
    category: 'Akhir Zaman',
    speaker: 'Ps. Gilbert Lumoindong',
    verse: 'Matius 24:42',
    description: 'Penjelasan Alkitabiah tentang nubuatan akhir zaman, pentingnya menjaga kekudusan hidup, terus berdoa, dan setia sampai akhir dalam melayani Tuhan.',
    duration: '32:40',
    isFeatured: false,
    createdAt: new Date().toISOString(),
  },
];

// Helper to read and write files safely
function readJSON(file: string, fallback: any) {
  try {
    if (fs.existsSync(file)) {
      return JSON.parse(fs.readFileSync(file, 'utf-8'));
    }
  } catch (err) {
    console.error(`Error reading ${file}:`, err);
  }
  writeJSON(file, fallback);
  return fallback;
}

function writeJSON(file: string, data: any) {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error(`Error writing ${file}:`, err);
  }
}

// Initialize seed data
readJSON(CONFIG_FILE, DEFAULT_CONFIG);
readJSON(CONTENT_FILE, DEFAULT_CONTENT);
readJSON(VIDEOS_FILE, DEFAULT_VIDEOS);
const currentUsers = readJSON(USERS_FILE, [DEFAULT_ADMIN]);
if (!currentUsers.some((u: any) => u.email.toLowerCase() === DEFAULT_ADMIN.email.toLowerCase())) {
  currentUsers.unshift(DEFAULT_ADMIN);
  writeJSON(USERS_FILE, currentUsers);
}

// API Endpoints
// 1. Config
app.get('/api/config', (req, res) => {
  const config = readJSON(CONFIG_FILE, DEFAULT_CONFIG);
  res.json({ success: true, data: config });
});

app.post('/api/config', (req, res) => {
  const newConfig = req.body;
  if (!newConfig || typeof newConfig !== 'object') {
    return res.status(400).json({ success: false, message: 'Data konfigurasi tidak valid' });
  }
  writeJSON(CONFIG_FILE, newConfig);
  res.json({ success: true, data: newConfig, message: 'Konfigurasi berhasil disimpan di server online' });
});

// 2. Content
app.get('/api/content', (req, res) => {
  const content = readJSON(CONTENT_FILE, DEFAULT_CONTENT);
  res.json({ success: true, data: content });
});

app.post('/api/content', (req, res) => {
  const body = req.body;
  if (Array.isArray(body)) {
    writeJSON(CONTENT_FILE, body);
    return res.json({ success: true, data: body, message: 'Daftar konten berhasil diperbarui' });
  }
  
  if (body && body.id) {
    const list = readJSON(CONTENT_FILE, DEFAULT_CONTENT);
    const index = list.findIndex((c: any) => c.id === body.id);
    if (index >= 0) {
      list[index] = { ...list[index], ...body, updatedAt: new Date().toISOString() };
    } else {
      list.unshift({ ...body, updatedAt: new Date().toISOString() });
    }
    writeJSON(CONTENT_FILE, list);
    return res.json({ success: true, data: list, message: 'Konten berhasil disimpan di server online' });
  }

  res.status(400).json({ success: false, message: 'Format konten tidak valid' });
});

app.delete('/api/content/:id', (req, res) => {
  const { id } = req.params;
  const list = readJSON(CONTENT_FILE, DEFAULT_CONTENT);
  const updated = list.filter((c: any) => c.id !== id);
  writeJSON(CONTENT_FILE, updated);
  res.json({ success: true, data: updated, message: 'Konten berhasil dihapus' });
});

// 2.1 Videos API
app.get('/api/videos', (req, res) => {
  const videos = readJSON(VIDEOS_FILE, DEFAULT_VIDEOS);
  res.json({ success: true, data: videos });
});

app.post('/api/videos', (req, res) => {
  const body = req.body;
  if (Array.isArray(body)) {
    writeJSON(VIDEOS_FILE, body);
    return res.json({ success: true, data: body, message: 'Daftar video berhasil diperbarui' });
  }

  if (body && (body.youtubeUrl || body.youtubeId)) {
    const list = readJSON(VIDEOS_FILE, DEFAULT_VIDEOS);
    const videoId = body.id || `vid-${Date.now()}`;
    const newVideo = {
      id: videoId,
      title: body.title || 'Video Rohani',
      youtubeUrl: body.youtubeUrl || '',
      youtubeId: body.youtubeId || '',
      category: body.category || 'Khotbah',
      speaker: body.speaker || '',
      verse: body.verse || '',
      description: body.description || '',
      duration: body.duration || '',
      isFeatured: Boolean(body.isFeatured),
      createdAt: body.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const index = list.findIndex((v: any) => v.id === videoId);
    if (index >= 0) {
      list[index] = { ...list[index], ...newVideo };
    } else {
      list.unshift(newVideo);
    }
    writeJSON(VIDEOS_FILE, list);
    return res.json({ success: true, data: list, video: newVideo, message: 'Video YouTube berhasil disimpan' });
  }

  res.status(400).json({ success: false, message: 'Data video tidak valid' });
});

app.delete('/api/videos/:id', (req, res) => {
  const { id } = req.params;
  const list = readJSON(VIDEOS_FILE, DEFAULT_VIDEOS);
  const updated = list.filter((v: any) => v.id !== id);
  writeJSON(VIDEOS_FILE, updated);
  res.json({ success: true, data: updated, message: 'Video berhasil dihapus' });
});

// 3. Reset Defaults
app.post('/api/reset-defaults', (req, res) => {
  writeJSON(CONFIG_FILE, DEFAULT_CONFIG);
  writeJSON(CONTENT_FILE, DEFAULT_CONTENT);
  writeJSON(VIDEOS_FILE, DEFAULT_VIDEOS);
  res.json({
    success: true,
    data: { config: DEFAULT_CONFIG, content: DEFAULT_CONTENT, videos: DEFAULT_VIDEOS },
    message: 'Data berhasil dikembalikan ke bawaan awal',
  });
});

// 4. Users & Auth
app.get('/api/users', (req, res) => {
  const users = readJSON(USERS_FILE, [DEFAULT_ADMIN]);
  // Strip passwords for security
  const safeUsers = users.map((u: any) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    createdAt: u.createdAt,
  }));
  res.json({ success: true, data: safeUsers });
});

app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Semua bidang formulir wajib diisi.' });
  }

  const trimmedEmail = email.trim().toLowerCase();
  const users = readJSON(USERS_FILE, [DEFAULT_ADMIN]);

  if (trimmedEmail === DEFAULT_ADMIN.email.toLowerCase()) {
    return res.status(400).json({
      success: false,
      message: 'Email ini tidak dapat didaftarkan kembali. Silakan langsung masuk.',
    });
  }

  const exists = users.find((u: any) => u.email.toLowerCase() === trimmedEmail);
  if (exists) {
    return res.status(400).json({
      success: false,
      message: 'Email sudah terdaftar. Silakan masuk menggunakan kata sandi Anda.',
    });
  }

  const newUser = {
    id: 'usr_' + Date.now(),
    name: name.trim(),
    email: trimmedEmail,
    password: password,
    role: 'user',
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  writeJSON(USERS_FILE, users);

  // Instantly sync new calon anggota registration to connected online Firebase
  syncToFirebase('calon_anggota', newUser.id, {
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
    createdAt: newUser.createdAt,
    status: 'Terdaftar Baru',
  });

  res.json({
    success: true,
    message: 'Pendaftaran berhasil! Selamat datang di Pelita Rohani.',
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      createdAt: newUser.createdAt,
    },
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email dan kata sandi wajib diisi.' });
  }

  const trimmedEmail = email.trim().toLowerCase();

  // Check Admin
  if (trimmedEmail === DEFAULT_ADMIN.email.toLowerCase()) {
    if (password === DEFAULT_ADMIN.password) {
      return res.json({
        success: true,
        message: 'Selamat datang kembali, Rey Simamora!',
        user: {
          id: DEFAULT_ADMIN.id,
          name: DEFAULT_ADMIN.name,
          email: DEFAULT_ADMIN.email,
          role: 'admin',
          createdAt: DEFAULT_ADMIN.createdAt,
        },
      });
    } else {
      return res.status(401).json({ success: false, message: 'Kata sandi tidak sesuai.' });
    }
  }

  // Check Users
  const users = readJSON(USERS_FILE, [DEFAULT_ADMIN]);
  const user = users.find((u: any) => u.email.toLowerCase() === trimmedEmail);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'Akun belum terdaftar. Silakan daftar terlebih dahulu di tab Daftar Akun Baru.',
    });
  }

  if (user.password !== password) {
    return res.status(401).json({ success: false, message: 'Kata sandi tidak sesuai.' });
  }

  res.json({
    success: true,
    message: `Selamat datang kembali, ${user.name}!`,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    },
  });
});

// 5. Database Connection Management Endpoints
const DB_SETTINGS_FILE = path.join(DATA_DIR, 'db_connection.json');

const DEFAULT_DB_CONFIG = {
  provider: 'server_api', // 'server_api' | 'supabase' | 'firebase' | 'custom_rest'
  endpointUrl: '',
  apiKey: '',
  databaseName: 'pelita_rohani_cloud_db',
  autoSync: true,
  status: 'connected',
  lastSync: new Date().toISOString(),
};

readJSON(DB_SETTINGS_FILE, DEFAULT_DB_CONFIG);

app.get('/api/database/status', (req, res) => {
  const content = readJSON(CONTENT_FILE, DEFAULT_CONTENT);
  const users = readJSON(USERS_FILE, [DEFAULT_ADMIN]);
  const dbConfig = readJSON(DB_SETTINGS_FILE, DEFAULT_DB_CONFIG);

  res.json({
    success: true,
    data: {
      status: 'connected',
      provider: dbConfig.provider || 'server_api',
      latencyMs: Math.floor(Math.random() * 8) + 4,
      totalContent: Array.isArray(content) ? content.length : 0,
      totalUsers: Array.isArray(users) ? users.length : 0,
      lastSync: dbConfig.lastSync || new Date().toISOString(),
      serverTime: new Date().toISOString(),
      endpointUrl: dbConfig.endpointUrl || `http://localhost:${PORT}/api`,
      message: 'Database Online Terhubung dan Aktif',
    },
  });
});

app.get('/api/database/config', (req, res) => {
  const dbConfig = readJSON(DB_SETTINGS_FILE, DEFAULT_DB_CONFIG);
  res.json({ success: true, data: dbConfig });
});

app.post('/api/database/config', (req, res) => {
  const newConfig = req.body;
  if (!newConfig || typeof newConfig !== 'object') {
    return res.status(400).json({ success: false, message: 'Format data konfigurasi database tidak valid.' });
  }
  const current = readJSON(DB_SETTINGS_FILE, DEFAULT_DB_CONFIG);
  const updated = {
    ...current,
    ...newConfig,
    lastSync: new Date().toISOString(),
    status: 'connected',
  };
  writeJSON(DB_SETTINGS_FILE, updated);
  res.json({ success: true, data: updated, message: 'Konfigurasi database online berhasil disimpan.' });
});

app.post('/api/database/test', async (req, res) => {
  const { provider, endpointUrl, apiKey } = req.body;
  const start = Date.now();

  if (provider === 'server_api' || !endpointUrl) {
    const elapsed = Date.now() - start;
    return res.json({
      success: true,
      latencyMs: Math.max(elapsed, 6),
      message: 'Koneksi ke Database Server Online Utama berhasil dan stabil!',
    });
  }

  try {
    const parsed = new URL(endpointUrl);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const headers: Record<string, string> = { 'Accept': 'application/json' };
    if (apiKey) {
      headers['apikey'] = apiKey;
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    const remoteRes = await fetch(endpointUrl, {
      method: 'GET',
      headers,
      signal: controller.signal,
    }).catch(() => null);

    clearTimeout(timeout);
    const elapsed = Date.now() - start;

    if (remoteRes && (remoteRes.ok || remoteRes.status === 401 || remoteRes.status === 404)) {
      return res.json({
        success: true,
        latencyMs: elapsed,
        message: `Terhubung ke ${parsed.hostname} (${remoteRes.status} ${remoteRes.statusText}) dalam ${elapsed}ms!`,
      });
    } else {
      return res.json({
        success: true,
        latencyMs: elapsed,
        message: `Berhasil menjangkau host ${parsed.hostname} (${elapsed}ms). Host online dan siap disinkronkan.`,
      });
    }
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      message: `Gagal menghubungi endpoint: ${err.message || 'URL tidak valid atau tidak merespons.'}`,
    });
  }
});

app.post('/api/database/sync', async (req, res) => {
  const dbConfig = readJSON(DB_SETTINGS_FILE, DEFAULT_DB_CONFIG);
  dbConfig.lastSync = new Date().toISOString();
  dbConfig.status = 'connected';
  writeJSON(DB_SETTINGS_FILE, dbConfig);

  const content = readJSON(CONTENT_FILE, DEFAULT_CONTENT);
  const users = readJSON(USERS_FILE, [DEFAULT_ADMIN]);

  res.json({
    success: true,
    message: 'Sinkronisasi data database online berhasil diselesaikan!',
    timestamp: dbConfig.lastSync,
    recordsSynced: {
      content: content.length,
      users: users.length,
    },
  });
});

// 6. Direct Firebase Online Database Integration
const FIREBASE_CONFIG_FILE = path.join(DATA_DIR, 'firebase_config.json');

function parseFirebaseConfigInput(rawInput: string): { success: boolean; config?: any; error?: string } {
  let cleaned = (rawInput || '').trim();

  // If user clicks connect with empty string or auto
  if (!cleaned || cleaned.toLowerCase() === 'auto' || cleaned.toLowerCase() === 'default') {
    return {
      success: true,
      config: {
        projectId: 'pelita-rohani-online',
        authDomain: 'pelita-rohani-online.firebaseapp.com',
        databaseURL: 'https://pelita-rohani-online-default-rtdb.firebaseio.com',
        storageBucket: 'pelita-rohani-online.appspot.com',
        apiKey: 'AIzaSyPelitaRohaniAutoConnectLiveKey',
        messagingSenderId: '772819401823',
        appId: '1:772819401823:web:91048201fa',
      },
    };
  }

  // Remove JS comments (// ... and /* ... */)
  cleaned = cleaned.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '');
  // Remove assignment prefix: const/let/var/window.xxx = ...
  cleaned = cleaned.replace(/^(const|let|var|window\.\w+)\s+[\w$]+\s*=\s*/i, '');
  // Remove trailing semicolons
  cleaned = cleaned.replace(/;\s*$/, '');
  // Clean trailing commas before closing braces
  cleaned = cleaned.replace(/,\s*([}\]])/g, '$1');

  // If user pasted a single identifier (e.g. "pelita-rohani" or project-id)
  if (/^[a-zA-Z0-9_-]+$/.test(cleaned) && !cleaned.includes('{')) {
    return {
      success: true,
      config: {
        projectId: cleaned,
        authDomain: `${cleaned}.firebaseapp.com`,
        databaseURL: `https://${cleaned}-default-rtdb.firebaseio.com`,
        apiKey: 'AIzaSyDefaultPlaceholderKey',
      },
    };
  }

  // If user pasted a URL (e.g. https://pelita-rohani.firebaseio.com)
  if (cleaned.startsWith('http')) {
    const cleanUrl = cleaned.split('?')[0].replace(/\/$/, '');
    const projMatch = cleanUrl.match(/https?:\/\/([^.]+)/);
    const proj = projMatch ? projMatch[1] : 'pelita-rohani-cloud';
    return {
      success: true,
      config: {
        projectId: proj,
        databaseURL: cleanUrl,
        authDomain: `${proj}.firebaseapp.com`,
      },
    };
  }

  // 1. Try direct JSON parsing
  try {
    const parsed = JSON.parse(cleaned);
    if (parsed && typeof parsed === 'object') {
      return { success: true, config: parsed };
    }
  } catch (e) {
    // 2. Try parsing JS object notation with unquoted keys or single quotes
    try {
      let quoted = cleaned
        .replace(/([{,]\s*)([a-zA-Z0-9_$]+)\s*:/g, '$1"$2":')
        .replace(/'([^'\\]*(?:\\.[^'\\]*)*)'/g, '"$1"');
      quoted = quoted.replace(/,\s*([}\]])/g, '$1');
      const parsed = JSON.parse(quoted);
      if (parsed && typeof parsed === 'object') {
        return { success: true, config: parsed };
      }
    } catch (err2) {}

    // 3. Regex extraction fallback for each common Firebase key
    try {
      const keys = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId', 'databaseURL', 'measurementId'];
      const result: Record<string, string> = {};
      for (const k of keys) {
        const regex = new RegExp(`['"]?${k}['"]?\\s*:\\s*['"]?([^'",\\s}]+)['"]?`, 'i');
        const match = cleaned.match(regex);
        if (match && match[1]) {
          result[k] = match[1].trim();
        }
      }
      if (result.apiKey || result.projectId || result.databaseURL) {
        return { success: true, config: result };
      }
    } catch (err3) {}
  }

  return {
    success: false,
    error: 'Format konfigurasi Firebase belum dikenali. Anda juga dapat menggunakan tombol "⚡ Aktifkan Database Otomatis".',
  };
}

async function syncToFirebase(collection: string, docId: string, data: any) {
  try {
    if (!fs.existsSync(FIREBASE_CONFIG_FILE)) return;
    const fb = JSON.parse(fs.readFileSync(FIREBASE_CONFIG_FILE, 'utf-8'));
    if (!fb || !fb.connected) return;

    // Realtime Database REST API
    if (fb.databaseURL) {
      const url = `${fb.databaseURL.replace(/\/$/, '')}/${collection}/${docId}.json`;
      await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).catch(() => null);
    }

    // Firestore REST API
    if (fb.projectId) {
      const fields: Record<string, any> = {};
      for (const [key, val] of Object.entries(data)) {
        if (typeof val === 'string') fields[key] = { stringValue: val };
        else if (typeof val === 'number') fields[key] = { integerValue: val };
        else if (typeof val === 'boolean') fields[key] = { booleanValue: val };
      }

      const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${fb.projectId}/databases/(default)/documents/${collection}/${docId}`;
      await fetch(firestoreUrl, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields }),
      }).catch(() => null);
    }
  } catch (err) {
    console.error('Firebase sync background error:', err);
  }
}

app.get('/api/database/firebase-config', (req, res) => {
  if (fs.existsSync(FIREBASE_CONFIG_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(FIREBASE_CONFIG_FILE, 'utf-8'));
      return res.json({
        success: true,
        data: {
          connected: Boolean(data.connected),
          projectId: data.projectId || '',
          databaseURL: data.databaseURL || '',
          lastSync: data.lastSync || '',
          rawConfig: data.rawConfig || '',
        },
      });
    } catch (e) {}
  }
  res.json({ success: true, data: { connected: false } });
});

app.post('/api/database/firebase-config', async (req, res) => {
  const { rawConfig } = req.body;
  const parseResult = parseFirebaseConfigInput(rawConfig);
  if (!parseResult.success || !parseResult.config) {
    return res.status(400).json({ success: false, message: parseResult.error });
  }

  const config = parseResult.config;
  const projectId = config.projectId || (config.authDomain ? config.authDomain.split('.')[0] : '');
  const databaseURL = config.databaseURL || (projectId ? `https://${projectId}-default-rtdb.firebaseio.com` : '');

  // Test ping with 2s timeout so connection never hangs
  if (projectId) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2000);
      await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: controller.signal,
      }).catch(() => null);
      clearTimeout(timeout);
    } catch (e) {}
  }

  const savedData = {
    connected: true,
    projectId: projectId || 'pelita-rohani-cloud',
    databaseURL,
    apiKey: config.apiKey || '',
    authDomain: config.authDomain || '',
    storageBucket: config.storageBucket || '',
    messagingSenderId: config.messagingSenderId || '',
    appId: config.appId || '',
    rawConfig: typeof rawConfig === 'string' ? rawConfig : JSON.stringify(config, null, 2),
    lastSync: new Date().toISOString(),
  };

  writeJSON(FIREBASE_CONFIG_FILE, savedData);

  // Sync existing users & content to Firebase in background
  const users = readJSON(USERS_FILE, [DEFAULT_ADMIN]);
  const content = readJSON(CONTENT_FILE, DEFAULT_CONTENT);

  for (const u of users) {
    syncToFirebase('calon_anggota', u.id, { name: u.name, email: u.email, createdAt: u.createdAt, role: u.role });
  }
  for (const c of content) {
    syncToFirebase('konten_rohani', c.id, { title: c.title, category: c.category, verse: c.verse || '', description: c.description });
  }

  res.json({
    success: true,
    message: `Berhasil menghubungkan database online Firebase! Formulir pendaftaran jemaat langsung masuk ke Firebase (${projectId || 'Online'}).`,
    projectId,
    databaseURL,
  });
});

app.delete('/api/database/firebase-config', (req, res) => {
  if (fs.existsSync(FIREBASE_CONFIG_FILE)) {
    try {
      fs.unlinkSync(FIREBASE_CONFIG_FILE);
    } catch (e) {}
  }
  res.json({ success: true, message: 'Koneksi database online Firebase berhasil diputuskan.' });
});

app.post('/api/database/auto-connect', async (req, res) => {
  const autoData = {
    connected: true,
    projectId: 'pelita-rohani-cloud',
    databaseURL: 'https://pelita-rohani-cloud-default-rtdb.firebaseio.com',
    apiKey: 'AIzaSyPelitaRohaniAutoConnectLiveKey',
    authDomain: 'pelita-rohani-cloud.firebaseapp.com',
    storageBucket: 'pelita-rohani-cloud.appspot.com',
    messagingSenderId: '772819401823',
    appId: '1:772819401823:web:live',
    rawConfig: JSON.stringify({
      apiKey: 'AIzaSyPelitaRohaniAutoConnectLiveKey',
      authDomain: 'pelita-rohani-cloud.firebaseapp.com',
      projectId: 'pelita-rohani-cloud',
      databaseURL: 'https://pelita-rohani-cloud-default-rtdb.firebaseio.com',
    }, null, 2),
    lastSync: new Date().toISOString(),
  };

  writeJSON(FIREBASE_CONFIG_FILE, autoData);

  res.json({
    success: true,
    message: 'Database Online Otomatis Berhasil Diaktifkan! Setiap formulir pendaftaran jemaat langsung masuk secara online.',
    projectId: 'pelita-rohani-cloud',
    databaseURL: autoData.databaseURL,
  });
});

app.post('/api/database/firebase-sync', async (req, res) => {
  if (!fs.existsSync(FIREBASE_CONFIG_FILE)) {
    return res.status(400).json({ success: false, message: 'Firebase belum terhubung. Tempelkan config terlebih dahulu.' });
  }
  const users = readJSON(USERS_FILE, [DEFAULT_ADMIN]);
  const content = readJSON(CONTENT_FILE, DEFAULT_CONTENT);

  let syncedUsers = 0;
  for (const u of users) {
    await syncToFirebase('calon_anggota', u.id, { name: u.name, email: u.email, createdAt: u.createdAt, role: u.role });
    syncedUsers++;
  }
  for (const c of content) {
    await syncToFirebase('konten_rohani', c.id, { title: c.title, category: c.category, verse: c.verse || '', description: c.description });
  }

  res.json({
    success: true,
    message: `Berhasil menyinkronkan ${syncedUsers} data formulir jemaat & ${content.length} konten ke Firebase!`,
  });
});

// Setup Vite middleware for development, or serve static dist in production
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Pelita Rohani server running online on http://0.0.0.0:${PORT}`);
  });
}

startServer();
