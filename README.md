# MPL S4 Cricket Tournament – Player Auction Card Display System

A professional, high-performance local web application built with **React**, **Vite**, and **Tailwind CSS** designed specifically for live cricket tournament player auctions.

---

## 📌 Project Overview

During live player auctions, speed and precision are paramount. This system allows the auctioneer to manually enter player numbers to instantly display the exact high-resolution player card image from the currently active category.

> ⚠️ **STRICT RULE: NO RANDOM SELECTION**
> This application **NEVER** generates random numbers, suggests random players, or automatically selects players. The auctioneer maintains 100% manual control over player card display.

---

## ✨ Features

- **Automatic File-based Detection**: Player numbers are extracted directly from image filenames (e.g., `75.png` -> Player #75). No manual database entry required.
- **Strict Active Category Search**: Scopes search exclusively to the active category folder (`photos/Bowler/`, `photos/Batsman/`, `photos/All-Rounder/`, `photos/Wk-Batsman/`).
- **Duplicate Prevention**: Prevents showing the same player card twice within an auction session.
- **Sequential Category Progression**:
  1. ⚾ **BOWLERS**
  2. 🧤 **WICKET KEEPERS**
  3. 🏏 **BATSMEN**
  4. ⚡ **ALL-ROUNDERS**
- **Live Counter**: Tracks real-time progress (`X / TOTAL PLAYERS SHOWN`) based only on successfully revealed unique player cards.
- **Category Completion Gates**: Automatically detects when all valid cards in a category have been shown, prompting the auctioneer to move to the next category.
- **TV / Projector Fullscreen Mode**: Native browser Fullscreen API integration for large display screens.
- **Aspect Ratio Protection**: Uses `object-fit: contain` to preserve exact original card styling without cropping or stretching.
- **Keyboard Shortcuts**: Pressing `ENTER` in the player number input field instantly reveals the card.
- **Reset & Restart Control**: Secured reset modal to restart the auction safely.

---

## 🛠️ Technology Stack

- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS & Lucide Icons
- **Effects**: Canvas Confetti (Final Celebration)
- **Language**: JavaScript (ES Modules)

---

## 📁 Folder Structure

```text
MPL-S4-Auction/
│
├── photos/
│   ├── Bowler/          # Bowler card image files (e.g. 75.png, 107.png)
│   ├── Batsman/         # Batsman card image files (e.g. 14.png, 100.png)
│   ├── All-Rounder/     # All-Rounder card image files (e.g. 1.png, 42.png)
│   └── Wk-Batsman/      # Keeper card image files (e.g. 2.png, 106.png)
│
├── src/
│   ├── components/
│   │   ├── HomeScreen.jsx        # Landing screen with tournament branding
│   │   ├── AuctionHeader.jsx     # Header with category badge & fullscreen
│   │   ├── CategoryProgress.jsx  # Stepper bar & progress counter
│   │   ├── PlayerInput.jsx       # Numeric input & submit button
│   │   ├── PlayerCard.jsx        # Original player card viewer
│   │   ├── CategoryComplete.jsx  # Category transition overlay
│   │   └── FinalScreen.jsx       # Auction completion screen
│   │
│   ├── hooks/
│   │   └── useAuction.js         # Central auction state manager
│   │
│   ├── utils/
│   │   └── playerUtils.js        # File scanning & player lookup helpers
│   │
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
│
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

---

## 🚀 How to Install and Run

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+ recommended)

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:3000`.

### 3. Production Build
```bash
npm run build
```

### 4. Preview Production Build
```bash
npm run preview
```

---

## 🖼️ How to Add or Manage Player Cards

1. Simply place player card images into the corresponding category folder in `photos/`:
   - `photos/Bowler/`
   - `photos/Batsman/`
   - `photos/All-Rounder/`
   - `photos/Wk-Batsman/` (or `photos/Keeper/`)
2. Supported extensions: `.png`, `.jpg`, `.jpeg`, `.webp`.
3. **Filename = Player Number**:
   - `75.png` -> Player #75
   - `007.jpg` -> Player #007
4. **Folder = Category**: The folder name determines the category.
5. The application will automatically detect all new files on reload without modifying any code.
