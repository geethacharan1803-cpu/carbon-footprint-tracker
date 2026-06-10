import { describe, test, expect } from 'vitest';
import { reducer } from '../AppContext';
import { getDaysAgo } from '../dataHelpers';

describe('AppContext reducer Unit Tests', () => {
  const getMockState = () => ({
    theme: 'light',
    activeTab: 'dashboard',
    activities: [],
    streak: 0,
    points: 0,
    badges: [],
    challenges: [
      { id: 'ch1', joined: false, participants: 10 },
    ],
    leaderboard: [
      { name: 'You', points: 0, co2Saved: 0, isCurrentUser: true },
    ],
    pledges: [
      { id: 'p1', current: 0, target: 10 },
    ],
    notifications: [],
    showEquivalentImpact: false,
    notificationsEnabled: false,
  });

  test('TOGGLE_THEME switches light and dark theme', () => {
    let state = getMockState();
    state = reducer(state, { type: 'TOGGLE_THEME' });
    expect(state.theme).toBe('dark');

    state = reducer(state, { type: 'TOGGLE_THEME' });
    expect(state.theme).toBe('light');
  });

  test('SET_TAB updates the active tab', () => {
    let state = getMockState();
    state = reducer(state, { type: 'SET_TAB', payload: 'tracker' });
    expect(state.activeTab).toBe('tracker');
  });

  test('TOGGLE_EQUIVALENT_IMPACT toggles the equivalent impact display flag', () => {
    let state = getMockState();
    state = reducer(state, { type: 'TOGGLE_EQUIVALENT_IMPACT' });
    expect(state.showEquivalentImpact).toBe(true);

    state = reducer(state, { type: 'TOGGLE_EQUIVALENT_IMPACT' });
    expect(state.showEquivalentImpact).toBe(false);
  });

  test('JOIN_CHALLENGE increments participants and flags joined', () => {
    let state = getMockState();
    state = reducer(state, { type: 'JOIN_CHALLENGE', payload: 'ch1' });
    expect(state.challenges[0].joined).toBe(true);
    expect(state.challenges[0].participants).toBe(11);
  });

  test('LEAVE_CHALLENGE decrements participants and flags joined as false', () => {
    let state = getMockState();
    // join first
    state = reducer(state, { type: 'JOIN_CHALLENGE', payload: 'ch1' });
    // then leave
    state = reducer(state, { type: 'LEAVE_CHALLENGE', payload: 'ch1' });
    expect(state.challenges[0].joined).toBe(false);
    expect(state.challenges[0].participants).toBe(10);
  });

  test('UPDATE_PLEDGE updates the specified pledge data', () => {
    let state = getMockState();
    state = reducer(state, { type: 'UPDATE_PLEDGE', payload: { id: 'p1', current: 5 } });
    expect(state.pledges[0].current).toBe(5);
  });

  test('ADD_PLEDGE appends a new pledge', () => {
    let state = getMockState();
    const newPledge = { id: 'p2', title: 'New Pledge', current: 0, target: 5 };
    state = reducer(state, { type: 'ADD_PLEDGE', payload: newPledge });
    expect(state.pledges).toHaveLength(2);
    expect(state.pledges[1].id).toBe('p2');
  });

  test('ADD_NOTIFICATION appends a new notification to the beginning of the list', () => {
    let state = getMockState();
    const notif = { id: 'n1', message: 'Eco test', timestamp: new Date().toISOString(), read: false };
    state = reducer(state, { type: 'ADD_NOTIFICATION', payload: notif });
    expect(state.notifications).toHaveLength(1);
    expect(state.notifications[0].id).toBe('n1');
  });

  test('CLEAR_NOTIFICATIONS empties the notifications list', () => {
    let state = getMockState();
    state.notifications = [{ id: 'n1' }];
    state = reducer(state, { type: 'CLEAR_NOTIFICATIONS' });
    expect(state.notifications).toHaveLength(0);
  });

  test('ENABLE_NOTIFICATIONS enables the notification system flag', () => {
    let state = getMockState();
    state = reducer(state, { type: 'ENABLE_NOTIFICATIONS' });
    expect(state.notificationsEnabled).toBe(true);
  });

  test('ADD_ACTIVITY appends an activity and recalculates stats', () => {
    let state = getMockState();
    const activity = {
      id: 'act-1',
      category: 'transport',
      activityId: 'car_km',
      label: 'Drove a car',
      unit: 'km',
      quantity: 10,
      co2: 2.1,
      positive: false,
      timestamp: getDaysAgo(0).toISOString(),
    };

    state = reducer(state, { type: 'ADD_ACTIVITY', payload: activity });
    expect(state.activities).toHaveLength(1);
    expect(state.activities[0].id).toBe('act-1');
    expect(state.points).toBeGreaterThan(0);
    expect(state.streak).toBe(1); // 1 day logged
  });
});
