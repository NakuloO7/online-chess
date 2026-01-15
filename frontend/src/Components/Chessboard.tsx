import type { Color, PieceSymbol, Square } from "chess.js";


export const Chessboard = ({board} : {
    board : ({
            square: Square;
            type: PieceSymbol;
            color: Color;
        } | null)[][];
})=>{
    return <div className="text-white-200">
        {board.map((row, i)=>{
            return <div key={i} className="flex">
                {row.map((square, j)=>{
                    return <div key={j} className={`w-16 h-16 ${(i+j)%2===0 ? "bg-green-500" : "bg-white"}`}>
                        <div className="flex justify-center w-full h-full">
                            <div className="flex justify-center h-full flex-col ">
                               {square?square.type: ""}
                            </div>
                        </div>
                    </div>
                })}
            </div>
        })}
    </div>
}