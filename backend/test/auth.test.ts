import { expect, test, describe } from 'bun:test';

describe('Level calculation logic', () => {
  test('XP to Level progression works', () => {
    function calculateLevel(currentXp: number) {
      let level = 1;
      let threshold = 100;
      let remaining = currentXp;

      while (remaining >= threshold) {
        remaining -= threshold;
        level++;
        threshold = level * 100;
      }

      return { level, remaining, threshold };
    }

    expect(calculateLevel(0).level).toBe(1);
    expect(calculateLevel(50).level).toBe(1);
    expect(calculateLevel(100).level).toBe(2);
    expect(calculateLevel(300).level).toBe(3);
  });
});
