export interface ChatMessage {
    id: string;
    sender: string;
    receiver: string;
    content: string;
    timestamp: number;
    conversationId: string;
    readAt?: number | null;
}

export interface Conversation {
    id: string;
    users: string[];
    usernames: string[];
    lastMessage: string;
    lastTimestamp: number;
    hasUnread: boolean;
}
