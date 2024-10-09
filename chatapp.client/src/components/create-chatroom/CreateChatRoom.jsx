/* eslint-disable react/prop-types */
import { useState, useRef, useEffect } from 'react';
import './createchatroom.css';

const CreateChatRoom = ({ createChatRoom }) => {
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [chatRoomName, setChatRoomName] = useState('');

    const popupRef = useRef(null);

    // open/close popup
    const togglePopup = () => {
        setIsPopupOpen(!isPopupOpen);
    }

    // submit and create a new chat room and clean up
    const handleChatRoomCreation = () => {
        if (chatRoomName.trim() === "") {
            return;
        }

        createChatRoom(chatRoomName);
        setIsPopupOpen(false);
        setChatRoomName('');
    }

    // submit if Enter key pressed
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleChatRoomCreation();
        }
    }

    // add an eventlistener to close the popup on outside mouse clicks
    useEffect(() => {
        if (isPopupOpen) {
            document.addEventListener('mousedown', (e) => {
                if (popupRef.current && !popupRef.current.contains(e.target)) {
                    setIsPopupOpen(false);
                }
            });
        }
    }, [isPopupOpen]);

    return (
        <div className="create-chatroom-container">
            {!isPopupOpen && (
                <button className="create-chatroom-button-popup" onClick={togglePopup}>
                    Create New Chat Room
                </button>
            )}

            {isPopupOpen && (
                <div className="create-chatroom-popup selector" ref={popupRef}>
                    <div className="create-chatroom-form">
                        <input
                            className="create-chatroom-input"
                            type="text"
                            placeholder="Chat room name"
                            value={chatRoomName}
                            onChange={(e) => setChatRoomName(e.target.value)}
                            onKeyPress={handleKeyPress}
                        />
                        <button className="create-chatroom-button-submit" onClick={handleChatRoomCreation}>
                            Create
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default CreateChatRoom;