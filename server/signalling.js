const socket_io = require('socket.io');
const roomsData = require('./roomsData');

module.exports = function (server) {
    const io = socket_io(server, {
        cors: {
            origin: "*"
        },
        transports: ['websocket'],
        secure: true
    });

    io.on('connect', socket => {
        //send message all users in room
        const sendMessage = (room, username, time, text, userSendingMessage) => {
            io.to(room).emit('send:message', {username, time, text, userSendingMessage});
        }

        //send quantity online users in room
        const updateList = (listOfUsers, room) => {
            io.to(room).emit('change:list', listOfUsers);
        }

        //update new user
        const handleJoin = (data) => {
            const {room, username, time} = data;

            if (username !== '' && username !== undefined && username !== null && username !== ' ') {
                roomsData.addNewUser(socket.id, username, room);
                let listUsersOnline = roomsData.getRoomMembers(room);
                let isStreamOnline = roomsData.roomIsStreamOn(room);
                socket.emit('logged', {
                    roomId: room,
                    username: username,
                    userId: socket.id,
                    listOnline: listUsersOnline,
                    isStreamOnline
                });

                socket.join(room);
                sendMessage(room, null, time, `${username} in room!`, socket.id);
                updateList(listUsersOnline, room);
            } else {
                socket.emit('error', {errorType: 'loggedError'});
            }
        }

        //delete user
        const handleDisconnect = () => {
            let user = roomsData.getUserInfo(socket.id);
            let date = new Date();

            if (user !== null) {
                roomsData.removeUser(user.userId, user.roomId);
                roomsData.removeUser(user.userId, 'webrtc' + user.roomId);
                let listUsersOnline = roomsData.getRoomMembers(user.roomId);
                updateList(listUsersOnline, user.roomId);
                sendMessage(user.roomId, user.username, `${date.getHours()}:${date.getMinutes()}`, `${user.username} just left chat room!`, socket.id);
            }
        }

        //send message
        const handleMessage = (data) => {
            if (data.text !== null && data.text !== undefined && data.text !== '' && data.text !== ' ')
                sendMessage(data.room, data.username, data.time, data.text, data.user);
            else {
                socket.emit('error', {errorType: 'messageError'});
            }
        }

        //webRTC connection
        const handleWebRTCConnection = (data) => {
            try {
                let room = 'webrtc' + data.roomId;
                let userTo = roomsData.getUserInfo(data.userTo);
                if (data.userTo !== undefined && userTo !== null) {
                    io.sockets.to(userTo.userId).emit('webRTC', data);
                } else {
                    socket.broadcast.to(room).emit('webRTC', data);
                }
            } catch (error) {
                console.log(error);
            }
        }

        //new user webRTC
        const handleWebRTCNewMember = (data) => {
            let room = 'webrtc' + data.roomId;
            roomsData.addNewUserToRoom(data.userId, data.username, room);
            if (!roomsData.roomIsStreamOn(data.roomId)) {
                roomsData.setStreamOn(data.roomId);
                io.to(data.roomId).emit('streamOn', null);
                sendMessage(data.roomId, data.username, data.time, `${data.username} just start video chat! Join it!`, data.userId);
            } else {
                sendMessage(data.roomId, data.username, data.time, `${data.username} just join video chat! Join it too!`, data.userId);
            }
            socket.join(room);
        }

        //delete webRTC
        const handleLeaveVideoChat = (data) => {
            let room = 'webrtc' + data.roomId;
            socket.leave(room);
            io.to(room).emit('userLeftRTC', data.userId);
            if (roomsData.removeUser(data.userId, room))
                sendMessage(data.roomId, data.username, data.time, `${data.username} just left video chat!`, data.userId);
            else {
                io.to(data.roomId).emit('streamOff', null);
                sendMessage(data.roomId, data.username, data.time, `${data.username} just end video chat!`, data.userId);
            }
        }

        const handleSetUserName = (data) => {
            let username = roomsData.getUsername(data.id);
            console.log(username);
            socket.emit('setUserName', {name: username});
        }

        //Sockets
        socket.on('join', handleJoin);
        socket.on('disconnect', handleDisconnect);
        socket.on('message', handleMessage);
        socket.on('getUserName', handleSetUserName)
        socket.on('webRTC', handleWebRTCConnection);
        socket.on('newWebRCT', handleWebRTCNewMember);
        socket.on('leaveChat', handleDisconnect);
        socket.on('leaveWebRtc', handleLeaveVideoChat);
    });
}