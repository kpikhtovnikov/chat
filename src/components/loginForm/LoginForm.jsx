import React, {useContext, useEffect, useRef} from 'react';
import {SocketContext} from '../../context/SocketContext';
import './LoginForm.css';

const LoginForm = () => {
    const inputRef = useRef();
    const socketContext = useContext(SocketContext);

    //sending request to login chat
    const onConnect = () => {
        if (inputRef.current) {
            let timeNow = new Date();
            let timeMinutes = timeNow.getMinutes().toString();
            timeMinutes = timeMinutes.length === 1 ? `0${timeMinutes}` : timeMinutes;
            let timeHours = timeNow.getHours().toString();
            timeHours = timeHours.length === 1 ? `0${timeHours}` : timeHours;
            socketContext.socketSend({
                type: 'join',
                data: {room: socketContext.room, username: inputRef.current.value, time: `${timeHours}:${timeMinutes}`}
            })
        }
    }

    useEffect(() => {
        if(socketContext.errorMessage.loggedError && inputRef){
            inputRef.current.style.backgroundColor = 'rgba(255, 234, 231, 30)';
            setTimeout(() => {inputRef.current.style.backgroundColor = 'rgb(253, 254, 255)';}, 500)
        }
    }, [socketContext.errorMessage.loggedError]);

    useEffect(() => {
        if(inputRef) {
            inputRef.current.focus();
        }
    }, [inputRef]);

    return (<div className='login-page'>
        <header className='login-page-header'>Enter the room</header>
        <form className='login-page-form' onSubmit={(e) => {
            e.preventDefault();
            onConnect();
        }}>
            <input className='login-page-form-input' placeholder='Username' ref={inputRef} type='text'/>
            <button className='login-page-form-button' type='button' onClick={onConnect}>Go!</button>
        </form>
    </div>);

}

export default LoginForm;