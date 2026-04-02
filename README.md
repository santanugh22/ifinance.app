# 💸 Personal Finance Companion 

![App Banner](https://via.placeholder.com/1000x300/4F46E5/FFFFFF?text=Personal+Finance+Companion+-+Your+Everyday+Money+Tracker)

<div align="center">
  <img src="https://img.shields.io/badge/Expo-1B1F23?style=for-the-badge&logo=expo&logoColor=white" alt="Expo" />
  <img src="https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React Native" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Zustand-5C2D91?style=for-the-badge&logo=react&logoColor=white" alt="Zustand" />
  <img src="https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase" />
</div>

<br />

## 📖 Overview

The **Personal Finance Companion** is a highly polished, offline-first mobile application designed to help users track everyday spending, visualize habits, and build better financial routines. 

Built with an emphasis on **Product Thinking** and **Premium UI/UX**, the app goes beyond simple ledgers by introducing gamified saving goals and a dynamic "No-Spend Streak" engine, wrapped in buttery-smooth 60fps animations.

---

## ✨ Key Features & Screenshots

| 📊 Home Dashboard | 📝 Transaction Ledger |
| :---: | :---: |
| <img src="https://via.placeholder.com/250x500/F8FAFC/0F172A?text=Home+Screen" width="250" /> | <img src="https://via.placeholder.com/250x500/F8FAFC/0F172A?text=Ledger+Screen" width="250" /> |
| **Real-time Overview:** Dynamic summary cards with income/expense calculations and quick-action buttons. | **Swipe-to-Delete:** Sectioned list grouped by date with Reanimated swipe-to-delete gestures. |

| 📈 Visual Insights | 🎯 Gamified Goals (The Challenge) |
| :---: | :---: |
| <img src="https://via.placeholder.com/250x500/F8FAFC/0F172A?text=Insights+Screen" width="250" /> | <img src="https://via.placeholder.com/250x500/F8FAFC/0F172A?text=Goals+Screen" width="250" /> |
| **Data Visualization:** High-performance Donut & Bar charts to understand spending by category and time. | **No-Spend Streaks:** Automatic tracking of consecutive days without spending to build saving habits. |

---

## 🏗️ Architecture & Tech Stack

We chose a modern, scalable enterprise stack to ensure type safety, high performance, and rapid feature iteration.

* **Framework:** Expo & React Native (using `expo-router` for file-based navigation & deep linking).
* **Language:** 100% Strict TypeScript.
* **State Management:** `zustand` + `AsyncStorage` (Implemented offline-first. The UI reacts instantly, allowing the app to be fully functional without an internet connection).
* **Authentication & Backend:** `@react-native-firebase/auth` + Expo Local Auth (Biometrics).
* **Animations:** `react-native-reanimated` & `react-native-gesture-handler` (Running on the UI thread for zero dropped frames).
* **Charts:** `react-native-gifted-charts` for native, SVG-based data visualization.

---

## 🧠 Addressing Evaluation Criteria

1.  **Product Thinking:** Rather than a generic database wrapper, the app introduces a **"No-Spend Streak"** widget. It intelligently parses historical data to reward users for days they don't log an expense, turning financial tracking into an engaging daily challenge.
2.  **Mobile UI/UX Quality:**
    * Implemented native bottom-sheet styled modals for data entry to keep context.
    * Utilized Haptic feedback (via Reanimated triggers) and fluid entry/exit layout animations.
    * Friendly, illustrated empty states for onboarding.
3.  **State and Data Handling:**
    Data is managed via a centralized Zustand store wrapped in persistence middleware. This guarantees immediate screen renders on startup and creates an "Offline-First" experience.
4.  **Code Structure:**
    Separation of concerns strictly enforced. Components are modular (`components/ui`, `components/charts`, `components/forms`), keeping the screen components (`app/(tabs)`) clean and focused strictly on orchestration.

---

## 📂 Project Structure

```text
├── app/                  # Expo Router directory (Screens & Layouts)
│   ├── (auth)/           # Authentication flows (Login/Biometrics)
│   ├── (tabs)/           # Main bottom-tab navigation (Home, Ledger, Insights, Goals)
│   └── modal/            # Full-screen / Bottom-sheet native modals
├── components/           # Reusable UI components
│   ├── charts/           # Visualization components
│   ├── features/         # Domain-specific components (Streak widget, Goal cards)
│   ├── forms/            # Form logic & validation
│   └── ui/               # Generic buttons, cards, empty states
├── constants/            # Theming (Colors, Typography) & Static Data (Categories)
├── hooks/                # Custom hooks (useBiometrics, useNotifications)
├── store/                # Zustand global state management
├── types/                # Strict TypeScript interfaces
└── utils/                # Helper functions (Date formatting, grouping)