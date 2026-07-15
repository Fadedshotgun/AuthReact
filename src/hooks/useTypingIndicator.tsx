import { useEffect, useState } from 'react';

export function useTypingIndicator(incomingTyping: { sender: string, conversationId: string } | null, conversationId: string | null) {
    const [isTyping, setIsTyping] = useState(false);

    useEffect(() => {
        if (!incomingTyping) {setIsTyping(false); return;}
        if (incomingTyping.conversationId !== conversationId) return;
        setIsTyping(true);
        const timeout = setTimeout(() => setIsTyping(false), 1000);
        return () => clearTimeout(timeout);
    }, [incomingTyping]);

    return {isTyping, setIsTyping};
}