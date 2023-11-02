// GameContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSocket } from './SocketContext';

const GameContext = createContext();

export function useGame() {
    return useContext(GameContext);
}

export function GameProvider({ children , initialGameState, initialBuzzOrder, initialPlayers }) {
    const socket = useSocket();
    const [gameState, setGameState] = useState(initialGameState || 'waiting');
    const [message, setMessage] = useState('');
    const [buzzOrder, setBuzzOrder] = useState(initialBuzzOrder || []);
    const [players, setPlayers] = useState(initialPlayers || []);

    useEffect(() => {
        socket.on('gameStarted', () => {
            setGameState('inProgress');
            setMessage('La partie a commencé !');
        });
        socket.on('gameReStarted', ({server}) => {
            setGameState('waiting');
            setMessage('La partie va recommencer !');
            console.log(server)
            // setBuzzOrder(server.buzzOrder);
            setGameState(server.gameStatus);
            setPlayers(server.players)
        });

        socket.on('gameCancelled', () => {
            setGameState('waiting');
            setMessage('La partie a été annulée.');
        });

        socket.on('playerBuzzed', ({ server }) => {
            setBuzzOrder(server.buzzOrder);
            setGameState(server.gameStatus);
        });

        socket.on('answerAccepted', ({ server }) => {
            // console.log(server);
            setBuzzOrder(server.buzzOrder);
            setGameState(server.gameStatus);
            setPlayers(server.players)
            setMessage('Réponse valide !')
        });
        socket.on('answerWon', ({ server }) => {
            // console.log(server);
            setBuzzOrder(server.buzzOrder);
            setGameState(server.gameStatus);
            setPlayers(server.players)
            setMessage('Réponse gagnante !')
        });
        socket.on('answerDeclined', ({ server }) => {
            // console.log(server);
            setBuzzOrder(server.buzzOrder);
            setGameState(server.gameStatus);
            setPlayers(server.players);
            setMessage('Réponse incorrecte !')

        });

        return () => {
            socket.off('gameStarted');
            socket.off('gameCancelled');
        };
    }, [socket]);

    const value = {
        gameState,
        message,
        setGameState,
        setMessage,
        buzzOrder,
        players, setPlayers
    };

    return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}
