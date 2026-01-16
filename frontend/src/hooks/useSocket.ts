import { useEffect, useState } from "react"

const WS_URL = 'ws://localhost:8080'


export const useSocket = ()=>{
    const [socket, setSocket] = useState<WebSocket | null>(null)
    
    useEffect(()=>{
        const ws = new WebSocket(WS_URL);
        let isOpen = false;
        
        ws.onopen = ()=>{
            setSocket(ws);
            isOpen = true;
        }
        
        ws.onclose = ()=>{
            setSocket(null);
        }
        
        return ()=>{
            if(isOpen){
                ws.close();
            }
        }
    }, [])

    return socket;
}