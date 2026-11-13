
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Player = "X" | "O";
type Square = Player | null;
type GameMode = "pvp" | "cpu";

const WINNING_COMBINATIONS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

function getWinner(board: Square[]): Player | null {
  for (const combination of WINNING_COMBINATIONS) {
    const [a, b, c] = combination;

    if (
      board[a] !== null &&
      board[a] === board[b] &&
      board[a] === board[c]
    ) {
      return board[a];
    }
  }

  return null;
}

// AI menggunakan algoritma Minimax
function minimax(
  board: Square[],
  isMaximizing: boolean,
  depth: number
): number {
  const winner = getWinner(board);

  if (winner === "O") return 10 - depth;
  if (winner === "X") return depth - 10;
  if (board.every((square) => square !== null)) return 0;

  if (isMaximizing) {
    let bestScore = -Infinity;

    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        const nextBoard = [...board];
        nextBoard[i] = "O";

        bestScore = Math.max(
          bestScore,
          minimax(nextBoard, false, depth + 1)
        );
      }
    }

    return bestScore;
  }

  let bestScore = Infinity;

  for (let i = 0; i < 9; i++) {
    if (board[i] === null) {
      const nextBoard = [...board];
      nextBoard[i] = "X";

      bestScore = Math.min(
        bestScore,
        minimax(nextBoard, true, depth + 1)
      );
    }
  }

  return bestScore;
}

function getBestMove(board: Square[]): number {
  let bestScore = -Infinity;
  let bestMove = -1;

  for (let i = 0; i < 9; i++) {
    if (board[i] === null) {
      const nextBoard = [...board];
      nextBoard[i] = "O";

      const score = minimax(nextBoard, false, 0);

      if (score > bestScore) {
        bestScore = score;
        bestMove = i;
      }
    }
  }

  return bestMove;
}

export default function Home() {
  const [board, setBoard] = useState<Square[]>(
    Array(9).fill(null)
  );

  const [currentPlayer, setCurrentPlayer] =
    useState<Player>("X");

  const [mode, setMode] = useState<GameMode>("pvp");

  const [scores, setScores] = useState({
    X: 0,
    O: 0,
  });

  const [draws, setDraws] = useState(0);

  const winner = getWinner(board);

  const winningCombination = WINNING_COMBINATIONS.find(
    (combination) =>
      combination.every(
        (index) =>
          board[index] !== null &&
          board[index] === board[combination[0]]
      )
  );

  const isDraw =
    !winner && board.every((square) => square !== null);

  const gameOver = Boolean(winner || isDraw);

  // Menjalankan giliran AI
  useEffect(() => {
    if (
      mode !== "cpu" ||
      currentPlayer !== "O" ||
      gameOver
    ) {
      return;
    }

    const timer = setTimeout(() => {
      const move = getBestMove(board);

      if (move === -1) return;

      const newBoard = [...board];
      newBoard[move] = "O";

      setBoard(newBoard);

      const result = getWinner(newBoard);

      if (result) {
        setScores((previous) => ({
          ...previous,
          [result]: previous[result] + 1,
        }));
      } else if (newBoard.every((square) => square !== null)) {
        setDraws((previous) => previous + 1);
      } else {
        setCurrentPlayer("X");
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [board, currentPlayer, mode, gameOver]);

  function handleClick(index: number) {
    if (
      board[index] !== null ||
      gameOver ||
      (mode === "cpu" && currentPlayer === "O")
    ) {
      return;
    }

    const newBoard = [...board];
    newBoard[index] = currentPlayer;

    setBoard(newBoard);

    const result = getWinner(newBoard);

    if (result) {
      setScores((previous) => ({
        ...previous,
        [result]: previous[result] + 1,
      }));
    } else if (newBoard.every((square) => square !== null)) {
      setDraws((previous) => previous + 1);
    } else {
      setCurrentPlayer(
        currentPlayer === "X" ? "O" : "X"
      );
    }
  }

  function newGame() {
    setBoard(Array(9).fill(null));
    setCurrentPlayer("X");
  }

  function changeMode(newMode: GameMode) {
    setMode(newMode);
    newGame();
  }

  function resetScores() {
    newGame();
    setScores({ X: 0, O: 0 });
    setDraws(0);
  }

  const statusText = winner
    ? mode === "cpu" && winner === "O"
      ? "Computer Wins!"
      : `Player ${winner} Wins!`
    : isDraw
      ? "It's a Draw!"
      : mode === "cpu" && currentPlayer === "O"
        ? "Computer is thinking..."
        : `Player ${currentPlayer}'s turn`;

  return (
    <main className="min-h-screen bg-[#100D1D] px-4 py-10 text-white sm:py-16">

      <div className="mx-auto max-w-2xl">

        {/* HEADER */}
        <header className="mb-10 text-center">

          <Badge className="mb-5 border border-purple-400/30 bg-purple-500/10 px-4 py-2 text-purple-300">
            ✦ THE CLASSIC GAME
          </Badge>

          <h1 className="text-4xl font-black tracking-tight sm:text-6xl">
            TIC <span className="text-purple-400">TAC</span> TOE
          </h1>

          <p className="mt-3 text-sm text-gray-400 sm:text-base">
            Challenge your friend. Make your move.
          </p>

        </header>

        {/* GAME MODE */}
        <div className="mb-7">

          <p className="mb-3 text-center text-xs font-semibold uppercase tracking-widest text-gray-500">
            Choose Game Mode
          </p>

          <div className="grid grid-cols-2 gap-3">

            <Button
              onClick={() => changeMode("pvp")}
              variant="outline"
              className={`h-12 border ${
                mode === "pvp"
                  ? "border-purple-400 bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 hover:text-purple-200"
                  : "border-white/10 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              👥 Player vs Player
            </Button>

            <Button
              onClick={() => changeMode("cpu")}
              variant="outline"
              className={`h-12 border ${
                mode === "cpu"
                  ? "border-purple-400 bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 hover:text-purple-200"
                  : "border-white/10 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              🤖 Player vs Computer
            </Button>

          </div>
        </div>

        {/* SCOREBOARD */}
        <div className="mb-6 grid grid-cols-3 gap-3">

          <Card className={`border p-4 text-center text-white transition-all ${
            currentPlayer === "X" && !gameOver
              ? "border-purple-400 bg-purple-500/15"
              : "border-white/10 bg-white/[0.04]"
          }`}>

            <p className="text-xs font-medium text-gray-400">
              PLAYER X
            </p>

            <p className="my-2 text-3xl font-black text-purple-400">
              X
            </p>

            <p className="text-2xl font-bold">
              {scores.X}
            </p>

          </Card>

          <Card className="border border-white/10 bg-white/[0.04] p-4 text-center text-white">

            <p className="text-xs font-medium text-gray-400">
              DRAWS
            </p>

            <p className="my-2 text-3xl font-black text-gray-300">
              =
            </p>

            <p className="text-2xl font-bold">
              {draws}
            </p>

          </Card>

          <Card className={`border p-4 text-center text-white transition-all ${
            currentPlayer === "O" && !gameOver
              ? "border-pink-400 bg-pink-500/15"
              : "border-white/10 bg-white/[0.04]"
          }`}>

            <p className="text-xs font-medium text-gray-400">
              {mode === "cpu" ? "COMPUTER" : "PLAYER O"}
            </p>

            <p className="my-2 text-3xl font-black text-pink-400">
              O
            </p>

            <p className="text-2xl font-bold">
              {scores.O}
            </p>

          </Card>

        </div>

        {/* GAME BOARD */}
        <Card className="border border-white/10 bg-white/[0.04] p-5 text-white shadow-2xl shadow-purple-950/20 sm:p-8">

          <div className="mb-7 flex min-h-10 items-center justify-center">

            {winner ? (

              <Badge className="border border-green-400/30 bg-green-500/15 px-5 py-2 text-green-300">
                🎉 {statusText}
              </Badge>

            ) : isDraw ? (

              <Badge className="border border-yellow-400/30 bg-yellow-500/15 px-5 py-2 text-yellow-300">
                {statusText}
              </Badge>

            ) : (

              <div className="text-center">

                <p className="text-sm font-medium text-gray-300">
                  {statusText}
                </p>

                {mode === "cpu" && currentPlayer === "O" && (
                  <p className="mt-1 text-xs text-purple-400">
                    AI is calculating the best move...
                  </p>
                )}

              </div>

            )}

          </div>

          {/* BOARD */}
          <div className="mx-auto grid w-full max-w-md grid-cols-3 gap-3">

            {board.map((square, index) => {

              const isWinningSquare =
                winningCombination?.includes(index) ?? false;

              return (

                <button
                  key={index}
                  type="button"
                  onClick={() => handleClick(index)}
                  disabled={
                    square !== null ||
                    gameOver ||
                    (mode === "cpu" && currentPlayer === "O")
                  }
                  aria-label={`Square ${index + 1}${square ? `: ${square}` : ": empty"}`}
                  className={`
                    flex aspect-square min-h-24 w-full
                    items-center justify-center
                    rounded-2xl border
                    text-5xl font-black
                    transition-all duration-200
                    sm:text-6xl
                    ${
                      isWinningSquare
                        ? "scale-95 border-green-400 bg-green-500/20 shadow-lg shadow-green-500/10"
                        : "border-white/10 bg-white/[0.05] hover:border-purple-400/60 hover:bg-purple-500/10"
                    }
                    ${
                      square === "X"
                        ? "text-purple-400"
                        : ""
                    }
                    ${
                      square === "O"
                        ? "text-pink-400"
                        : ""
                    }
                    ${
                      !square && !gameOver && !(mode === "cpu" && currentPlayer === "O")
                        ? "cursor-pointer active:scale-95"
                        : "cursor-default"
                    }
                  `}
                >

                  <span className={square ? "animate-in zoom-in-50 duration-200" : ""}>
                    {square}
                  </span>

                </button>

              );
            })}

          </div>

          {/* CONTROLS */}
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">

            <Button
              onClick={newGame}
              className="bg-purple-600 px-7 text-white hover:bg-purple-500"
            >
              ↻ New Game
            </Button>

            <Button
              onClick={resetScores}
              variant="outline"
              className="border-white/20 bg-transparent px-7 text-white hover:bg-white/10 hover:text-white"
            >
              Reset Score
            </Button>

          </div>

        </Card>

        {/* GAME INFORMATION */}
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5">

          <h2 className="mb-2 text-sm font-bold text-purple-300">
            How to Play
          </h2>

          <p className="text-xs leading-6 text-gray-400">
            {mode === "cpu"
              ? "You play as X. The computer plays as O using the Minimax algorithm. Get three symbols in a row to win!"
              : "Two players take turns placing X and O on the board. The first player to get three symbols in a row wins!"}
          </p>

        </div>

        {/* FOOTER */}
        <footer className="mt-8 text-center">

          <p className="text-xs text-gray-500">
            Made with ♡ · Tic Tac Toe
          </p>

          <p className="mt-2 text-xs text-gray-600">
            Built with React 19 & Next.js
          </p>

        </footer>

      </div>

    </main>
  );
}
