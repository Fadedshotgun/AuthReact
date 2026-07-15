export const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = date.toDateString() == yesterday.toDateString();

    if (isToday) {
        return date.toLocaleString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    } else if (isYesterday) {
        return "Yesterday at " + date.toLocaleString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    } else {
        return date.toLocaleDateString('en-US') + " " + date.toLocaleString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });;
    }
}

export const formatReadTimestamp = (timestamp: number | null | undefined) => {
    if (typeof timestamp !== 'number' || Number.isNaN(timestamp)) return;

    const now = Date.now();

    const diffInMs = now - timestamp;

    const msInMinute = 1000 * 60;

    const date = new Date(timestamp);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = date.toDateString() == yesterday.toDateString();

    const minutes = Math.floor(diffInMs / msInMinute);
    if (minutes < 1) {
        return "Read just now";
    } else if (minutes < 60) {
        return "Read " + minutes + "m ago";
    } else if (minutes < 1440) {
        return "Read " + Math.floor(minutes/60) + "h ago";
    } else if (isYesterday) {
        return "Read yesterday";
    } else {
        return "Read on " + date.toLocaleDateString('en-US');
    }
}