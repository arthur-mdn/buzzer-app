//GameRoom.jsx
import React, {useEffect, useState} from 'react';
import HostGameRoom from './HostGameRoom.jsx';
import PlayerGameRoom from './PlayerGameRoom.jsx';
import {Link, useParams} from "react-router-dom";
import PlayerList from "./PlayerList.jsx";
import PlayerCount from "./PlayerCount.jsx";
import {useSocket} from "../../SocketContext.jsx";
import { useUser } from '../../UserContext.jsx';
import {useToken} from "../../TokenContext.jsx";
import { GameProvider } from '../../GameContext.jsx';
import {FaInfoCircle, FaUser} from "react-icons/fa";
import RoomDetails from "./RoomDetails.jsx";
import Modal from '../modal/Modal.jsx';
import ServerSettings from "./ServerSettings.jsx";
import BlasonServerViewer from "../host/BlasonServerViewer.jsx";
import PingViewer from "./PingViewer.jsx";
import {FaInbox, FaInfo} from "react-icons/fa6";

import config from '../../config.js';

function GameRoom( {currentPing} ) {
    const socket = useSocket();
    const userId = useUser();
    const token = useToken();
    const { serverCode } = useParams();
    const [role, setRole] = useState(null); // 'host' ou 'participant'
    const [serverInfo, setServerInfo] = useState(null);
    const [error, setError] = useState(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('details'); // 'details' ou 'players'


    useEffect(() => {
        const fetchServerDetails = async () => {
            try {

                // Récupérer l'userId du localStorage
                const response = await fetch(config.serverUrl + `/server/${serverCode}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });
                const data = await response.json();

                if(data.success){
                    setServerInfo(data.server);
                    // console.log(data.server)
                    setRole(data.role);
                    socket.emit('joinServer', { serverCode: serverCode });
                }else{
                    setError('Serveur introuvable.');
                }

            } catch (error) {
                console.error('There was an error fetching the server details:', error);
                setError('Erreur lors de la récupération des détails du serveur. Veuillez réessayer.');
            }
        };
        fetchServerDetails();
    }, [serverCode, socket, token]);

    useEffect(() => {
        const handleUnload = () => {
            socket.emit('userLeaving', { userId: userId });
        };

        window.addEventListener("beforeunload", handleUnload);

        return () => {
            window.removeEventListener("beforeunload", handleUnload);
        };
    }, [socket, userId]);

    useEffect(() => {
        socket.on('serverDeleted', () => {
            setError('Serveur supprimé.');
        });
    }, [socket]);

    const handleBackClick = () => {
        socket.emit('userLeaving', { userId: userId });
    };

    const handleOpenModal = (tab) => {
        setActiveTab(tab);
        setIsModalOpen(true);
    };

    // console.log(serverInfo)
    if (error) {
        return (
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                <nav className={'modal_bg'}>
                    <div className={'modal'}>
                        <div className={'modal_content_title'}>
                            <h2>Erreur !</h2>
                        </div>
                        <form className={'modal_content'}>
                            <label style={{width:'100%',textAlign:'left'}}> {error} </label>
                            <Link to="/" className={'btn-push'} style={{width: '100%', textAlign:'center',padding: '1rem 0'}} >Accueil</Link>
                        </form>
                    </div>
                </nav>
            </div>
        );
    }

    // console.log(serverInfo)
    if (!serverInfo) {
        return <div>Récupération des informations du serveur...</div>;
    }
    if(role !== "host" && role !== "participant"){
        return <div>Rôle invalide.</div>;
    }


    return <GameProvider initialGameState={serverInfo.gameStatus} initialGameOptions={serverInfo.options} initialBuzzOrder={serverInfo.buzzOrder} >
        {
            config.sendPings === "true" &&
            <PingViewer ping={currentPing}/>
        }
        <div style={{display:'flex', padding:'2rem', flexDirection:'row', justifyContent:'space-between', gap:'2rem', alignItems:'center', zIndex:'1', position:'relative'}}>
            <button onClick={() => handleOpenModal('details')} className={"btn-push btn-push-gray"} style={{padding:'0.5rem 1rem', gap:'1rem', width:'100%', display:'flex', alignItems:'center'}}>
                <BlasonServerViewer imageIndex={serverInfo.blason.blason}/>
                <div>
                    <h6 style={{textAlign:'left'}}>{serverInfo.name}</h6>
                    <span onClick={() => handleOpenModal('players')} style={{ display:'flex',gap:'5px'}}> <FaUser /> <PlayerCount /></span>
                </div>
            </button>
            <Link to="/" onClick={handleBackClick} className={'btn-push'} style={{padding: '0.1rem 0.7rem 0.3rem 0.75rem', height: 'fit-content'}} >{'x'}</Link>
        </div>
        { role === 'host' &&
            <HostGameRoom serverInfo={serverInfo}/>
        }
        { role === 'participant' &&
            <PlayerGameRoom serverInfo={serverInfo}  />
        }
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} style={{maxWidth:'none'}}>
            <div style={{marginLeft: '15px', display: 'flex', gap: '10px'}}>
                <button onClick={() => setActiveTab('details')}
                        className={`modal-tab ${activeTab === 'details' ? 'active' : ''}`}>
                    Détails
                </button>
                <button onClick={() => setActiveTab('players')}
                        className={`modal-tab ${activeTab === 'players' ? 'active' : ''}`}>
                    Membres
                </button>
                { role === 'host' &&
                    <button onClick={() => setActiveTab('settings')}
                            className={`modal-tab ${activeTab === 'settings' ? 'active' : ''}`}>
                        Options
                    </button>
                }
            </div>
            {activeTab === 'details' ? <><RoomDetails serverInfo={serverInfo} /> <div style={{margin:'0.5rem'}}></div> <PlayerList serverInfo={serverInfo} /></> : (activeTab === 'players' ? <PlayerList serverInfo={serverInfo} /> : <ServerSettings/>)}
        </Modal>
    </GameProvider>;
}

export default GameRoom;
