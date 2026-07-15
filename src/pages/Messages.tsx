import { useEffect, useMemo, useRef, useState } from 'react';
import { useAuthContext } from '../AuthContext';

import "./Messages.css"

import ChatWindow from '../components/ChatWindow';
import { useWebSocket } from '../hooks/useWebSocket';
import type { Conversation } from '../types/chat';

const API = import.meta.env.VITE_API_URL

export default function Messages() {
    const { username, userId } = useAuthContext();
    const [usernameSearch, setUsernameSearch] = useState<string | null>(null);
    const [usernameSearchResponse, setUsernameSearchResponse] = useState<string | null>(null);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeReceiverId, setActiveReceiverId] = useState<string | null>(null);
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
    const [activeReceiverUsername, setActiveReceiverUsername] = useState<string | null>(null);

    const activeConversationIdRef = useRef<string | null>(null);

    useEffect(() => {
        activeConversationIdRef.current = activeConversationId;
    }, [activeConversationId]);

    const { stompClient, incomingMessage, incomingTyping, readReceipt, onlineUsers, setOnlineUsers } = useWebSocket({
        username,
        onConversationUpdate: (updated) => {
            setConversations(prev => {
                const exists = prev.find(c => c.id === updated.id);
                const next = exists
                    ? prev.map(c => c.id === updated.id ? {
                        ...updated,
                        hasUnread: c.hasUnread
                    } : c)
                    : [...prev, updated];
                return next.sort((a, b) => b.lastTimestamp - a.lastTimestamp);
            });
        },
        setConversations
    });

    const isReceiverOnline = activeReceiverUsername ? onlineUsers.has(activeReceiverUsername) : false;

    useEffect(() => {
        fetch(`${API}/api/user/online`, { credentials: 'include' })
            .then(res => res.ok ? res.json() : [])
            .then((data: string[]) => setOnlineUsers(new Set(data)));
    }, []);

    const [showPopup, setShowPopup] = useState(false);

    useEffect(() => {
        if (Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);



    useEffect(() => {
        fetch(`${API}/api/user/conversations`, { credentials: 'include' })
            .then(res => res.json())
            .then(data => setConversations(data.sort((a: Conversation, b: Conversation) => b.lastTimestamp - a.lastTimestamp)));
    }, []);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setShowPopup(false);
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, []);

    const sortedConversations = useMemo(
        () => [...conversations].sort((a, b) => b.lastTimestamp - a.lastTimestamp),
        [conversations]
    );

    const selectConversation = async (conversation: Conversation) => {
        setActiveConversationId(conversation.id);
        setActiveReceiverUsername(conversation.usernames.find(u => u !== username) ?? null);
        setActiveReceiverId(conversation.users.find(u => u !== userId) ?? null);
    };

    const startConversation = async () => {
        if (usernameSearch === null) return;

        const receiverUsername = usernameSearch;

        const response = await fetch(`${API}/api/user/conversation?username=${receiverUsername}`, {
            method: 'POST',
            credentials: 'include'
        });
        if (!response.ok) {
            setUsernameSearchResponse("Could not find username");
            return;
        }
        const convId = await response.text();
        setActiveConversationId(convId);

        const response2 = await fetch(`${API}/api/user/id?username=${receiverUsername}`, { credentials: 'include' });
        if (response2.ok) setActiveReceiverId(await response2.text());

        // setConversations(prev => prev.find(c => c.id === convId) ? prev : [...prev, {
        //     id: convId,
        //     usernames: [username!, receiverUsername],
        //     users: [],
        //     lastMessage: '',
        //     lastTimestamp: Date.now()
        // }]);
        setShowPopup(false);
    };

    const show = () => {
        setShowPopup(true)
    }

    const markRead = (convoId:string) => {
        console.log("READ")
        setConversations(prev => prev.map(c =>
            c.id === convoId ? { ...c, hasUnread: false } : c
        ));
    }

    return (
        <div className="messages-container">
            <div className="left-panel">
                <div className="conversations-list">
                    {sortedConversations.map(conversation => {

                        const receiverUsername = conversation.usernames.find(u => u !== username);
                        const isOnline = receiverUsername ? onlineUsers.has(receiverUsername) : false;

                        return (
                            <div key={conversation.id} className="conversation" onClick={() => selectConversation(conversation)}>
                                <div className={`conversation-header ${conversation.hasUnread ? 'unread' : ''}`}>
                                    <div className="sender-label">{conversation.usernames.find(u => u !== username) || "Deleted user"}</div>
                                    <span className={`${isOnline ? 'online' : 'offline'}`}></span>
                                </div>
                                <div className={`last-message-label ${conversation.hasUnread ? 'unread' : ''}`}>{conversation.lastMessage}</div>
                            </div>
                        )
                    })}
                    <button onClick={show} className="new-conversation">Create a new conversation</button>
                </div>
                <div className="user-display">logged in as "{username}"</div>
            </div>
            <ChatWindow
                receiverId={activeReceiverId}
                conversationId={activeConversationId}
                stompClient={stompClient}
                incomingMessage={incomingMessage}
                incomingTyping={incomingTyping}
                receiverUsername={activeReceiverUsername}
                isReceiverOnline={isReceiverOnline}
                readReceipt={readReceipt}
                onMarkRead={markRead}
            />

            {showPopup && (
                <div className="popup-overlay" onClick={e => e.target === e.currentTarget && setShowPopup(false)}>
                    <div className="search-box">
                        <div className="search-box-header">Enter username</div>
                        {usernameSearchResponse && <div className="search-response">{usernameSearchResponse}</div>}
                        <input
                            placeholder="Username"
                            onChange={e => { setUsernameSearch(e.target.value); setUsernameSearchResponse(''); }}
                            onKeyDown={e => e.key === 'Enter' && startConversation()}
                        />
                    </div>
                </div>)}
        </div>

    );
}