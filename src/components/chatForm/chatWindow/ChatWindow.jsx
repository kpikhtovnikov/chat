import React, {useContext, useRef, useEffect, useState} from 'react';
import {SocketContext} from '../../../context/SocketContext';
import MessagesWindow from "./messagesWindow/MessagesWindow";
import UserOnline from './userOnline/UserOnline';
import './ChatWindow.css';

const ChatWindow = () => {
    let context = useContext(SocketContext);
    const inputRef = useRef();
    const [listOfMembers, setListOfMembers] = useState([]);

    const handleMessageSend = () => {
        let timeNow = new Date();
        let timeMinutes = timeNow.getMinutes().toString();
        timeMinutes = timeMinutes.length === 1 ? `0${timeMinutes}` : timeMinutes;
        let timeHours = timeNow.getHours().toString();
        timeHours = timeHours.length === 1 ? `0${timeHours}` : timeHours;
        // console.log("Message", context.userInfo);
        context.socketSend({
            type: 'message',
            data: {
                user: context.userInfo?.userId,
                username: context.userInfo?.username,
                room: context.userInfo?.roomId,
                text: inputRef.current?.value,
                time: `${timeHours}:${timeMinutes}`
            }
        });
        inputRef.current.value = "";
    }

    useEffect(() => {
        // console.log(context.listOfMembers)
        setListOfMembers(context.listOfMembers?.map(value => {
            return <UserOnline name={value.username} key={Math.random().toString(36).substr(2, 9)}/>
        }));
    }, [context.listOfMembers])

    return (<div className='chat-window'>
        <div className='chat-list-members'>
                Online in chat room
                <div className='block-chat-user chat-users'>
                    {listOfMembers?.map(value => value)}
                </div>
            <MessagesWindow/>
            <form className='chat-window-form' onSubmit={(e) => {
            e.preventDefault();
            handleMessageSend();
        }}>
            <input className='chat-window-form-input' placeholder='typing message...' ref={inputRef}
                   type='text'/>
        </form>
        </div>
    </div>);
}

export default ChatWindow;