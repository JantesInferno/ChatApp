/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { decryptMessage, formatDay } from '../../utils.js';
import ChatRoom from "../chatroom/ChatRoom";
import ChatRoomTab from "../chatroom-tab/ChatRoomTab";
import CreateChatRoom from '../create-chatroom/CreateChatRoom.jsx';
import './chatOverview.css';


const ChatOverview = () => {

    const [connection, setConnection] = useState();
    const [chatRooms, setChatRooms] = useState([]);
    const [activeChatRoomId, setActiveChatRoomId] = useState();
    const [userOnline, setUserOnline] = useState();
    const [hasJoinedRoom, setHasJoinedRoom] = useState(false);

    const { chatRoomIdFromUrl } = useParams();
    const navigate = useNavigate();

    // change the active chat room
    const handleChatRoomChange = async (chatRoomId) => {
        setActiveChatRoomId(chatRoomId);
        if (chatRoomId != activeChatRoomId)
            refreshChatRooms();
    };

    // create new chatroom from CreateChatRoom component
    const createChatRoom = async (chatRoomName) => {
        console.log(chatRoomName);

        await connection.invoke("CreateChatRoom", chatRoomName)
            .catch(err => {
                console.error(err.toString());
                alert(err.message);
            });
    }

    // return users online
    const usersOnline = (chatRoom) => {
        return chatRoom.Users.filter(user => user.IsOnline == true);
    }

    // invoke method on hub to join a chat room
    const joinChatRoom = async (chatRoomId) => {
        if (chatRoomId && !hasJoinedRoom) {
            await connection.invoke("JoinChatRoom", chatRoomId)
                .catch(err => {
                    console.error(err.toString());
                    alert(err.message);
                    return;
                });
            setActiveChatRoomId(chatRoomId);
            refreshChatRooms();
        }
    };

    // update current chat room data
    const refreshChatRooms = async () => {
        if (connection) {
            await connection.invoke("FetchChatData")
                .catch(err => {
                    console.error(err.toString());
                    alert(err.message);
            });
        }
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
                    connection.on("UserOnlineStatusUpdate", (user) => {
                        setUserOnline(JSON.parse(user));
                    });
                    connection.on("ReceiveData", (data) => {
                        const obj = JSON.parse(data);

                        obj.forEach(x => {
                            x.ChatMessages.forEach(cm => {
                                console.log("meddelande innan dekryptering:", cm.Message)

                                try {
                                    cm.Message = decryptMessage(cm.Message);
                                } catch (error) {
                                    console.error('Decryption error:', error);
                                    return;
                                }

                                console.log("meddelande efter dekryptering:", cm.Message)

                                let date = new Date(Date.parse(cm.DateTime));

                                const day = formatDay(date)
                                if (day)
                                    date = `${day} at ${(date.getHours() < 10 ? '0' : '') + date.getHours()}:${(date.getMinutes() < 10 ? '0' : '') + date.getMinutes()}`;
                                else 
                                    date = cm.ShortDate;

                                cm.DateTime = date;
                            })
                        })
                            
                        setChatRooms(obj);
                    });

                    return () => {
                        connection.off("UserOnlineStatusUpdate");
                        connection.off("ReceiveData");
                    };
                })
                .catch(error =>
                    console.error(error.toString()));
        }
    }, [connection]);

    // Set active chat room when chatRooms changes
    useEffect(() => {
        if (
            connection &&
            chatRoomIdFromUrl &&
            chatRoomIdFromUrl.toLowerCase() !== activeChatRoomId &&
            !hasJoinedRoom
        ) {
            const room = chatRooms.find((room) => room.Id === chatRoomIdFromUrl);
            if (room) {
                setActiveChatRoomId(chatRoomIdFromUrl.toLowerCase());
                setHasJoinedRoom(true);
            } else {
                joinChatRoom(chatRoomIdFromUrl).then(() => {
                    setHasJoinedRoom(true);
                });
            }
        } else if (chatRooms.length > 0 && !activeChatRoomId) {
            setActiveChatRoomId(chatRooms[0].Id);
            setHasJoinedRoom(true);
        }
    }, [chatRooms, chatRoomIdFromUrl, activeChatRoomId, hasJoinedRoom]);


    return (

        <>
            {/* Links to different chatrooms */}
            <div className="chatrooms-nav">
            <div className="chatrooms-open-list">
                    {activeChatRoomId != null && chatRooms.map((room) => (
                        <ChatRoomTab key={room.Id} chatRoom={room} activeChatRoomId={activeChatRoomId} usersOnline={usersOnline} handleChatRoomChange={handleChatRoomChange} />
                ))}

                
                </div>
                {chatRooms.length > 0 && (
                    <CreateChatRoom createChatRoom={createChatRoom} />
                )}

            </div>

            {/* Render current active chat room */}
            {connection && chatRooms.length > 0 && activeChatRoomId && (
                <ChatRoom
                    key={activeChatRoomId}
                    connection={connection}
                    chatRoom={chatRooms.find((room) => room.Id === activeChatRoomId)}
                    userOnline={userOnline}
                />
            )}
        </>
    )
}

export default ChatOverview;