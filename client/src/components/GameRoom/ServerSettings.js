// ServerSettings.js
import React, {useState} from 'react';
import {useGame} from "../../GameContext";
import {useSocket} from "../../SocketContext";
import {useParams} from "react-router-dom";

function ServerSettings() {
    const { options } = useGame();
    const { serverCode } = useParams();
    const socket = useSocket();
    const [winPoint, setWinPoint] = useState(options.winPoint);
    const [answerPoint, setAnswerPoint] = useState(options.answerPoint);
    const [deductPointOnWrongAnswer, setDeductPointOnWrongAnswer] = useState(options.deductPointOnWrongAnswer);
    const [autoRestartAfterDecline, setAutoRestartAfterDecline] = useState(options.autoRestartAfterDecline);
    const [isPublic, setIsPublic] = useState(options.isPublic);


    const handleSaveSettings = () => {
        const newOptions = {
            winPoint,
            answerPoint,
            deductPointOnWrongAnswer,
            autoRestartAfterDecline,
            isPublic
        };

        console.log(newOptions)
        // Envoyer les nouvelles options au serveur
        socket.emit('updateServerOptions', { serverCode, newOptions });
    };

    return (
        <div className={"tab-content"} style={{height:'100%', overflowY:'scroll'}}>

            <form className={'modal_content'}>
                <div>
                    <label htmlFor="winPoint">Points pour gagner la partie :</label>
                    <input
                        type="range"
                        min="5"
                        max="50"
                        value={winPoint}
                        className={'slider'}

                        onChange={(e) => setWinPoint(Number(e.target.value))}
                    />
                    <span>{winPoint}</span>
                </div>
                <div>
                    <label htmlFor="answerPoint">Points gagnés par bonne réponse :</label>
                    <input
                        type="range"
                        min="1"
                        max="5"
                        value={answerPoint}
                        className={'slider'}
                        onChange={(e) => setAnswerPoint(Number(e.target.value))}
                    />
                    <span>{answerPoint}</span>
                </div>
                <div>
                    <label>
                        <input
                            type="checkbox"
                            checked={deductPointOnWrongAnswer}
                            onChange={(e) => setDeductPointOnWrongAnswer(e.target.checked)}
                        />
                        Retirer un point par mauvaise réponse.
                    </label>
                </div>
                <div>
                    <label>
                        <input
                            type="checkbox"
                            checked={autoRestartAfterDecline}
                            onChange={(e) => setAutoRestartAfterDecline(e.target.checked)}
                        />
                       Engager une nouvelle manche lors d'une mauvaise réponse.
                    </label>
                </div>
                <div>
                    <label>
                        <input
                            type="checkbox"
                            checked={isPublic}
                            onChange={(e) => setIsPublic(e.target.checked)}
                        />
                       Serveur public
                    </label>
                </div>
                <button type="button" onClick={handleSaveSettings} className={'btn-push btn-push-green'} style={{width: '100%', padding: '1rem'}}>Enregistrer</button>
            </form>
        </div>
    );
}


export default ServerSettings;
