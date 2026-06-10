# 🌿 Carbon Insight — Your Personal Eco Companion

**Carbon Insight** is a web-based sustainability dashboard built to help individuals track, understand, and reduce their daily carbon footprints. Designed with a **Natural Tones** theme, it combines interactive data visualization, community challenges, gamification, and a voice-enabled smart AI assistant to drive behavioral change towards eco-friendly living.

---

## 🎯 Challenge Vertical: Behavioral Sustainability & Smart Eco-Assistance

This solution focuses on the **Behavioral Sustainability** vertical. Our goal is to convert complex, abstract climate science into tangible, daily habits. Instead of just showing numbers in a spreadsheet, **Carbon Insight** translates metric tonnes of CO₂ into "phone charges," "trees planted," or "car miles avoided," creating immediate, relatable feedback loops. 

Additionally, the smart assistant **Sage** acts as a context-aware coach. Sage analyzes the user's logged activity history to dynamically suggest personalized sustainability tips (e.g. recommending cycling if the user frequently logs driving, or composting if food waste is logged).

---

## ✨ Core Features

1. **Daily Activity Tracker & Budgeting**:
   - Log activities across 5 core verticals: *Transport, Energy, Diet (Food), Waste, and Water*.
   - Uses real-world scientific emission factors to calculate carbon output.
   - Monitors a daily CO₂ budget (limit of 11.0 kg/day) with a circular SVG progress indicator.

2. **Interactive Local Hub**:
   - Leaflet-powered maps matching the user's location to nearby recycling centers, transit stations, and composting hubs.

3. **Gamification & Leaderboard**:
   - Earn points for logging positive activities (e.g. solar energy use, cycling).
   - Unlock 12 distinct milestone-based badges (e.g. *Plant Pioneer*, *Energy Saver Pro*).
   - Track consecutive daily logging streaks (visualized with an active flame indicator).
   - Participate in community-wide sustainability challenges and view rankings on a leaderboard.

4. **Carbon Impact Calculator**:
   - Run simulation sliders (e.g., "If I bike X km/week instead of driving") to estimate annual savings and see equivalent visual impact comparisons.

5. **Contextual AI Assistant (Sage)**:
   - Floating assistant utilizing **Text-to-Speech (SpeechSynthesis API)** for reading suggestions out loud.
   - **Personalized Tips Carousel** displaying context-aware recommendations tailored to the user's dominant logging categories.
   - Interactive prompt options for tracking stats, streaks, or carbon reduction progress.
   - **Voice Logging** (Web SpeechRecognition API) allows hands-free logging of daily habits.

6. **Data Portability**:
   - Export logging history to standard CSV files directly from the dashboard.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite (for hot module replacement and performance)
- **Styling**: Pure CSS (using custom HSL tokens, CSS Grid, Flexbox, glassmorphic card stylings)
- **Animations**: Framer Motion (for staggered list transitions, active navigation highlights, and modal slides)
- **Data Visualization**: Chart.js & `react-chartjs-2` (30-day interactive history lines and donut category breakdowns)
- **Maps**: Leaflet & `react-leaflet`
- **Voice APIs**: SpeechRecognition (log voice inputs) & SpeechSynthesis (TTS aloud)
- **State Management**: React Context API & `useReducer` with local persistence.

---

## 🚀 Getting Started

### Prerequisites

Ensure you have **Node.js (v16+)** and **npm** installed.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/carbon-insight.git
   cd Carbon-insight
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

---

## 🌿 Natural Tones Palette (Light/Dark Mode)

Carbon Insight ships with a dynamic dark/light toggle centered around earthy green, soft clay, and natural light tones:
- **Light Mode Background**: `#FAF7F2` (Warm Sand)
- **Dark Mode Background**: `#1A1A2E` (Deep Forest Shadows)
- **Primary Accent**: `#4CAF50` (Leaf Green)
- **Secondary Accent**: `#00897B` (Mineral Teal)
- **Warning Accent**: `#FF8F00` (Earthy Amber)
