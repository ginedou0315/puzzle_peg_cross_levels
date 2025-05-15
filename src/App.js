// src/App.js
import React, { useState, useEffect } from "react";
import "./App.css";
import Game from "./Game";
import LevelSelector from "./components/LevelSelector";
import { levels } from "./levelsData";

const TOTAL_GLOBAL_FREE_UNDOS = 3;

function App() {
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [globalFreeUndosRemaining, setGlobalFreeUndosRemaining] = useState(
    TOTAL_GLOBAL_FREE_UNDOS
  );
  const [isGameLoaded, setIsGameLoaded] = useState(false); // To prevent flicker on initial load

  // Load game state from localStorage when the App mounts
  useEffect(() => {
    const savedLevelIndex = localStorage.getItem("pegPuzzle_currentLevelIndex");
    const savedUndos = localStorage.getItem(
      "pegPuzzle_globalFreeUndosRemaining"
    );

    if (savedLevelIndex !== null) {
      setCurrentLevelIndex(parseInt(savedLevelIndex, 10));
    }
    if (savedUndos !== null) {
      setGlobalFreeUndosRemaining(parseInt(savedUndos, 10));
    }
    setIsGameLoaded(true); // Indicate that loading is complete
  }, []);

  // Save game state to localStorage whenever currentLevelIndex or globalFreeUndosRemaining changes
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
    }
  }, [currentLevelIndex, globalFreeUndosRemaining, isGameLoaded]);

  const handleLevelSelect = (levelIndex) => {
    if (levelIndex >= 0 && levelIndex < levels.length) {
      setCurrentLevelIndex(levelIndex);
      // Optionally, reset level-specific history in Game.js if desired when manually selecting
      // (The `key` prop on Game component already handles this by remounting)
    }
  };

  const handleConsumeGlobalUndo = () => {
    if (globalFreeUndosRemaining > 0) {
      setGlobalFreeUndosRemaining((prev) => prev - 1);
      return true; // Undo was successfully consumed
    }
    return false; // No free undos left to consume
  };

  const handlePurchaseGlobalUndos = () => {
    // Mock purchase: gives a certain number of undos
    // In a real app, this would involve a payment flow
    setGlobalFreeUndosRemaining((prev) => prev + 3); // Example: "Buy" 3 more undos
    // Note: You might want to cap this or have different "packages"
    alert("Mock purchase: 3 undos added!"); // Simple feedback
  };

  if (!isGameLoaded) {
    return (
      <div className="app-container">
        <p>Loading game...</p>
      </div>
    ); // Or a proper loading spinner
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
          setCurrentLevelIndex={setCurrentLevelIndex}
          key={`${currentLevelIndex}-${globalFreeUndosRemaining}`} // Re-mount if global undos change from purchase
          // to ensure Game component re-reads the prop
          globalFreeUndosRemaining={globalFreeUndosRemaining}
          onConsumeGlobalUndo={handleConsumeGlobalUndo}
          onPurchaseGlobalUndos={handlePurchaseGlobalUndos} // Pass this down
        />
      </main>
      <footer>
        <p>Global Free Undos: {globalFreeUndosRemaining}</p>
        <p>
          <small>Game developed with React</small>
        </p>
      </footer>
    </div>
  );
}

export default App;
