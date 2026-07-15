import { useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import type { ChatMessage, Conversation } from '../types/chat';

const API = import.meta.env.VITE_API_URL

interface Props {
    username: string | null;
    onConversationUpdate: (conversation: Conversation) => void;
    setConversations: any;
}

export function useWebSocket({ username, onConversationUpdate, setConversations }: Props) {
    const stompClient = useRef<Client | null>(null);
    const [incomingMessage, setIncomingMessage] = useState<ChatMessage | null>(null);
    const [incomingTyping, setIncomingTyping] = useState<{ sender: string, conversationId: string } | null>(null);
    const [readReceipt, setReadReceipt] = useState<{ conversationId: string } | null>(null);
    const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

    useEffect(() => {
        const client = new Client({
            webSocketFactory: () => new SockJS(`${API}/chat`),
            onConnect: () => {
                client.subscribe('/user/queue/conversations', msg => {
                    onConversationUpdate(JSON.parse(msg.body));
                });

                client.subscribe('/user/queue/messages', msg => {
                    const received: ChatMessage = JSON.parse(msg.body);
                    if (received.sender !== username) {
                        setIncomingMessage(received);

                        setConversations((prev: Conversation[]) => prev.map(c =>
                            c.id === received.conversationId ? { ...c, hasUnread: true } : c
                        ));

                        if (document.visibilityState === 'hidden' && Notification.permission === 'granted') {
                            new Notification(received.sender, {
                                body: received.content,
                                icon: '/tongtong3.png'
                            });
                        }
                    }
                });

                client.subscribe('/user/queue/typing', msg => {
                    setIncomingTyping(JSON.parse(msg.body));
                });

                client.subscribe('/user/queue/status', msg => {
                    const { username: user, online }: { username: string, online: boolean } = JSON.parse(msg.body);
                    setOnlineUsers(prev => {
                        const next = new Set(prev);
                        online ? next.add(user) : next.delete(user);
                        return next;
                    });
                });

                client.subscribe('/user/queue/read', msg => {
                    setReadReceipt(JSON.parse(msg.body));
                });
            }
        });

        client.activate();
        stompClient.current = client;
        return () => { client.deactivate(); };
    }, []);

    return { stompClient, incomingMessage, incomingTyping, readReceipt, onlineUsers, setOnlineUsers };
}