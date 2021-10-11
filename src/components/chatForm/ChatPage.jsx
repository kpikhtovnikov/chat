import React from 'react';
import './ChatPage.css';
import '../videoForm/VideoChat.css'
import ChatWindow from './chatWindow/ChatWindow';
import VideoChat from "../videoForm/VideoChat";

const ChatPage = () => {

    return (   
        <section className="main-section">
            <div className="container">
                <div className={'video-page'}>
                    <VideoChat/>
                    <ChatWindow/>
                </div>
            </div>
        </section>
    );
}

export default ChatPage;