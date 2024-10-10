/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import { encryptMessage, decryptMessage, formatDay } from '../../utils.js';
import DmChat from '../dmchat/DmChat';
import './userlist.css';

const UserList = ({ chatRoom, users, openDms, setOpenDms, toggledDms, setToggledDms, connection, dmMessages, setDmMessages }) => {

    const [newMessage, setNewMessage] = useState("");

    const handleDm = (user) => {
        if (user.Username !== sessionStorage.getItem('username') && user.IsOnline) {
            setOpenDms((prev) => {
                const found = prev.find((u) => u.Username === user.Username);
                if (!found) {
                    return [...prev, user];
                }
                return prev;
            });
        }
    };

    const handleCloseDm = (user) => {
        setOpenDms((prev) => {
            const filtered = prev.filter((u) => u.Username !== user.Username);
            return filtered;
        });
    }

    const handleToggleDm = (user) => {
        setToggledDms((prev) => {
            const isToggled = prev.includes(user.Username);
            if (isToggled) {
                return prev.filter((u) => u !== user.Username);
            } else {
                return [...prev, user.Username];
            }
        });
    };

    // send message to SignalR hub
    const sendMessage = async (user) => {
        if (newMessage.trim() === "") {
            return;
        }

        if (user.IsOnline) {
            let encryptedMessage;

            try {
                encryptedMessage = encryptMessage(newMessage);
            } catch (error) {
                console.error('Encryption error:', error);
                return;
            }

            await connection.invoke("SendPrivateMessage", encryptedMessage, user.Username)
                .catch(err => {
                    console.error(err.toString());
                    alert(err.message);
                });

            setNewMessage('');
        }
    }

    // handle form submit by clicking button
    const handleSubmit = (e, user) => {
        e.preventDefault();
        if (!user) alert("no user recipient");
        sendMessage(user);
    }

    // handle form submit by pressing Enter
    const handleKeyPress = (e, user) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            sendMessage(user);
        }
    }

    // handle current message and ping SignalR hub indicating typing status
    const handleOnChange = (e) => {
        setNewMessage(e.target.value);
    }

    useEffect(() => {
        setOpenDms((prevOpenDms) => {
            return prevOpenDms.map((dmUser) => {
                const updatedUser = users.find((u) => u.Username === dmUser.Username);
                return updatedUser ? { ...dmUser, IsOnline: updatedUser.IsOnline } : dmUser;
            });
        });
    }, [users]);

    useEffect(() => {
        if (connection) {
            let username = sessionStorage.getItem('username');

            connection.on(`ReceiveChatMessageOn_${username.toLowerCase()}`, (msg) => {

                let message = JSON.parse(msg);
                let decryptedMessage;
                console.log("ReceiveChatMessageOn", message);

                try {
                    decryptedMessage = decryptMessage(message.Message);
                } catch (error) {
                    console.error('Decryption error:', error);
                    return;
                }

                message.Message = decryptedMessage;

                let date = new Date(Date.parse(message.DateTime));

                const day = formatDay(date)
                if (day)
                    date = `${day} at ${(date.getHours() < 10 ? '0' : '') + date.getHours()}:${(date.getMinutes() < 10 ? '0' : '') + date.getMinutes()}`;
                else
                    date = message.ShortDate;

                message.DateTime = date;

                setDmMessages(prev => [...prev, message]);
            });


            return () => {
                connection.off(`ReceiveChatMessageOn_${username.toLowerCase()}`);
            };
        }
    }, [connection]);

    return (
        <>
            <div className="users-status-list selector">
                <div className="users-status-list-header">
                    Members - {users.length}
                </div>
                {chatRoom && users && users.map((user) => {
                    return (
                        <div key={user.Username} className="user-status" onClick={() => handleDm(user)}>
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

            {openDms.length > 0 && (
                <div className="dm-list">
                    {openDms.map((user) => {
                        const isToggled = toggledDms.includes(user.Username);
                        return (
                            <div key={user.Username} className="dm-container selector">
                                <div className="dm-header selector" onClick={() => handleToggleDm(user)}>
                                    <div
                                        className="dm-user"
                                    >
                                        {/*<svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-message" width="22" height="22" viewBox="0 0 24 24" strokeWidth="1.5" stroke="#ffffff" fill="none" strokeLinecap="round" strokeLinejoin="round">*/}
                                        {/*    <path stroke="none" d="M0 0h24v24H0z" fill="none" />*/}
                                        {/*    <path d="M8 9h8" />*/}
                                        {/*    <path d="M8 13h6" />*/}
                                        {/*    <path d="M18 4a3 3 0 0 1 3 3v8a3 3 0 0 1 -3 3h-5l-5 3v-3h-2a3 3 0 0 1 -3 -3v-8a3 3 0 0 1 3 -3h12z" />*/}
                                        {/*</svg>*/}
                                        <div className="user-status-icon"
                                            style={{
                                                background: user.IsOnline
                                                    ? 'linear-gradient(90deg, #0e4206, #37a127)'
                                                    : 'linear-gradient(90deg, #4d1111, #b53a3a)'
                                            }}
                                        ></div>
                                        {user.Username} Live Chat
                                    </div>
                                    <button className="dm-button-close selector" onClick={() => handleCloseDm(user)}>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-square-x" width="22" height="22" viewBox="0 0 24 24" strokeWidth="1.5" stroke="#ffffff" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                            <path d="M3 5a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-14z" />
                                            <path d="M9 9l6 6m0 -6l-6 6" />
                                        </svg>
                                    </button>
                                </div>

                                {isToggled && (
                                    <div className="dm-expanded">
                                        <DmChat key={user} participant={user} dmMessages={dmMessages} />
                                        <div className="dm-form-container selector">
                                            <form onSubmit={(e) => handleSubmit(e, user)} action="#" className="dm-message-form">
                                                <textarea cols="300" rows="2" placeholder="Message" className="chatroom-message-input" value={newMessage} onChange={handleOnChange} onKeyPress={(e) => handleKeyPress(e, user)}></textarea>
                                                <button type="submit" className="chatroom-message-submit">Send</button>
                                            </form>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </>
    );
}

export default UserList;