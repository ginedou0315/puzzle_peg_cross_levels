// src/App.js
import React, { useState, useEffect } from "react";
import "./App.css";
import Game from "./Game";
import LevelSelector from "./components/LevelSelector";
import { levels } from "./levelsData";

const TOTAL_GLOBAL_FREE_UNDOS = 3; // Global free undos for the entire game session
const INITIAL_PURCHASED_HAMMERS = 0; // Purchased/bonus hammers start at 0
const LOCAL_STORAGE_PREFIX = "pegPuzzleCross_";

function App() {
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [globalFreeUndosRemaining, setGlobalFreeUndosRemaining] = useState(
    TOTAL_GLOBAL_FREE_UNDOS
  );
  const [purchasedHammers, setPurchasedHammers] = useState(
    INITIAL_PURCHASED_HAMMERS
  ); // Renamed for clarity
  const [isGameLoaded, setIsGameLoaded] = useState(false);

  // Load game state from localStorage
  useEffect(() => {
    console.log("App.js: Loading saved game state...");
    const savedLevelIndex = localStorage.getItem(
      `${LOCAL_STORAGE_PREFIX}currentLevelIndex`
    );
    const savedUndos = localStorage.getItem(
      `${LOCAL_STORAGE_PREFIX}globalFreeUndosRemaining`
    );
    const savedPurchasedHammers = localStorage.getItem(
      `${LOCAL_STORAGE_PREFIX}purchasedHammers`
    );

    let loadedLevelIndex = 0;
    if (savedLevelIndex !== null) {
      const parsedLevelIndex = parseInt(savedLevelIndex, 10);
      if (parsedLevelIndex >= 0 && parsedLevelIndex < levels.length) {
        loadedLevelIndex = parsedLevelIndex;
      } else {
        localStorage.removeItem(`${LOCAL_STORAGE_PREFIX}currentLevelIndex`);
      }
    }
    setCurrentLevelIndex(loadedLevelIndex);

    if (savedUndos !== null) {
      setGlobalFreeUndosRemaining(parseInt(savedUndos, 10));
    } else {
      setGlobalFreeUndosRemaining(TOTAL_GLOBAL_FREE_UNDOS);
    }

    if (savedPurchasedHammers !== null) {
      setPurchasedHammers(parseInt(savedPurchasedHammers, 10));
    } else {
      setPurchasedHammers(INITIAL_PURCHASED_HAMMERS);
    }
    setIsGameLoaded(true);
    console.log("App.js: Game state loading complete.");
  }, []);

  // Save game state to localStorage
  useEffect(() => {
    if (isGameLoaded) {
      console.log("App.js: Saving game state...");
      localStorage.setItem(
        `${LOCAL_STORAGE_PREFIX}currentLevelIndex`,
        currentLevelIndex.toString()
      );
      localStorage.setItem(
        `${LOCAL_STORAGE_PREFIX}globalFreeUndosRemaining`,
        globalFreeUndosRemaining.toString()
      );
      localStorage.setItem(
        `${LOCAL_STORAGE_PREFIX}purchasedHammers`,
        purchasedHammers.toString()
      );
    }
  }, [
    currentLevelIndex,
    globalFreeUndosRemaining,
    purchasedHammers,
    isGameLoaded,
  ]);

  const handleLevelSelect = (levelIndex) => {
    if (levelIndex >= 0 && levelIndex < levels.length) {
      setCurrentLevelIndex(levelIndex);
    }
  };

  const handleConsumeGlobalUndo = () => {
    if (globalFreeUndosRemaining > 0) {
      setGlobalFreeUndosRemaining((prev) => prev - 1);
      return true;
    }
    return false;
  };

  const handlePurchaseGlobalUndos = (quantity = 3) => {
    setGlobalFreeUndosRemaining((prev) => prev + quantity);
    alert(`Mock purchase: ${quantity} undo(s) added!`);
  };

  // Consumes from the 'purchasedHammers' stack
  const handleConsumePurchasedHammer = () => {
    console.log(
      "App.js: Attempting to consume a PURCHASED hammer. Available:",
      purchasedHammers
    );
    if (purchasedHammers > 0) {
      setPurchasedHammers((prev) => prev - 1);
      console.log(
        "App.js: Purchased hammer consumed. New total:",
        purchasedHammers - 1
      );
      return true;
    }
    console.log("App.js: No purchased hammers to consume.");
    return false;
  };

  // Adds to the 'purchasedHammers' stack
  const handlePurchaseHammers = (quantity = 3) => {
    setPurchasedHammers((prev) => prev + quantity);
    alert(`Mock purchase: ${quantity} hammer(s) added to your inventory!`);
  };

  const resetAllGameData = () => {
    if (
      window.confirm(
        "Are you sure you want to reset all game data? This will clear your current level progress, undos, and purchased hammers."
      )
    ) {
      setCurrentLevelIndex(0);
      setGlobalFreeUndosRemaining(TOTAL_GLOBAL_FREE_UNDOS);
      setPurchasedHammers(INITIAL_PURCHASED_HAMMERS); // Reset purchased hammers
      alert("All game data has been reset!");
    }
  };

  if (!isGameLoaded) {
    return (
      <div
        className="app-container"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <p style={{ fontSize: "1.5em", color: "#333" }}>
          Loading Peg Puzzle Challenge...
        </p>
      </div>
    );
  }

  return (
    <div className="app-container">
      <header>
        <h1 className="game-title">Peg Puzzle Cross - Levels Challenge</h1>
        <button
          onClick={resetAllGameData}
          title="Reset all game progress, including current level, undos, and purchased hammers."
          style={{
            backgroundColor: "#d32f2f",
            color: "white",
            border: "none",
            padding: "8px 15px",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "0.9em",
            margin: "0 auto 15px auto",
            display: "block",
          }}
        >
          Reset All Game Data
        </button>
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
          key={currentLevelIndex} // CRITICAL: Only remount Game when level changes
          globalFreeUndosRemaining={globalFreeUndosRemaining}
          onConsumeGlobalUndo={handleConsumeGlobalUndo}
          onPurchaseGlobalUndos={handlePurchaseGlobalUndos}
          purchasedHammersAvailable={purchasedHammers}
          onConsumePurchasedHammer={handleConsumePurchasedHammer}
          onPurchaseHammers={handlePurchaseHammers}
        />
      </main>
      <footer>
        <p>
          Global Free Undos: {globalFreeUndosRemaining} | Purchased Hammers:{" "}
          {purchasedHammers}
        </p>
        <p>
          <small>Enjoy the Peg Puzzle Challenge!</small>
        </p>
      </footer>
    </div>
  );
}

export default App;
