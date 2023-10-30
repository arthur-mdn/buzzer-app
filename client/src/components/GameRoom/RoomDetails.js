// PlayerList.js
import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { FaUser, FaCircle } from 'react-icons/fa';
import {useSocket} from "../../SocketContext";
import {useUser} from "../../UserContext";
import {useToken} from "../../TokenContext";

function PlayerList({ serverInfo, players, setPlayers }) {
    const socket = useSocket();
    const userId = useUser();
    const token = useToken();
    const { serverCode } = useParams();

    useEffect(() => {
        const handlePlayersUpdate = (updatedServer) => {
            console.log(updatedServer)
            setPlayers(updatedServer.players);
        };
        socket.on('playersUpdate', handlePlayersUpdate);
        socket.on('error', console.error);
        return () => {
            socket.off('playersUpdate', handlePlayersUpdate);
        };
    }, [players, serverCode, setPlayers, socket, token]);

    const [isOpen, setIsOpen] = useState(false);
    const toggleSidebar = () => setIsOpen(!isOpen);


    const playersGrouped = players ? players.reduce((acc, player) => {
        const key = `${player.role}-${player.state}`;
        if (!acc[key]) acc[key] = [];
        acc[key].push(player);
        return acc;
    }, {}) : {};


    const PlayerItem = ({ player }) => (
        <li>
            <img src={process.env.PUBLIC_URL + '/user.png'} alt="Logo" style={{ width: '40px' }} />
            <div>
                <span>{player.user.userName}</span>
                <span className={player.state}>
                <FaCircle /> {player.state === 'online' ? 'En ligne' : 'Hors ligne'}
            </span>
            </div>
        </li>
    );
    const onlineHosts = playersGrouped['host-online'] ? playersGrouped['host-online'].length : 0;
    const onlineUsers = playersGrouped['user-online'] ? playersGrouped['user-online'].length : 0;

    return (
        <div>
            <div style={{display:'flex', width:'100%', flexDirection:'row-reverse'  }}>
                <button className="openMenuButton btn-push" onClick={toggleSidebar}  style={{padding:'0.5rem 1rem', zIndex:'2'}}>
                    <FaUser /> {onlineHosts + onlineUsers}
                </button>
            </div>

            <div className={`sidebar ${isOpen ? "open" : ""}`}>
                <button className="closebtn" onClick={toggleSidebar}>&times;</button>
                <h2>Hôte:</h2>
                <ul className={playersGrouped['host-online']?.some(player => player.user.userId === userId) ? "yourProfile" : ""}>
                    {playersGrouped['host-online']?.map(player => <PlayerItem key={player._id} player={player} />)}
                </ul>
                <ul className={playersGrouped['host-offline']?.some(player => player.user.userId === userId) ? "yourProfile" : ""}>
                    {playersGrouped['host-offline']?.map(player => <PlayerItem key={player._id} player={player} />)}
                </ul>
                <h2>Joueurs:</h2>
                <ul className={playersGrouped['user-online']?.some(player => player.user.userId === userId) ? "yourProfile" : ""}>
                    {playersGrouped['user-online']?.map(player => <PlayerItem key={player._id} player={player} />)}
                </ul>
                <ul className={playersGrouped['user-offline']?.some(player => player.user.userId === userId) ? "yourProfile" : ""}>
                    {playersGrouped['user-offline']?.map(player => <PlayerItem key={player.user.userId} player={player} />)}
                </ul>
            </div>
        </div>
    );
}


export default PlayerList;
