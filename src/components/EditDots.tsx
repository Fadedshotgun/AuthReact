import { useState } from "react";

interface Props {
    messageid: string
}

export default function EditDots(props: Props) {
    const [menuPos, setMenuPos] = useState({ x: 0, y: 0, visible: false });

    const del = () => {
        hide();
        console.log("delete message " + props.messageid)
    }

    const edit = () => {
        hide();
        console.log("edit message")
    }

    const show = (e:any) => {
        setMenuPos({x: e.pageX - 5, y: e.pageY - 5, visible:true})
    }

    const hide = () => {
        setMenuPos({x: 0, y: 0, visible:false})
    }

    return (
        <div className="edit-dots">
            <div className="dots-container" onClick={show}>
                <span className="edit-dot"></span>
                <span className="edit-dot"></span>
                <span className="edit-dot"></span>
            </div>
            {menuPos.visible && <div onMouseLeave={hide} className="dots-menu" style={{ top: menuPos.y, left: menuPos.x, position: 'absolute' }}>
                <div onClick={del} className="dots-option">Delete</div>
                <div onClick={edit} className="dots-option">Edit</div>
            </div>}
        </div>
    )
}