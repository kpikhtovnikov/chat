import React from 'react';
import './MessageTemplate.css';

const MessageTemplate = (props) => {
    const messageBlockPosition = props.isCurrentUser ? {
        alignSelf: 'flex-end',
        marginRight: '15px'
    } : {
        alignSelf: 'flex-start',
        marginLeft: '15px'
    };

    const textAlign = props.isCurrentUser ? {
        textAlign: 'right',
        marginRight: '5px'
    } : {
        textAlign: 'left',
        marginLeft: '5px'
    }

    const messageBodyColor = props.name === null ? {
        backgroundColor: 'rgb(186 187 173)',
        border: '3px solid rgb(98 93 92)'
    } : null;

    return (<div className='message-block' style={messageBlockPosition}>
        <div className='message-block_name' style={textAlign}>
            {props.name}
        </div>
        <div className='message-block-message-body' style={messageBodyColor}>
            <div className='message-block-message-body-text'>
                {props.text}
            </div>
            <div className='message-block-message-body-time' style={textAlign}>
                {props.time}
            </div>
        </div>
    </div>);
};

export default MessageTemplate;