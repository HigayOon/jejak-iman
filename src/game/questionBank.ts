/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Question, QuestionType, GameZone } from '../types/game';

/**
 * 24 Comprehensive Indonesian SMP Sample Questions covering:
 * - Bible Knowledge, Old & New Testament
 * - Jesus' Teachings
 * - Christian Character & Values
 * - Honesty, Friendship, Bullying, Forgiveness, Responsibility, Daily Life
 * - Multiple choice, True/False, and Reflection types
 */
export const INITIAL_QUESTIONS: Question[] = [
  // ==========================================
  // 1. QUIZ TILES (Bible Knowledge & Teachings)
  // ==========================================
  {
    id: 'smp-quiz-1',
    zone: 'rumah',
    type: 'quiz',
    format: 'multiple_choice',
    categoryName: 'Perjanjian Lama',
    question: 'Siapakah putra Abraham dan Sara yang lahir sesuai janji Tuhan pada masa tua mereka?',
    options: ['Ismail', 'Ishak', 'Yakub', 'Yusuf'],
    optionA: 'Ismail',
    optionB: 'Ishak',
    optionC: 'Yakub',
    optionD: 'Yusuf',
    correctIndex: 1,
    correctAnswer: 'B',
    explanation: 'Ishak adalah anak perjanjian yang lahir bagi Abraham dan Sara ketika Abraham berusia 100 tahun.',
    bibleVerse: 'Kejadian 21:3 - "Abraham menamai anaknya yang baru lahir itu Ishak."',
    difficulty: 'EASY',
    enabled: true,
    rewardStars: 1,
    updatedAt: 1715000000000,
  },
  {
    id: 'smp-quiz-2',
    zone: 'sekolah',
    type: 'quiz',
    format: 'multiple_choice',
    categoryName: 'Ajaran Yesus',
    question: 'Dalam Khotbah di Bukit (Matius 5:14), Yesus mengumpamakan murid-murid-Nya sebagai...',
    options: ['Penguasa dunia', 'Garam dan terang dunia', 'Prajurit penakluk', 'Saudagar kaya'],
    optionA: 'Penguasa dunia',
    optionB: 'Garam dan terang dunia',
    optionC: 'Prajurit penakluk',
    optionD: 'Saudagar kaya',
    correctIndex: 1,
    correctAnswer: 'B',
    explanation: 'Yesus mengajarkan bahwa orang beriman harus memberi rasa damai (garam) dan teladan kebaikan (terang) bagi sekitar.',
    bibleVerse: 'Matius 5:14 - "Kamu adalah terang dunia. Kota yang terletak di atas gunung tidak mungkin tersembunyi."',
    difficulty: 'EASY',
    enabled: true,
    rewardStars: 1,
    updatedAt: 1715000000000,
  },
  {
    id: 'smp-quiz-3',
    zone: 'masyarakat',
    type: 'quiz',
    format: 'multiple_choice',
    categoryName: 'Ajaran Yesus',
    question: 'Dalam perumpamaan Orang Samaria yang Murah Hati, siapakah yang akhirnya menolong korban perampokan?',
    options: [
      'Seorang imam bait suci',
      'Orang Samaria yang tergerak oleh belas kasihan',
      'Seorang Lewi terpandang',
      'Prajurit Romawi yang lewat',
    ],
    optionA: 'Seorang imam bait suci',
    optionB: 'Orang Samaria yang tergerak oleh belas kasihan',
    optionC: 'Seorang Lewi terpandang',
    optionD: 'Prajurit Romawi yang lewat',
    correctIndex: 1,
    correctAnswer: 'B',
    explanation: 'Yesus mengajarkan bahwa kasih sejati tidak membeda-bedakan suku, agama, atau status sosial.',
    bibleVerse: 'Lukas 10:33 - "Lalu datang seorang Samaria... ketika ia melihat orang itu, tergeraklah hatinya oleh belas kasihan."',
    difficulty: 'MEDIUM',
    enabled: true,
    rewardStars: 2,
    updatedAt: 1715000000000,
  },
  {
    id: 'smp-quiz-4',
    zone: 'menjadi_terang',
    type: 'quiz',
    format: 'multiple_choice',
    categoryName: 'Perjanjian Baru',
    question: 'Berapa banyak murid yang secara khusus dipilih Yesus untuk menjadi kedua belas rasul-Nya?',
    options: ['7 rasul', '10 rasul', '12 rasul', '70 rasul'],
    optionA: '7 rasul',
    optionB: '10 rasul',
    optionC: '12 rasul',
    optionD: '70 rasul',
    correctIndex: 2,
    correctAnswer: 'C',
    explanation: 'Yesus memilih dua belas rasul untuk diutus memberitakan Injil dan Kerajaan Allah.',
    bibleVerse: 'Lukas 6:13 - "Ketika hari siang, Ia memanggil murid-murid-Nya... lalu memilih dari antara mereka dua belas orang, yang disebut-Nya rasul."',
    difficulty: 'EASY',
    enabled: true,
    rewardStars: 1,
    updatedAt: 1715000000000,
  },
  {
    id: 'smp-quiz-5',
    zone: 'rumah',
    type: 'quiz',
    format: 'multiple_choice',
    categoryName: 'Pengetahuan Alkitab',
    question: 'Hukum Taurat kelima yang diberikan Allah kepada Musa di Gunung Sinai berbunyi...',
    options: [
      'Jangan membunuh sesamamu',
      'Hormatilah ayahmu dan ibumu',
      'Kuduskanlah hari Sabat',
      'Jangan mencuri milik sesamamu',
    ],
    optionA: 'Jangan membunuh sesamamu',
    optionB: 'Hormatilah ayahmu dan ibumu',
    optionC: 'Kuduskanlah hari Sabat',
    optionD: 'Jangan mencuri milik sesamamu',
    correctIndex: 1,
    correctAnswer: 'B',
    explanation: 'Menghormati orang tua adalah perintah pertama yang disertai janji berkat dan lanjut umur.',
    bibleVerse: 'Keluaran 20:12 - "Hormatilah ayahmu dan ibumu, supaya lanjut umurmu di tanah yang diberikan TUHAN, Allahmu, kepadamu."',
    difficulty: 'EASY',
    enabled: true,
    rewardStars: 1,
    updatedAt: 1715000000000,
  },
  {
    id: 'smp-quiz-6',
    zone: 'menjadi_terang',
    type: 'quiz',
    format: 'multiple_choice',
    categoryName: 'Karakter Kristiani',
    question: 'Manakah di bawah ini yang merupakan Buah Roh menurut Surat Paulus kepada jemaat di Galatia?',
    options: [
      'Kekayaan, popularitas, dan kemenangan fisik',
      'Kasih, sukacita, damai sejahtera, kesabaran, kemurahan, kebaikan, kesetiaan, kelemahlembutan, penguasaan diri',
      'Kekuasaan politik dan kepandaian berdebat',
      'Kekuatan otot dan keindahan rupa semata',
    ],
    optionA: 'Kekayaan, popularitas, dan kemenangan fisik',
    optionB: 'Kasih, sukacita, damai sejahtera, kesabaran, kemurahan, kebaikan, kesetiaan, kelemahlembutan, penguasaan diri',
    optionC: 'Kekuasaan politik dan kepandaian berdebat',
    optionD: 'Kekuatan otot dan keindahan rupa semata',
    correctIndex: 1,
    correctAnswer: 'B',
    explanation: 'Buah Roh mencerminkan karakter Ilahi yang hidup dan berbuah dalam perkataan serta perbuatan murid Kristus.',
    bibleVerse: 'Galatia 5:22-23 - "Tetapi buah Roh ialah: kasih, sukacita, damai sejahtera, kesabaran, kemurahan, kebaikan, kesetiaan, kelemahlembutan, penguasaan diri."',
    difficulty: 'MEDIUM',
    enabled: true,
    rewardStars: 2,
    updatedAt: 1715000000000,
  },
  {
    id: 'smp-quiz-7',
    zone: 'sekolah',
    type: 'quiz',
    format: 'true_false',
    categoryName: 'Karakter Kristiani',
    question: 'Yesus mengajarkan agar kita membalas kejahatan orang lain dengan kejahatan yang setimpal.',
    options: ['Benar', 'Salah'],
    optionA: 'Benar',
    optionB: 'Salah',
    correctIndex: 1,
    correctAnswer: 'B',
    explanation: 'Salah. Ajaran Yesus menegaskan agar kita tidak membalas kejahatan dengan kejahatan, melainkan mengalahkan kejahatan dengan kebaikan.',
    bibleVerse: 'Roma 12:21 - "Janganlah kamu kalah terhadap kejahatan, tetapi kalahkanlah kejahatan dengan kebaikan!"',
    difficulty: 'EASY',
    enabled: true,
    rewardStars: 1,
    updatedAt: 1715000000000,
  },
  {
    id: 'smp-quiz-8',
    zone: 'rumah',
    type: 'quiz',
    format: 'true_false',
    categoryName: 'Pengetahuan Alkitab',
    question: 'Kitab Mazmur sebagian besar digubah oleh Raja Daud sebagai ungkapan doa, pujian, dan syukur kepada Tuhan.',
    options: ['Benar', 'Salah'],
    optionA: 'Benar',
    optionB: 'Salah',
    correctIndex: 0,
    correctAnswer: 'A',
    explanation: 'Benar. Raja Daud adalah pemazmur yang mempersembahkan nyanyian pujian dan ratapan iman kepada Tuhan.',
    bibleVerse: 'Mazmur 23:1 - "TUHAN adalah gembalaku, takkan kekurangan aku."',
    difficulty: 'EASY',
    enabled: true,
    rewardStars: 1,
    updatedAt: 1715000000000,
  },

  // ==========================================
  // 2. LADDER CHALLENGES (Christian Virtues)
  // ==========================================
  {
    id: 'smp-lad-1',
    zone: 'rumah',
    type: 'ladder',
    format: 'multiple_choice',
    categoryName: 'Nilai-Nilai Kristiani',
    question: 'Kamu melihat adik kelas diejek oleh anak yang lebih tua di halte bus. Sikap keberanian Kristiani yang tepat adalah...',
    options: [
      'Ikut menertawakan agar dianggap keren oleh anak yang lebih tua',
      'Mengajak teman lain melerai dengan santun dan menemani adik kelas tersebut dengan aman',
      'Segera lari dan pura-pura tidak melihat apa pun',
      'Merekam video pertengkaran untuk disebarkan ke media sosial',
    ],
    optionA: 'Ikut menertawakan agar dianggap keren oleh anak yang lebih tua',
    optionB: 'Mengajak teman lain melerai dengan santun dan menemani adik kelas tersebut dengan aman',
    optionC: 'Segera lari dan pura-pura tidak melihat apa pun',
    optionD: 'Merekam video pertengkaran untuk disebarkan ke media sosial',
    correctIndex: 1,
    correctAnswer: 'B',
    explanation: 'Keberanian Kristiani membela kebenaran dan melindungi sesama yang lemah dengan kasih tanpa kekerasan.',
    bibleVerse: 'Yosua 1:9 - "Kuatkan dan teguhkanlah hatimu! Janganlah kecut dan tawar hati, sebab TUHAN, Allahmu, menyertai engkau."',
    difficulty: 'MEDIUM',
    enabled: true,
    rewardStars: 2,
    updatedAt: 1715000000000,
  },
  {
    id: 'smp-lad-2',
    zone: 'rumah',
    type: 'ladder',
    format: 'multiple_choice',
    categoryName: 'Tanggung Jawab',
    question: 'Ibu sedang repot menyiapkan makanan sementara cucian piring menumpuk di dapur. Tindakan berhikmat adalah...',
    options: [
      'Mengunci kamar dan mendengarkan musik dengan volume kencang',
      'Berinisiatif mencuci piring dengan sukacita tanpa harus disuruh berkali-kali',
      'Menuntut uang saku tambahan sebelum mau membantu orang tua',
      'Mengeluh bahwa pekerjaan rumah bukan tugas seorang anak',
    ],
    optionA: 'Mengunci kamar dan mendengarkan musik dengan volume kencang',
    optionB: 'Berinisiatif mencuci piring dengan sukacita tanpa harus disuruh berkali-kali',
    optionC: 'Menuntut uang saku tambahan sebelum mau membantu orang tua',
    optionD: 'Mengeluh bahwa pekerjaan rumah bukan tugas seorang anak',
    correctIndex: 1,
    correctAnswer: 'B',
    explanation: 'Pelayanan kasih yang tulus di dalam keluarga adalah ibadah nyata yang berkenan bagi Tuhan.',
    bibleVerse: 'Galatia 6:2 - "Bertolong-tolonganlah menanggung bebanmu! Demikianlah kamu memenuhi hukum Kristus."',
    difficulty: 'EASY',
    enabled: true,
    rewardStars: 1,
    updatedAt: 1715000000000,
  },
  {
    id: 'smp-lad-3',
    zone: 'sekolah',
    type: 'ladder',
    format: 'multiple_choice',
    categoryName: 'Karakter Kristiani',
    question: 'Saat mengoreksi silang lembar jawaban ulangan teman sebangku, kamu melihat guru memberi nilai lebih tinggi dari jawaban yang salah. Apa tindakanmu?',
    options: [
      'Diam saja karena menguntungkan teman akrabmu',
      'Menjelaskan kepada guru dengan sopan dan jujur agar nilai dikoreksi dengan adil',
      'Memeras teman agar membelikan jajan dengan ancaman akan melapor',
      'Menyalahkan guru di depan seluruh kelas dengan nada tinggi',
    ],
    optionA: 'Diam saja karena menguntungkan teman akrabmu',
    optionB: 'Menjelaskan kepada guru dengan sopan dan jujur agar nilai dikoreksi dengan adil',
    optionC: 'Memeras teman agar membelikan jajan dengan ancaman akan melapor',
    optionD: 'Menyalahkan guru di depan seluruh kelas dengan nada tinggi',
    correctIndex: 1,
    correctAnswer: 'B',
    explanation: 'Kejujuran dan keadilan mendatangkan damai sejahtera serta menjaga hati nurani tetap murni di hadapan Allah.',
    bibleVerse: 'Amsal 11:3 - "Orang yang jujur dipimpin oleh ketulusannya, tetapi pengkhianat dirusak oleh kecurangannya."',
    difficulty: 'MEDIUM',
    enabled: true,
    rewardStars: 2,
    updatedAt: 1715000000000,
  },
  {
    id: 'smp-lad-4',
    zone: 'sekolah',
    type: 'ladder',
    format: 'multiple_choice',
    categoryName: 'Persahabatan',
    question: 'Sahabatmu gagal dalam ujian seleksi paduan suara gereja dan menangis sedih. Respon empati Kristiani adalah...',
    options: [
      'Mengejek suaranya yang fals di depan teman-teman',
      'Duduk bersamanya, mendengarkan perasaannya dengan tulus, dan menghiburnya',
      'Membanggakan dirimu yang berhasil lolos tanpa peduli perasaannya',
      'Menjauhinya karena menganggapnya membawa pengaruh sedih',
    ],
    optionA: 'Mengejek suaranya yang fals di depan teman-teman',
    optionB: 'Duduk bersamanya, mendengarkan perasaannya dengan tulus, dan menghiburnya',
    optionC: 'Membanggakan dirimu yang berhasil lolos tanpa peduli perasaannya',
    optionD: 'Menjauhinya karena menganggapnya membawa pengaruh sedih',
    correctIndex: 1,
    correctAnswer: 'B',
    explanation: 'Sahabat sejati hadir untuk menguatkan di waktu susah, mencerminkan kasih Kristus yang setia.',
    bibleVerse: 'Roma 12:15 - "Bersukacitalah dengan orang yang bersukacita, dan menangislah dengan orang yang menangis!"',
    difficulty: 'EASY',
    enabled: true,
    rewardStars: 1,
    updatedAt: 1715000000000,
  },
  {
    id: 'smp-lad-5',
    zone: 'masyarakat',
    type: 'ladder',
    format: 'multiple_choice',
    categoryName: 'Nilai-Nilai Kristiani',
    question: 'Seseorang yang pernah memfitnahmu di media sosial datang kepadamu dan memohon maaf dengan tulus. Sikapmu adalah...',
    options: [
      'Menolak permohonan maafnya dan menyusun rencana pembalasan dendam',
      'Mengampuninya dari lubuk hati, melepaskan dendam, dan membuka persaudaraan yang damai',
      'Meminta uang ganti rugi yang besar sebelum mempertimbangkan maaf',
      'Menyebarkan permohonan maafnya agar dia dipermalukan di depan publik',
    ],
    optionA: 'Menolak permohonan maafnya dan menyusun rencana pembalasan dendam',
    optionB: 'Mengampuninya dari lubuk hati, melepaskan dendam, dan membuka persaudaraan yang damai',
    optionC: 'Meminta uang ganti rugi yang besar sebelum mempertimbangkan maaf',
    optionD: 'Menyebarkan permohonan maafnya agar dia dipermalukan di depan publik',
    correctIndex: 1,
    correctAnswer: 'B',
    explanation: 'Pengampunan membebaskan jiwa kita dari belenggu kebencian sebagaimana Bapa telah mengampuni dosa kita.',
    bibleVerse: 'Efesus 4:32 - "Hendaklah kamu ramah seorang terhadap yang lain, penuh kasih mesra dan saling mengampuni, sebagaimana Allah di dalam Kristus telah mengampuni kamu."',
    difficulty: 'HARD',
    enabled: true,
    rewardStars: 3,
    updatedAt: 1715000000000,
  },
  {
    id: 'smp-lad-6',
    zone: 'masyarakat',
    type: 'ladder',
    format: 'multiple_choice',
    categoryName: 'Tanggung Jawab',
    question: 'Kamu diberi tanggung jawab memimpin kelompok bakti sosial membersihkan lingkungan kapel. Cara memimpin yang bijak adalah...',
    options: [
      'Duduk santai di posko sambil memberi instruksi kasar kepada anggota',
      'Memberi teladan nyata dengan ikut menyapu dan memungut sampah bersama seluruh regu',
      'Pulang ke rumah lebih awal sebelum kegiatan bakti sosial selesai',
      'Menyalahkan anggota kelompok bila pekerjaan dinilai lambat oleh pengurus',
    ],
    optionA: 'Duduk santai di posko sambil memberi instruksi kasar kepada anggota',
    optionB: 'Memberi teladan nyata dengan ikut menyapu dan memungut sampah bersama seluruh regu',
    optionC: 'Pulang ke rumah lebih awal sebelum kegiatan bakti sosial selesai',
    optionD: 'Menyalahkan anggota kelompok bila pekerjaan dinilai lambat oleh pengurus',
    correctIndex: 1,
    correctAnswer: 'B',
    explanation: 'Kepemimpinan Kristiani adalah kepemimpinan yang melayani (*servant leadership*) dengan teladan perbuatan.',
    bibleVerse: 'Matius 20:26 - "Barangsiapa ingin menjadi besar di antara kamu, hendaklah ia menjadi pelayanmu."',
    difficulty: 'MEDIUM',
    enabled: true,
    rewardStars: 2,
    updatedAt: 1715000000000,
  },

  // ==========================================
  // 3. SNAKE CHALLENGES (Moral Tests & Temptations)
  // ==========================================
  {
    id: 'smp-snk-1',
    zone: 'rumah',
    type: 'snake',
    format: 'multiple_choice',
    categoryName: 'Karakter Kristiani',
    question: 'Saudaramu menerima hadiah laptop baru dari orang tua karena prestasinya, sementara kamu tidak. Godaan iri hati muncul. Cara mengatasinya adalah...',
    options: [
      'Menumpahkan air ke keyboard laptop tersebut diam-diam',
      'Bersyukur atas keberhasilan saudaramu, memberinya selamat tulus, dan terpacu belajar giat',
      'Mogok makan dan mendiamkan orang tua selama seminggu',
      'Menuduh orang tua tidak adil dan pilih kasih',
    ],
    optionA: 'Menumpahkan air ke keyboard laptop tersebut diam-diam',
    optionB: 'Bersyukur atas keberhasilan saudaramu, memberinya selamat tulus, dan terpacu belajar giat',
    optionC: 'Mogok makan dan mendiamkan orang tua selama seminggu',
    optionD: 'Menuduh orang tua tidak adil dan pilih kasih',
    correctIndex: 1,
    correctAnswer: 'B',
    explanation: 'Hati yang bersyukur mematikan benih iri hati. Sukacita saudara adalah berkat bagi keluarga.',
    bibleVerse: 'Amsal 14:30 - "Hati yang tenang menyegarkan tubuh, tetapi iri hati membusukkan tulang."',
    difficulty: 'MEDIUM',
    enabled: true,
    rewardStars: 2,
    updatedAt: 1715000000000,
  },
  {
    id: 'smp-snk-2',
    zone: 'sekolah',
    type: 'snake',
    format: 'multiple_choice',
    categoryName: 'Kehidupan Sehari-hari',
    question: 'Di ruang ujian sekolah, temanmu menyelipkan carikan kertas kunci jawaban ke mejamu. Bagaimana keputusan imanmu?',
    options: [
      'Menyalin jawabannya untuk soal nomor yang sulit',
      'Mengabaikan contekan tersebut dengan tenang dan tetap mengerjakan ulangan secara jujur',
      'Menjual contekan itu kepada siswa lain di baris belakang',
      'Menyembunyikan kertas itu di bawah kotak pensil untuk dipakai saat guru lengah',
    ],
    optionA: 'Menyalin jawabannya untuk soal nomor yang sulit',
    optionB: 'Mengabaikan contekan tersebut dengan tenang dan tetap mengerjakan ulangan secara jujur',
    optionC: 'Menjual contekan itu kepada siswa lain di baris belakang',
    optionD: 'Menyembunyikan kertas itu di bawah kotak pensil untuk dipakai saat guru lengah',
    correctIndex: 1,
    correctAnswer: 'B',
    explanation: 'Hasil yang diperoleh dari ketidakjujuran tidak membawa berkat Tuhan. Kejujuran bernilai kekal.',
    bibleVerse: 'Amsal 12:22 - "Orang yang dusta bibirnya adalah kekejian bagi TUHAN, tetapi orang yang berlaku setia dikenan-Nya."',
    difficulty: 'EASY',
    enabled: true,
    rewardStars: 1,
    updatedAt: 1715000000000,
  },
  {
    id: 'smp-snk-3',
    zone: 'sekolah',
    type: 'snake',
    format: 'multiple_choice',
    categoryName: 'Persahabatan',
    question: 'Geng siswa populer di kantin mengajakmu merundung (*bullying*) seorang murid baru yang berpakaian sederhana. Sikapmu adalah...',
    options: [
      'Ikut mengejek agar diterima dan tidak menjadi sasaran berikutnya',
      'Menolak ajakan merundung dengan tegas dan mengajak siswa baru tersebut duduk bersama',
      'Merekam ejekan geng tersebut dan tertawa bersorak',
      'Menyebarkan foto siswa baru itu dengan tulisan merendahkan',
    ],
    optionA: 'Ikut mengejek agar diterima dan tidak menjadi sasaran berikutnya',
    optionB: 'Menolak ajakan merundung dengan tegas dan mengajak siswa baru tersebut duduk bersama',
    optionC: 'Merekam ejekan geng tersebut dan tertawa bersorak',
    optionD: 'Menyebarkan foto siswa baru itu dengan tulisan merendahkan',
    correctIndex: 1,
    correctAnswer: 'B',
    explanation: 'Setiap pribadi diciptakan segambar dan serupa dengan Allah (*Imago Dei*). Menindas sesama melukai hati Allah.',
    bibleVerse: 'Efesus 4:29 - "Janganlah ada perkataan kotor keluar dari mulutmu, tetapi pakailah perkataan yang baik untuk membangun."',
    difficulty: 'HARD',
    enabled: true,
    rewardStars: 3,
    updatedAt: 1715000000000,
  },
  {
    id: 'smp-snk-4',
    zone: 'masyarakat',
    type: 'snake',
    format: 'multiple_choice',
    categoryName: 'Tanggung Jawab',
    question: 'Tugas kelompok membuat makalah agama harus diserahkan esok hari, tetapi kamu tergoda begadang bermain game daring. Tindakan bertanggung jawab adalah...',
    options: [
      'Mematikan gawai, mendisiplinkan diri, dan menuntaskan bagian tugas kelompokmu',
      'Terus bermain game sampai subuh dan membiarkan teman yang lain menanggung bagianmu',
      'Mengirim pesan bohong bahwa jaringan internetmu mati total',
      'Menjiplak tulisan orang lain dari internet tanpa membaca isinya',
    ],
    optionA: 'Mematikan gawai, mendisiplinkan diri, dan menuntaskan bagian tugas kelompokmu',
    optionB: 'Terus bermain game sampai subuh dan membiarkan teman yang lain menanggung bagianmu',
    optionC: 'Mengirim pesan bohong bahwa jaringan internetmu mati total',
    optionD: 'Menjiplak tulisan orang lain dari internet tanpa membaca isinya',
    correctIndex: 0,
    correctAnswer: 'A',
    explanation: 'Kesetiaan dalam tanggung jawab kecil membentuk karakter pemuda yang dapat dipercaya oleh Allah dan sesama.',
    bibleVerse: 'Amsal 6:6 - "Hai pemalas, pergilah kepada semut, perhatikanlah lakunya dan jadilah bijak."',
    difficulty: 'MEDIUM',
    enabled: true,
    rewardStars: 2,
    updatedAt: 1715000000000,
  },
  {
    id: 'smp-snk-5',
    zone: 'masyarakat',
    type: 'snake',
    format: 'multiple_choice',
    categoryName: 'Persahabatan',
    question: 'Kamu mendengar kabar buruk yang belum tentu benar tentang teman sekelasmu beredar di grup obrolan. Respon bijakmu adalah...',
    options: [
      'Menyebarkannya ke grup kelas lain agar menjadi topik hangat',
      'Menghentikan gosip tersebut, tidak meneruskannya, dan mengingatkan teman agar tabayun/menjaga lisan',
      'Menambahkan bumbu cerita bohong agar lebih dramatis',
      'Membuat akun palsu untuk menjelek-jelekkan teman tersebut',
    ],
    optionA: 'Menyebarkannya ke grup kelas lain agar menjadi topik hangat',
    optionB: 'Menghentikan gosip tersebut, tidak meneruskannya, dan mengingatkan teman agar tabayun/menjaga lisan',
    optionC: 'Menambahkan bumbu cerita bohong agar lebih dramatis',
    optionD: 'Membuat akun palsu untuk menjelek-jelekkan teman tersebut',
    correctIndex: 1,
    correctAnswer: 'B',
    explanation: 'Fitnah dan gosip memecah belah persahabatan, sedangkan kata-kata yang bijaksana memulihkan dan mendamaikan.',
    bibleVerse: 'Amsal 16:28 - "Orang yang curang menimbulkan pertengkaran, dan seorang pemfitnah menceraikan sahabat yang karib."',
    difficulty: 'MEDIUM',
    enabled: true,
    rewardStars: 2,
    updatedAt: 1715000000000,
  },
  {
    id: 'smp-snk-6',
    zone: 'menjadi_terang',
    type: 'snake',
    format: 'multiple_choice',
    categoryName: 'Nilai-Nilai Kristiani',
    question: 'Guru dan pembina remaja menegurmu karena sering mengabaikan tugas piket dan bercanda saat doa bersama. Respon yang rendah hati adalah...',
    options: [
      'Membanting pintu kelas dan membantah teguran dengan kata-kata kasar',
      'Menerima teguran dengan lapang dada, meminta maaf, dan memperbaiki kedisiplinan diri',
      'Menuduh pembina remaja membenci dirimu secara pribadi',
      'Memboikot kegiatan doa bersama sebagai tanda protes',
    ],
    optionA: 'Membanting pintu kelas dan membantah teguran dengan kata-kata kasar',
    optionB: 'Menerima teguran dengan lapang dada, meminta maaf, dan memperbaiki kedisiplinan diri',
    optionC: 'Menuduh pembina remaja membenci dirimu secara pribadi',
    optionD: 'Memboikot kegiatan doa bersama sebagai tanda protes',
    correctIndex: 1,
    correctAnswer: 'B',
    explanation: 'Didikan dan teguran yang tulus adalah tanda kasih demi keselamatan dan pertumbuhan karakter iman kita.',
    bibleVerse: 'Amsal 15:5 - "Orang bodoh menolak didikan ayahnya, tetapi siapa mengindahkan teguran, ia bijak."',
    difficulty: 'EASY',
    enabled: true,
    rewardStars: 1,
    updatedAt: 1715000000000,
  },

  // ==========================================
  // 4. OPEN-ENDED REFLECTION QUESTIONS
  // ==========================================
  {
    id: 'smp-ref-1',
    zone: 'rumah',
    type: 'reflection',
    format: 'reflection',
    categoryName: 'Iman dalam Tindakan',
    question: 'Sebutkan satu tindakan kasih nyata yang dapat kamu lakukan di rumah minggu ini untuk meringankan beban orang tuamu!',
    options: [],
    correctIndex: -1,
    correctAnswer: 'NONE',
    explanation: 'Jawaban refleksi dievaluasi langsung oleh Bapak/Ibu Guru berdasarkan ketulusan niat dan komitmen siswa.',
    bibleVerse: '1 Yohanes 3:18 - "Anak-anakku, marilah kita mengasihi bukan dengan perkataan atau dengan lidah, tetapi dengan perbuatan dan dalam kebenaran."',
    difficulty: 'MEDIUM',
    enabled: true,
    rewardStars: 2,
    updatedAt: 1715000000000,
  },
  {
    id: 'smp-ref-2',
    zone: 'sekolah',
    type: 'reflection',
    format: 'reflection',
    categoryName: 'Persahabatan',
    question: 'Bagikan pengalamanmu ketika kamu memaafkan seorang sahabat yang pernah bersalah kepadamu, atau saat kamu meminta maaf dengan tulus!',
    options: [],
    correctIndex: -1,
    correctAnswer: 'NONE',
    explanation: 'Refleksi dinilai secara lisan atau tulisan oleh guru dengan pemberian Bintang Iman atas kejujuran hati.',
    bibleVerse: 'Kolose 3:13 - "Sabarlah kamu seorang terhadap yang lain, dan ampunilah seorang akan yang lain."',
    difficulty: 'MEDIUM',
    enabled: true,
    rewardStars: 2,
    updatedAt: 1715000000000,
  },
  {
    id: 'smp-ref-3',
    zone: 'masyarakat',
    type: 'reflection',
    format: 'reflection',
    categoryName: 'Iman dalam Tindakan',
    question: 'Bagaimana caramu menjadi pembawa damai di lingkungan tempat tinggalmu ketika melihat perbedaan atau perselisihan?',
    options: [],
    correctIndex: -1,
    correctAnswer: 'NONE',
    explanation: 'Bapak/Ibu Guru dapat memberikan 1 hingga 3 Bintang Iman sesuai kedalaman pemikiran dan contoh nyata siswa.',
    bibleVerse: 'Matius 5:9 - "Berbahagialah orang yang membawa damai, karena mereka akan disebut anak-anak Allah."',
    difficulty: 'HARD',
    enabled: true,
    rewardStars: 3,
    updatedAt: 1715000000000,
  },
  {
    id: 'smp-ref-4',
    zone: 'menjadi_terang',
    type: 'reflection',
    format: 'reflection',
    categoryName: 'Karakter Kristiani',
    question: 'Sebutkan satu talenta atau kelebihan yang Tuhan anugerahkan kepadamu, dan bagaimana kamu akan menggunakannya untuk melayani sesama!',
    options: [],
    correctIndex: -1,
    correctAnswer: 'NONE',
    explanation: 'Guru mengapresiasi kesadaran diri siswa dan komitmen mempersembahkan talenta demi kemuliaan Tuhan.',
    bibleVerse: '1 Petrus 4:10 - "Layanilah seorang akan yang lain, sesuai dengan karunia yang telah diperoleh tiap-tiap orang sebagai pengurus yang baik dari kasih karunia Allah."',
    difficulty: 'HARD',
    enabled: true,
    rewardStars: 3,
    updatedAt: 1715000000000,
  },
];

const LOCAL_STORAGE_KEY = 'jejak_iman_custom_questions_v2';
const TEACHER_PIN_KEY = 'jejak_iman_teacher_pin';
const DEFAULT_TEACHER_PIN = '1234';

/**
 * Gets configured teacher PIN or default '1234'
 */
export function getStoredTeacherPin(): string {
  try {
    const pin = localStorage.getItem(TEACHER_PIN_KEY);
    if (pin && pin.trim().length >= 4) {
      return pin.trim();
    }
  } catch {
    // Ignore
  }
  return DEFAULT_TEACHER_PIN;
}

/**
 * Saves a new teacher PIN to localStorage
 */
export function saveTeacherPin(newPin: string): boolean {
  try {
    if (!newPin || newPin.trim().length < 4) return false;
    localStorage.setItem(TEACHER_PIN_KEY, newPin.trim());
    return true;
  } catch {
    return false;
  }
}

/**
 * Resets teacher PIN back to default '1234'
 */
export function resetTeacherPin(): void {
  try {
    localStorage.removeItem(TEACHER_PIN_KEY);
  } catch {
    // Ignore
  }
}

/**
 * Retrieves stored questions from localStorage or initializes defaults
 */
export function getStoredQuestions(): Question[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return INITIAL_QUESTIONS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (e) {
    console.warn('Failed reading custom questions from localStorage', e);
  }
  return INITIAL_QUESTIONS;
}

/**
 * Persists questions to localStorage
 */
export function saveStoredQuestions(questions: Question[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(questions));
  } catch (e) {
    console.error('Failed saving questions to localStorage', e);
  }
}

/**
 * Resets question bank back to default initial questions
 */
export function resetToDefaultQuestions(): Question[] {
  try {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  } catch {
    // Ignore
  }
  return INITIAL_QUESTIONS;
}

/**
 * Finds the best active question matching the event type and current zone.
 * Prevents repetition by tracking usedQuestionIds until available pool is exhausted.
 */
export function getQuestionForEvent(
  eventType: QuestionType,
  zone: GameZone,
  questionList: Question[],
  usedQuestionIds: string[] = []
): { question: Question; updatedUsedIds: string[] } {
  // Only select active (enabled !== false) questions
  const activeQuestions = questionList.filter((q) => q.enabled !== false);
  const pool = activeQuestions.length > 0 ? activeQuestions : INITIAL_QUESTIONS;

  // Filter pool matching eventType
  // For 'quiz' eventType on board, both 'quiz' and 'reflection' questions can qualify
  let matchingType = pool.filter((q) => {
    if (eventType === 'quiz') return q.type === 'quiz' || q.type === 'reflection';
    return q.type === eventType;
  });

  if (matchingType.length === 0) {
    matchingType = pool;
  }

  // Check unused questions first to avoid repetition
  let candidates = matchingType.filter((q) => !usedQuestionIds.includes(q.id));

  let currentUsedIds = [...usedQuestionIds];
  // If all matching questions have been used, reset the repetition tracker for this type
  if (candidates.length === 0) {
    candidates = matchingType;
    currentUsedIds = [];
  }

  // 1. Try exact zone match among candidates
  const zoneMatches = candidates.filter((q) => q.zone === zone);
  const selectedList = zoneMatches.length > 0 ? zoneMatches : candidates;

  const selected = selectedList[Math.floor(Math.random() * selectedList.length)] || INITIAL_QUESTIONS[0];

  currentUsedIds.push(selected.id);
  return { question: selected, updatedUsedIds: currentUsedIds };
}
