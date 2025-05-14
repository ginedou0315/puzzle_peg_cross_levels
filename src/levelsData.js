// src/levelsData.js
export const levels = [
  {
    id: 1,
    name: "First Jump",
    description: "Make your first jump. Leave one peg.",
    boardSetup: [
      [0, 2, 0], // 0 = non-playable, 1 = empty hole, 2 = peg
      [0, 2, 0],
      [0, 1, 0],
    ],
    targetPegsRemaining: 1,
  },
  {
    id: 2,
    name: "Simple Line",
    description: "Clear the line. Leave one peg.",
    boardSetup: [[2, 2, 1, 2, 1]],
    targetPegsRemaining: 1,
  },
  {
    id: 3,
    name: "Small Cross",
    description: "A classic shape, miniaturized.",
    boardSetup: [
      [1, 2, 2],
      [2, 1, 2],
      [1, 2, 1],
    ],
    targetPegsRemaining: 1,
  },
  {
    id: 4,
    name: "The L-Shape",
    description: "Master the L. Leave one peg.",
    boardSetup: [
      [2, 1, 1, 1],
      [2, 2, 1, 1],
      [1, 2, 1, 2],
    ],
    targetPegsRemaining: 1,
  },
  {
    id: 5, // Your original game's setup
    name: "Classic Cross (English Board)",
    description: "The standard challenge. Can you leave one peg in the center?",
    boardSetup: [
      [0, 0, 2, 2, 2, 0, 0],
      [0, 0, 2, 2, 2, 0, 0],
      [2, 2, 2, 2, 2, 2, 2],
      [2, 2, 2, 1, 2, 2, 2], // Central hole is empty
      [2, 2, 2, 2, 2, 2, 2],
      [0, 0, 2, 2, 2, 0, 0],
      [0, 0, 2, 2, 2, 0, 0],
    ],
    targetPegsRemaining: 1,
  },
  // Add 20 more levels here with different boardSetups!
  // Example: Larger board
  {
    id: 6,
    name: "Plus Shape",
    description: "A larger plus shape.",
    boardSetup: [
      [0, 0, 0, 2, 0, 0, 0],
      [0, 0, 0, 2, 0, 0, 0],
      [0, 0, 0, 2, 0, 0, 0],
      [2, 2, 2, 1, 2, 2, 2],
      [0, 0, 0, 2, 0, 0, 0],
      [0, 0, 0, 2, 0, 0, 0],
      [0, 0, 0, 2, 0, 0, 0],
    ],
    targetPegsRemaining: 1,
  },
  // ... up to 25+ levels
];

// Function to count initial pegs for a given board setup
export const countInitialPegs = (boardSetup) => {
  let pegCount = 0;
  boardSetup.forEach((row) => {
    row.forEach((cell) => {
      if (cell === 2) {
        // 2 represents a peg
        pegCount++;
      }
    });
  });
  return pegCount;
};
