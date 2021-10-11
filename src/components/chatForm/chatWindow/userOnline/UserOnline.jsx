import React from 'react';
import './UserOnline.css';

const UserOnline = ({name}) => {
    return (<div className='user-chat'>
        <div className='user-chat-name'>{name}</div>
    </div>);
}

export default UserOnline;