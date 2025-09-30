import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TimePassIcon } from '../icons/Icons';

type Player = 'X' | 'O' | null;
type Game = 'tictactoe' | 'rps' | 'snake' | 'memory';

// --- GAME 1: TIC-TAC-TOE --- //

const Square: React.FC<{ value: Player; onClick: () => void; isWinning: boolean; }> = ({ value, onClick, isWinning }) => (
    <button
        onClick={onClick}
        className={`w-20 h-20 sm:w-24 sm:h-24 border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center text-5xl sm:text-6xl font-bold transition-colors duration-300
            ${value === 'X' ? 'text-orange-500' : 'text-green-500'}
            ${isWinning ? 'bg-yellow-200 dark:bg-yellow-800/50' : 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'}
        `}
    >
        {value}
    </button>
);

const TicTacToe: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
    const [xIsNext, setXIsNext] = useState(true);
    const [gameMode, setGameMode] = useState<'player' | 'computer' | null>(null);
    const [winner, setWinner] = useState<Player>(null);
    const [winningLine, setWinningLine] = useState<number[]>([]);

    const calculateWinner = useCallback((squares: Player[]): { winner: Player; line: number[] } => {
        const lines = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];
        for (let i = 0; i < lines.length; i++) {
            const [a, b, c] = lines[i];
            if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
                return { winner: squares[a], line: lines[i] };
            }
        }
        return { winner: null, line: [] };
    }, []);

    useEffect(() => {
        const result = calculateWinner(board);
        if (result.winner) {
            setWinner(result.winner);
            setWinningLine(result.line);
        } else if (gameMode === 'computer' && !xIsNext && !board.every(Boolean)) {
            const computerMove = findBestMove(board);
            if (computerMove !== -1) {
                setTimeout(() => handleClick(computerMove), 500);
            }
        }
    }, [board, gameMode, xIsNext, calculateWinner]);

    const findBestMove = (squares: Player[]): number => {
        // 1. Check if computer can win
        for (let i = 0; i < 9; i++) {
            if (!squares[i]) {
                const newBoard = squares.slice();
                newBoard[i] = 'O';
                if (calculateWinner(newBoard).winner === 'O') return i;
            }
        }
        // 2. Check if player can win and block
        for (let i = 0; i < 9; i++) {
            if (!squares[i]) {
                const newBoard = squares.slice();
                newBoard[i] = 'X';
                if (calculateWinner(newBoard).winner === 'X') return i;
            }
        }
        // 3. Take center
        if (!squares[4]) return 4;
        // 4. Take a random corner
        const corners = [0, 2, 6, 8].filter(i => !squares[i]);
        if (corners.length > 0) return corners[Math.floor(Math.random() * corners.length)];
        // 5. Take a random side
        const sides = [1, 3, 5, 7].filter(i => !squares[i]);
        if (sides.length > 0) return sides[Math.floor(Math.random() * sides.length)];
        return -1;
    };

    const handleClick = (i: number) => {
        if (winner || board[i] || (gameMode === 'computer' && !xIsNext)) {
            return;
        }
        const newBoard = board.slice();
        newBoard[i] = xIsNext ? 'X' : 'O';
        setBoard(newBoard);
        setXIsNext(!xIsNext);
    };

    const resetGame = (mode: 'player' | 'computer' | null = gameMode) => {
        setBoard(Array(9).fill(null));
        setXIsNext(true);
        setWinner(null);
        setWinningLine([]);
        setGameMode(mode);
    };

    const status = winner
        ? `Winner: ${winner}`
        : board.every(Boolean)
        ? "It's a Draw!"
        : `Next player: ${xIsNext ? 'X' : 'O'}`;

    if (!gameMode) {
        return (
            <div className="flex flex-col items-center p-4">
                 <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Tic-Tac-Toe</h2>
                 <div className="space-y-4">
                    <button onClick={() => resetGame('player')} className="w-48 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-lg shadow-md">2 Player</button>
                    <button onClick={() => resetGame('computer')} className="w-48 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg shadow-md">Vs Computer</button>
                    <button onClick={onBack} className="w-48 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg shadow-md">Back to Games</button>
                 </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center p-4">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Tic-Tac-Toe</h2>
            <div className={`text-xl font-semibold mb-4 ${winner ? 'text-green-500' : 'text-gray-600 dark:text-gray-300'}`}>
                {status}
            </div>
            <div className="grid grid-cols-3 gap-1 bg-gray-300 dark:bg-gray-600 p-1 rounded-lg shadow-lg">
                {[...Array(9)].map((_, i) => <Square key={i} value={board[i]} onClick={() => handleClick(i)} isWinning={winningLine.includes(i)} />)}
            </div>
            <div className="mt-6 flex space-x-4">
                <button onClick={() => resetGame(null)} className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded-lg shadow-md">Change Mode</button>
                <button onClick={onBack} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg shadow-md">Back</button>
            </div>
        </div>
    );
};

// --- GAME 2: ROCK PAPER SCISSORS --- //
const RockPaperScissors: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const choices = { rock: '✊', paper: '✋', scissors: '✌️' };
    type Choice = keyof typeof choices;
    const [playerChoice, setPlayerChoice] = useState<Choice | null>(null);
    const [computerChoice, setComputerChoice] = useState<Choice | null>(null);
    const [result, setResult] = useState<string | null>(null);
    const [score, setScore] = useState({ player: 0, computer: 0 });

    const handlePlayerChoice = (choice: Choice) => {
        const computerKeys = Object.keys(choices) as Choice[];
        const randomChoice = computerKeys[Math.floor(Math.random() * computerKeys.length)];
        
        setPlayerChoice(choice);
        setComputerChoice(randomChoice);

        if (choice === randomChoice) {
            setResult("It's a draw!");
        } else if (
            (choice === 'rock' && randomChoice === 'scissors') ||
            (choice === 'paper' && randomChoice === 'rock') ||
            (choice === 'scissors' && randomChoice === 'paper')
        ) {
            setResult('You win!');
            setScore(s => ({ ...s, player: s.player + 1 }));
        } else {
            setResult('You lose!');
            setScore(s => ({ ...s, computer: s.computer + 1 }));
        }
    };

    const resetGame = () => {
        setPlayerChoice(null);
        setComputerChoice(null);
        setResult(null);
    };

    return (
        <div className="flex flex-col items-center p-4">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Rock Paper Scissors</h2>
            <div className="text-xl font-semibold mb-4 text-gray-600 dark:text-gray-300">
                Player: {score.player} - Computer: {score.computer}
            </div>
            {!result ? (
                <>
                    <p className="mb-4">Choose your weapon:</p>
                    <div className="flex space-x-4">
                        {(Object.keys(choices) as Choice[]).map(choice => (
                            <button key={choice} onClick={() => handlePlayerChoice(choice)} className="text-6xl p-4 rounded-full bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-md transform hover:scale-110 transition-transform">
                                {choices[choice]}
                            </button>
                        ))}
                    </div>
                </>
            ) : (
                <div className="text-center">
                    <div className="flex items-center justify-center space-x-8 text-6xl mb-4">
                        <div>
                            <p className="text-sm">You</p>
                            {playerChoice && choices[playerChoice]}
                        </div>
                        <span className="text-2xl text-gray-500">vs</span>
                        <div>
                            <p className="text-sm">CPU</p>
                            {computerChoice && choices[computerChoice]}
                        </div>
                    </div>
                    <p className="text-2xl font-bold">{result}</p>
                    <button onClick={resetGame} className="mt-4 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded-lg">Play Again</button>
                </div>
            )}
            <button onClick={onBack} className="mt-6 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg">Back to Games</button>
        </div>
    );
};

// --- GAME 3: SNAKE GAME --- //
const SnakeGame: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const GRID_SIZE = 20;
    const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
    const [food, setFood] = useState({ x: 15, y: 15 });
    const [direction, setDirection] = useState<'UP' | 'DOWN' | 'LEFT' | 'RIGHT'>('RIGHT');
    const [isGameOver, setIsGameOver] = useState(false);
    const [score, setScore] = useState(0);

    const generateFood = useCallback(() => {
        setFood({
            x: Math.floor(Math.random() * GRID_SIZE),
            y: Math.floor(Math.random() * GRID_SIZE),
        });
    }, []);

    const gameLoop = useCallback(() => {
        const newSnake = [...snake];
        const head = { ...newSnake[0] };

        switch (direction) {
            case 'UP': head.y -= 1; break;
            case 'DOWN': head.y += 1; break;
            case 'LEFT': head.x -= 1; break;
            case 'RIGHT': head.x += 1; break;
        }

        if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE || newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
            setIsGameOver(true);
            return;
        }

        newSnake.unshift(head);

        if (head.x === food.x && head.y === food.y) {
            setScore(s => s + 1);
            generateFood();
        } else {
            newSnake.pop();
        }
        setSnake(newSnake);
    }, [snake, direction, food, generateFood]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            switch (e.key) {
                case 'ArrowUp': if (direction !== 'DOWN') setDirection('UP'); break;
                case 'ArrowDown': if (direction !== 'UP') setDirection('DOWN'); break;
                case 'ArrowLeft': if (direction !== 'RIGHT') setDirection('LEFT'); break;
                case 'ArrowRight': if (direction !== 'LEFT') setDirection('RIGHT'); break;
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [direction]);

    useEffect(() => {
        if (isGameOver) return;
        const interval = setInterval(gameLoop, 200);
        return () => clearInterval(interval);
    }, [gameLoop, isGameOver]);

    const resetGame = () => {
        setSnake([{ x: 10, y: 10 }]);
        generateFood();
        setDirection('RIGHT');
        setIsGameOver(false);
        setScore(0);
    };

    return (
        <div className="flex flex-col items-center p-4">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Snake</h2>
            <p className="text-lg font-semibold mb-4 text-gray-600 dark:text-gray-300">Score: {score}</p>
            <div className="relative bg-gray-200 dark:bg-gray-900 border-4 border-gray-400 dark:border-gray-600" style={{ width: GRID_SIZE * 20, height: GRID_SIZE * 20 }}>
                {isGameOver && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center text-white">
                        <p className="text-3xl font-bold">Game Over</p>
                        <button onClick={resetGame} className="mt-4 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded-lg">Play Again</button>
                    </div>
                )}
                {snake.map((segment, index) => (
                    <div key={index} className="absolute bg-green-500" style={{ left: segment.x * 20, top: segment.y * 20, width: 20, height: 20 }} />
                ))}
                <div className="absolute bg-red-500 rounded-full" style={{ left: food.x * 20, top: food.y * 20, width: 20, height: 20 }} />
            </div>
             <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">Use arrow keys to move</p>
             <button onClick={onBack} className="mt-4 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg">Back to Games</button>
        </div>
    );
};

// --- GAME 4: MEMORY MATCH --- //
const MemoryGame: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const EMOJIS = ['🐘', '🐅', '🦚', '🐍', '🐒', '🐫', ' Lotus Temple ', ' Taj Mahal '];
    const generateCards = () => {
        const duplicated = [...EMOJIS, ...EMOJIS];
        return duplicated.map((value, id) => ({ id, value, isFlipped: false, isMatched: false }))
                         .sort(() => Math.random() - 0.5);
    };
    const [cards, setCards] = useState(generateCards);
    const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
    const [moves, setMoves] = useState(0);
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        if (flippedIndices.length === 2) {
            const [firstIndex, secondIndex] = flippedIndices;
            const firstCard = cards[firstIndex];
            const secondCard = cards[secondIndex];

            if (firstCard.value === secondCard.value) {
                setCards(prev => prev.map((card, index) => (index === firstIndex || index === secondIndex) ? { ...card, isMatched: true } : card));
                setFlippedIndices([]);
            } else {
                setTimeout(() => {
                    setCards(prev => prev.map((card, index) => (index === firstIndex || index === secondIndex) ? { ...card, isFlipped: false } : card));
                    setFlippedIndices([]);
                }, 1000);
            }
        }
    }, [flippedIndices, cards]);

    useEffect(() => {
        if (cards.length > 0 && cards.every(c => c.isMatched)) {
            setIsComplete(true);
        }
    }, [cards]);

    const handleCardClick = (index: number) => {
        if (flippedIndices.length >= 2 || cards[index].isFlipped) return;
        
        setCards(prev => prev.map((card, i) => i === index ? { ...card, isFlipped: true } : card));
        setFlippedIndices(prev => [...prev, index]);
        if (flippedIndices.length === 0) {
            setMoves(m => m + 1);
        }
    };
    
    const resetGame = () => {
        setCards(generateCards());
        setFlippedIndices([]);
        setMoves(0);
        setIsComplete(false);
    };

    return (
        <div className="flex flex-col items-center p-4">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Memory Match</h2>
            <p className="text-lg font-semibold mb-4 text-gray-600 dark:text-gray-300">Moves: {moves}</p>
            {isComplete ? (
                 <div className="text-center">
                     <p className="text-3xl font-bold text-green-500">You Won!</p>
                     <p>You completed the game in {moves} moves.</p>
                     <button onClick={resetGame} className="mt-4 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded-lg">Play Again</button>
                 </div>
            ) : (
                <div className="grid grid-cols-4 gap-2 sm:gap-4">
                    {cards.map((card, index) => (
                        <div key={card.id} className="w-16 h-16 sm:w-20 sm:h-20" onClick={() => handleCardClick(index)}>
                            <div className={`w-full h-full transition-transform duration-500 rounded-lg shadow-md ${card.isFlipped ? '[transform:rotateY(180deg)]' : ''}`} style={{ transformStyle: 'preserve-3d' }}>
                                <div className="absolute w-full h-full bg-orange-400 rounded-lg flex items-center justify-center text-3xl [backface-visibility:hidden]">?</div>
                                <div className="absolute w-full h-full bg-white dark:bg-gray-700 rounded-lg flex items-center justify-center text-xl sm:text-2xl [transform:rotateY(180deg)] [backface-visibility:hidden]">
                                    {card.value}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
             <button onClick={onBack} className="mt-6 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg">Back to Games</button>
        </div>
    );
};

// --- MAIN COMPONENT & MENU --- //

const GameCard: React.FC<{ title: string; description: string; onSelect: () => void; icon: string }> = ({ title, description, onSelect, icon }) => (
    <button onClick={onSelect} className="w-full text-left bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-orange-400 dark:hover:border-orange-500 transition-all transform hover:-translate-y-1">
        <div className="flex items-center">
            <span className="text-4xl mr-4">{icon}</span>
            <div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">{title}</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-1">{description}</p>
            </div>
        </div>
    </button>
);

const GameMenu: React.FC<{ onSelectGame: (game: Game) => void }> = ({ onSelectGame }) => (
    <div className="space-y-4">
        <GameCard title="Tic-Tac-Toe" description="Classic Noughts and Crosses. Play with a friend or challenge the computer." onSelect={() => onSelectGame('tictactoe')} icon="🕹️" />
        <GameCard title="Rock Paper Scissors" description="A quick game of chance against the computer. Can you outsmart it?" onSelect={() => onSelectGame('rps')} icon="✂️" />
        <GameCard title="Snake" description="The timeless classic. Eat the food, grow your snake, and avoid the walls!" onSelect={() => onSelectGame('snake')} icon="🐍" />
        <GameCard title="Memory Match" description="Test your memory! Find all the matching pairs of cards." onSelect={() => onSelectGame('memory')} icon="🧠" />
    </div>
);

const TimePass: React.FC = () => {
    const [selectedGame, setSelectedGame] = useState<Game | null>(null);

    const renderGame = () => {
        switch(selectedGame) {
            case 'tictactoe': return <TicTacToe onBack={() => setSelectedGame(null)} />;
            case 'rps': return <RockPaperScissors onBack={() => setSelectedGame(null)} />;
            case 'snake': return <SnakeGame onBack={() => setSelectedGame(null)} />;
            case 'memory': return <MemoryGame onBack={() => setSelectedGame(null)} />;
            default: return <GameMenu onSelectGame={setSelectedGame} />;
        }
    };

    return (
        <div className="game-zone-background -m-4 md:-m-8 min-h-full animate-fadeIn">
            <div className="max-w-4xl mx-auto p-4 md:p-8 relative z-10">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center p-4 bg-white/10 rounded-full mb-4 text-orange-400">
                        <TimePassIcon />
                    </div>
                    <h1 className="text-3xl font-bold text-white drop-shadow-lg">TimePass Games</h1>
                    <p className="text-gray-300 mt-2 drop-shadow-md">
                        A collection of simple, offline-friendly games to enjoy during your travels.
                    </p>
                </div>
                <div className="bg-black/20 backdrop-blur-sm p-4 md:p-8 rounded-2xl shadow-xl border border-white/10">
                    {renderGame()}
                </div>
            </div>
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.5s ease-out forwards;
                }
                @keyframes move-bg {
                  0% { background-position: 0% 50%; }
                  50% { background-position: 100% 50%; }
                  100% { background-position: 0% 50%; }
                }
                .game-zone-background {
                  background: linear-gradient(135deg, #0d0c22, #3c145c, #003e3e, #4d0f0f);
                  background-size: 300% 300%;
                  animation: move-bg 25s ease infinite;
                  position: relative;
                  overflow: hidden;
                }
                .game-zone-background::before {
                  content: '';
                  position: absolute;
                  top: 0;
                  left: 0;
                  width: 100%;
                  height: 100%;
                  background-image: 
                    linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
                  background-size: 40px 40px;
                  opacity: 0.8;
                  pointer-events: none;
                }
            `}</style>
        </div>
    );
};

export default TimePass;
