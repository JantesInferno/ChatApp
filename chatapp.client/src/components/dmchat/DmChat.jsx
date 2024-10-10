/* eslint-disable react/prop-types */
import { sanitizeHtml } from '../../utils.js';
import { useState, useEffect } from 'react';
import '../chatmessages/chatmessages.css';


const DmChat = ({ participant, dmMessages }) => {

    const [chatMessages, setChatMessages] = useState([]);

    useEffect(() => {
        const thisUsername = sessionStorage.getItem('username');
        // needs new data object with sender/receiver if multiple dm-sessions. messages from signed in user will bleed into other conversations
        const filteredMsgs = dmMessages.filter(msg => msg.Username !== participant.Username || msg.Username !== thisUsername);
        setChatMessages(filteredMsgs);
    }, [participant, dmMessages])

    return (
        <div className="chatbox-message-content">
            <div className="chatbox-message-list">
                {
                    chatMessages.length > 0
                        ?
                        chatMessages.map((msg) => {
                            return (
                                <div key={msg.Id} className="chatbox-message-item">
                                    <div key={msg.Id + msg.Username} className="chatbox-message-sender">
                                        <span key={msg.Username} className="chatbox-message-sender-text">{sanitizeHtml(msg.Username)}</span>
                                        <span key={msg.DateTime} className="chatbox-message-item-time">{msg.DateTime}</span>
                                    </div>
                                    <div key={msg.Id + msg.Message} className="chatbox-message-item-sent">
                                        <span key={sanitizeHtml(msg.Message)} className="chatbox-message-item-text">
                                            {msg.Message}
                                        </span>
                                    </div>
                                </div>
                            )
                        })
                        :
                        <div className="chatbox-message-empty">
                            <span>Wow, such empty</span>
                        </div>
                }
            </div>
        </div>
    )
}

export default DmChat;