import { useEffect, useState, useRef } from 'react';
import { Client } from '@stomp/stompjs';

const API = import.meta.env.VITE_API_URL

import type { ChatMessage } from '../types/chat';


export function useMessages(conversationId: string | null, incomingMessage: ChatMessage | null, stompClient: React.RefObject<Client | null>, username: string | null, readReceipt: {conversationId: string} | null ) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [hasMore, setHasMore] = useState(true);
    const [initialLoad, setInitialLoad] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const pageRef = useRef(0);

    useEffect(() => {
        if (!readReceipt) return;
        if (readReceipt.conversationId !== conversationId) return;
        setMessages(prev => prev.map(m =>
            m.sender === username ? { ...m, readAt: Date.now() } : m
        ));
    }, [readReceipt]);

    useEffect(() => {
        if (!conversationId) return;
        const abortController = new AbortController();

        pageRef.current = 0;
        setMessages([]);
        setHasMore(true);
        setInitialLoad(false);

        fetch(`${API}/api/user/messages/${conversationId}?page=0`, { credentials: 'include', signal: abortController.signal })
            .then(res => res.ok ? res.json() : [])
            .then((data: ChatMessage[]) => {
                if (data.length < 50) setHasMore(false);
                const reversed = [...data].reverse();
                setMessages(reversed);
                setInitialLoad(true);

                stompClient.current?.publish({
                    destination: `/app/chat/read/${conversationId}`,
                    body: ''
                });
            })
            .catch(err => {
                if (err.name === 'AbortError') return;
            });

        return () => abortController.abort();
    }, [conversationId]);

    useEffect(() => {
        if (!incomingMessage) return;
        if (incomingMessage.conversationId !== conversationId) return;
        setMessages(prev => [...prev, incomingMessage].sort((a, b) => a.timestamp - b.timestamp));
    }, [incomingMessage]);

    const loadMore = async () => {
        if (!hasMore || !conversationId || isLoadingMore) return;
        setIsLoadingMore(true);
        pageRef.current += 1;

        const res = await fetch(`${API}/api/user/messages/${conversationId}?page=${pageRef.current}`, { credentials: 'include' });
        if (!res.ok) { setIsLoadingMore(false); return; }
        const data = await res.json();
        if (data.length < 50) setHasMore(false);
        setMessages(prev => [...data.reverse(), ...prev]);
        setIsLoadingMore(false);
    };

    const markAllRead = () => {
        setMessages(prev => prev.map(m =>
            m.receiver === username ? { ...m, readAt: Date.now() } : m
        ));
    };

    const addMessage = (msg: ChatMessage) => setMessages(prev => [...prev, msg].sort((a, b) => a.timestamp - b.timestamp));

    return { messages, addMessage, loadMore, hasMore, initialLoad, isLoadingMore, markAllRead };
}