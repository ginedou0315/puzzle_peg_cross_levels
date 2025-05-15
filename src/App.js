import React, { useState } from "react";
import "./App.css";
import Game from "./Game";
import LevelSelector from "./components/LevelSelector"; // Import LevelSelector
import { levels } from "./levelsData"; // Import levels data

function App() {
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);

  const handleLevelSelect = (levelIndex) => {
    if (levelIndex >= 0 && levelIndex < levels.length) {
      setCurrentLevelIndex(levelIndex);
    }
  };

  return (
    <div className="app-container">
      <header>
        <h1 className="game-title">Peg Puzzle Cross - Levels Challenge</h1>
      </header>
      <main>
        <LevelSelector // Add LevelSelector component
          levels={levels}
          currentLevelIndex={currentLevelIndex}
          onSelectLevel={handleLevelSelect}
        />
        <Game
          currentLevelIndex={currentLevelIndex}
          setCurrentLevelIndex={setCurrentLevelIndex} // Pass this for next level logic
          key={currentLevelIndex} // Add key to force re-mount of Game on level change
          // This helps reset Game state cleanly
        />
        {/* Message for completing all levels is now primarily handled within Game.js */}
      </main>
      <footer>
        <p>
          <small>Game developed with React</small>
        </p>
      </footer>
    </div>
  );
}

export default App;
