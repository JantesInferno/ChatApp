import { useEffect } from 'react';
import './chatroom.css';



const ChatRoom = () => {

    /*
    function showTypingIndicator() {
    const loadingMessage = `
        <div class="chatbox-message-item received loading">
            <div class="chatbox-message-item">
                <div class="chatbox-message-typing">
                    <img src="./images/icons8-bot-64.png" alt="Chatterbox typing" class="chatbox-message-typing-image">
                    <div class="typing">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            </div>
        </div>
    `;
    chatboxMessageWrapper.insertAdjacentHTML('beforeend', loadingMessage);
    scrollBottom();
}
    */

    useEffect(() => {

    }, [])

    return (
        <div className="chatbox-wrapper">
            <div className="chatbox-message-wrapper">
                <div className="chatbox-message-header">
                    <span>Global chat</span> {/* chatRoom.name*/ }
                </div>
                <div className="chatbox-message-content">
                    {/* chatRoom.messages.map(() => {})*/}
                    <div className="chatbox-message-item">
                        <div className="chatbox-message-sender">
                            <span className="chatbox-message-sender-text">John Doe</span>
                            <span className="chatbox-message-item-time">14:50</span>
                        </div>
                        <div className="chatbox-message-item sent">
                            <span className="chatbox-message-item-text">
                                Testmeddelande 1
                            </span>
                        </div>
                    </div>
                    <div className="chatbox-message-item">
                        <div className="chatbox-message-sender">
                            <span className="chatbox-message-sender-text">Jane Doe</span>
                            <span className="chatbox-message-item-time">14:52</span>
                        </div>
                        <div className="chatbox-message-item sent">
                            <span className="chatbox-message-item-text">
                                Det här är ett svar på ditt mycket intressanta meddelande
                            </span>
                        </div>
                    </div>
                    <div className="chatbox-message-item">
                        <div className="chatbox-message-sender">
                            <span className="chatbox-message-sender-text">Jane Doe</span>
                            <span className="chatbox-message-item-time">14:52</span>
                        </div>
                        <div className="chatbox-message-item sent">
                            <span className="chatbox-message-item-text">
                                Det här är ett svar på ditt mycket intressanta meddelande
                            </span>
                        </div>
                    </div>
                    <div className="chatbox-message-item">
                        <div className="chatbox-message-sender">
                            <span className="chatbox-message-sender-text">Jane Doe</span>
                            <span className="chatbox-message-item-time">14:52</span>
                        </div>
                        <div className="chatbox-message-item sent">
                            <span className="chatbox-message-item-text">
                                Det här är ett svar på ditt mycket intressanta meddelande
                            </span>
                        </div>
                    </div>
                    <div className="chatbox-message-item">
                        <div className="chatbox-message-sender">
                            <span className="chatbox-message-sender-text">John Doe</span>
                            <span className="chatbox-message-item-time">14:50</span>
                        </div>
                        <div className="chatbox-message-item sent">
                            <span className="chatbox-message-item-text">
                                Testmeddelande 1
                            </span>
                        </div>
                    </div>
                    <div className="chatbox-message-item">
                        <div className="chatbox-message-sender">
                            <span className="chatbox-message-sender-text">John Doe</span>
                            <span className="chatbox-message-item-time">14:50</span>
                        </div>
                        <div className="chatbox-message-item sent">
                            <span className="chatbox-message-item-text">
                                Testmeddelande 1
                            </span>
                        </div>
                    </div>
                    <div className="chatbox-message-item">
                        <div className="chatbox-message-sender">
                            <span className="chatbox-message-sender-text">John Doe</span>
                            <span className="chatbox-message-item-time">14:50</span>
                        </div>
                        <div className="chatbox-message-item sent">
                            <span className="chatbox-message-item-text">
                                Testmeddelande 1
                            </span>
                        </div>
                    </div>
                    <div className="chatbox-message-item">
                        <div className="chatbox-message-sender">
                            <span className="chatbox-message-sender-text">John Doe</span>
                            <span className="chatbox-message-item-time">14:50</span>
                        </div>
                        <div className="chatbox-message-item sent">
                            <span className="chatbox-message-item-text">
                                Testmeddelande 1
                            </span>
                        </div>
                    </div>
                    
                    
                </div>
                <div className="chatbox-message-bottom">
                    <div className="chatbox-message-typing">
                        <div className="typing">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                        <span>John</span> {/* {users.typing.map((user) => {})}  */}
                        <span>&nbsp;is typing...</span>
                    </div>
                    <form action="#" className="chatbox-message-form">
                        <textarea cols="200" rows="1" placeholder="Message" className="chatbox-message-input"></textarea>
                        <button type="button" className="chatbox-message-submit">Send</button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default ChatRoom;