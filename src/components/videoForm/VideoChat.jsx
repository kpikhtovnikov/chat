import React, {useContext, useEffect, useRef, useState} from 'react';
import './VideoChat.css';
import {SocketContext} from '../../context/SocketContext';
import {currentUserWebRTC} from '../../context/userWebRTC';
import VideoChatUser from './videoChatUser/VideoChatUser';
import {currentWebRTC} from '../../context/WebRTC';
import VideocamIcon from '@material-ui/icons/Videocam';
import VideocamOffIcon from '@material-ui/icons/VideocamOff';
import MicIcon from '@material-ui/icons/Mic';
import MicOffIcon from '@material-ui/icons/MicOff';
import CallEndIcon from '@material-ui/icons/CallEnd';

const VideoChat = () => {
    let context = useContext(SocketContext);
    const localVideoTag = useRef();
    const [listShowVideo, setListShowVideo] = useState([]);
    const [buttonCamera, setButtonCamera] = useState(true);
    const [buttonMic, setButtonMic] = useState(true);
    const [streamAccess, setStreamAccess] = useState(false);

    const handleEndCall = () => {
        context.userStream(false);
        currentUserWebRTC._isCameraOn = false;
        currentUserWebRTC._localStream = null;
        currentUserWebRTC._streams = {};
        let timeNow = new Date();
        let timeMinutes = timeNow.getMinutes().toString();
        timeMinutes = timeMinutes.length === 1 ? `0${timeMinutes}` : timeMinutes;
        let timeHours = timeNow.getHours().toString();
        timeHours = timeHours.length === 1 ? `0${timeHours}` : timeHours;
        context.socketSend({
            type: 'leaveWebRtc',
            data: {
                userId: context.userInfo.userId,
                username: context.userInfo.username,
                roomId: context.userInfo.roomId,
                time: `${timeHours}:${timeMinutes}`
            }
        })
        context.notLogged(false)
    };

    const getUserMedia = () => {
        return navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        }).then(stream => {
            setStreamAccess(true);
            context.userStream(true, stream);
            currentUserWebRTC.setLocalStream(stream, true);
        })
            .catch((error) => {
                context.userStream(false, null);
                setStreamAccess(false);
                alert('You have rejected the use of the camera and microphone, without it video chat cannot work. Please, change camera permission settings.');
                currentUserWebRTC.setLocalStream(null, false);
            }).finally(() => {
                currentUserWebRTC.localId = context.userInfo.userId;
            })
    }

    useEffect(()=>{
        currentUserWebRTC.user = {
            userId: context.userInfo.userId,
            username: context.userInfo.username,
            roomId: context.userInfo.roomId
        };
        getUserMedia();
    },[])

    useEffect(() => {
        if (streamAccess) {
            currentWebRTC.sendWebRTCMessage(undefined, 'newPeerReceived', undefined);
            let timeNow = new Date();
            let timeMinutes = timeNow.getMinutes().toString();
            timeMinutes = timeMinutes.length === 1 ? `0${timeMinutes}` : timeMinutes;
            let timeHours = timeNow.getHours().toString();
            timeHours = timeHours.length === 1 ? `0${timeHours}` : timeHours;
            context.socketSend({type: 'newWebRCT',
                data: {
                    userId: currentUserWebRTC.user.userId,
                    username: currentUserWebRTC.user.username,
                    roomId: currentUserWebRTC.user.roomId,
                    time: `${timeHours}:${timeMinutes}`
                }
            });
        }
    }, [streamAccess])

    useEffect(() => {
        if (context.localVideo && localVideoTag) {
            localVideoTag.current.srcObject = context.localVideo;
        }
    }, [context.localVideo])

    useEffect(() => {
        setListShowVideo(context.listVideo.filter(item => item !== context.userInfo.userId).map(videoItem => {
            return <VideoChatUser id={videoItem.id} type='remote' stream={videoItem.stream}/>
        }))
    }, [context.listVideo])

    return (<div>
        <div className='video-chat-block'>
            <div className='video-chat-block-list'>
                <div className='video-chat-user'>
                    <video autoPlay muted className='local-video' ref={localVideoTag}/>
                </div>
                {
                    listShowVideo.map(value => value)
                }
            </div>
        </div>
        <form className='video-chat-block-form'>
                <button type='button' onClick={() => {
                    context.toggleVideo();
                    setButtonCamera(!buttonCamera);
                }}>
                    {buttonCamera ? <VideocamIcon /> : <VideocamOffIcon/>}
                </button>
                <button type='button' onClick={() => {
                    context.toggleAudio();
                    setButtonMic(!buttonMic);
                }}>
                    {buttonMic ? <MicIcon/> : <MicOffIcon/>}
                </button>
                <button type='button' onClick={handleEndCall}>
                    <CallEndIcon/>
                </button>
            </form>
    </div>);
}

export default VideoChat;