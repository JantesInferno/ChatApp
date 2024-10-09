/* eslint-disable react/prop-types */
import { useEffect } from 'react';
import DmChat from '../dmchat/DmChat';
import './userlist.css';

const UserList = ({ chatRoom, users, openDms, setOpenDms, toggledDms, setToggledDms }) => {

    const handleDm = (user) => {
        setOpenDms((prev) => {
            const found = prev.find((u) => u.Username === user.Username);
            if (!found) {
                return [...prev, user];
            }
            return prev;
        });
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

    useEffect(() => {
        setOpenDms((prevOpenDms) => {
            return prevOpenDms.map((dmUser) => {
                const updatedUser = users.find((u) => u.Username === dmUser.Username);
                return updatedUser ? { ...dmUser, IsOnline: updatedUser.IsOnline } : dmUser;
            });
        });
    }, [users]);

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
                                        <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-message" width="22" height="22" viewBox="0 0 24 24" strokeWidth="1.5" stroke="#ffffff" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                            <path d="M8 9h8" />
                                            <path d="M8 13h6" />
                                            <path d="M18 4a3 3 0 0 1 3 3v8a3 3 0 0 1 -3 3h-5l-5 3v-3h-2a3 3 0 0 1 -3 -3v-8a3 3 0 0 1 3 -3h12z" />
                                        </svg>
                                        <div className="user-status-icon"
                                            style={{
                                                background: user.IsOnline
                                                    ? 'linear-gradient(90deg, #0e4206, #37a127)'
                                                    : 'linear-gradient(90deg, #4d1111, #b53a3a)'
                                            }}
                                        ></div>
                                        {user.Username}
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
                                        <DmChat />
                                        <div className="dm-form-container selector">
                                            <form action="#" className="dm-message-form">
                                                <textarea cols="300" rows="2" placeholder="Message" className="chatroom-message-input"></textarea>
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