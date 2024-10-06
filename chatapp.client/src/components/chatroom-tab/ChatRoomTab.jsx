/* eslint-disable react/prop-types */


const ChatRoomTab = ({ chatRoom, activeChatRoomId, usersOnline, handleChatRoomChange }) => {

    return (
        <div
            key={chatRoom.Id}
            className={"chatroom-tab " + (chatRoom.Id === activeChatRoomId ? 'selector' : '')}
            onClick={() => handleChatRoomChange(chatRoom.Id)}
        >
            {chatRoom.Name}
            {chatRoom.Users && chatRoom.Id != activeChatRoomId &&
                <div key="users" className="chatroom-tab-users">
                    <div key="users-online" className="chatroom-tab-users-online">
                        <div className="user-status-icon"
                            style={{ background: 'linear-gradient(90deg, #0e4206, #37a127)' }}
                        >
                        </div>
                        {usersOnline(chatRoom).length}
                        <div className="user-status-icon"
                            style={{ background: 'linear-gradient(90deg, #4d1111, #b53a3a)' }}
                        >
                        </div>
                        {chatRoom.Users.length - usersOnline(chatRoom).length}
                    </div>
                </div>
            }
        </div>
    )
}

export default ChatRoomTab;