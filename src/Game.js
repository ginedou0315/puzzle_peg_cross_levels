// src/Game.js
import React, { useState, useEffect, useCallback } from "react";
import { levels as allLevels } from "./levelsData";
import Board from "./components/Board";
import GameInfo from "./components/GameInfo";
import GameControls from "./components/GameControls";

const LEVEL_ATTEMPT_FREE_HAMMERS = 3; // Free hammers per level attempt

function Game({
  currentLevelIndex,
  setCurrentLevelIndex,
  globalFreeUndosRemaining,
  onConsumeGlobalUndo,
  onPurchaseGlobalUndos,
  purchasedHammersAvailable, // Prop from App.js (purchased/bonus hammers)
  onConsumePurchasedHammer, // Prop function from App.js
  onPurchaseHammers, // Prop function from App.js (to buy more, adds to purchased stack)
}) {
  const [currentLevelData, setCurrentLevelData] = useState(null);
  const [board, setBoard] = useState([]);
  const [selectedPeg, setSelectedPeg] = useState(null);
  const [pegsRemaining, setPegsRemaining] = useState(0);
  const [movesCount, setMovesCount] = useState(0);
  const [isGameWon, setIsGameWon] = useState(false);
  const [isGameLost, setIsGameLost] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [history, setHistory] = useState([]);
  const [showPurchaseUndoModal, setShowPurchaseUndoModal] = useState(false);
  const [levelFreeHammersRemaining, setLevelFreeHammersRemaining] = useState(
    LEVEL_ATTEMPT_FREE_HAMMERS
  ); // State for this level attempt
  const [isHammerModeActive, setIsHammerModeActive] = useState(false);
  const [showPurchaseHammerModal, setShowPurchaseHammerModal] = useState(false);

  console.log(
    `Game.js [Lvl ${currentLevelIndex}] Render. LevelFreeHammers: ${levelFreeHammersRemaining}, PurchasedHammersProp: ${purchasedHammersAvailable}, HammerMode: ${isHammerModeActive}`
  );

  const initializeLevel = useCallback((levelIdx) => {
    console.log(`Game.js: Initializing level ${levelIdx}`);
    const level = allLevels[levelIdx];
    if (!level) {
      setFeedbackMessage("Error: Level data not found!");
      setCurrentLevelData(null);
      setBoard([]);
      return;
    }
    setCurrentLevelData(level);
    const initialBoard = level.boardSetup.map((row) => [...row]);
    setBoard(initialBoard);
    let initialPegsCount = 0;
    initialBoard.forEach((row) =>
      row.forEach((cell) => {
        if (cell === 2) initialPegsCount++;
      })
    );
    setPegsRemaining(initialPegsCount);
    setMovesCount(0);
    setSelectedPeg(null);
    setIsGameWon(false);
    setIsGameLost(false);
    setFeedbackMessage(
      level.description ||
        `Level ${level.id}: Try to leave ${level.targetPegsRemaining} peg(s).`
    );
    setHistory([]);
    setShowPurchaseUndoModal(false);
    setIsHammerModeActive(false);
    setShowPurchaseHammerModal(false);
    setLevelFreeHammersRemaining(LEVEL_ATTEMPT_FREE_HAMMERS); // Reset for this level attempt
    console.log(
      `Game.js: Level free hammers reset to ${LEVEL_ATTEMPT_FREE_HAMMERS} for level ${levelIdx}`
    );
  }, []); // Removed setters from deps, let React handle it based on initializeLevel identity

  useEffect(() => {
    console.log(
      `Game.js: useEffect for currentLevelIndex ${currentLevelIndex} triggered.`
    );
    if (currentLevelIndex < allLevels.length) {
      initializeLevel(currentLevelIndex);
    } else {
      setFeedbackMessage("Congratulations! You've completed all levels!");
      setIsGameWon(true);
      setCurrentLevelData(null);
      setBoard([]);
      setHistory([]);
      setIsHammerModeActive(false);
    }
  }, [currentLevelIndex, initializeLevel]); // initializeLevel is stable due to useCallback

  const canAnyPegMove = useCallback(() => {
    /* ... (no changes needed here) ... */
    if (!board || board.length === 0) return false;
    for (let r = 0; r < board.length; r++) {
      for (let c = 0; c < board[r].length; c++) {
        if (board[r][c] === 2) {
          const directions = [
            [-2, 0],
            [2, 0],
            [0, -2],
            [0, 2],
          ];
          for (const [dr, dc] of directions) {
            const nr = r + dr;
            const nc = c + dc;
            const jr = r + dr / 2;
            const jc = c + dc / 2;
            if (
              nr >= 0 &&
              nr < board.length &&
              nc >= 0 &&
              nc < board[nr].length &&
              board[nr][nc] === 1 &&
              jr >= 0 &&
              jr < board.length &&
              jc >= 0 &&
              jc < board[jr].length &&
              board[jr][jc] === 2
            ) {
              return true;
            }
          }
        }
      }
    }
    return false;
  }, [board]);

  useEffect(() => {
    /* ... (win/loss logic - no changes needed here) ... */
    if (!currentLevelData || board.length === 0 || isGameWon || isGameLost)
      return;
    if (pegsRemaining === currentLevelData.targetPegsRemaining) {
      if (!canAnyPegMove()) {
        setIsGameWon(true);
        setFeedbackMessage(`Level ${currentLevelData.id} Complete!`);
      }
    } else if (pegsRemaining < currentLevelData.targetPegsRemaining) {
      if (!canAnyPegMove()) {
        setIsGameLost(true);
        setFeedbackMessage("Too few pegs left.");
      }
    } else if (
      !canAnyPegMove() &&
      pegsRemaining > currentLevelData.targetPegsRemaining
    ) {
      setIsGameLost(true);
      setFeedbackMessage("No more moves.");
    }
  }, [
    pegsRemaining,
    currentLevelData,
    board,
    canAnyPegMove,
    isGameWon,
    isGameLost,
  ]);

  const handleCellClick = (row, col) => {
    console.log(
      `Game.js: Cell click [${row},${col}]. Hammer mode: ${isHammerModeActive}. Board val: ${board[row]?.[col]}`
    );
    if (isGameWon || isGameLost || !board[row] || board[row][col] === 0) return;

    if (isHammerModeActive) {
      if (board[row][col] === 2) {
        // Clicked on a peg
        console.log("Game.js: Hammer targeting peg.");
        let hammerConsumedThisTurn = false;
        let hammerSource = "";

        if (levelFreeHammersRemaining > 0) {
          setLevelFreeHammersRemaining((prev) => prev - 1);
          hammerConsumedThisTurn = true;
          hammerSource = "level free";
          console.log(
            "Game.js: Consumed a level free hammer. Remaining for level:",
            levelFreeHammersRemaining - 1
          );
        } else if (purchasedHammersAvailable > 0) {
          if (onConsumePurchasedHammer()) {
            // Call App.js to consume a purchased one
            hammerConsumedThisTurn = true;
            hammerSource = "purchased";
            console.log("Game.js: Consumed a purchased hammer via App.js.");
          } else {
            console.error(
              "Game.js: onConsumePurchasedHammer from App.js returned false unexpectedly."
            );
          }
        } else {
          console.log("Game.js: No hammers (level or purchased) to use.");
          setFeedbackMessage("No hammers left. Try buying some!");
          setIsHammerModeActive(false);
          setShowPurchaseHammerModal(true);
          return;
        }

        if (hammerConsumedThisTurn) {
          // Save state BEFORE modification for undo
          setHistory((prevHistory) => [
            ...prevHistory,
            {
              board: board.map((r) => [...r]),
              pegsRemaining,
              movesCount,
              levelFreeHammers:
                levelFreeHammersRemaining -
                (hammerSource === "level free" ? 1 : 0),
            }, // Capture state before this hammer use
          ]);
          const newBoard = board.map((r) => [...r]);
          newBoard[row][col] = 1; // Remove peg
          setBoard(newBoard);
          setPegsRemaining((prev) => prev - 1);
          setIsHammerModeActive(false); // Deactivate after use
          setFeedbackMessage(`Peg hammered using a ${hammerSource} hammer!`);
          setSelectedPeg(null);
          setIsGameWon(false);
          setIsGameLost(false); // Re-evaluate win/loss
        }
      } else {
        setFeedbackMessage("Select a peg to hammer.");
      }
      return; // Exit after hammer logic
    }

    // Regular Jump Logic
    const cellValue = board[row][col];
    if (cellValue === 2) {
      setSelectedPeg({ row, col });
      setFeedbackMessage("Peg selected. Click an empty hole.");
    } else if (cellValue === 1 && selectedPeg) {
      const { row: fromRow, col: fromCol } = selectedPeg;
      const toRow = row;
      const toCol = col;
      const dRow = toRow - fromRow;
      const dCol = toCol - fromCol;
      if (
        (Math.abs(dRow) === 2 && dCol === 0) ||
        (Math.abs(dCol) === 2 && dRow === 0)
      ) {
        const jumpedRow = fromRow + dRow / 2;
        const jumpedCol = fromCol + dCol / 2;
        if (board[jumpedRow]?.[jumpedCol] === 2) {
          setHistory((prevHistory) => [
            ...prevHistory,
            {
              board: board.map((r) => [...r]),
              pegsRemaining,
              movesCount,
              levelFreeHammers: levelFreeHammersRemaining,
            },
          ]);
          const newBoard = board.map((r) => [...r]);
          newBoard[fromRow][fromCol] = 1;
          newBoard[jumpedRow][jumpedCol] = 1;
          newBoard[toRow][toCol] = 2;
          setBoard(newBoard);
          setPegsRemaining((prev) => prev - 1);
          setMovesCount((prev) => prev + 1);
          setSelectedPeg(null);
          setFeedbackMessage("Nice jump!");
          setIsGameWon(false);
          setIsGameLost(false);
        } else {
          setFeedbackMessage("Invalid jump path.");
          setSelectedPeg(null);
        }
      } else {
        setFeedbackMessage("Invalid jump distance.");
        setSelectedPeg(null);
      }
    } else {
      setSelectedPeg(null);
      if (cellValue === 1) setFeedbackMessage("Select a peg first.");
    }
  };

  const toggleHammerMode = () => {
    if (isGameWon || isGameLost) return;
    const totalHammersPlayerHas =
      levelFreeHammersRemaining + purchasedHammersAvailable;
    console.log(
      `Game.js: Toggling hammer. Level free: ${levelFreeHammersRemaining}, Purchased: ${purchasedHammersAvailable}, Total: ${totalHammersPlayerHas}`
    );
    if (!isHammerModeActive && totalHammersPlayerHas === 0) {
      setShowPurchaseHammerModal(true);
      setFeedbackMessage("No hammers left! Get more?");
      return;
    }
    const newModeState = !isHammerModeActive;
    setIsHammerModeActive(newModeState);
    setSelectedPeg(null);
    setFeedbackMessage(
      newModeState
        ? `Hammer mode on! Click a peg. (Free: ${levelFreeHammersRemaining}, Purchased: ${purchasedHammersAvailable})`
        : "Hammer mode off."
    );
  };

  const handleResetLevel = () => {
    console.log("Game.js: Reset Level button clicked.");
    initializeLevel(currentLevelIndex);
  };

  const handleNextLevel = () => {
    if (currentLevelIndex < allLevels.length - 1) {
      setCurrentLevelIndex((prev) => prev + 1);
    } else {
      setFeedbackMessage("Congratulations! You've completed all levels!");
    }
  };

  const handleUndoMove = () => {
    if (isHammerModeActive) setIsHammerModeActive(false);
    if (history.length === 0) {
      setFeedbackMessage("No moves to undo.");
      return;
    }
    if (globalFreeUndosRemaining > 0) {
      const consumedUndo = onConsumeGlobalUndo();
      if (consumedUndo) {
        const lastState = history[history.length - 1];
        setBoard(lastState.board.map((r) => [...r]));
        setPegsRemaining(lastState.pegsRemaining);
        setMovesCount(lastState.movesCount);
        // Restore level-specific free hammers if the history item has it
        if (lastState.levelFreeHammers !== undefined) {
          setLevelFreeHammersRemaining(lastState.levelFreeHammers);
          console.log(
            "Game.js: Undid move, restored levelFreeHammers to",
            lastState.levelFreeHammers
          );
        }
        setHistory((prevHistory) => prevHistory.slice(0, -1));
        setSelectedPeg(null);
        setIsGameWon(false);
        setIsGameLost(false);
        setFeedbackMessage("Last move undone.");
      }
    } else {
      setShowPurchaseUndoModal(true);
      setFeedbackMessage("Out of global free undos!");
    }
  };

  if (!currentLevelData && currentLevelIndex >= allLevels.length) {
    /* ... (All levels complete UI) ... */
    return (
      <div className="all-levels-complete">
        <h1>Amazing!</h1>
        <p>{feedbackMessage || "All levels complete!"}</p>
        <button onClick={() => setCurrentLevelIndex(0)}>Play Again</button>
      </div>
    );
  }
  if (!currentLevelData) {
    /* ... (Loading UI) ... */
    return <p className="feedback-message info">Loading level...</p>;
  }

  const getFeedbackClass = () =>
    isGameWon ? "success" : isGameLost ? "error" : "info";
  const totalAvailableHammers =
    levelFreeHammersRemaining + purchasedHammersAvailable;
  const hammerButtonText = `Hammer (${totalAvailableHammers})`;
  const undoButtonText =
    globalFreeUndosRemaining > 0
      ? `Undo (${globalFreeUndosRemaining})`
      : history.length > 0
      ? "Get Undos"
      : "Undo";

  return (
    <div
      className={`game-area ${isHammerModeActive ? "hammer-mode-active" : ""}`}
    >
      <GameInfo
        levelName={`Level ${currentLevelData.id}: ${currentLevelData.name}`}
        levelDescription={currentLevelData.description}
        pegsRemaining={pegsRemaining}
        movesCount={movesCount}
        // You can add levelFreeHammersRemaining here if you want to show it in GameInfo
        // levelFreeHammersCount={levelFreeHammersRemaining}
      />
      <div className="powerup-controls">
        <button
          onClick={toggleHammerMode}
          className={`hammer-button ${isHammerModeActive ? "active" : ""}`}
          disabled={
            isGameWon ||
            isGameLost ||
            (totalAvailableHammers === 0 && !isHammerModeActive)
          }
          title={
            totalAvailableHammers > 0
              ? "Activate Hammer Mode"
              : "Get More Hammers"
          }
        >
          {hammerButtonText}
        </button>
      </div>
      <Board
        boardState={board}
        selectedPeg={selectedPeg}
        onCellClick={handleCellClick}
        isHammerModeActive={isHammerModeActive}
      />
      <GameControls
        onReset={handleResetLevel}
        onUndo={handleUndoMove}
        canUndo={history.length > 0 && !isGameWon && !isGameLost}
        undoButtonText={undoButtonText}
        onNextLevel={handleNextLevel}
        canGoNext={isGameWon}
        isGameWon={isGameWon}
        allLevelsCompleted={
          currentLevelIndex >= allLevels.length - 1 && isGameWon
        }
      />
      {feedbackMessage && (
        <p className={`feedback-message ${getFeedbackClass()}`}>
          {feedbackMessage}
        </p>
      )}
      {showPurchaseUndoModal && (
        <div className="modal-overlay">
          {" "}
          <div className="modal-content">
            <h3>Need Undos?</h3>
            <p>Out of global free undos.</p>
            <div className="modal-actions">
              <button
                onClick={() => {
                  onPurchaseGlobalUndos();
                  setShowPurchaseUndoModal(false);
                }}
                className="button-primary"
              >
                "Buy" Undos
              </button>
              <button onClick={() => setShowPurchaseUndoModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {showPurchaseHammerModal && (
        <div className="modal-overlay">
          {" "}
          <div className="modal-content">
            <h3>Need Hammers?</h3>
            <p>Out of hammers!</p>
            <div className="modal-actions">
              <button
                onClick={() => {
                  onPurchaseHammers(3);
                  setShowPurchaseHammerModal(false);
                }}
                className="button-primary"
              >
                "Buy" 3 Hammers
              </button>
              <button onClick={() => setShowPurchaseHammerModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Game;
