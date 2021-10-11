const roomsData = [];
const usersData = [];

module.exports = {
    //getting users in room
    getRoomMembers: roomId => {
        let room = roomsData.find(roomValue => roomValue.roomId === roomId);
        return room !== undefined ? room.listOfMembers : null;
    },
    //stream on/off
    roomIsStreamOn: roomId => {
        let room = roomsData.find(roomValue => roomValue.roomId === roomId);
        return room !== undefined ? room.isStreamOn : null;
    },
    //information for send message
    getUserInfo: userId => {
        let username = usersData.find(userValue => userValue.userId === userId);

        return username !== undefined ? username : null;
    },
    //getting username
    getUsername: userId => {
        let username = usersData.find(userValue => userValue.userId === userId);

        return username !== undefined ? username.username : null;
    },
    //adding user
    addNewUser: (userId, userName, roomId) => {
        usersData.push({
            userId,
            username: userName,
            roomId
        });
        let roomIndex = roomsData.findIndex(roomValue => roomValue.roomId === roomId);
        if (roomIndex !== -1) {
            roomsData[roomIndex].listOfMembers.push({userId, username: userName});
        } else {
            roomsData.push({
                roomId,
                isStreamOn: false,
                listOfMembers: [{userId, username: userName}]
            });
        }
    },
    addNewUserToRoom: (userId, roomId, userName) => {
        let roomIndex = roomsData.findIndex(roomValue => roomValue.roomId === roomId);
        if (roomIndex !== -1) {
            roomsData[roomIndex].listOfMembers.push({userId, username: userName});
        } else {
            roomsData.push({
                roomId,
                isStreamOn: false,
                listOfMembers: [{userId, username: userName}]
            });
        }
    },
    //delete user
    removeUser: (userId, roomId) => {
        try {
            if (roomId.includes('video')) {
                let roomsIndex = roomsData.findIndex(roomValue => roomValue.roomId === roomId);
                let userIndexInRoom = roomsData[roomsIndex].listOfMembers.findIndex(userValue => userValue.userId === userId);
                roomsData[roomsIndex].listOfMembers.splice(userIndexInRoom, 1);

                if (roomsData[roomsIndex].listOfMembers.length === 0) {
                    roomsData.splice(roomsIndex, 1);
                    return false;
                } else {
                    return true;
                }
            } else {
                let userIndex = usersData.findIndex(userValue => userValue.userId === userId);
                if (userIndex !== -1) {
                    usersData.splice(userIndex, 1);

                    let roomsIndex = roomsData.findIndex(roomValue => roomValue.roomId === roomId);
                    if (roomsIndex !== -1) {
                        let userIndexInRoom = roomsData[roomsIndex].listOfMembers.findIndex(userValue => userValue.userId === userId);
                        roomsData[roomsIndex].listOfMembers.splice(userIndexInRoom, 1);

                        if (roomsData[roomsIndex].listOfMembers.length === 0) {
                            roomsData.splice(roomsIndex, 1);
                        }
                    }
                }
            }
        } catch (e) {
            console.log(e);
        }
    },
    //on stream
    setStreamOn: (roomId) => {
        let roomIndex = roomsData.findIndex(roomValue => roomValue.roomId === roomId);
        if (roomIndex !== -1) {
            roomsData[roomIndex].isStreamOn = true;
        }
    },
    //off stream
    setStreamOff: (roomId) => {
        let roomIndex = roomsData.findIndex(roomValue => roomValue.roomId === roomId);
        if (roomIndex !== -1) {
            roomsData[roomIndex].isStreamOn = false;
        }
    }
};