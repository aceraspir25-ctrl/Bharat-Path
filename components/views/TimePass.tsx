// @ts-nocheck
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TimePassIcon } from '../icons/Icons';

type Game = 'tictactoe' | 'rps' | 'snake' | 'memory';

// --- GAME 1: TIC-TAC-TOE (Smarter & Darker) --- //
const TicTacToe: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [board, setBoard] = useState(Array(9).fill(null));
    const [xIsNext, setXIsNext] = useState(true);
    const [winner, setWinner] = useState(null);

    const checkWinner = (squares) => {
        const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
        for (let [a, b, c] of lines) {
            if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) return squares[a];
        }
        return null;
    };

    const handleClick = (i) => {
        if (winner || board[i]) return;
        const newBoard = [...board];
        newBoard[i] = 'X';
        setBoard(newBoard);
        setXIsNext(false);
        const win = checkWinner(newBoard);
        if (win) setWinner(win);
        else if (!newBoard.includes(null)) setWinner('Draw');
    };

    // Auto-move for Computer
    useEffect(() => {
        if (!xIsNext && !winner) {
            const emptyIndices = board.map((v, i) => v === null ? i : null).filter(v => v !== null);
            if (emptyIndices.length > 0) {
                const randomMove = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
                setTimeout(() => {
                    const newBoard = [...board];
                    newBoard[randomMove] = 'O';
                    setBoard(newBoard);
                    setXIsNext(true);
                    setWinner(checkWinner(newBoard));
                }, 600);
            }
        }
    }, [xIsNext, winner, board]);

    return (
        <div className="flex flex-col items-center animate-fadeInUp">
            <h3 className="text-orange-500 font-black uppercase tracking-[0.3em] text-[10px] mb-6 text-center">Neural Strategy Node</h3>
            <div className="grid grid-cols-3 gap-3 bg-white/5 p-4 rounded-[2rem] border border-white/10 shadow-2xl">
                {board.map((val, i) => (
                    <button key={i} onClick={() => handleClick(i)} className="w-20 h-20 bg-black/40 rounded-2xl flex items-center justify-center text-4xl font-black text-white hover:bg-orange-500/20 transition-all border border-white/5">
                        {val === 'X' ? <span className="text-orange-500 animate-pulse">X</span> : <span className="text-blue-400">{val}</span>}
                    </button>
                ))}
            </div>
            <div className="mt-8 text-center">
                <p className="text-white font-black uppercase italic tracking-tighter text-xl mb-4">{winner ? (winner === 'Draw' ? "TIE PROTOCOL" : `${winner} DOMINATES`) : (xIsNext ? "YOUR TURN" : "AI THINKING...")}</p>
                <button onClick={() => {setBoard(Array(9).fill(null)); setWinner(null); setXIsNext(true);}} className="px-8 py-3 bg-white text-black font-black rounded-full uppercase text-[10px] tracking-widest hover:bg-orange-500 hover:text-white transition-all">Re-Initialize</button>
            </div>
        </div>
    );
};

// --- GAME 2: SNAKE (With Retro Vibe) --- //
const SnakeGame: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const GRID_SIZE = 15;
    const [snake, setSnake] = useState([{ x: 8, y: 8 }]);
    const [food, setFood] = useState({ x: 5, y: 5 });
    const [dir, setDir] = useState({ x: 0, y: -1 });
    const [gameOver, setGameOver] = useState(false);
    const [score, setScore] = useState(0);

    const moveSnake = useCallback(() => {
        if (gameOver) return;
        const newHead = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
        
        if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE || snake.some(s => s.x === newHead.x && s.y === newHead.y)) {
            setGameOver(true);
            return;
        }

        const newSnake = [newHead, ...snake];
        if (newHead.x === food.x && newHead.y === food.y) {
            setScore(s => s + 10);
            setFood({ x: Math.floor(Math.random() * GRID_SIZE), y: Math.floor(Math.random() * GRID_SIZE) });
        } else {
            newSnake.pop();
        }
        setSnake(newSnake);
    }, [snake, dir, food, gameOver]);

    useEffect(() => {
        const handleKeys = (e) => {
            if (e.key === 'ArrowUp' && dir.y === 0) setDir({ x: 0, y: -1 });
            if (e.key === 'ArrowDown' && dir.y === 0) setDir({ x: 0, y: 1 });
            if (e.key === 'ArrowLeft' && dir.x === 0) setDir({ x: -1, y: 0 });
            if (e.key === 'ArrowRight' && dir.x === 0) setDir({ x: 1, y: 0 });
        };
        window.addEventListener('keydown', handleKeys);
        const interval = setInterval(moveSnake, 150);
        return () => { clearInterval(interval); window.removeEventListener('keydown', handleKeys); };
    }, [moveSnake, dir]);

    return (
        <div className="flex flex-col items-center animate-fadeIn">
            <div className="flex justify-between w-full max-w-[300px] mb-4">
                <span className="text-orange-500 font-black text-[10px] tracking-widest uppercase">Score: {score}</span>
                <span className="text-gray-500 font-black text-[10px] tracking-widest uppercase">Grid: 15x15</span>
            </div>
            <div className="relative bg-[#0a0b14] border-4 border-white/5 rounded-3xl overflow-hidden shadow-4xl" style={{ width: 300, height: 300 }}>
                {snake.map((s, i) => (
                    <div key={i} className="absolute bg-orange-500 rounded-sm border border-black/20" style={{ left: s.x * 20, top: s.y * 20, width: 20, height: 20 }}></div>
                ))}
                <div className="absolute bg-red-500 rounded-full animate-pulse" style={{ left: food.x * 20, top: food.y * 20, width: 20, height: 20 }}></div>
                {gameOver && (
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
                        <p className="text-white font-black text-2xl uppercase italic tracking-tighter mb-4">Collision Detected</p>
                        <button onClick={() => {setSnake([{x:8,y:8}]); setGameOver(false); setScore(0);}} className="bg-orange-500 text-white px-6 py-2 rounded-full font-black text-[10px] uppercase">Re-Sync Path</button>
                    </div>
                )}
            </div>
            {/* Mobile Controls Add-on */}
            <div className="grid grid-cols-3 gap-2 mt-8 md:hidden">
                <div /> <button onClick={() => setDir({x:0, y:-1})} className="p-4 bg-white/10 rounded-xl">▲</button> <div />
                <button onClick={() => setDir({x:-1, y:0})} className="p-4 bg-white/10 rounded-xl">◀</button>
                <button onClick={() => setDir({x:0, y:1})} className="p-4 bg-white/10 rounded-xl">▼</button>
                <button onClick={() => setDir({x:1, y:0})} className="p-4 bg-white/10 rounded-xl">▶</button>
            </div>
        </div>
    );
};

// --- MAIN ARCADE COMPONENT --- //
const TimePass: React.FC = () => {
    const [selectedGame, setSelectedGame] = useState<Game | null>(null);

    const games = [
        { id: 'snake', name: 'Neural Snake', icon: '🐍', desc: 'Navigate the digital grid and grow your node.' },
        { id: 'tictactoe', name: 'Logic Matrix', icon: '🕹️', desc: 'Outsmart the AI in a 3x3 strategic sequence.' },
        { id: 'memory', name: 'Registry Match', icon: '🧠', desc: 'Recall the travel nodes hidden in the vault.' },
        { id: 'rps', name: 'Kinetic Strike', icon: '✂️', desc: 'Fast-paced rock-paper-scissors uplink.' },
    ];

    return (
        <div className="max-w-6xl mx-auto pb-40 px-6 h-screen overflow-y-auto custom-scrollbar selection:bg-orange-500/30">
            <header className="py-12 flex flex-col md:flex-row justify-between items-end gap-6 mb-12 border-b border-white/5">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <span className="p-3 bg-orange-500/10 rounded-2xl text-orange-500 shadow-inner"><TimePassIcon /></span>
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.5em]">Offline Entertainment Node</span>
                    </div>
                    <h1 className="text-7xl font-black text-white uppercase italic tracking-tighter leading-none">Arcade <span className="text-orange-500">Zone</span></h1>
                </div>
                {selectedGame && (
                    <button onClick={() => setSelectedGame(null)} className="px-8 py-3 bg-white/5 border border-white/10 text-white rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-orange-500 transition-all">Back to Lobby</button>
                )}
            </header>

            <div className="bg-white/5 backdrop-blur-3xl rounded-[4rem] border border-white/10 p-10 md:p-16 shadow-4xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 text-[15rem] font-black text-white/[0.01] pointer-events-none select-none uppercase italic leading-none">PLAY</div>
                
                <div className="relative z-10">
                    {!selectedGame ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fadeIn">
                            {games.map(game => (
                                <button key={game.id} onClick={() => setSelectedGame(game.id as any)} className="group text-left p-10 bg-black/40 rounded-[3rem] border border-white/5 hover:border-orange-500/40 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 relative overflow-hidden">
                                    <div className="relative z-10 flex items-center gap-8">
                                        <div className="text-6xl group-hover:scale-125 group-hover:rotate-12 transition-transform duration-500">{game.icon}</div>
                                        <div>
                                            <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-2">{game.name}</h3>
                                            <p className="text-gray-500 text-xs font-medium leading-relaxed uppercase tracking-widest">{game.desc}</p>
                                        </div>
                                    </div>
                                    <div className="absolute -bottom-4 -right-4 text-6xl font-black text-white/[0.02] uppercase italic group-hover:text-orange-500/[0.05] transition-colors">{game.id}</div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="flex justify-center min-h-[400px]">
                            {selectedGame === 'tictactoe' && <TicTacToe onBack={() => setSelectedGame(null)} />}
                            {selectedGame === 'snake' && <SnakeGame onBack={() => setSelectedGame(null)} />}
                            {selectedGame === 'memory' && <p className="text-gray-500 font-black uppercase text-xs self-center">Registry Match coming in next Sync...</p>}
                            {selectedGame === 'rps' && <p className="text-gray-500 font-black uppercase text-xs self-center">Kinetic Strike coming in next Sync...</p>}
                        </div>
                    )}
                </div>
            </div>

            <footer className="mt-24 pt-10 border-t border-white/5 text-center">
                <p className="text-[9px] font-black text-gray-700 uppercase tracking-[0.8em] italic">Gaming Protocol Designed by Shashank Mishra</p>
            </footer>

            <style>{`
                .shadow-4xl { box-shadow: 0 60px 150px -30px rgba(0,0,0,0.8); }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fadeInUp { animation: fadeInUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
                @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
                .animate-float { animation: float 4s ease-in-out infinite; }
            `}</style>
        </div>
    );
};

export default TimePass;