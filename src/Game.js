import React, { useState, useEffect, useCallback } from "react";
import { levels as allLevels } from "./levelsData";
import Board from "./components/Board";
import GameInfo from "./components/GameInfo";
import GameControls from "./components/GameControls";
// import hammerIcon from "./assets/hammer.png";

function Game({
  currentLevelIndex,
  setCurrentLevelIndex,
  globalFreeUndosRemaining,
  onConsumeGlobalUndo,
  onPurchaseGlobalUndos,
  globalHammersRemaining, // Prop from App.js
  onConsumeHammer, // Prop from App.js
  onPurchaseHammers, // Prop from App.js
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
  const [isHammerModeActive, setIsHammerModeActive] = useState(false); // Hammer mode state
  const [showPurchaseHammerModal, setShowPurchaseHammerModal] = useState(false); // Hammer purchase modal
  // const [hammerAnimation, setHammerAnimation] = useState({ active: false, targetRow: -1, targetCol: -1 }); // For advanced animation

  const initializeLevel = useCallback((levelIndex) => {
    const level = allLevels[levelIndex];
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
    setIsHammerModeActive(false); // Reset hammer mode
    setShowPurchaseHammerModal(false); // Reset hammer purchase modal
    // setHammerAnimation({ active: false, targetRow: -1, targetCol: -1 });
  }, []);

  useEffect(() => {
    if (currentLevelIndex < allLevels.length) {
      initializeLevel(currentLevelIndex);
    } else {
      setFeedbackMessage("Congratulations! You've completed all levels!");
      setIsGameWon(true);
      setCurrentLevelData(null);
      setBoard([]);
      setHistory([]);
      setIsHammerModeActive(false); // Also reset here
    }
  }, [currentLevelIndex, initializeLevel]);

  const canAnyPegMove = useCallback(() => {
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
    if (!currentLevelData || board.length === 0 || isGameWon || isGameLost)
      return;
    // Removed hammerAnimation.active from condition as basic version doesn't use it for win/loss check

    if (pegsRemaining === currentLevelData.targetPegsRemaining) {
      if (!canAnyPegMove()) {
        setIsGameWon(true);
        setFeedbackMessage(`Level ${currentLevelData.id} Complete! Well done!`);
      }
    } else if (pegsRemaining < currentLevelData.targetPegsRemaining) {
      if (!canAnyPegMove()) {
        setIsGameLost(true);
        setFeedbackMessage("Oh no! Too few pegs left and no more moves.");
      }
    } else if (
      !canAnyPegMove() &&
      pegsRemaining > currentLevelData.targetPegsRemaining
    ) {
      setIsGameLost(true);
      setFeedbackMessage(
        "No more moves available. Try resetting the level or undo."
      );
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
    if (isGameWon || isGameLost || !board[row] || board[row][col] === 0) return;

    if (isHammerModeActive) {
      if (board[row][col] === 2) {
        // Clicked on a peg with hammer active
        // Placeholder for starting hammer animation:
        // setHammerAnimation({ active: true, targetRow: row, targetCol: col });
        // For now, directly remove the peg:

        // Save current state to history BEFORE making the move
        setHistory((prevHistory) => [
          ...prevHistory,
          { board: board.map((r) => [...r]), pegsRemaining, movesCount },
        ]);

        const newBoard = board.map((r) => [...r]);
        newBoard[row][col] = 1; // Remove the peg
        setBoard(newBoard);
        setPegsRemaining((prev) => prev - 1);
        // Not counting hammer as a "move" in movesCount for now

        onConsumeHammer(); // Consume a hammer from App.js
        setIsHammerModeActive(false); // Exit hammer mode after use
        setFeedbackMessage(
          `Peg hammered! Hammers remaining: ${globalHammersRemaining - 1}`
        );
        setSelectedPeg(null);
        setIsGameWon(false); // Re-evaluate win/loss
        setIsGameLost(false);
      } else {
        setFeedbackMessage("Select a peg to hammer.");
      }
      return; // Exit after hammer logic
    }

    // Regular Peg Selection & Jump Logic
    const cellValue = board[row][col];
    if (cellValue === 2) {
      setSelectedPeg({ row, col });
      setFeedbackMessage("Peg selected. Click an empty hole to jump.");
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
        if (board[jumpedRow] && board[jumpedRow][jumpedCol] === 2) {
          setHistory((prevHistory) => [
            ...prevHistory,
            { board: board.map((r) => [...r]), pegsRemaining, movesCount },
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
          setFeedbackMessage(
            "Invalid jump: No peg to jump over, or invalid path."
          );
          setSelectedPeg(null);
        }
      } else {
        setFeedbackMessage(
          "Invalid jump: Must jump over one peg to an empty hole two spaces away."
        );
        setSelectedPeg(null);
      }
    } else {
      setSelectedPeg(null);
      if (cellValue === 1)
        setFeedbackMessage("Select a peg first to make a jump.");
    }
  };

  const toggleHammerMode = () => {
    if (isGameWon || isGameLost) return;
    if (globalHammersRemaining > 0) {
      const newHammerModeState = !isHammerModeActive;
      setIsHammerModeActive(newHammerModeState);
      setSelectedPeg(null);
      setFeedbackMessage(
        newHammerModeState
          ? `Hammer mode activated! Select a peg to remove. Hammers: ${globalHammersRemaining}`
          : "Hammer mode deactivated."
      );
    } else {
      setShowPurchaseHammerModal(true);
      setFeedbackMessage("No hammers left! Get more?");
    }
  };

  const handleResetLevel = () => {
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
    if (isHammerModeActive) setIsHammerModeActive(false); // Deactivate hammer mode if undoing
    if (history.length === 0) {
      setFeedbackMessage("No moves to undo.");
      return;
    }
    if (globalFreeUndosRemaining > 0) {
      const consumed = onConsumeGlobalUndo();
      if (consumed) {
        const lastState = history[history.length - 1];
        setBoard(lastState.board.map((r) => [...r]));
        setPegsRemaining(lastState.pegsRemaining);
        setMovesCount(lastState.movesCount);
        setHistory((prevHistory) => prevHistory.slice(0, -1));
        setSelectedPeg(null);
        setIsGameWon(false);
        setIsGameLost(false);
        setFeedbackMessage(
          `Last move undone. Global free undos remaining: ${
            globalFreeUndosRemaining - 1
          }`
        );
      }
    } else {
      setShowPurchaseUndoModal(true);
      setFeedbackMessage("Out of global free undos!");
    }
  };

  if (!currentLevelData && currentLevelIndex >= allLevels.length) {
    return (
      <div className="all-levels-complete">
        <h1>Amazing!</h1>
        <p className="feedback-message success">
          {feedbackMessage || "Congratulations! You've completed all levels!"}
        </p>
        <p>You have mastered the Peg Puzzle Cross!</p>
        <button onClick={() => setCurrentLevelIndex(0)}>
          Play Again From Level 1
        </button>
      </div>
    );
  }
  if (!currentLevelData) {
    return (
      <p className="feedback-message info">
        Loading level or level not found...
      </p>
    );
  }

  const getFeedbackClass = () => {
    if (isGameWon) return "success";
    if (isGameLost) return "error";
    if (selectedPeg || isHammerModeActive) return "info"; // Hammer mode can also show info
    return "info";
  };

  const canUndo = history.length > 0 && !isGameWon && !isGameLost;
  const undoButtonText =
    globalFreeUndosRemaining > 0
      ? `Undo (${globalFreeUndosRemaining})`
      : history.length > 0
      ? "Get Undos"
      : "Undo";
  const hammerButtonText = `Hammer (${globalHammersRemaining})`;

  return (
    <div
      className={`game-area ${isHammerModeActive ? "hammer-mode-active" : ""}`}
    >
      <GameInfo
        levelName={`Level ${currentLevelData.id}: ${currentLevelData.name}`}
        levelDescription={currentLevelData.description}
        pegsRemaining={pegsRemaining}
        movesCount={movesCount}
      />

      <div className="powerup-controls">
        <button
          onClick={toggleHammerMode}
          className={`hammer-button ${isHammerModeActive ? "active" : ""}`}
          disabled={
            isGameWon ||
            isGameLost ||
            (globalHammersRemaining === 0 && !isHammerModeActive)
          }
          title={
            globalHammersRemaining > 0
              ? "Activate Hammer Mode"
              : "Get More Hammers"
          }
        >
          {/* <img src={hammerIcon} alt="" style={{width: '20px', marginRight: '5px'}} /> */}
          {hammerButtonText}
        </button>
      </div>

      <Board
        boardState={board}
        selectedPeg={selectedPeg}
        onCellClick={handleCellClick}
        isHammerModeActive={isHammerModeActive} // Pass for potential cell styling
      />
      <GameControls
        onReset={handleResetLevel}
        onUndo={handleUndoMove}
        canUndo={canUndo}
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

      {/* Undo Purchase Modal */}
      {showPurchaseUndoModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Need More Undos?</h3>
            <p>You've used all your global free undos.</p>
            <div className="modal-actions">
              <button
                onClick={() => {
                  onPurchaseGlobalUndos();
                  setShowPurchaseUndoModal(false);
                }}
                className="button-primary"
              >
                "Buy" More Undos
              </button>
              <button onClick={() => setShowPurchaseUndoModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hammer Purchase Modal */}
      {showPurchaseHammerModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Need More Hammers?</h3>
            <p>You're out of hammers!</p>
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
              {/* Placeholder for "Watch Ad for Hammer"
                <button onClick={() => { console.log('Watch ad for hammer clicked'); setShowPurchaseHammerModal(false); }}>
                    Watch Ad for 1 Hammer
                </button>
                */}
              <button onClick={() => setShowPurchaseHammerModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Placeholder for Hammer Animation Element
      {hammerAnimation.active && (
        <div 
            className="hammer-animation-sprite" 
            style={{ 
                position: 'absolute', 
                top: `${hammerAnimation.targetRow * 50 + 25}px`, // Example positioning, adjust based on cell size/board offset
                left: `${hammerAnimation.targetCol * 50 + 25}px`,
                width: '50px', height: '50px', background: 'rgba(255,0,0,0.5)', // Replace with actual animation
                pointerEvents: 'none',
                transform: 'translate(-50%, -50%)' // Center it
            }}
            // onAnimationEnd={() => { ... actual peg removal and reset animation state ... }}
        >
            Hammer Anim!
        </div>
      )}
      */}
    </div>
  );
}

export default Game;
