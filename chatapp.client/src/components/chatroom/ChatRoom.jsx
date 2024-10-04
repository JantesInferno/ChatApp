/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
import './chatroom.css';
import { useState, useEffect } from 'react';

const ChatRoom = ({ connection, chatRoom }) => {
    const [chatMessages, setChatMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [usersTyping, setUsersTyping] = useState([]);

    // send message to SignalR hub
    const sendMessage = async () => {
        if (newMessage.trim() === "") {
            return;
        }
        try {
            await connection.invoke("SendMessage", newMessage, chatRoom.Name);
            await connection.invoke("DeactivateTypingIndicator", chatRoom.Name);
            setNewMessage('');
        } catch (error) {z
            console.error("Error sending message:", error);
        }
    }

    // handle form submit by clicking button
    const handleSubmit = (e) => {
        e.preventDefault();
        sendMessage();
    }

    // handle form submit by pressing Enter
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            sendMessage();
        }
    }

    // handle current message and ping SignalR hub indicating typing status
    const handleOnChange = (e) => {
        if (e.target.value)
            connection.invoke("ActivateTypingIndicator", chatRoom.Name);
        else 
            connection.invoke("DeactivateTypingIndicator", chatRoom.Name);

        setNewMessage(e.target.value);
    }

    // escape html characters
    const sanitizeHtml = (text) => {
        return text.replace(/&/g, "&amp;")
                   .replace(/</g, "&lt;")
                   .replace(/>/g, "&gt;")
                   .replace(/"/g, "&quot;")
                   .replace(/'/g, "&#039;");
    }

    // check if message's date is the current date
    function sameDay(d1) {
        let d2 = new Date();
        return d1.getFullYear() === d2.getFullYear() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getDate() === d2.getDate();
    }

    // handle duplicate/remove users in array
    const filterDuplicateUsers = (user) => {
        let newArr = usersTyping.filter(x => x !== user)
        setUsersTyping(newArr);
    }

    // SignalR methods for receiving data
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
            let date = new Date(Date.parse(obj.DateTime));

            if (sameDay(date))
                date = `today at ${(date.getHours() < 10 ? '0' : '') + date.getHours()}:${(date.getMinutes() < 10 ? '0' : '') + date.getMinutes()}`;
            else 
                date = obj.ShortDate;

            obj.DateTime = date;

            setChatMessages(prevChatMessages => {
                let newChatMessages = prevChatMessages.filter(x => x.Id !== obj.Id);
                return [...newChatMessages, obj];
            });
        });
    }, [connection]);

    // automatically scroll down chat to last message
    useEffect(() => {
        const chatboxMessageWrapper = document.querySelector('.chatbox-message-content');
        chatboxMessageWrapper.scrollTo(0, chatboxMessageWrapper.scrollHeight);
    }, [newMessage, chatMessages]);

    // populate chat with messages from db
    useEffect(() => {
        if (chatRoom) {
            setChatMessages(chatRoom.ChatMessages || []);
            const sortedUsers = chatRoom.Users.sort(function (a, b) { if (a.Username.toLowerCase() < b.Username.toLowerCase()) return -1; if (a.Username.toLowerCase() > b.Username.toLowerCase()) return 1; return 0; })
            console.log(sortedUsers);
            setUsers(sortedUsers || []);
        }
    }, [chatRoom]);

    
    return (
        <div className="chatbox-wrapper">
            <div className="chatbox-message-wrapper">
                <div className="chatbox-message-header selector">
                </div>
                <div className="selector" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
                    <div className="chatbox-message-content">
                        {
                            chatRoom && chatMessages.length > 0 ? chatMessages.map((msg) => {
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
                                : <span>Wow, such empty</span>
                        }
                    </div>

                    <div className="chatbox-message-bottom selector">
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

                    <div className="users-status-list selector">
                        <div className="users-status-list-header">
                            Members - {users.length}
                        </div>
                        {chatRoom && users && users.map((user) => {
                            return (
                                <div key={user.Username} className="user-status">
                                    <div className="user-status-icon"
                                        style={{
                                            background: user.IsOnline
                                                ? 'linear-gradient(90deg, #0e4206, #37a127)'
                                                : 'linear-gradient(90deg, #4d1111, #b53a3a)'
                                        }}
                                    ></div>
                                    {user.Username}
                                </div>

                            );
                        })}
                    </div>

                    <button className="invite-link-button" onClick={() => navigator.clipboard.writeText(`${window.location.origin}/chat/${chatRoom.Id}`)}>
                        Copy Invite Link
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ChatRoom;