import './ChatWindow.css';

export function TypingIndicator() {
    return (
        <div className="message-container received">
            <div className="arrow recieved-arrow"></div>
            <div className={`message received`}>
                <div className="message-content typing">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        </div>
    );
}