import './App.css';
import {useEffect, useState} from 'react';
import {v4 as uuidv4} from 'uuid';
import {SocketContextProvider} from './context/SocketContext';
import MainPage from './components/mainPage/MainPage';


function App() {
    const [room, setRoom] = useState();

    useEffect(() => {
        //componentDidMount
        const params = (new URL(window.location)).searchParams;
        let room = params.get('room');
        if (!room) {
            room = uuidv4();
            window.location = `?room=${room}`
        }
        setRoom(room);
    }, []);

    return (<SocketContextProvider room={room}>
        <MainPage/>
    </SocketContextProvider>);
}

export default App;
