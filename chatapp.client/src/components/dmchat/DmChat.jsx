/* eslint-disable react/prop-types */
import { sanitizeHtml } from '../../utils.js';
import { useState } from 'react';
import '../chatmessages/chatmessages.css';


const DmChat = () => {

    const [chatMessages, setChatMessages] = useState([]);
    const [usersTyping, setUsersTyping] = useState([]);

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

            {
                usersTyping.length > 0
                    ?
                    <div className="chatbox-typing-indicator">
                        <div className="chatbox-message-typing">
                            <div className="typing">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                            {
                                usersTyping.map((user, idx) => {
                                    return (
                                        <span key={user}>&nbsp;{user} {idx == usersTyping.length - 1 ? '' : ','}</span>
                                    )
                                })
                            }
                            <span>&nbsp;is typing...</span>
                        </div>
                    </div>
                    :
                    null
            }

        </div>
    )
}

export default DmChat;