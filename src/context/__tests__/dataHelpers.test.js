import { describe, test, expect } from 'vitest';
import {
  calculateCO2,
  getDailyCO2,
  formatDate,
  getDaysAgo,
  getEquivalentImpact,
  calculatePoints,
  calculateStreak,
  getUnlockedBadges,
  ALL_BADGES,
} from '../dataHelpers';

describe('dataHelpers.js Unit Tests', () => {
  describe('calculateCO2', () => {
    test('calculates transport car emissions correctly', () => {
      // car_km factor is 0.21. 10 km should be 2.1 kg CO2.
      expect(calculateCO2('transport', 'car_km', 10)).toBe(2.1);
    });

    test('calculates transport bike emissions as 0', () => {
      expect(calculateCO2('transport', 'bike_km', 15)).toBe(0);
    });

    test('calculates food meat meal emissions correctly', () => {
      // meat_meal factor is 3.3. 2 meals should be 6.6 kg CO2.
      expect(calculateCO2('food', 'meat_meal', 2)).toBe(6.6);
    });

    test('returns 0 for unknown categories or activities', () => {
      expect(calculateCO2('unknown', 'unknown', 10)).toBe(0);
      expect(calculateCO2('transport', 'unknown', 10)).toBe(0);
    });
  });

  describe('formatDate', () => {
    test('formats dates properly as YYYY-MM-DD', () => {
      const date = new Date('2026-06-10T12:34:56.789Z');
      expect(formatDate(date)).toBe('2026-06-10');
    });
  });

  describe('getDailyCO2', () => {
    test('aggregates daily CO2 emissions for a specific date', () => {
      const today = new Date();
      const yesterday = getDaysAgo(1);

      const activities = [
        { timestamp: today.toISOString(), co2: 2.5 },
        { timestamp: today.toISOString(), co2: 1.5 },
        { timestamp: yesterday.toISOString(), co2: 5.0 },
      ];

      expect(getDailyCO2(activities, today)).toBe(4.0);
      expect(getDailyCO2(activities, yesterday)).toBe(5.0);
    });
  });

  describe('getEquivalentImpact', () => {
    test('calculates various environmental equivalence values correctly', () => {
      const co2Kg = 21; // equals 1 tree (21kg/tree)
      const impact = getEquivalentImpact(co2Kg);
      expect(impact.trees).toBe('1.0');
      expect(impact.carMiles).toBe('52'); // 21 / 0.404 = 51.98 -> 52
      expect(impact.phoneCharges).toBe('2625'); // 21 / 0.008 = 2625
    });
  });

  describe('calculatePoints', () => {
    test('calculates base points and positive activity bonuses', () => {
      const activities = [
        { co2: 5.0, positive: false }, // base points = 10
        { co2: -2.0, positive: true },  // base points = 10, positive bonus = 15, negative co2 bonus = 10 (2 * 5)
      ];

      // Expected total:
      // Act 1: 10 points
      // Act 2: 10 + 15 + 10 = 35 points
      // Total: 45 points
      expect(calculatePoints(activities)).toBe(45);
    });
  });

  describe('calculateStreak', () => {
    test('returns 0 for empty activities', () => {
      expect(calculateStreak([])).toBe(0);
    });

    test('computes active logging streak correctly', () => {
      const activities = [
        { timestamp: getDaysAgo(0).toISOString() },
        { timestamp: getDaysAgo(1).toISOString() },
        { timestamp: getDaysAgo(2).toISOString() },
        { timestamp: getDaysAgo(4).toISOString() },
      ];

      expect(calculateStreak(activities)).toBe(3);
    });
  });

  describe('getUnlockedBadges', () => {
    test('correctly unlocks badges based on criteria', () => {
      const activities = [
        { activityId: 'solar_kwh', co2: -2.0, positive: true, category: 'energy' }
      ];
      // 1 activity should unlock 'First Step' (first_log) but not 'Consistent' (ten_logs)
      const unlocked = getUnlockedBadges(activities, 1);
      const firstStep = unlocked.find(b => b.id === 'first_log');
      const consistent = unlocked.find(b => b.id === 'ten_logs');

      expect(firstStep.unlocked).toBe(true);
      expect(consistent.unlocked).toBe(false);
    });
  });
});
