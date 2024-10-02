/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import ChatRoom from "../chatroom/ChatRoom";


const ChatOverview = () => {

    const [connection, setConnection] = useState();
    const [chatRooms, setChatRooms] = useState([]);
    const [activeChatRoomId, setActiveChatRoomId] = useState(chatRooms.length > 0 ? chatRooms[0].Id : null);

    // Handler to change the active chat room
    const handleChatRoomChange = async (chatRoomId) => {
        setActiveChatRoomId(chatRoomId);
        await connection.invoke("FetchChatData");
    };

    // check if message's date is the current date
    function sameDay(d1) {
        let d2 = new Date();
        return d1.getFullYear() === d2.getFullYear() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getDate() === d2.getDate();
    }

    // set up connection to SignalR hub with token
    useEffect(() => {
        let token = sessionStorage.getItem('token');
        if (token) {
            const conn = new HubConnectionBuilder().withUrl("https://localhost:7063/chathub", {
                accessTokenFactory: () => {
                    return token;
                }
            }).configureLogging(LogLevel.Information).build();

            setConnection(conn);
        }
    }, []);

    // SignalR methods for receiving data
    useEffect(() => {
        if (connection) {
            connection.start()
                .then(function () {
                    connection.on("ReceiveMessage", (msg) => {
                        // ******************************** TODO ********************************
                        console.log(msg);
                    });
                    connection.on("ReceiveData", (data) => {
                        let obj = JSON.parse(data);

                        console.log(obj);

                        obj.forEach(x => {
                            x.ChatMessages.forEach(y => {
                                var date = new Date(Date.parse(y.DateTime));
                                if (sameDay(date))
                                    date = `today at ${(date.getHours() < 10 ? '0' : '') + date.getHours() }:${(date.getMinutes() < 10 ? '0' : '') + date.getMinutes() }`;
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

    // ******************************** TODO ********************************

    // Online/offline users in a list attached to each chat room
    return (

        <>
            {/* Links to different chatrooms */}
            <div className="chatroom-links">
                {chatRooms.map((room) => (
                    <button
                        key={room.Id}
                        onClick={() => handleChatRoomChange(room.Id)}
                        style={{
                            margin: '0.5rem',
                            padding: '0.5rem 1rem',
                            backgroundColor: room.Id === activeChatRoomId ? '#007bff' : '#111',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                        }}
                    >
                        {room.Name}
                    </button>
                ))}
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