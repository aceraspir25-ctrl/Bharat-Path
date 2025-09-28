import React, { useState, useEffect } from 'react';
import { TimePassIcon } from '../icons/Icons';

type Player = 'X' | 'O' | null;

const Square: React.FC<{ value: Player; onClick: () => void; isWinning: boolean; }> = ({ value, onClick, isWinning }) => (
    <button
        onClick={onClick}
        className={`w-24 h-24 sm:w-32 sm:h-32 border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center text-5xl sm:text-6xl font-bold transition-colors duration-300
            ${value === 'X' ? 'text-orange-500' : 'text-green-500'}
            ${isWinning ? 'bg-yellow-200 dark:bg-yellow-800/50' : 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'}
        `}
    >
        {value}
    </button>
);

const TicTacToe: React.FC = () => {
    const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
    const [xIsNext, setXIsNext] = useState(true);
    const [winner, setWinner] = useState<Player>(null);
    const [winningLine, setWinningLine] = useState<number[]>([]);

    const calculateWinner = (squares: Player[]): { winner: Player; line: number[] } => {
        const lines = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
            [0, 4, 8], [2, 4, 6]             // diagonals
        ];
        for (let i = 0; i < lines.length; i++) {
            const [a, b, c] = lines[i];
            if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
                return { winner: squares[a], line: lines[i] };
            }
        }
        return { winner: null, line: [] };
    };
    
    useEffect(() => {
        const result = calculateWinner(board);
        if (result.winner) {
            setWinner(result.winner);
            setWinningLine(result.line);
        }
    }, [board]);

    const handleClick = (i: number) => {
        if (winner || board[i]) {
            return;
        }
        const newBoard = board.slice();
        newBoard[i] = xIsNext ? 'X' : 'O';
        setBoard(newBoard);
        setXIsNext(!xIsNext);
    };

    const resetGame = () => {
        setBoard(Array(9).fill(null));
        setXIsNext(true);
        setWinner(null);
        setWinningLine([]);
    };

    const renderSquare = (i: number) => {
        return <Square value={board[i]} onClick={() => handleClick(i)} isWinning={winningLine.includes(i)} />;
    };

    const status = winner
        ? `Winner: ${winner}`
        : board.every(Boolean)
        ? "It's a Draw!"
        : `Next player: ${xIsNext ? 'X' : 'O'}`;

    return (
        <div className="flex flex-col items-center p-4">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Tic-Tac-Toe</h2>
            <div className={`text-xl font-semibold mb-4 ${winner ? 'text-green-500' : 'text-gray-600 dark:text-gray-300'}`}>
                {status}
            </div>
            <div className="grid grid-cols-3 gap-1 bg-gray-300 dark:bg-gray-600 p-1 rounded-lg shadow-lg">
                {renderSquare(0)}
                {renderSquare(1)}
                {renderSquare(2)}
                {renderSquare(3)}
                {renderSquare(4)}
                {renderSquare(5)}
                {renderSquare(6)}
                {renderSquare(7)}
                {renderSquare(8)}
            </div>
            <button
                onClick={resetGame}
                className="mt-6 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded-lg shadow-md transition-colors"
            >
                New Game
            </button>
        </div>
    );
};

const TimePass: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto animate-fadeIn">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center p-4 bg-orange-100 dark:bg-orange-900/50 rounded-full mb-4">
            <TimePassIcon />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">TimePass Games</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          A collection of simple, offline-friendly games to enjoy during your travels.
        </p>
      </div>
      <div className="bg-white dark:bg-gray-800/50 p-4 md:p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
        <TicTacToe />
      </div>
       <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default TimePass;
