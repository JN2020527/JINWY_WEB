# Getting Started Guide

Welcome to the **Jinwyuan Smart Teaching Assistant Platform** project! This guide will help you set up your development environment and understand the project structure.

## 🚀 Quick Start

Follow these steps to get the project running locally:

1. **Clone the Repository** (assuming you have the code)
2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Run Development Server**:
   ```bash
   npm run dev
   ```
4. **Access the App**: Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

Here’s a high-level overview of the folder structure:

- `src/components/`: Contains all Vue components (Header, LeftNav, Home, etc.).
- `src/mock/`: Contains `data.js` where all the static mock data is stored.
- `src/styles/`: Global CSS styles.
- `src/App.vue`: The root component managing global state and navigation.
- `src/main.js`: Entry point where Vue is initialized and Element Plus is registered.
- `public/`: Static assets like images and icons.

---

## 🛠️ Key Commands

- `npm run dev`: Starts the Vite development server.
- `npm run build`: Bundles the application for production.
- `npm run preview`: Previews the production build locally.

---

## 💡 Key Concepts for New Developers

### 1. No Backend Required
This is a frontend-only prototype. All data is managed locally in `src/mock/data.js`. You don't need to set up a database or API.

### 2. State Management
We use a simple reactive state pattern in `App.vue` using Vue 3 Composition API (`refs`). There is no Pinia or Vuex. Components communicate via props and events.

### 3. Navigation
Navigation is handled by conditional rendering (`v-if`) in `App.vue` based on the `currentLeftMenu` state. We do **not** use Vue Router.

### 4. Component Library
We use **Element Plus**. Icons are globally registered in `main.js`, so you can use them directly in templates without importing them manually.

---

## 🎨 UI & Styling
- **Primary Theme**: Purple gradient (#667eea → #764ba2).
- **Styling**: Vanilla CSS with scoped styles in `.vue` files.
- **Responsiveness**: The layout adjusts for mobile at the 768px breakpoint.

Happy Coding! 🚀
