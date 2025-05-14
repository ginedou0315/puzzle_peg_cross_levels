import React, { useState } from "react";
import "./App.css";
import Game from "./Game";
import { levels } from "./levelsData"; // To know the total number of levels

function App() {
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);

  return (
    <div className="app-container">
      <header>
        <h1 className="game-title">Peg Puzzle Cross - Levels Challenge</h1>
      </header>
      <main>
        <Game
          currentLevelIndex={currentLevelIndex}
          setCurrentLevelIndex={setCurrentLevelIndex}
        />
        {currentLevelIndex >= levels.length && (
          // This completion message is now primarily handled within Game.js
          // But you could have a global message here too or a level select button
          <p style={{ marginTop: "20px", fontWeight: "bold" }}>
            You've reached the end of the available levels!
          </p>
        )}
      </main>
      <footer>
        <p>
          <small>Game developed by Ginelle Doubek with React</small>
        </p>
      </footer>
    </div>
  );
}

export default App;
