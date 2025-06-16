// src/App.js
import React, { useState, useEffect } from "react";
import "./App.css";
import Game from "./Game";
import LevelSelector from "./components/LevelSelector";
import { levels } from "./levelsData";

const TOTAL_GLOBAL_FREE_UNDOS = 3;
const TOTAL_GLOBAL_FREE_HAMMERS = 3;

function App() {
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [globalFreeUndosRemaining, setGlobalFreeUndosRemaining] = useState(
    TOTAL_GLOBAL_FREE_UNDOS
  );
  const [globalHammersRemaining, setGlobalHammersRemaining] = useState(
    TOTAL_GLOBAL_FREE_HAMMERS
  );
  const [isGameLoaded, setIsGameLoaded] = useState(false); // To prevent flicker on initial load

  // Load game state from localStorage when the App mounts
  useEffect(() => {
    const savedLevelIndex = localStorage.getItem("pegPuzzle_currentLevelIndex");
    const savedUndos = localStorage.getItem(
      "pegPuzzle_globalFreeUndosRemaining"
    );
    const savedHammers = localStorage.getItem(
      "pegPuzzle_globalHammersRemaining"
    );

    if (savedLevelIndex !== null) {
      const parsedLevelIndex = parseInt(savedLevelIndex, 10);
      // Ensure loaded level index is within bounds of available levels
      if (parsedLevelIndex >= 0 && parsedLevelIndex < levels.length) {
        setCurrentLevelIndex(parsedLevelIndex);
      } else {
        setCurrentLevelIndex(0); // Default to first level if out of bounds
        localStorage.removeItem("pegPuzzle_currentLevelIndex"); // Clear invalid stored index
      }
    }
    if (savedUndos !== null) {
      setGlobalFreeUndosRemaining(parseInt(savedUndos, 10));
    }
    if (savedHammers !== null) {
      setGlobalHammersRemaining(parseInt(savedHammers, 10));
    }
    setIsGameLoaded(true); // Indicate that loading is complete
  }, []); // Empty dependency array means this runs once on mount

  // Save game state to localStorage whenever relevant state changes
  useEffect(() => {
    if (isGameLoaded) {
      // Only save after initial load is complete
      localStorage.setItem(
        "pegPuzzle_currentLevelIndex",
        currentLevelIndex.toString()
      );
      localStorage.setItem(
        "pegPuzzle_globalFreeUndosRemaining",
        globalFreeUndosRemaining.toString()
      );
      localStorage.setItem(
        "pegPuzzle_globalHammersRemaining",
        globalHammersRemaining.toString()
      );
    }
  }, [
    currentLevelIndex,
    globalFreeUndosRemaining,
    globalHammersRemaining,
    isGameLoaded,
  ]);

  const handleLevelSelect = (levelIndex) => {
    if (levelIndex >= 0 && levelIndex < levels.length) {
      setCurrentLevelIndex(levelIndex);
      // The `key` prop on Game component will handle re-mounting and re-initializing Game state
    }
  };

  const handleConsumeGlobalUndo = () => {
    if (globalFreeUndosRemaining > 0) {
      setGlobalFreeUndosRemaining((prev) => prev - 1);
      return true; // Undo was successfully consumed
    }
    return false; // No free undos left to consume
  };

  const handlePurchaseGlobalUndos = (quantity = 3) => {
    setGlobalFreeUndosRemaining((prev) => prev + quantity);
    alert(`Mock purchase: ${quantity} undo(s) added!`); // Simple feedback for now
  };

  const handleConsumeHammer = () => {
    if (globalHammersRemaining > 0) {
      setGlobalHammersRemaining((prev) => prev - 1);
      return true; // Hammer was successfully consumed
    }
    return false; // No hammers left to consume
  };

  const handlePurchaseHammers = (quantity = 3) => {
    setGlobalHammersRemaining((prev) => prev + quantity);
    alert(`Mock purchase: ${quantity} hammer(s) added!`); // Simple feedback for now
  };

  if (!isGameLoaded) {
    return (
      <div className="app-container">
        <p style={{ textAlign: "center", fontSize: "1.2em", padding: "50px" }}>
          Loading game...
        </p>
      </div>
    );
  }

  return (
    <div className="app-container">
      <header>
        <h1 className="game-title">Peg Puzzle Cross - Levels Challenge</h1>
      </header>
      <main>
        <LevelSelector
          levels={levels}
          currentLevelIndex={currentLevelIndex}
          onSelectLevel={handleLevelSelect}
        />
        <Game
          currentLevelIndex={currentLevelIndex}
          setCurrentLevelIndex={setCurrentLevelIndex} // To allow Game to advance levels
          key={`${currentLevelIndex}-${globalFreeUndosRemaining}-${globalHammersRemaining}`} // Force re-mount on these key changes
          globalFreeUndosRemaining={globalFreeUndosRemaining}
          onConsumeGlobalUndo={handleConsumeGlobalUndo}
          onPurchaseGlobalUndos={handlePurchaseGlobalUndos}
          globalHammersRemaining={globalHammersRemaining}
          onConsumeHammer={handleConsumeHammer}
          onPurchaseHammers={handlePurchaseHammers}
        />
      </main>
      <footer>
        <p>
          Global Free Undos: {globalFreeUndosRemaining} | Global Hammers:{" "}
          {globalHammersRemaining}
        </p>
        <p>
          <small>Game developed with React. Enjoy!</small>
        </p>
      </footer>
    </div>
  );
}

export default App;
