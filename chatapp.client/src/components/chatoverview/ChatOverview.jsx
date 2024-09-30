//import { useEffect } from 'react';
import ChatRoom from "../chatroom/ChatRoom";


const ChatOverview = () => {

    //const [chatRooms, setChatRooms] = useState([]);

    //useEffect(() => {
    //    // get all current users chatrooms, with chatmessage history and users FROM DB
    //}, [])

    // ChatRoom components with a list of chatmessage components
    // Toggle between rooms
    // Online/offline users in a list attached to each chat room
    return (
        <>
            {/* Links to different chatrooms from db
                Mark current chat room
                */}
            <ChatRoom />
            {/* <ChatRoom room={chatRoomsFromDB[clicked chatroom]} */ }
        </>
    )
}

export default ChatOverview;