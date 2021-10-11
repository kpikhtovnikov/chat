import React, {useCallback, useEffect, useRef, useState} from 'react';
import {io} from 'socket.io-client';
import {currentWebRTC} from './WebRTC';
import {currentUserWebRTC} from "./userWebRTC";

const LOCALHOST = 'http://localhost:8080' ;

const DEFAULT_SOCKET = {};

const SocketContext = React.createContext(DEFAULT_SOCKET);

const SocketContextProvider = props => {
    const {children, room} = props;
    const [roomId, setRoom] = useState(props.room);
    const [socket, setSocket] = useState();
    const [logged, setLogged] = useState(false);
    const [userInfo, setUserInfo] = useState();
    const [listOfMembers, setListOfMembers] = useState();
    const [isStreamOn, setIsStreamOn] = useState(false);
    const [newMessage, setNewMessage] = useState();
    const [errorMessage, setErrorMessage] = useState({loggedError: false, messageError: false});
    const [localVideo, setLocalVideo] = useState();
    const [listVideo, setListVideo] = useState([]);
    const [userVideoName, setUserVideoName] = useState(null);

    const listRef = useRef([]);

    const toggleVideo = () => {
        console.log(localVideo)
        localVideo.getVideoTracks().forEach(track => track.enabled = !track.enabled)
    }

    const toggleAudio = () => {
        localVideo.getAudioTracks().forEach(track => track.enabled = !track.enabled)
    }

    //Create and socket in state
    useEffect(() => {
        console.log(roomId)
        if (room) {
            setSocket(io(LOCALHOST, {
                    transports: ['websocket', 'polling']
                }
            ));
        }
    }, [roomId]);

    //room id 
    useEffect(() => {
        console.log(props.room)
        setRoom(props.room);
    }, [props.room])

    //is connection "ok"
    const onConnect = useCallback(() => {
        if (socket)
            console.log(socket?.connected);
    }, [socket?.connected]);

    //Exit room
    const onDisconnect = () => {
        console.log('disconnect')
        let array = listVideo.map(value => value);
        let index = listVideo.findIndex(value => value.id === userInfo.userId);
        array.splice(index, 1);
        setListVideo(array.map(value => value));
        setLogged(false);
        setNewMessage(undefined);
        setUserInfo(undefined);
        setListOfMembers(undefined);
        setIsStreamOn(false);
        currentWebRTC.onBeforeUnload();
        // setLogged(false);
    }

    const onMessage = (data) => {
        setNewMessage({
            userId: data.userSendingMessage,
            username: data.username,
            text: data.text,
            time: data.time
        });
    }

    const onSrcObject = (id, stream) => {
        if (listRef.current.find(value => value.id === id) === undefined) {
            setListVideo((prevState) => {
                    return [
                        ...prevState, {id, stream}
                    ]
                }
            )
            listRef.current.push({id, stream});
        }
    }

    const onLogged = (data) => {
        setUserInfo({
            username: data.username,
            userId: data.userId,
            roomId: data.roomId,
            isOnStream: false
        });
        setIsStreamOn(data.isStreamOnline);
        currentWebRTC.socket = socket;
        currentWebRTC.userId = data.userId;
        currentWebRTC.roomId = data.roomId;
        currentWebRTC.onSrcObject = onSrcObject;
        currentWebRTC.onUserLeft = onHandleUserLeft;
        setLogged(true);
    }

    const notLogged = (data) => {
        setLogged(false);
    }

    const onUpdateList = (data) => {
        setListOfMembers(data);
    }

    const onHandleError = (data) => {
        if (data.errorType === 'loggedError') {
            setErrorMessage(prevState => {
                return {...prevState, loggedError: true}
            })
        } else {
            setErrorMessage(prevState => {
                return {...prevState, messageError: true}
            })
        }
    }

    const onHandleStreamOn = () => {
        setIsStreamOn(true);
    }

    const onHandleStreamOff = () => {
        setIsStreamOn(false);
    }

    const onHandleSetUserName = (data) => {
        setUserVideoName(data.name);
    }

    const onHandleUserLeft = (data) => {
        currentWebRTC.onBeforeUnload();
        currentWebRTC._peers[data.userId] = undefined;
        delete currentWebRTC._peers[data.userId];
        currentUserWebRTC.removeStream(data.userId);
        currentWebRTC.connectionsCount = currentWebRTC.connectionsCount - 1;
        let array = listRef.current.map(value => value);
        let index = listRef.current.findIndex(value => value.id === data.userId);
        array.splice(index, 1);
        setListVideo(array.map(value => value));
        listRef.current = array.map(value => value);
    }

    useEffect(() => {
        if (!logged)
            return;
        window.addEventListener("beforeunload", finishAllTasks);
        window.addEventListener("beforeunload", finishAllTasks);
        return () => {
            window.removeEventListener("beforeunload", finishAllTasks);
            window.removeEventListener("beforeunload", finishAllTasks);
        };
    }, [logged]);

    const finishAllTasks = () => {
        console.log(currentWebRTC)
        currentWebRTC.onBeforeUnload();
        console.log(currentWebRTC)
        //clear webRTC connections
        socketSend({
            type: 'leaveWebRtc', data: {
                userId: userInfo.userId,
                username: userInfo.username,
                roomId: userInfo.roomId
            }
        });
        //clear user lists
        socketSend({
            type: 'leaveChat', data: {
                userId: userInfo.userId,
                username: userInfo.username,
                roomId: userInfo.roomId
            }
        });
    }

    useEffect(() => {
        if (socket && room) {
            socket.on('connect', onConnect);
            socket.on('disconnect', onDisconnect);
            socket.on('logged', onLogged);
            socket.on('send:message', onMessage);
            socket.on('change:list', onUpdateList);
            socket.on('error', onHandleError);
            socket.on('streamOn', onHandleStreamOn);
            socket.on('streamOff', onHandleStreamOff);
            socket.on('setUserName', onHandleSetUserName);
            socket.on('userLeftRTC', onHandleUserLeft);
            socket.on('webRTC', currentWebRTC.socketReceived);
        }
    }, [socket])


    const socketSend = useCallback(({type, data}) => {
        if (socket) {
            socket.emit(type, data);
            setErrorMessage({loggedError: false, messageError: false});
        }
    }, [socket]);

    const userStream = (isOnStream, mediaStream) => {
        setUserInfo((prevState) => {
            return {...prevState, isOnStream}
        });
        if (isOnStream)
            setLocalVideo(mediaStream);
        else {
            currentWebRTC.onBeforeUnload();
        }
    }

    return (
        <SocketContext.Provider
            value={{
                room,
                socket,
                socketSend,
                logged,
                notLogged,
                newMessage,
                isStreamOn,
                listOfMembers,
                userInfo,
                errorMessage,
                userStream,
                localVideo,
                listVideo,
                userVideoName,
                toggleVideo,
                toggleAudio
            }}>
            {children}
        </SocketContext.Provider>
    )
}

export {SocketContext, SocketContextProvider};
