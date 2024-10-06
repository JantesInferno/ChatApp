/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import ChatRoom from "../chatroom/ChatRoom";
import ChatRoomTab from "../chatroom-tab/ChatRoomTab";
import './chatOverview.css';


const ChatOverview = () => {

    const [connection, setConnection] = useState();
    const [chatRooms, setChatRooms] = useState([]);
    const [activeChatRoomId, setActiveChatRoomId] = useState();
    const [userOnline, setUserOnline] = useState();

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
    function formatDay(messageDate) {
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
                        // ******************************** TODO ********************************
                        setUserOnline(JSON.parse(user));
                    });
                    connection.on("ReceiveData", (data) => {
                        let obj = JSON.parse(data);

                        obj.forEach(x => {
                            x.ChatMessages.forEach(y => {
                                var date = new Date(Date.parse(y.DateTime));

                                let day = formatDay(date)
                                if (day)
                                    date = `${day} at ${(date.getHours() < 10 ? '0' : '') + date.getHours()}:
                                                    ${(date.getMinutes() < 10 ? '0' : '') + date.getMinutes()}`;
                                else 
                                    date = y.ShortDate;

                                y.DateTime = date;
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

    // Set active chat room when `chatRooms` or `chatRoomIdFromUrl` changes
    useEffect(() => {
        if (connection && chatRoomIdFromUrl && chatRoomIdFromUrl.toLowerCase() != activeChatRoomId) {
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
            <div className="chatrooms-nav">
            <div className="chatrooms-open-list">
                    {activeChatRoomId != null && chatRooms.map((room) => (
                        <ChatRoomTab key={room.Id} chatRoom={room} activeChatRoomId={activeChatRoomId} usersOnline={usersOnline} handleChatRoomChange={handleChatRoomChange} />
                ))}

                
                </div>

                <button className="test selector">
                    Create New Chat Room
                </button>

            </div>

            {/* Render currently active chat room */}
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