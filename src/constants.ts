export interface ContentItem {
  id: string;
  title: string;
  description: string;
  verse?: string;
  content: string;
  category: 'Renungan' | 'Doa' | 'Ayat' | 'Akhir Zaman';
}

export const SPIRITUAL_CONTENT: ContentItem[] = [
  // RENUNGAN
  {
    id: 'r1',
    category: 'Renungan',
    title: 'Berjalan dalam Iman, Bukan Penglihatan',
    description: 'Bagaimana tetap percaya di tengah ketidakpastian.',
    verse: '2 Korintus 5:7',
    content: 'Seringkali kita ingin melihat jalan di depan kita dengan jelas sebelum melangkah. Namun, Tuhan memanggil kita untuk percaya pada-Nya bahkan ketika kabut tebal menutupi pandangan kita. Berjalan dalam iman berarti mengandalkan karakter Tuhan yang tidak berubah, bukan pada situasi kita yang terus berubah.'
  },
  {
    id: 'r2',
    category: 'Renungan',
    title: 'Kekuatan dalam Kelemahan',
    description: 'Menemukan anugerah Tuhan saat kita merasa tidak berdaya.',
    verse: '2 Korintus 12:9',
    content: 'Dunia mengajarkan kita untuk menjadi kuat dan mandiri. Namun, dalam kerajaan Allah, pengakuan akan kelemahan kita adalah pintu bagi kekuatan-Nya. Saat kita menyerah pada keterbatasan kita, anugerah-Nya menjadi sempurna dalam hidup kita.'
  },
  {
    id: 'r3',
    category: 'Renungan',
    title: 'Menanti dengan Sabar',
    description: 'Belajar mempercayai waktu Tuhan.',
    verse: 'Yesaya 40:31',
    content: 'Menanti bukanlah hal yang pasif. Menanti dalam Tuhan adalah tindakan iman yang aktif. Seperti rajawali yang menanti angin untuk terbang tinggi, kita menanti Tuhan untuk memperbaharui kekuatan kita agar kita tidak menjadi lelah dalam perjalanan hidup ini.'
  },

  // DOA
  {
    id: 'd1',
    category: 'Doa',
    title: 'Doa Penyerahan Diri',
    description: 'Menyerahkan segala kekhawatiran kepada Bapa.',
    content: 'Bapa Surgawi, hari ini aku datang ke hadapan-Mu dengan segala beban dan kekhawatiranku. Aku menyerahkan hidupku, keluargaku, dan masa depanku ke dalam tangan-Mu. Aku percaya bahwa Engkau memegang kendali atas segalanya. Berikanlah aku damai sejahtera-Mu yang melampaui segala akal. Amin.'
  },
  {
    id: 'd2',
    category: 'Doa',
    title: 'Doa Memohon Hikmat',
    description: 'Meminta tuntunan Roh Kudus dalam mengambil keputusan.',
    content: 'Tuhan Yesus, aku membutuhkan hikmat-Mu dalam setiap keputusan yang aku ambil hari ini. Terangilah pikiranku dengan Roh Kudus-Mu agar aku dapat membedakan mana yang baik dan berkenan di hadapan-Mu. Tuntunlah langkahku agar selalu berada di jalan-Mu. Amin.'
  },
  {
    id: 'd3',
    category: 'Doa',
    title: 'Doa Syukur',
    description: 'Mengucap syukur atas segala kebaikan Tuhan.',
    content: 'Terima kasih Tuhan atas nafas kehidupan dan segala berkat yang Engkau curahkan. Bahkan di tengah badai, aku tahu Engkau baik. Terima kasih untuk kasih setia-Mu yang baru setiap pagi. Biarlah hatiku selalu penuh dengan pujian bagi-Mu. Amin.'
  },

  // AYAT
  {
    id: 'a1',
    category: 'Ayat',
    title: 'Kasih Allah yang Sempurna',
    description: 'Ayat tentang betapa besarnya kasih Tuhan.',
    verse: 'Yohanes 3:16',
    content: 'Karena begitu besar kasih Allah akan dunia ini, sehingga Ia telah mengaruniakan Anak-Nya yang tunggal, supaya setiap orang yang percaya kepada-Nya tidak binasa, melainkan beroleh hidup yang kekal.'
  },
  {
    id: 'a2',
    category: 'Ayat',
    title: 'Jangan Takut',
    description: 'Janji penyertaan Tuhan di saat sulit.',
    verse: 'Yesaya 41:10',
    content: 'Janganlah takut, sebab Aku menyertai engkau, janganlah bimbang, sebab Aku ini Allahmu; Aku akan meneguhkan, bahkan akan menolong engkau; Aku akan memegang engkau dengan tangan kanan-Mu yang membawa kemenangan.'
  },
  {
    id: 'a3',
    category: 'Ayat',
    title: 'Rancangan Damai Sejahtera',
    description: 'Masa depan yang penuh harapan.',
    verse: 'Yeremia 29:11',
    content: 'Sebab Aku ini mengetahui rancangan-rancangan apa yang ada pada-Ku mengenai kamu, demikianlah firman TUHAN, yaitu rancangan damai sejahtera dan bukan rancangan kecelakaan, untuk memberikan kepadamu hari depan yang penuh harapan.'
  },

  // AKHIR ZAMAN
  {
    id: 'az1',
    category: 'Akhir Zaman',
    title: 'Tanda-tanda Zaman',
    description: 'Memahami apa yang dikatakan Alkitab tentang hari-hari terakhir.',
    verse: 'Matius 24:6-8',
    content: 'Yesus memperingatkan kita tentang perang, kelaparan, dan gempa bumi sebagai permulaan penderitaan. Namun, Ia juga mengingatkan kita untuk tidak gelisah. Tanda-tanda ini bukanlah untuk menakut-nakuti, melainkan untuk membuat kita tetap berjaga-jaga dan fokus pada misi-Nya.'
  },
  {
    id: 'az2',
    category: 'Akhir Zaman',
    title: 'Berjaga-jaga dan Berdoa',
    description: 'Kesiapan hati menyambut kedatangan Tuhan.',
    verse: '1 Petrus 4:7',
    content: 'Kesudahan segala sesuatu sudah dekat. Karena itu kuasailah dirimu dan jadilah tenang, supaya kamu dapat berdoa. Di hari-hari terakhir, hubungan kita dengan Tuhan melalui doa adalah jangkar yang menjaga kita tetap teguh.'
  },
  {
    id: 'az3',
    category: 'Akhir Zaman',
    title: 'Pengharapan Baru',
    description: 'Langit dan bumi yang baru.',
    verse: 'Wahyu 21:4',
    content: 'Pada akhirnya, Tuhan akan menghapus segala air mata. Tidak akan ada lagi maut, perkabungan, ratap tangis, atau dukacita. Inilah pengharapan besar kita sebagai orang percaya: bahwa akhir dari dunia ini adalah awal dari kekekalan yang indah bersama Bapa.'
  }
];
