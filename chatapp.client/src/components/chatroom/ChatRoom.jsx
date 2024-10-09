/* eslint-disable react/prop-types */
import './chatroom.css';
import { useState, useEffect } from 'react';
import { encryptMessage, decryptMessage, formatDay, sortUsers } from '../../utils.js';
import ChatMessages from '../chatmessages/ChatMessages';
import UserList from '../userlist/UserList';

const ChatRoom = ({ connection, chatRoom, userOnline, openDms, setOpenDms, toggledDms, setToggledDms, dmMessages, setDmMessages}) => {
    const [chatMessages, setChatMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [usersTyping, setUsersTyping] = useState([]);

    // send message to SignalR hub
    const sendMessage = async () => {
        if (newMessage.trim() === "") {
            return;
        }

        let encryptedMessage;

        try {
            encryptedMessage = encryptMessage(newMessage);
        } catch (error) {
            console.error('Encryption error:', error);
            return;
        }

        await connection.invoke("SendMessage", encryptedMessage, chatRoom.Name)
            .catch(err => {
                console.error(err.toString());
                alert(err.message);
        });
        await connection.invoke("DeactivateTypingIndicator", chatRoom.Name)
            .catch(err => {
                console.error(err.toString());
                alert(err.message);
        });
        setNewMessage('');
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
            connection.invoke("ActivateTypingIndicator", chatRoom.Name)
                .catch(err => {
                    console.error(err.toString());
                    alert(err.message);
            });
        else 
            connection.invoke("DeactivateTypingIndicator", chatRoom.Name)
                .catch(err => {
                    console.error(err.toString());
                    alert(err.message);
            });

        setNewMessage(e.target.value);
    }

    // SignalR methods for receiving data
    useEffect(() => {
        if (connection && chatRoom?.Name) {

            connection.on(`ReceiveTypingIndicatorOn_${chatRoom.Name}`, (user) => {
                setUsersTyping((prev) => {
                    const found = prev.find((username) => username === user);
                    if (!found) {
                        return [...prev, user];
                    }
                    return prev;
                });
            });

            connection.on(`ReceiveTypingIndicatorOff_${chatRoom.Name}`, (user) => {
                setUsersTyping((prev) => {
                    return prev.filter((username) => username !== user);
                });
            });

            connection.on("ReceiveChatMessage", (msg) => {
                const obj = JSON.parse(msg);

                try {
                    obj.Message = decryptMessage(obj.Message);
                } catch (error) {
                    console.error('Decryption error:', error);
                    return;
                }

                let date = new Date(Date.parse(obj.DateTime));

                const day = formatDay(date)
                if (day)
                    date = `${day} at ${(date.getHours() < 10 ? '0' : '') + date.getHours()}:${(date.getMinutes() < 10 ? '0' : '') + date.getMinutes()}`;
                else
                    date = obj.ShortDate;

                obj.DateTime = date;

                setChatMessages(prevChatMessages => {
                    const filteredChatMessages = prevChatMessages.filter(x => x.Id !== obj.Id);
                    return [...filteredChatMessages, obj];
                });
            });

            return () => {
                connection.off(`ReceiveTypingIndicatorOn_${chatRoom.Name}`);
                connection.off(`ReceiveTypingIndicatorOff_${chatRoom.Name}`);
                connection.off("ReceiveChatMessage");
            };
        }
    }, [connection, chatRoom?.Name]);

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

    // update list of users with newly signed in user
    useEffect(() => {
        if (userOnline) {
            setUsers((prevUsers) => {
                const filteredUsers = prevUsers.filter(u => u.Username !== userOnline.Username);
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

                <ChatMessages chatRoom={chatRoom} chatMessages={chatMessages} usersTyping={usersTyping} />

                <div className="users-status-panel selector">

                    <UserList
                        chatRoom={chatRoom}
                        users={users}
                        openDms={openDms}
                        setOpenDms={setOpenDms}
                        toggledDms={toggledDms}
                        setToggledDms={setToggledDms}
                        connection={connection}
                        dmMessages={dmMessages}
                        setDmMessages={setDmMessages}
                    />

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