import { test, expect } from '@playwright/test';
import { charFrequency, formatFrequency } from './charFrequency.js';

test.describe('String Character Frequency', () => {
  test('should handle the example input "hello world"', () => {
    const result = formatFrequency('hello world');
    expect(result).toBe('h:1, e:1, l:3, o:2, w:1, r:1, d:1');
  });

  test('should return empty string for empty input', () => {
    expect(formatFrequency('')).toBe('');
  });

  test('should handle single character', () => {
    expect(formatFrequency('a')).toBe('a:1');
  });

  test('should handle repeated characters', () => {
    expect(formatFrequency('aaa')).toBe('a:3');
  });

  test('should be case-sensitive (A !== a)', () => {
    expect(formatFrequency('Aa')).toBe('A:1, a:1');
  });

  test('should exclude spaces', () => {
    expect(formatFrequency('a b c')).toBe('a:1, b:1, c:1');
  });

  test('should handle special characters', () => {
    expect(formatFrequency('a!!b')).toBe('a:1, !:2, b:1');
  });

  test('should handle unicode characters', () => {
    expect(formatFrequency('café')).toBe('c:1, a:1, f:1, é:1');
  });

  test('should preserve order of first appearance', () => {
    const result = formatFrequency('banana');
    expect(result).toBe('b:1, a:3, n:2');
  });

  test('should handle only spaces (returns empty)', () => {
    expect(formatFrequency('   ')).toBe('');
  });

  test('should handle numbers and punctuation', () => {
    expect(formatFrequency('a1!a1!')).toBe('a:2, 1:2, !:2');
  });

  test('charFrequency should return a Map with correct counts', () => {
    const result = charFrequency('hello');
    expect(result.get('h')).toBe(1);
    expect(result.get('e')).toBe(1);
    expect(result.get('l')).toBe(2);
    expect(result.get('o')).toBe(1);
    expect(result.size).toBe(4);
  });
});
