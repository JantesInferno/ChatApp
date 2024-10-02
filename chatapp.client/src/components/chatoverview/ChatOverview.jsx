/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import ChatRoom from "../chatroom/ChatRoom";


const ChatOverview = () => {

    const [connection, setConnection] = useState();
    const [chatRooms, setChatRooms] = useState([]);

    function sameDay(d1) {
        let d2 = new Date();
        return d1.getFullYear() === d2.getFullYear() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getDate() === d2.getDate();
    }

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


    useEffect(() => {
        if (connection) {
            connection.start()
                .then(function () {
                    connection.on("ReceiveMessage", (msg) => {
                        console.log(msg);
                    });
                    connection.on("ReceiveData", (data) => {
                        let obj = JSON.parse(data);
                        console.log("obj", obj);
                        console.log("Name", obj[0].Name);

                        obj.forEach(x => {
                            x.ChatMessages.forEach(y => {
                                var date = new Date(Date.parse(y.DateTime));
                                if (sameDay(date)) {
                                    date = `today at ${(date.getHours() < 10 ? '0' : '') + date.getHours() }:${(date.getMinutes() < 10 ? '0' : '') + date.getMinutes() }`;
                                }
                                else {
                                    date = y.ShortDate;
                                }
                                y.DateTime = date;
                            })
                        })

                        console.log(obj);

                        setChatRooms(obj);

                    });
                })
                .catch(error =>
                    console.error(error.toString()));
        }
    }, [connection]);

    // ChatRoom components with a list of chatmessage components
    // Toggle between rooms
    // Online/offline users in a list attached to each chat room
    return (
        <>
            {/* Links to different chatrooms from db
                Mark current chat room
                */}
            {connection && chatRooms.length > 0
                ?
                <ChatRoom connection={connection} chatRoom={chatRooms[0]} />
                : null
            }
            {/* <ChatRoom connection={connection} chatRoom={chatRooms[0]} />*/}
        </>
    )
}

export default ChatOverview;