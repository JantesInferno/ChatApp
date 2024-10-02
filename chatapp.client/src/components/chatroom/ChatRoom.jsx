/* eslint-disable react/prop-types */
import './chatroom.css';
import { useState, useEffect } from 'react';


const ChatRoom = ({ connection, chatRoom }) => {
    const [chatMessages, setChatMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [usersTyping, setUsersTyping] = useState([]);


    const sendMessage = async () => {
        if (newMessage.trim() === "") {
            return; // Prevent sending empty messages
        }
        try {
            await connection.invoke("SendMessage", newMessage, chatRoom.Name);
            await connection.invoke("DeactivateTypingIndicator", chatRoom.Name);
            setNewMessage('');
        } catch (error) {
            console.error("Error sending message:", error);
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        sendMessage();
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            sendMessage();
        }
    }

    const handleOnChange = (e) => {
        if (e.target.value) {
            connection.invoke("ActivateTypingIndicator", chatRoom.Name);
        }
        else {
            connection.invoke("DeactivateTypingIndicator", chatRoom.Name);
        }

        setNewMessage(e.target.value);
    }

    const sanitizeHtml = (text) => {
        return text.replace(/&/g, "&amp;")
                   .replace(/</g, "&lt;")
                   .replace(/>/g, "&gt;")
                   .replace(/"/g, "&quot;")
                   .replace(/'/g, "&#039;");
    }

    function sameDay(d1) {
        let d2 = new Date();
        return d1.getFullYear() === d2.getFullYear() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getDate() === d2.getDate();
    }

    const filterDuplicateUsers = (user) => {
        let newArr = usersTyping.filter(x => x !== user)
        setUsersTyping(newArr);
    }

    useEffect(() => {
        connection.on("ReceiveTypingIndicatorOn", (user) => {
            filterDuplicateUsers(user);
            setUsersTyping(prev => [...prev, user]);
        });
        
        connection.on("ReceiveTypingIndicatorOff", (user) => {
            filterDuplicateUsers(user);
        });

        connection.on("ReceiveChatMessage", (msg) => {
            let obj = JSON.parse(msg);
            var date = new Date(Date.parse(obj.DateTime));

            if (sameDay(date)) {
                date = `today at ${(date.getHours() < 10 ? '0' : '') + date.getHours()}:${(date.getMinutes() < 10 ? '0' : '') + date.getMinutes()}`;
            }
            else {
                date = obj.ShortDate;
            }

            obj.DateTime = date;

            setChatMessages(prevChatMessages => {
                let newChatMessages = prevChatMessages.filter(x => x.Id !== obj.Id);
                return [...newChatMessages, obj];
            });

        });
        
    }, [connection]);

    useEffect(() => {
        const chatboxMessageWrapper = document.querySelector('.chatbox-message-content');
        chatboxMessageWrapper.scrollTo(0, chatboxMessageWrapper.scrollHeight);
    }, [newMessage, chatMessages]);

    useEffect(() => {
        if (chatRoom.ChatMessages && chatMessages.length == 0) {
            setChatMessages(chatRoom.ChatMessages);
        }
    }, []);


    

    return (
        <div className="chatbox-wrapper">
            <div className="chatbox-message-wrapper">
                <div className="chatbox-message-header">
                    <span>{chatRoom.Name}</span>
                </div>
                <div className="chatbox-message-content">
                    {
                        chatMessages && chatMessages.map((msg) => {
                            return (
                                <div key={msg.Id} className="chatbox-message-item">
                                    <div key={msg.Id + msg.Username} className="chatbox-message-sender">
                                        <span key={msg.Username} className="chatbox-message-sender-text">{sanitizeHtml(msg.Username)}</span>
                                        <span key={msg.DateTime} className="chatbox-message-item-time">{msg.DateTime}</span>
                                    </div>
                                    <div key={msg.Id + msg.Message} className="chatbox-message-item sent">
                                        <span key={sanitizeHtml(msg.Message)} className="chatbox-message-item-text">
                                            {msg.Message}
                                        </span>
                                    </div>
                                </div>
                            )
                        })
                    }
                </div>

                <div className="chatbox-message-bottom">
                    {
                        usersTyping.length > 0
                            ?
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
                            : null
                    }   

                    <form onSubmit={handleSubmit} action="#" className="chatbox-message-form">
                        <textarea cols="200" rows="1" placeholder="Message" className="chatbox-message-input" value={newMessage} onChange={handleOnChange} onKeyPress={handleKeyPress}></textarea>
                        <button type="submit" className="chatbox-message-submit">Send</button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default ChatRoom;