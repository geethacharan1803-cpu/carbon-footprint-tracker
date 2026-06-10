/* ============================================================
   dataHelpers.js — Utility functions, CO₂ calculations,
   badge logic, streak computation, seed data, CSV export
   ============================================================ */

// ---------- CO₂ Emission Factors (kg CO₂ per unit) ----------
export const EMISSION_FACTORS = {
  transport: {
    car_km: 0.21,
    bus_km: 0.089,
    train_km: 0.041,
    bike_km: 0,
    walk_km: 0,
    flight_km: 0.255,
  },
  energy: {
    electricity_kwh: 0.475,
    gas_kwh: 0.184,
    solar_kwh: 0,
  },
  food: {
    meat_meal: 3.3,
    vegetarian_meal: 1.7,
    vegan_meal: 0.9,
    dairy_serving: 1.1,
  },
  waste: {
    recycled_kg: -0.5,
    composted_kg: -0.3,
    landfill_kg: 0.58,
  },
  water: {
    shower_min: 0.1,
    bath: 1.7,
    laundry_load: 0.6,
  },
};

// ---------- Activity Descriptions ----------
export const ACTIVITY_OPTIONS = {
  transport: [
    { id: 'car_km', label: 'Drove a car', unit: 'km', icon: '🚗' },
    { id: 'bus_km', label: 'Took the bus', unit: 'km', icon: '🚌' },
    { id: 'train_km', label: 'Took the train', unit: 'km', icon: '🚆' },
    { id: 'bike_km', label: 'Biked', unit: 'km', icon: '🚲', positive: true },
    { id: 'walk_km', label: 'Walked', unit: 'km', icon: '🚶', positive: true },
  ],
  energy: [
    { id: 'electricity_kwh', label: 'Used electricity', unit: 'kWh', icon: '⚡' },
    { id: 'gas_kwh', label: 'Used gas', unit: 'kWh', icon: '🔥' },
    { id: 'solar_kwh', label: 'Used solar energy', unit: 'kWh', icon: '☀️', positive: true },
  ],
  food: [
    { id: 'meat_meal', label: 'Had a meat meal', unit: 'meals', icon: '🥩' },
    { id: 'vegetarian_meal', label: 'Had a veggie meal', unit: 'meals', icon: '🥗', positive: true },
    { id: 'vegan_meal', label: 'Had a vegan meal', unit: 'meals', icon: '🌱', positive: true },
  ],
  waste: [
    { id: 'recycled_kg', label: 'Recycled', unit: 'kg', icon: '♻️', positive: true },
    { id: 'composted_kg', label: 'Composted', unit: 'kg', icon: '🪱', positive: true },
    { id: 'landfill_kg', label: 'Landfill waste', unit: 'kg', icon: '🗑️' },
  ],
  water: [
    { id: 'shower_min', label: 'Shower', unit: 'min', icon: '🚿' },
    { id: 'bath', label: 'Took a bath', unit: 'baths', icon: '🛁' },
    { id: 'laundry_load', label: 'Laundry load', unit: 'loads', icon: '🫧' },
  ],
};

export const CATEGORY_META = {
  transport: { label: 'Transport', icon: '🚗', color: '#42A5F5' },
  energy: { label: 'Energy', icon: '⚡', color: '#FFB300' },
  food: { label: 'Food', icon: '🍽️', color: '#66BB6A' },
  waste: { label: 'Waste', icon: '♻️', color: '#AB47BC' },
  water: { label: 'Water', icon: '💧', color: '#26A69A' },
};

// ---------- CO₂ Calculation ----------
export function calculateCO2(category, activityId, quantity) {
  const factor = EMISSION_FACTORS[category]?.[activityId] ?? 0;
  return parseFloat((factor * quantity).toFixed(2));
}

// ---------- Daily CO₂ Budget ----------
export const DAILY_CO2_BUDGET = 11.0; // kg — average person's daily budget goal

export function getDailyCO2(activities, date = new Date()) {
  const dateStr = formatDate(date);
  return activities
    .filter(a => formatDate(new Date(a.timestamp)) === dateStr)
    .reduce((sum, a) => sum + Math.abs(a.co2), 0);
}

// ---------- Date Helpers ----------
export function formatDate(date) {
  return date.toISOString().split('T')[0];
}

export function formatTime(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function getDaysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getDateLabel(date) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${date.getDate()}`;
}

// ---------- Chart Data (30-day) ----------
export function getChartData(activities, days = 30) {
  const labels = [];
  const data = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = getDaysAgo(i);
    labels.push(getDateLabel(d));
    const dayTotal = getDailyCO2(activities, d);
    data.push(dayTotal);
  }
  return { labels, data };
}

// ---------- Equivalent Impact ----------
export function getEquivalentImpact(co2Kg) {
  return {
    trees: (co2Kg / 21).toFixed(1),        // ~21 kg CO₂ per tree/year
    carMiles: (co2Kg / 0.404).toFixed(0),    // ~0.404 kg CO₂ per mile
    phoneCharges: (co2Kg / 0.008).toFixed(0), // ~8g CO₂ per phone charge
    lightBulbHours: (co2Kg / 0.042).toFixed(0), // ~42g per hour
  };
}

// ---------- Projected Monthly Impact ----------
export function getProjectedMonthly(activities) {
  const last7 = [];
  for (let i = 0; i < 7; i++) {
    last7.push(getDailyCO2(activities, getDaysAgo(i)));
  }
  const avgDaily = last7.reduce((a, b) => a + b, 0) / 7;
  return parseFloat((avgDaily * 30).toFixed(1));
}

// ---------- Streak ----------
export function calculateStreak(activities) {
  if (!activities.length) return 0;
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i <= 365; i++) {
    const d = getDaysAgo(i);
    const dateStr = formatDate(d);
    const hasEntry = activities.some(a => formatDate(new Date(a.timestamp)) === dateStr);
    if (hasEntry) {
      streak++;
    } else if (i === 0) {
      continue; // today hasn't passed yet
    } else {
      break;
    }
  }
  return streak;
}

// ---------- Points ----------
export function calculatePoints(activities) {
  let points = 0;
  activities.forEach(a => {
    points += 10; // base points for logging
    if (a.co2 < 0) points += Math.abs(a.co2) * 5; // bonus for positive activities
    if (a.positive) points += 15;
  });
  return Math.round(points);
}

// ---------- Badges ----------
export const ALL_BADGES = [
  { id: 'first_log', name: 'First Step', icon: '🌱', desc: 'Logged your first activity', condition: (a) => a.length >= 1 },
  { id: 'ten_logs', name: 'Consistent', icon: '📊', desc: 'Logged 10 activities', condition: (a) => a.length >= 10 },
  { id: 'fifty_logs', name: 'Dedicated', icon: '🏆', desc: 'Logged 50 activities', condition: (a) => a.length >= 50 },
  { id: 'energy_saver', name: 'Energy Saver Pro', icon: '⚡', desc: 'Used solar energy 5 times', condition: (a) => a.filter(x => x.activityId === 'solar_kwh').length >= 5 },
  { id: 'waste_warrior', name: 'Waste Warrior', icon: '♻️', desc: 'Recycled 20 times', condition: (a) => a.filter(x => x.activityId === 'recycled_kg').length >= 20 },
  { id: 'green_commuter', name: 'Green Commuter', icon: '🚲', desc: 'Biked or walked 15 times', condition: (a) => a.filter(x => x.activityId === 'bike_km' || x.activityId === 'walk_km').length >= 15 },
  { id: 'vegan_streak', name: 'Plant Pioneer', icon: '🌿', desc: 'Had 10 vegan meals', condition: (a) => a.filter(x => x.activityId === 'vegan_meal').length >= 10 },
  { id: 'week_streak', name: '7-Day Streak', icon: '🔥', desc: 'Logged activities 7 days in a row', condition: (_, s) => s >= 7 },
  { id: 'month_streak', name: '30-Day Streak', icon: '💎', desc: 'Logged activities 30 days in a row', condition: (_, s) => s >= 30 },
  { id: 'carbon_cutter', name: 'Carbon Cutter', icon: '✂️', desc: 'Saved over 50 kg CO₂', condition: (a) => a.filter(x => x.co2 < 0).reduce((s, x) => s + Math.abs(x.co2), 0) >= 50 },
  { id: 'water_saver', name: 'Water Guardian', icon: '💧', desc: 'Reduced water usage 10 times', condition: (a) => a.filter(x => x.category === 'water').length >= 10 },
  { id: 'eco_master', name: 'Eco Master', icon: '🌍', desc: 'Earned 1000 points', condition: (a) => calculatePoints(a) >= 1000 },
];

export function getUnlockedBadges(activities, streak) {
  return ALL_BADGES.map(badge => ({
    ...badge,
    unlocked: badge.condition(activities, streak),
  }));
}

// ---------- CSV Export ----------
export function exportToCSV(activities) {
  const headers = ['Date', 'Time', 'Category', 'Activity', 'Quantity', 'Unit', 'CO₂ (kg)'];
  const rows = activities.map(a => {
    const d = new Date(a.timestamp);
    return [
      formatDate(d),
      formatTime(d),
      a.category,
      a.label,
      a.quantity,
      a.unit,
      a.co2,
    ].join(',');
  });
  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `carbon-insight-export-${formatDate(new Date())}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ---------- Seed Data Generator ----------
export function generateSeedData() {
  const activities = [];
  const categories = Object.keys(ACTIVITY_OPTIONS);

  for (let day = 29; day >= 0; day--) {
    const numEntries = Math.floor(Math.random() * 4) + 1;
    for (let e = 0; e < numEntries; e++) {
      const cat = categories[Math.floor(Math.random() * categories.length)];
      const opts = ACTIVITY_OPTIONS[cat];
      const opt = opts[Math.floor(Math.random() * opts.length)];
      const qty = parseFloat((Math.random() * 10 + 1).toFixed(1));
      const co2 = calculateCO2(cat, opt.id, qty);
      const date = getDaysAgo(day);
      date.setHours(Math.floor(Math.random() * 14) + 7, Math.floor(Math.random() * 60));
      activities.push({
        id: `seed-${day}-${e}`,
        category: cat,
        activityId: opt.id,
        label: opt.label,
        icon: opt.icon,
        unit: opt.unit,
        quantity: qty,
        co2,
        positive: opt.positive || false,
        timestamp: date.toISOString(),
      });
    }
  }
  return activities;
}

// ---------- Community Seed Data ----------
export const SAMPLE_CHALLENGES = [
  {
    id: 'ch1',
    title: 'No-Car Week',
    description: 'Avoid driving for 7 days. Use bikes, buses, or walk!',
    category: 'transport',
    icon: '🚫🚗',
    participants: 2341,
    daysLeft: 5,
    joined: false,
    target: 7,
    progress: 0,
  },
  {
    id: 'ch2',
    title: 'Zero Waste Challenge',
    description: 'Produce zero landfill waste for 14 days.',
    category: 'waste',
    icon: '🗑️✨',
    participants: 1587,
    daysLeft: 12,
    joined: true,
    target: 14,
    progress: 6,
  },
  {
    id: 'ch3',
    title: 'Meatless Month',
    description: 'Go vegetarian or vegan for 30 days.',
    category: 'food',
    icon: '🥗',
    participants: 3892,
    daysLeft: 22,
    joined: false,
    target: 30,
    progress: 0,
  },
  {
    id: 'ch4',
    title: 'Energy Audit Sprint',
    description: 'Reduce electricity usage by 20% in 2 weeks.',
    category: 'energy',
    icon: '⚡',
    participants: 945,
    daysLeft: 8,
    joined: true,
    target: 14,
    progress: 9,
  },
];

export const SAMPLE_LEADERBOARD = [
  { rank: 1, name: 'Priya M.', avatar: '🌸', points: 4520, co2Saved: 127.3 },
  { rank: 2, name: 'Alex K.', avatar: '🌊', points: 4105, co2Saved: 115.8 },
  { rank: 3, name: 'Sam R.', avatar: '🌿', points: 3890, co2Saved: 108.2 },
  { rank: 4, name: 'Jordan L.', avatar: '🦋', points: 3650, co2Saved: 99.4 },
  { rank: 5, name: 'You', avatar: '🌍', points: 0, co2Saved: 0, isCurrentUser: true },
  { rank: 6, name: 'Maya T.', avatar: '🌻', points: 2980, co2Saved: 84.1 },
  { rank: 7, name: 'Dev P.', avatar: '🍃', points: 2740, co2Saved: 78.5 },
  { rank: 8, name: 'Chris B.', avatar: '🌲', points: 2510, co2Saved: 71.0 },
];

// ---------- Pledge Category Metadata ----------
export const PLEDGE_CATEGORY_META = {
  transport: { label: 'Transport', icon: '🚗', color: '#42A5F5', darkColor: '#64B5F6' },
  energy:    { label: 'Energy',    icon: '⚡', color: '#FFB300', darkColor: '#FFD54F' },
  food:      { label: 'Diet',      icon: '🥗', color: '#66BB6A', darkColor: '#81C784' },
  waste:     { label: 'Waste',     icon: '♻️', color: '#AB47BC', darkColor: '#CE93D8' },
  water:     { label: 'Water',     icon: '💧', color: '#26A69A', darkColor: '#80CBC4' },
  general:   { label: 'General',   icon: '🌍', color: '#78909C', darkColor: '#B0BEC5' },
};

// CO₂ impact is in kg CO₂ saved per completed unit of the pledge
export const SAMPLE_PLEDGES = [
  { id: 'p1', title: 'Bike to work 3x/week',       target: 12, current: 8,  unit: 'rides', category: 'transport', co2Impact: 2.1  },
  { id: 'p2', title: 'Compost food scraps daily',   target: 30, current: 22, unit: 'days',  category: 'waste',     co2Impact: 0.3  },
  { id: 'p3', title: 'Take 5-min showers',          target: 30, current: 18, unit: 'days',  category: 'water',     co2Impact: 0.3  },
  { id: 'p4', title: 'Eat plant-based lunches',     target: 20, current: 20, unit: 'meals', category: 'food',      co2Impact: 2.4, completed: true },
  { id: 'p5', title: 'Switch off standby devices',  target: 30, current: 12, unit: 'days',  category: 'energy',    co2Impact: 0.5  },
  { id: 'p6', title: 'Use public transit to campus', target: 20, current: 14, unit: 'trips', category: 'transport', co2Impact: 1.8  },
  { id: 'p7', title: 'Recycle all plastic waste',   target: 30, current: 25, unit: 'days',  category: 'waste',     co2Impact: 0.5  },
  { id: 'p8', title: 'Go meatless on Mondays',      target: 12, current: 5,  unit: 'meals', category: 'food',      co2Impact: 3.3  },
  { id: 'p9', title: 'Air-dry laundry instead of dryer', target: 20, current: 9, unit: 'loads', category: 'energy', co2Impact: 1.2 },
];

// ---------- Local Hub Sample Data ----------
export const SAMPLE_LOCATIONS = [
  { id: 'loc1', name: 'Green Park Recycling Centre', type: 'recycling', lat: 12.9716, lng: 77.5946, address: '42 MG Road, Bangalore', hours: '9 AM – 6 PM' },
  { id: 'loc2', name: 'Metro Station - Majestic', type: 'transit', lat: 12.9767, lng: 77.5713, address: 'Majestic Circle', hours: '5 AM – 11 PM' },
  { id: 'loc3', name: 'EcoWaste Collection Point', type: 'recycling', lat: 12.9352, lng: 77.6245, address: '15 Koramangala, Bangalore', hours: '8 AM – 5 PM' },
  { id: 'loc4', name: 'Bus Terminal - Shivajinagar', type: 'transit', lat: 12.9857, lng: 77.6057, address: 'Shivajinagar, Bangalore', hours: '24/7' },
  { id: 'loc5', name: 'Community Compost Hub', type: 'composting', lat: 12.9600, lng: 77.6400, address: '8 Indiranagar, Bangalore', hours: '7 AM – 7 PM' },
  { id: 'loc6', name: 'E-Waste Drop-off', type: 'recycling', lat: 12.9500, lng: 77.5800, address: '3 Jayanagar, Bangalore', hours: '10 AM – 4 PM' },
  { id: 'loc7', name: 'Metro Station - Indiranagar', type: 'transit', lat: 12.9784, lng: 77.6408, address: 'CMH Road, Indiranagar', hours: '5 AM – 11 PM' },
  { id: 'loc8', name: 'Organic Waste Centre', type: 'composting', lat: 12.9200, lng: 77.6100, address: 'HSR Layout', hours: '6 AM – 8 PM' },
];

// ---------- Sage Tips ----------
export const SUSTAINABILITY_TIPS = [
  { id: 't1', title: 'Switch to LED Bulbs', desc: 'LED bulbs use 75% less energy and last 25x longer than incandescent lighting.', icon: '💡', category: 'energy' },
  { id: 't2', title: 'Meal Prep Sundays', desc: 'Planning meals reduces food waste by up to 40% and saves money.', icon: '🍱', category: 'food' },
  { id: 't3', title: 'Cycle Short Trips', desc: 'Cycling trips under 5 km eliminates car emissions entirely.', icon: '🚲', category: 'transport' },
  { id: 't4', title: 'Cold Water Wash', desc: 'Washing clothes in cold water reduces energy use by 90%.', icon: '🫧', category: 'water' },
  { id: 't5', title: 'Composting 101', desc: 'Composting diverts 30% of household waste from landfills.', icon: '🪱', category: 'waste' },
  { id: 't6', title: 'Unplug Devices', desc: 'Phantom power draws 5-10% of your electricity bill. Unplug when not in use.', icon: '🔌', category: 'energy' },
  { id: 't7', title: 'Reusable Bottles', desc: 'One reusable bottle prevents 156 plastic bottles per year from landfills.', icon: '🧴', category: 'waste' },
  { id: 't8', title: 'Public Transit', desc: 'A single bus replaces 40 cars. Public transit cuts emissions by 45%.', icon: '🚌', category: 'transport' },
  { id: 't9', title: 'Seasonal Eating', desc: 'Eating seasonal produce reduces food transport emissions by up to 10x.', icon: '🥕', category: 'food' },
  { id: 't10', title: 'Shorter Showers', desc: 'Cutting 2 minutes from your shower saves 10 gallons of water.', icon: '🚿', category: 'water' },
];
