import { Client } from '@stomp/stompjs';
import { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { useAuthContext } from '../AuthContext';
import { v4 } from 'uuid';

import "./ChatWindow.css"
import { TypingIndicator } from './TypingIndictor';

import type { ChatMessage } from '../types/chat';
import { Message } from './Message';
import { useMessages } from '../hooks/useMessages';
import { useTypingIndicator } from '../hooks/useTypingIndicator';
import { formatReadTimestamp } from '../utils/time';

interface Props {
    conversationId: string | null;
    receiverId: string | null;
    stompClient: React.RefObject<Client | null>;
    incomingMessage: ChatMessage | null;
    incomingTyping: { sender: string, conversationId: string } | null;
    receiverUsername: string | null;
    isReceiverOnline: boolean;
    readReceipt: { conversationId: string } | null;
    onMarkRead: (conversationId: string) => void;
}

export default function ChatWindow(props: Props) {
    const { username } = useAuthContext();
    const { messages, addMessage, loadMore, hasMore, initialLoad, isLoadingMore, markAllRead } = useMessages(props.conversationId, props.incomingMessage, props.stompClient, username, props.readReceipt);
    const { isTyping, setIsTyping } = useTypingIndicator(props.incomingTyping, props.conversationId);

    const [message, setMessage] = useState('');

    const isAtBottom = useRef(true);
    const isAtVeryBottom = useRef(true);

    const bottomRef = useRef<HTMLDivElement | null>(null);
    const chatRef = useRef<HTMLDivElement | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const prevScrollHeight = useRef(0);

    const lastReadIndex = messages.findLastIndex(m => m.sender === username && m.readAt);

    const markRead = () => {
        props.stompClient.current?.publish({
            destination: `/app/chat/read/${props.conversationId}`,
            body: ''
        });
        markAllRead();
        props.onMarkRead?.(props.conversationId!);
    };

    const handleScroll = () => {
        if (!chatRef.current || isLoadingMore) return;

        isAtBottom.current = chatRef.current.scrollHeight - chatRef.current.scrollTop - chatRef.current.clientHeight < 150;
        isAtVeryBottom.current = chatRef.current.scrollHeight - chatRef.current.scrollTop - chatRef.current.clientHeight < 50;

        if (chatRef.current.scrollTop === 0 && hasMore) {
            prevScrollHeight.current = chatRef.current.scrollHeight;
            loadMore();
        }

        if (isAtVeryBottom.current) {
            markRead();
        }
    };

    useEffect(() => {
        if (!initialLoad) return;
        requestAnimationFrame(() => {
            bottomRef.current?.scrollIntoView({ behavior: 'instant' });
        });
    }, [initialLoad]);

    const prevMessageCount = useRef(0);

    useLayoutEffect(() => {
        if (!initialLoad) return;

        if (prevScrollHeight.current > 0 && chatRef.current) {
            // load more
            chatRef.current.scrollTop = chatRef.current.scrollHeight - prevScrollHeight.current;
            prevScrollHeight.current = 0;
        } else if (messages.length === prevMessageCount.current + 1 && isAtBottom.current) {
            // new message
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        }

        prevMessageCount.current = messages.length;
    }, [messages]);

    useEffect(() => {
        setIsTyping(false);
    }, [props.incomingMessage]);

    useEffect(() => {
        if (!isTyping || !isAtBottom.current) return;
        bottomRef.current?.scrollIntoView({ behavior: 'instant' });
    }, [isTyping]);

    const sendMessage = () => {
        const trimmed = message.trim();

        if (!props.receiverId || !trimmed) return;
        props.stompClient.current?.publish({
            destination: `/app/chat/send/${props.receiverId}`,
            body: JSON.stringify({ content: trimmed })
        });
        addMessage({
            id: v4(),
            sender: username!,
            receiver: props.receiverId!,
            content: trimmed,
            timestamp: Date.now(),
            conversationId: props.conversationId!
        });
        setMessage('');
    };

    if (!props.conversationId) return (
        <div className="chat-window-empty">
            <div>Seems like theres nothing here... {':c'}</div>
        </div>
    );

    const handleTyping = () => {
        props.stompClient.current?.publish({
            destination: `/app/chat/typing/${props.receiverUsername}`,
            body: JSON.stringify({ conversationId: props.conversationId })
        });
    };

    const handleInputKeyDown = (e: any) => {
        if (e.key === 'Enter') {
            if (e.shiftKey) {
        
            } else {
                e.preventDefault();
                sendMessage()
                if (textareaRef.current) textareaRef.current.style.height = 'auto';
            }
        }
    }

    const autoResize = () => {
        if (!textareaRef.current) return;
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    };

    return (
        <div className="chat-window">
            <div className="chat-window-header">
                <div className="header-username">{props.receiverUsername}</div>
                <span className={`status-dot ${props.isReceiverOnline ? 'online' : 'offline'}`}></span>
            </div>
            <div className="chat-messages" ref={chatRef} onScroll={handleScroll}>
                {isLoadingMore && <div className='loading-more-messages'>Fetching messages...</div>}
                {initialLoad && messages.map((m, i) => (
                    <>
                        <Message key={m.id} m={m} usern={username!} />
                        {i === lastReadIndex && m.sender === username && (
                            <div className="read-receipt">{formatReadTimestamp(m.readAt)}</div>
                        )}
                    </>
                ))}

                {messages.length == 0 && !initialLoad && <div className="loading-messages">Fetching messages...</div>}
                {messages.length == 0 && initialLoad && <div className="loading-messages">You have no messages with this user yet, say hello!</div>}

                {isTyping && <TypingIndicator />}

                <div ref={bottomRef}></div>
            </div>
            <div className="chat-input">
                <textarea
                    className="chat-input-text"
                    value={message}
                    onChange={e => { setMessage(e.target.value); handleTyping(); autoResize(); }}
                    onKeyDown={handleInputKeyDown}
                    placeholder="Message"
                    rows={1}
                    ref={textareaRef}
                    maxLength={2000}
                />
                {message.length > 1000 && (
                    <div className={`char-counter ${message.length > 1700 ? 'danger' : ''}`}>{2000 - message.length}</div>
                )}
                <button onClick={sendMessage}>{'>'}</button>
            </div>
        </div>
    );
}