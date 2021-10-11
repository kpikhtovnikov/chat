import {currentUserWebRTC} from './userWebRTC';

const STUN_URL = 'stun:stun.l.google.com:19302';

class WebRTC {
    constructor() {
        this._connectionCount = 0;
        this._peers = {};

        this.server = {
            iceServers: [{urls: STUN_URL}]
        };
    }


    set onSrcObject(functionState) {
        this._onSrcObject = functionState;
    }

    set onUserLeft(functionState) {
        this._onUserLeft = functionState;
    }

    set socket(socketConnection) {
        this._socket = socketConnection;
    }

    set userId(id) {
        this._userId = id;
    }

    set roomId(id) {
        this._roomId = id;
    }

    sendWebRTCMessage = (userTo, type, message) => {
        console.log('webRTC', {userId: this._userId, userTo, type, data: message});
        this._socket.emit('webRTC', {userId: this._userId, roomId: this._roomId, userTo, type, data: message})
    }

    get connectionCount() {
        return this._connectionCount;
    }

    set connectionCount(value) {
        this._connectionsCount = value;
    }

    onBeforeUnload = () => {
        console.log(this._peers)
        for (let id in this._peers) {
            if (this._peers.hasOwnProperty(id)) {
                if (this._peers[id].channel !== undefined) {
                    try {
                        this._peers[id].channel.close();
                    } catch (e) {
                        console.error(e);
                    }
                }
            }
        }
    }

    socketReceived = (value) => {
        let id = value.userId;
        let to = value.userTo;
        let type = value.type;
        let data = value.data;
        switch (type) {
            case 'newPeerReceived':
                this.newPeerReceived(id);
                break;
            case 'candidate':
                this.remoteCandidateReceived(id, data);
                break;
            case 'offer':
                this.remoteOfferReceived(id, data);
                break;
            case 'answer':
                this.remoteAnswerReceived(id, data);
                break;
            default:
                console.log(`Unknown type received from socket:`);
                console.log({id, to, type, data});
                break;
        }
    }

    newPeerReceived = async (id) => {
        this.createConnection(id);
        const peerConnection = this._peers[id].connection;
        const tracks = this._peers[id].tracks;

        this.initConnection(id, peerConnection, this);

        await this.initMedia(id, tracks, peerConnection, this);
        await peerConnection.createOffer().then(offer => {
            return peerConnection.setLocalDescription(offer).then(() => {
                this.sendWebRTCMessage(id, 'offer', offer);
            }).catch(error => console.error('Error set local description', error));
        }).catch(error => console.error('Error create offer', error));
    }

    remoteAnswerReceived = async (id, answer) => {
        const peerConnection = this._peers[id].connection;
        await peerConnection.setRemoteDescription(answer).catch(error => console.error('Error set remote description', error));
    }

    remoteCandidateReceived = async (id, candidate) => {
        this.createConnection(id);
        const peerConnection = this._peers[id].connection;
        await peerConnection.addIceCandidate(candidate)
            .catch(error => console.error('Error add iceCandidate', error));
    }

    remoteOfferReceived = async (id, offer) => {
        this.createConnection(id);
        const peerConnection = this._peers[id].connection;
        const tracks = this._peers[id].tracks;

        await this.initMedia(id, tracks, peerConnection, this);

        this.initConnection(id, peerConnection, this);

        await peerConnection.setRemoteDescription(offer).then(() => {
            peerConnection.createAnswer().then(answer => {
                return peerConnection.setLocalDescription(answer).then(() => {
                    this.sendWebRTCMessage(id, "answer", answer);
                }).catch(error => console.error('Error set local description', error));
            }).catch(error => console.error('Error create answer', error));
        }).catch(error => console.error('Error set remote description', error));
    }

    initConnection = (id, peerConnection, target) => {
        peerConnection.onicecandidate = function (event) {
            if (event.candidate)
                target.sendWebRTCMessage(id, "candidate", event.candidate)
        }

        peerConnection.oniceconnectionstatechange = () => {
            switch (peerConnection.iceConnectionState) {
                case 'disconnected': {
                    delete this._peers[id];
                    currentUserWebRTC.removeStream(id);
                    this.connectionsCount = this.connectionsCount - 1;
                    this._onUserLeft({userId: id});
                    console.log(`[${id}] disconnected. Peers: ${this.connectionsCount}`);
                    break;
                }
                case 'connected': {
                    this.connectionsCount = this.connectionsCount + 1;
                    console.log(`[${id}] connected. Peers: ${this.connectionsCount}`);
                    break;
                }

                default:
                    console.log(peerConnection.iceConnectionState);
                    break;
            }
        }
    }

    initMedia = async (id, tracks, peerConnection, target) => {
        console.log('initmedia')
        peerConnection.ontrack = function ({streams: [stream]}) {
            currentUserWebRTC.addStream(id, stream);
            target._onSrcObject(id, stream);
        }

        if (currentUserWebRTC.localStream !== undefined)
            currentUserWebRTC.localStream.getTracks().forEach(track => {
                console.log('Adding new track', [peerConnection, track]);
                if (!tracks.includes(track)) {
                    tracks.push(track);
                    peerConnection.addTrack(track, currentUserWebRTC.localStream);
                }
            })
    }

    createConnection = (id) => {
        if (this._peers[id] === undefined) {
            this._peers[id] = {};
            this._peers[id].tracks = [];
            this._peers[id].connection =
                new RTCPeerConnection(this.server);
            console.log(this._peers[id]);
        }
    }
}

export const currentWebRTC = new WebRTC();