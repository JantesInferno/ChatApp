/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import ChatRoom from "../chatroom/ChatRoom";
import './chatOverview.css';


const ChatOverview = () => {

    const [connection, setConnection] = useState();
    const [chatRooms, setChatRooms] = useState([]);
    const [activeChatRoomId, setActiveChatRoomId] = useState();

    const { chatRoomIdFromUrl } = useParams();
    const navigate = useNavigate();

    // Handler to change the active chat room
    const handleChatRoomChange = async (chatRoomId) => {
        setActiveChatRoomId(chatRoomId);
        if (chatRoomId != activeChatRoomId)
            refreshChatRooms();
    };

    const usersOnline = (chatRoom) => {
        return chatRoom.Users.filter(user => user.IsOnline == true);
    }

    const joinChatRoom = async (chatRoomId) => {
        if (chatRoomId) {
            try {
                await connection.invoke("JoinChatRoom", chatRoomId);
                refreshChatRooms();
                setActiveChatRoomId(chatRoomId);
            } catch (error) {
                console.error("Error while joining chat room:", error);
            }
        }
    };

    const refreshChatRooms = async () => {
        if (connection) {
            try {
                await connection.invoke("FetchChatData");
            } catch (error) {
                console.error("Error while fetching chat data:", error);
            }
        }
    }

    // check if message's date is the current date
    function sameDay(d1) {
        let d2 = new Date();
        return d1.getFullYear() === d2.getFullYear() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getDate() === d2.getDate();
    }

    // set up connection to SignalR hub with token
    useEffect(() => {
        if (!connection) {
            let token = sessionStorage.getItem('token');
            
            if (token) {
                try {
                    const conn = new HubConnectionBuilder().withUrl("https://localhost:7063/chathub", {
                        accessTokenFactory: () => {
                            return token;
                        }
                    }).configureLogging(LogLevel.Information).build();

                    setConnection(conn);
                } catch (error) {
                    console.error("Error while connecting to chathub:", error);
                }
            }
            else {
                const currentPath = location.pathname + location.search;
                const encodedRedirect = encodeURIComponent(currentPath);
                if (!location.pathname.startsWith('/signin'))
                    navigate(`/signin?redirect=${encodedRedirect}`);
            }
        }
    }, []);

    // SignalR methods for receiving data
    useEffect(() => {
        if (connection) {
            connection.start()
                .then(function () {
                    connection.on("ReceiveMessage", (user) => {
                        // ******************************** TODO ********************************
                        console.log(user);
                    });
                    connection.on("ReceiveData", (data) => {
                        let obj = JSON.parse(data);

                        console.log(obj);

                        obj.forEach(x => {
                            x.ChatMessages.forEach(y => {
                                var date = new Date(Date.parse(y.DateTime));
                                if (sameDay(date))
                                    date = `today at ${(date.getHours() < 10 ? '0' : '') + date.getHours()}:
                                                    ${(date.getMinutes() < 10 ? '0' : '') + date.getMinutes()}`;
                                else 
                                    date = y.ShortDate;

                                y.DateTime = date;
                            })
                        })
                            
                        setChatRooms(obj);
                    });
                })
                .catch(error =>
                    console.error(error.toString()));
        }
    }, [connection]);

    // Set active chat room when `chatRooms` or `chatRoomIdFromUrl` changes
    useEffect(() => {
        if (connection && chatRoomIdFromUrl && chatRoomIdFromUrl.toLowerCase() != activeChatRoomId) {
            console.log("chatRoomIdFromUrl", chatRoomIdFromUrl);
            console.log("activeChatRoomId", activeChatRoomId);
            const room = chatRooms.find((room) => room.Id == chatRoomIdFromUrl);
            if (room) {
                setActiveChatRoomId(chatRoomIdFromUrl.toLowerCase());
            } else {
                joinChatRoom(chatRoomIdFromUrl);
            }
        } else if (chatRooms.length > 0 && !activeChatRoomId) {
            setActiveChatRoomId(chatRooms[0].Id);
        }
    }, [chatRooms]);

    // ******************************** TODO ********************************

    // Online/offline users in a list attached to each chat room
    return (

        <>
            {/* Links to different chatrooms */}
            <div className="navbar">
            <div className="chatrooms-list">
                {activeChatRoomId != null && chatRooms.map((room) => (
                    <div
                        key={room.Id}
                        className={"chatroom-tab " + (room.Id === activeChatRoomId ? 'selector' : '')}
                        onClick={() => handleChatRoomChange(room.Id)}
                        >
                        {/*<button*/}
                        {/*    className="chatroom-tab-button"*/}
                        {/*    onClick={() => handleChatRoomChange(room.Id)}*/}
                        {/*    style={{*/}
                        {/*        background: room.Id === activeChatRoomId ? 'linear-gradient(145deg, #332cf2, #4d9e41)' : '#111',*/}
                        {/*        fontWeight: room.Id === activeChatRoomId ? 'bold' : 'normal',*/}
                        {/*    }}*/}
                        {/*>*/}
                        {/*    {room.Name}*/}
                        {/*</button>*/}
                        {room.Name}
                        {room.Users && room.Id != activeChatRoomId &&
                            <div key="users" className="chatroom-tab-users">
                                <div key="users-online" className="chatroom-tab-users-online">
                                    <div className="user-status-icon"
                                        style={{ background: 'linear-gradient(90deg, #0e4206, #37a127)' }}
                                    >
                                    </div>
                                    {usersOnline(room).length}
                                    <div className="user-status-icon"
                                        style={{ background: 'linear-gradient(90deg, #4d1111, #b53a3a)' }}
                                    >
                                    </div>
                                    {room.Users.length - usersOnline(room).length}
                                </div>
                            </div>
                        }
                    </div>
                ))}

                
                </div>

                <button className="test selector">
                    Create New Chat Room
                </button>

            </div>

            {/* Render currently active chat room */}
            {connection && chatRooms.length > 0 && activeChatRoomId && (
                <ChatRoom
                    connection={connection}
                    chatRoom={chatRooms.find((room) => room.Id === activeChatRoomId)}
                />
            )}
        </>
    )
}

export default ChatOverview;