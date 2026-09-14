# Dokumentasi Pengujian Shor's Algorithm

Dokumen ini menjelaskan apa yang diuji oleh aplikasi, bagaimana perhitungannya bekerja, dan bagaimana membaca hasil pengujian tanpa harus memahami seluruh kode JavaScript terlebih dahulu.

## 1. Hal terpenting yang perlu dipahami

Aplikasi ini **belum menjalankan algoritma Shor pada quantum computer**. Browser melakukan pencarian periode secara klasik untuk memperlihatkan struktur algoritmanya.

Pembagian prosesnya adalah:

| Tahap | Shor sesungguhnya | Implementasi aplikasi |
|---|---|---|
| Memilih bilangan `a` | Classical computation | Classical computation |
| Menghitung `gcd(a, N)` | Classical computation | Fungsi `gcd()` |
| Mencari periode `r` | Quantum period finding | Disimulasikan oleh `findPeriod()` secara klasik |
| Mengubah periode menjadi faktor | Classical computation | Fungsi `shorResult()` |

Jadi, unit test membuktikan bahwa **matematika simulasi dan classical post-processing** menghasilkan jawaban yang benar. Unit test tidak membuktikan bahwa sebuah quantum circuit atau quantum hardware telah berjalan.

---

## 2. Tujuan sederhana algoritma

Kita ingin mencari faktor dari bilangan komposit `N`.

Contoh:

```text
N = 15
faktor yang diharapkan = 3 dan 5
```

Shor tidak langsung mencoba membagi 15 dengan semua angka. Ia mengubah factoring menjadi masalah mencari pola berulang atau **period finding** dari:

```text
f(x) = aˣ mod N
```

Keterangan:

- `a` adalah bilangan basis yang dipilih.
- `x` adalah pangkat.
- `mod N` berarti mengambil sisa pembagian oleh `N`.
- `r` adalah panjang pola berulang terkecil.

---

## 3. Contoh lengkap: N = 15 dan a = 2

### Langkah 1 — Periksa GCD

```text
gcd(2, 15) = 1
```

Artinya 2 dan 15 tidak memiliki faktor bersama selain 1. Kita dapat melanjutkan ke period finding.

Jika hasil GCD lebih besar dari 1, faktor justru sudah ditemukan dan quantum step tidak diperlukan.

### Langkah 2 — Bangun fungsi modular

Hitung `2ˣ mod 15`:

| x | 2ˣ | 2ˣ mod 15 |
|---:|---:|---:|
| 0 | 1 | 1 |
| 1 | 2 | 2 |
| 2 | 4 | 4 |
| 3 | 8 | 8 |
| 4 | 16 | 1 |
| 5 | 32 | 2 |
| 6 | 64 | 4 |
| 7 | 128 | 8 |

Terlihat pola:

```text
1, 2, 4, 8, 1, 2, 4, 8, ...
```

Nilai kembali menjadi 1 pada `x = 4`. Karena itu:

```text
periode r = 4
```

Inilah yang diperiksa test berikut:

```js
assert.equal(findPeriod(2, 15), 4)
```

Kalimat tersebut berarti:

> Jalankan `findPeriod(2, 15)`, lalu pastikan hasilnya sama persis dengan 4.

### Langkah 3 — Periksa apakah periode dapat dipakai

Periode harus genap.

```text
r = 4
4 adalah genap → lanjut
```

Lalu hitung:

```text
a^(r/2) mod N
= 2^(4/2) mod 15
= 2² mod 15
= 4
```

Hasilnya tidak boleh sama dengan `−1 mod N`. Untuk `N = 15`, bentuk positif dari `−1 mod 15` adalah 14. Karena hasilnya 4, kita dapat melanjutkan.

### Langkah 4 — Ekstrak faktor

Gunakan dua perhitungan GCD:

```text
p = gcd(a^(r/2) − 1, N)
  = gcd(4 − 1, 15)
  = gcd(3, 15)
  = 3

q = gcd(a^(r/2) + 1, N)
  = gcd(4 + 1, 15)
  = gcd(5, 15)
  = 5
```

Hasil akhir:

```text
15 = 3 × 5
```

---

## 4. Fungsi yang digunakan

Kode utama berada di `src/utils/math.js`.

### `gcd(a, b)`

Mencari **greatest common divisor**, yaitu bilangan terbesar yang membagi `a` dan `b` tanpa sisa.

```js
gcd(54, 24) // 6
```

Fungsi memakai Euclidean algorithm:

```text
54 mod 24 = 6
24 mod 6  = 0
GCD        = 6
```

### `modularPow(base, exponent, modulus)`

Menghitung:

```text
base^exponent mod modulus
```

Contoh:

```js
modularPow(2, 4, 15) // 1
```

Fungsi memakai **modular exponentiation by repeated squaring**. Metode ini mengurangi nilai pada setiap langkah sehingga program tidak perlu terlebih dahulu membentuk bilangan berpangkat yang sangat besar.

### `findPeriod(a, n)`

Mencari bilangan positif terkecil `r` yang memenuhi:

```text
aʳ mod N = 1
```

Contoh:

```js
findPeriod(2, 15) // 4
```

Dalam aplikasi ini fungsi mencoba nilai `r = 1, 2, 3, ...` secara klasik. Pada algoritma Shor sesungguhnya, informasi periode diperoleh melalui quantum subroutine yang melibatkan superposition, modular exponentiation, measurement, dan inverse Quantum Fourier Transform.

### `shorResult(a, n)`

Fungsi ini mengatur keseluruhan classical workflow:

1. Menghitung `gcd(a, N)`.
2. Memanggil `findPeriod(a, N)`.
3. Menolak periode ganjil.
4. Menolak kondisi `a^(r/2) ≡ −1 mod N`.
5. Menghitung dua faktor kandidat.
6. Mengembalikan status `success`, `retry`, `lucky`, atau `fail`.

| Status | Makna |
|---|---|
| `success` | Dua faktor non-trivial ditemukan |
| `retry` | Basis `a` tidak cocok; pilih basis lain |
| `lucky` | GCD langsung menemukan faktor |
| `fail` | Periode tidak ditemukan dalam batas simulasi |

---

## 5. Lima unit test yang dijalankan

File pengujian berada di `tests/math.test.js`.

### Test 1 — GCD

```js
assert.equal(gcd(54, 24), 6)
assert.equal(gcd(-21, 14), 7)
```

Tujuannya memastikan Euclidean algorithm bekerja untuk bilangan positif dan input negatif.

### Test 2 — Modular exponentiation

```js
assert.equal(modularPow(2, 4, 15), 1)
assert.equal(modularPow(2, 5, 21), 11)
```

Perhitungan kedua dapat diperiksa manual:

```text
2⁵ = 32
32 mod 21 = 11
```

### Test 3 — Period finding

```js
findPeriod(2, 15) → 4
findPeriod(2, 21) → 6
findPeriod(2, 35) → 12
```

Test memastikan fungsi menemukan panjang pola modular yang benar.

### Test 4 — Hasil faktorisasi

Dengan basis `a = 2`, test mengharapkan:

| N | Periode r | Faktor yang diharapkan |
|---:|---:|---:|
| 15 | 4 | 3 × 5 |
| 21 | 6 | 3 × 7 |
| 35 | 12 | 5 × 7 |

Kode juga mengurutkan faktor sebelum membandingkan. Karena itu hasil `[5, 3]` tetap dianggap sama dengan `[3, 5]`.

### Test 5 — Percobaan yang harus diulang

```js
shorResult(14, 15)
```

Urutannya:

```text
14² mod 15 = 1
r = 2
14^(2/2) mod 15 = 14
14 ≡ −1 mod 15
```

Kondisi tersebut tidak menghasilkan faktor non-trivial, sehingga hasil yang benar adalah:

```text
type = "retry"
```

Ini bukan error program. Algoritma Shor bersifat probabilistik dan kadang harus memilih `a` lain.

---

## 6. Cara menjalankan pengujian

Dari terminal pada folder repo:

```bash
npm install
npm test
npm run build
```

Arti perintah:

| Perintah | Fungsi |
|---|---|
| `npm install` | Mengunduh dependency |
| `npm test` | Menjalankan lima unit test matematika |
| `npm run build` | Memastikan seluruh React source dapat dibuat menjadi production bundle |

Hasil sukses akan memuat:

```text
# tests 5
# pass 5
# fail 0
```

Pada GitHub, langkah yang sama dijalankan otomatis oleh workflow `.github/workflows/ci.yml`.

---

## 7. Apa yang sudah dan belum dibuktikan

### Sudah diuji

- Implementasi GCD.
- Modular exponentiation untuk contoh yang dipakai.
- Period finding klasik untuk 15, 21, dan 35.
- Classical post-processing untuk menghasilkan faktor.
- Kondisi retry untuk basis yang tidak cocok.
- React production build.

### Belum diuji

- Quantum circuit yang sebenarnya.
- Quantum Fourier Transform secara numerik.
- Noise dan quantum error correction.
- Eksekusi pada Qiskit simulator atau IBM Quantum hardware.
- Bilangan kriptografis besar seperti modulus RSA.

---

## 8. Pertanyaan kritis untuk memeriksa pemahaman

1. Mengapa `gcd(a, N) > 1` membuat period finding tidak diperlukan?
2. Mengapa periode `r` harus genap?
3. Dari mana bentuk `gcd(a^(r/2) ± 1, N)` berasal?
4. Mengapa basis tertentu memberi status `retry`, tetapi bukan berarti algoritmanya salah?
5. Bagian mana yang memperoleh quantum speedup pada Shor sesungguhnya?
6. Apakah lolos unit test berarti aplikasi telah menjalankan quantum computation?

Jawaban inti pertanyaan terakhir adalah **tidak**. Unit test saat ini memvalidasi model matematika edukatif dan bagian klasik dari alur Shor.
