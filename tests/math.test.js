import test from 'node:test'
import assert from 'node:assert/strict'
import { findPeriod, gcd, modularPow, shorResult } from '../src/utils/math.js'

test('gcd finds the greatest common divisor', () => {
  assert.equal(gcd(54, 24), 6)
  assert.equal(gcd(-21, 14), 7)
})

test('modularPow performs modular exponentiation', () => {
  assert.equal(modularPow(2, 4, 15), 1)
  assert.equal(modularPow(2, 5, 21), 11)
})

test('findPeriod identifies modular periods', () => {
  assert.equal(findPeriod(2, 15), 4)
  assert.equal(findPeriod(2, 21), 6)
  assert.equal(findPeriod(2, 35), 12)
})

test('Shor post-processing factors supported composites', () => {
  for (const [n, expected] of [[15, [3, 5]], [21, [3, 7]], [35, [5, 7]]]) {
    const result = shorResult(2, n)
    assert.equal(result.type, 'success')
    assert.deepEqual([...result.factors].sort((a, b) => a - b), expected)
  }
})

test('Shor post-processing requests a retry for an unusable basis', () => {
  const result = shorResult(14, 15)
  assert.equal(result.type, 'retry')
  assert.equal(result.period, 2)
})
