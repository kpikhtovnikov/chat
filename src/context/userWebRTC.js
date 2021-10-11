class UserWebRTC {
    constructor() {
        this._user = {id: '', username: '', roomId: ''};
        this._isCameraOn = false;
        this._localStream = null;
        this._streams = {};
    }

    get user() {
        return this._user;
    }

    set user(value) {
        this._user = value;
    }

    get localId() {
        return this._id;
    }

    set localId(streamId) {
        this._id = streamId;
        this.addStream(streamId, this._localStream);
    }

    get localStream() {
        return this._localStream;
    }

    get isCameraOn() {
        return this._isCameraOn;
    }

    setLocalStream(stream, success) {
        if (success) {
            this._localStream = stream;
            this._isCameraOn = true;
        } else {
            this._isCameraOn = false;
        }
    }


    addStream(id, stream) {
        this._streams[id] = stream;
        if (this._id === id) {
            this._localStream = this._streams[id];
        }
        console.log(this._streams);
    }

    getTrack(id, type) {
        let track;
        if (this._streams[id] === undefined) {
            console.warn('Stream doesn\'t exist', id);
            return undefined;
        }
        console.log(type)
        switch (type) {
            case 'audio':
                track = this._streams[id].getAudioTracks()[0];
                break;
            case 'video':
                track = this._streams[id].getVideoTracks()[0];
                break;
            default:
                console.warn('Unknown stream type', type);
                return undefined;
        }
        return track;
    }

    removeStream(id) {
        if (this._streams[id] !== undefined)
            delete this._streams[id];
        console.log('delete stream')
    }

}

export const currentUserWebRTC = new UserWebRTC();