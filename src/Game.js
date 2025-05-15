import React, { useState, useEffect, useCallback } from "react";
import { levels as allLevels } from "./levelsData";
import Board from "./components/Board";
import GameInfo from "./components/GameInfo";
import GameControls from "./components/GameControls";

function Game({ currentLevelIndex, setCurrentLevelIndex }) {
  const [currentLevelData, setCurrentLevelData] = useState(null);
  const [board, setBoard] = useState([]);
  const [selectedPeg, setSelectedPeg] = useState(null);
  const [pegsRemaining, setPegsRemaining] = useState(0);
  const [movesCount, setMovesCount] = useState(0);
  const [isGameWon, setIsGameWon] = useState(false);
  const [isGameLost, setIsGameLost] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [history, setHistory] = useState([]); // <-- New state for undo

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
    setHistory([]); // <-- Reset history on new level
  }, []);

  useEffect(() => {
    if (currentLevelIndex < allLevels.length) {
      initializeLevel(currentLevelIndex);
    } else {
      setFeedbackMessage("Congratulations! You've completed all levels!");
      setIsGameWon(true);
      setCurrentLevelData(null);
      setBoard([]);
      setHistory([]); // Also clear history here
    }
  }, [currentLevelIndex, initializeLevel]);

  const canAnyPegMove = useCallback(() => {
    // ... (no changes to this function)
    if (!board || board.length === 0) return false;
    for (let r = 0; r < board.length; r++) {
      for (let c = 0; c < board[r].length; c++) {
        if (board[r][c] === 2) {
          // If there's a peg
          const directions = [
            [-2, 0],
            [2, 0],
            [0, -2],
            [0, 2],
          ];
          for (const [dr, dc] of directions) {
            const nr = r + dr;
            const nc = c + dc;
            const jr = r + dr / 2; // Jumped peg row
            const jc = c + dc / 2; // Jumped peg col

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
    // ... (no changes to this function's core logic for win/loss)
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
      // Added condition
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
        const jumpedRow = fromRow + dRow / 2;
        const jumpedCol = fromCol + dCol / 2;

        if (board[jumpedRow] && board[jumpedRow][jumpedCol] === 2) {
          // <-- Save current state to history BEFORE making the move
          setHistory((prevHistory) => [
            ...prevHistory,
            {
              board: board.map((r) => [...r]), // Deep copy of current board
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
          // After a successful move, game might be won/lost, so clear these flags
          // The useEffect for win/loss will re-evaluate
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
    initializeLevel(currentLevelIndex); // This already resets history
  };

  const handleNextLevel = () => {
    if (currentLevelIndex < allLevels.length - 1) {
      setCurrentLevelIndex((prev) => prev + 1);
    } else {
      setFeedbackMessage("Congratulations! You've completed all levels!");
    }
  };

  const handleUndoMove = () => {
    // <-- New Undo function
    if (history.length === 0) {
      setFeedbackMessage("No moves to undo.");
      return;
    }

    const lastState = history[history.length - 1];
    setBoard(lastState.board.map((r) => [...r])); // Restore board (deep copy)
    setPegsRemaining(lastState.pegsRemaining);
    setMovesCount(lastState.movesCount);

    setHistory((prevHistory) => prevHistory.slice(0, -1)); // Remove last state from history
    setSelectedPeg(null);
    setIsGameWon(false); // Game is no longer won/lost after undo
    setIsGameLost(false);
    setFeedbackMessage("Last move undone.");
  };

  if (!currentLevelData && currentLevelIndex >= allLevels.length) {
    // ... (All levels complete message - no change)
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
    // ... (no changes)
    if (isGameWon) return "success";
    if (isGameLost) return "error";
    if (selectedPeg) return "info";
    return "info";
  };

  return (
    <div className="game-area">
      <GameInfo
        levelName={`Level ${currentLevelData.id}: ${currentLevelData.name}`}
        levelDescription={currentLevelData.description}
        pegsRemaining={pegsRemaining}
        movesCount={movesCount}
      />
      <Board
        boardState={board}
        selectedPeg={selectedPeg}
        onCellClick={handleCellClick}
      />
      <GameControls
        onReset={handleResetLevel}
        onUndo={handleUndoMove} // <-- Pass new handler
        canUndo={history.length > 0 && !isGameWon && !isGameLost} // <-- Condition for enabling undo
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
    </div>
  );
}

export default Game;
