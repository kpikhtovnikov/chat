import {React, useContext} from 'react';
import {SocketContext} from '../../context/SocketContext';
import ChatPage from "../chatForm/ChatPage";
import LoginForm from "../loginForm/LoginForm";

const MainPage = () => {
    const socketContext = useContext(SocketContext);
    return (<div className={socketContext.logged? 'main-page-chat': 'main-page'}>
        {socketContext.logged ? <ChatPage/> : <LoginForm/>}
    </div>);
}

export default MainPage;