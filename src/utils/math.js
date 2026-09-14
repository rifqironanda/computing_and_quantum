export function gcd(a, b) {
  let x = Math.abs(a)
  let y = Math.abs(b)
  while (y !== 0) {
    ;[x, y] = [y, x % y]
  }
  return x
}

export function modularPow(base, exponent, modulus) {
  let result = 1
  let value = base % modulus
  let power = exponent
  while (power > 0) {
    if (power % 2 === 1) result = (result * value) % modulus
    value = (value * value) % modulus
    power = Math.floor(power / 2)
  }
  return result
}

export function findPeriod(a, n) {
  for (let r = 1; r <= n * 2; r += 1) {
    if (modularPow(a, r, n) === 1) return r
  }
  return null
}

export function buildResidues(a, n, limit = n) {
  return Array.from({ length: limit }, (_, x) => ({
    x,
    value: modularPow(a, x, n),
  }))
}

export function shorResult(a, n) {
  const common = gcd(a, n)
  if (common > 1) {
    return {
      type: 'lucky',
      common,
      factors: [common, n / common],
      message: 'Pilihan a langsung memiliki faktor bersama dengan N.',
    }
  }

  const period = findPeriod(a, n)
  if (!period) return { type: 'fail', message: 'Periode tidak ditemukan.' }
  if (period % 2 !== 0) {
    return { type: 'retry', period, message: 'Periode r ganjil. Pilih basis a lain.' }
  }

  const halfPower = modularPow(a, period / 2, n)
  if (halfPower === n - 1) {
    return {
      type: 'retry',
      period,
      halfPower,
      message: 'a^(r/2) ≡ −1 (mod N), sehingga percobaan ini tidak memberi faktor.',
    }
  }

  const p = gcd(halfPower - 1, n)
  const q = gcd(halfPower + 1, n)
  if (p === 1 || q === 1 || p === n || q === n) {
    return { type: 'retry', period, halfPower, message: 'Faktor yang muncul trivial. Coba basis lain.' }
  }

  return { type: 'success', period, halfPower, factors: [p, q] }
}

export const shorOptions = {
  15: [2, 4, 7, 8, 11, 13, 14],
  21: [2, 4, 5, 8, 10, 11, 13, 16, 17, 19, 20],
  35: [2, 3, 4, 6, 8, 9, 11, 12, 13, 16, 17, 18, 19, 22, 23, 24, 26, 27, 29, 31, 32, 33, 34],
}
