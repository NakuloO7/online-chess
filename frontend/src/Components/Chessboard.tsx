import type { Color, PieceSymbol, Square } from "chess.js";
import { useState } from "react";
import { MOVE } from "../screens/Game";


export const Chessboard = ({board, socket, setBoard, chess} : {
    chess : any,
    setBoard : any,
    board : ({
            square: Square;
            type: PieceSymbol;
            color: Color;
        } | null)[][],
        socket : WebSocket;
})=>{

    const [from, setFrom] = useState<null | Square>(null);

    return <div className="text-white-200">
        {board.map((row, i)=>{
            return <div key={i} className="flex">
                {row.map((square, j)=>{
                    const squreRepresentation = String.fromCharCode(97 + (j%8)) + "" + (8-i) as Square;
                    return <div onClick={()=>{
                        if(!from){
                            setFrom(squreRepresentation)
                        }else{
                            socket.send(JSON.stringify({
                                type : MOVE, 
                                payload : {
                                    move :{
                                        from, 
                                        to : squreRepresentation
                                    }
                                }
                            }))
                            setFrom(null);
                            chess.move({
                                    from,
                                    to : squreRepresentation
                                });
                            setBoard(chess.board());
                            console.log({
                                from,
                                to : squreRepresentation
                            })
                        }
                    }} key={j} className={`w-16 h-16 ${(i+j)%2===0 ? "bg-green-500" : "bg-white"}`}>
                        <div className="flex justify-center w-full h-full">
                            <div className="flex justify-center h-full flex-col ">
                               {square ? <img className="w-4" src={`/${square?.color ==="b"? square?.type : `${square?.type?.toUpperCase()} copy`}.png`}/> : null}
                            </div>
                        </div>
                    </div>
                })}
            </div>
        })}
    </div>
}