import type { ChatMessage } from '../types/chat';
import { formatTimestamp } from '../utils/time';
import './ChatWindow.css';

import { memo } from 'react';
import EditDots from './EditDots';

export const Message = memo(function Message({ m, usern }: { m: ChatMessage, usern: string}) {
    const isSent = m.sender === usern;

    const isImage = (url: string) => {
    return /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i.test(url);
};

const renderContent = (content: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = content.split(urlRegex);

    return parts.map((part, i) => {
        const testRegex = /(https?:\/\/[^\s]+)/;
        if (!testRegex.test(part)) return part;

        if (isImage(part)) {
            return (
                <a key={i} href={part} target="_blank" rel="noopener noreferrer">
                    <img
                        src={part}
                        alt="image"
                        className="message-embed"
                        onError={e => {
                            e.currentTarget.style.display = 'none';
                        }}
                    />
                </a>
            );
        }

            return (
                <a key={i} href={part} target="_blank" rel="noopener noreferrer">
                    {part}
                </a>
            );
        });
    };

    return (
        <>
            <div className={`message-container ${isSent ? 'sent' : 'received'}`}>

                {!isSent && <div className="arrow recieved-arrow"></div>}
                {isSent && <EditDots messageid={m.id} />}

                <div className={`message ${isSent ? 'sent' : 'received'}`}>
                    <div className="message-header">
                        <div className="message-username">{m.sender}</div>
                        <div className="message-date">{formatTimestamp(m.timestamp)}</div>
                    </div>
                    <div className="message-content">{renderContent(m.content)}</div>
                </div>

                {isSent && <div className="arrow sent-arrow"></div>}
                {!isSent && <EditDots messageid={m.id} />}

            </div>
        </>
    );
});