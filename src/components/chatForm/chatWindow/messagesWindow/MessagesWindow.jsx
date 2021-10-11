import React, {useContext, useEffect, useRef, useState} from 'react';
import {SocketContext} from '../../../../context/SocketContext';
import MessageTemplate from './messageTemplate/MessageTemplate';
import './MessagesWindow.css';

const MessagesWindow = () => {
    const context = useContext(SocketContext);
    const [listOfMessages, setListOfMessages] = useState([]);

    const messageBlockRef = useRef();
    const listOfMessagesRef = useRef();

    useEffect(() => {
        if (context.newMessage) {
            setListOfMessages(prevState => [...prevState, 
            <MessageTemplate name={context.newMessage.username}
                time={context.newMessage.time}
                text={context.newMessage.text}
                isCurrentUser={context.newMessage.userId === context.userInfo.userId}
                key={Math.random().toString(36).substr(2, 9)}
            />]
            )
        }
    }, [context.newMessage])

    return (<div className='messages-window'>
        <div className='messages-window-block' ref={messageBlockRef} >
            <div className='messages-window-block-list-of-messages' ref={listOfMessagesRef}>
                {listOfMessages?.map(value => value)}
            </div>
        </div>
    </div>);
}

export default MessagesWindow;