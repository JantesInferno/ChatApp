/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
import './chatroom.css';
import { useState, useEffect } from 'react';

const ChatRoom = ({ connection, chatRoom, userOnline }) => {
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
        } catch (error) {
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
    function checkDay(messageDate) {
        var date = messageDate.getDate(),
            diffDays = new Date().getDate() - date,
            diffMonths = new Date().getMonth() - messageDate.getMonth(),
            diffYears = new Date().getFullYear() - messageDate.getFullYear();

        if (diffYears === 0 && diffDays === 0 && diffMonths === 0)
            return "today";
        else if (diffYears === 0 && diffDays === 1)
            return "yesterday";

        return null;
    }

    const sortUsers = (users) => {
        const sortedUsers = users.sort(function (a, b) {
            if (a.Username.toLowerCase() < b.Username.toLowerCase()) return -1;
            if (a.Username.toLowerCase() > b.Username.toLowerCase()) return 1;
            return 0;
        });

        return sortedUsers;
    }

    // SignalR methods for receiving data
    useEffect(() => {

        const typingOnEvent = `ReceiveTypingIndicatorOn_${chatRoom.Name}`;
        const typingOffEvent = `ReceiveTypingIndicatorOff_${chatRoom.Name}`;

        connection.on(typingOnEvent, (user) => {
            setUsersTyping((prev) => {
                const found = prev.find((username) => username === user);
                if (!found) {
                    return [...prev, user];
                }
                return prev;
            });
        });
        
        connection.on(typingOffEvent, (user) => {
            setUsersTyping((prev) => {
                return prev.filter((username) => username !== user);
            });
        });

        connection.on("ReceiveChatMessage", (msg) => {
            let obj = JSON.parse(msg);
            let date = new Date(Date.parse(obj.DateTime));

            let day = checkDay(date)
            if (day)
                date = `${day} at ${(date.getHours() < 10 ? '0' : '') + date.getHours()}:${(date.getMinutes() < 10 ? '0' : '') + date.getMinutes()}`;
            else 
                date = obj.ShortDate;

            obj.DateTime = date;

            setChatMessages(prevChatMessages => {
                let filteredChatMessages = prevChatMessages.filter(x => x.Id !== obj.Id);
                return [...filteredChatMessages, obj];
            });
        });

        return () => {
            connection.off(typingOnEvent);
            connection.off(typingOffEvent);
            connection.off("ReceiveChatMessage");
        };
    }, [connection, chatRoom.Name]);

    // automatically scroll down chat to last message
    useEffect(() => {
        const chatboxMessageWrapper = document.querySelector('.chatbox-message-content');
        chatboxMessageWrapper.scrollTo(0, chatboxMessageWrapper.scrollHeight);
    }, [newMessage, chatMessages]);

    // populate chat with messages from db
    useEffect(() => {
        if (chatRoom) {
            setChatMessages(chatRoom.ChatMessages || []);
            setUsers(sortUsers(chatRoom.Users) || []);
        }
    }, [chatRoom]);

    useEffect(() => {
        if (userOnline) {
            setUsers((prevUsers) => {
                let filteredUsers = prevUsers.filter(u => u.Username !== userOnline.Username);
                const updatedUsers = [...filteredUsers, userOnline];
                return sortUsers(updatedUsers);
            });
        }
    }, [userOnline]);

    
    return (
        <div className="chatroom-container">
            <div className="chatroom-header selector">
            </div>
            <div className="chatroom-main">
                <div className="chatroom-side-panel selector">
                </div>
                <div className="chatbox-message-content">
                    <div className="chatbox-message-list">
                        {
                            chatRoom && chatMessages.length > 0
                                ?
                                chatMessages.map((msg) => {
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
                    <button className="invite-link-button" onClick={() => navigator.clipboard.writeText(`${window.location.origin}/chat/${chatRoom.Id}`)}>
                        Invitation link
                        <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-copy" width="22" height="22" viewBox="0 0 24 24" strokeWidth="2" stroke="#ffffff" fill="none" strokeLinecap="round" strokeLinejoin="round">
                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                            <path d="M7 7m0 2.667a2.667 2.667 0 0 1 2.667 -2.667h8.666a2.667 2.667 0 0 1 2.667 2.667v8.666a2.667 2.667 0 0 1 -2.667 2.667h-8.666a2.667 2.667 0 0 1 -2.667 -2.667z" />
                            <path d="M4.012 16.737a2.005 2.005 0 0 1 -1.012 -1.737v-10c0 -1.1 .9 -2 2 -2h10c.75 0 1.158 .385 1.5 1" />
                        </svg>
                    </button>
                    </div>
            </div>
            <div className="chatroom-form-container selector">
                <form onSubmit={handleSubmit} action="#" className="chatroom-message-form">
                    <textarea cols="200" rows="4" placeholder="Message" className="chatroom-message-input" value={newMessage} onChange={handleOnChange} onKeyPress={handleKeyPress}></textarea>
                    <button type="submit" className="chatroom-message-submit">Send</button>
                </form>
            </div>
        </div>
    )
}

export default ChatRoom;