// src/Game.js
import React, { useState, useEffect, useCallback } from "react";
import { levels as allLevels } from "./levelsData"; // Ensure this import is correct
import Board from "./components/Board"; // Ensure this import is correct
import GameInfo from "./components/GameInfo"; // Ensure this import is correct
import GameControls from "./components/GameControls"; // Ensure this import is correct

function Game({
  currentLevelIndex,
  setCurrentLevelIndex,
  globalFreeUndosRemaining, // Prop from App.js
  onConsumeGlobalUndo, // Prop from App.js
  onPurchaseGlobalUndos, // Prop from App.js
}) {
  const [currentLevelData, setCurrentLevelData] = useState(null);
  const [board, setBoard] = useState([]); // 0: non-playable, 1: empty, 2: peg
  const [selectedPeg, setSelectedPeg] = useState(null); // {row, col}
  const [pegsRemaining, setPegsRemaining] = useState(0);
  const [movesCount, setMovesCount] = useState(0);
  const [isGameWon, setIsGameWon] = useState(false);
  const [isGameLost, setIsGameLost] = useState(false); // Stuck
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [history, setHistory] = useState([]);
  const [showPurchaseUndoModal, setShowPurchaseUndoModal] = useState(false);

  const initializeLevel = useCallback((levelIndex) => {
    const level = allLevels[levelIndex]; // Uses allLevels
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
  }, []); // Added initializeLevel to dependency array (implicit from usage)

  useEffect(() => {
    if (currentLevelIndex < allLevels.length) {
      // Uses allLevels
      initializeLevel(currentLevelIndex);
    } else {
      setFeedbackMessage("Congratulations! You've completed all levels!");
      setIsGameWon(true);
      setCurrentLevelData(null);
      setBoard([]);
      setHistory([]);
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
        const jumpedRow = fromRow + dRow / 2; // Definition
        const jumpedCol = fromCol + dCol / 2; // Definition

        if (
          board[jumpedRow] && // Uses jumpedRow
          board[jumpedRow][jumpedCol] === 2 // Uses jumpedRow and jumpedCol
        ) {
          setHistory((prevHistory) => [
            ...prevHistory,
            {
              board: board.map((r) => [...r]),
              pegsRemaining: pegsRemaining,
              movesCount: movesCount,
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

  const handleResetLevel = () => {
    // Definition
    initializeLevel(currentLevelIndex);
  };

  const handleNextLevel = () => {
    // Definition
    if (currentLevelIndex < allLevels.length - 1) {
      // Uses allLevels
      setCurrentLevelIndex((prev) => prev + 1);
    } else {
      setFeedbackMessage("Congratulations! You've completed all levels!");
    }
  };

  const handleUndoMove = () => {
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
    // Uses allLevels
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
    // Definition
    if (isGameWon) return "success";
    if (isGameLost) return "error";
    if (selectedPeg) return "info";
    return "info";
  };

  const canUndo = history.length > 0 && !isGameWon && !isGameLost;
  const undoButtonText =
    globalFreeUndosRemaining > 0
      ? `Undo (${globalFreeUndosRemaining})`
      : history.length > 0
      ? "Get Undos"
      : "Undo";

  return (
    <div className="game-area">
      <GameInfo // Uses GameInfo
        levelName={`Level ${currentLevelData.id}: ${currentLevelData.name}`}
        levelDescription={currentLevelData.description}
        pegsRemaining={pegsRemaining}
        movesCount={movesCount}
      />
      <Board // Uses Board
        boardState={board}
        selectedPeg={selectedPeg}
        onCellClick={handleCellClick}
      />
      <GameControls // Uses GameControls
        onReset={handleResetLevel} // Uses handleResetLevel
        onUndo={handleUndoMove}
        canUndo={canUndo}
        undoButtonText={undoButtonText}
        onNextLevel={handleNextLevel} // Uses handleNextLevel
        canGoNext={isGameWon}
        isGameWon={isGameWon}
        allLevelsCompleted={
          currentLevelIndex >= allLevels.length - 1 && isGameWon
        } // Uses allLevels
      />
      {feedbackMessage && (
        <p className={`feedback-message ${getFeedbackClass()}`}>
          {" "}
          {/* Uses getFeedbackClass */}
          {feedbackMessage}
        </p>
      )}

      {showPurchaseUndoModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Need More Undos?</h3>
            <p>You've used all your global free undos.</p>
            <p>(This is a placeholder for a real purchase feature)</p>
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
    </div>
  );
}

export default Game;
