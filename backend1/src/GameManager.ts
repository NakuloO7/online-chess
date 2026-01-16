import type WebSocket from "ws";
import { INIT_GAME, MOVE } from "./messages.js";
import { Game } from "./Game.js";


export class GameManager {
    private games : Game[];
    private pendingUser : WebSocket | null;
    private users : WebSocket[];  //list of currentlly active users on server

    constructor(){
        this.games=[];
        this.pendingUser = null;
        this.users = [];
    }

    addUser(socket : WebSocket){
        this.users.push(socket);  //this users will be pushed in the Users array
        this.addHandler(socket);  //this will handle the operations on each user, wheather to add in game or in pending user

    }

    removeUser(socket : WebSocket){
        this.users = this.users.filter(user => user !== socket);
        //stop the game here because the user left
    }

    private handleMessage(){
         
    }

    private addHandler(socket : WebSocket){ //receives a user
        socket.on("message", (data)=>{
            const message = JSON.parse(data.toString());

            if(message.type == INIT_GAME){
                if(this.pendingUser){
                    const game = new Game(this.pendingUser, socket); //the game class want 2 players 
                    //1 is the already pending player and other is the new player
                    this.games.push(game);  //pushing in the global array  
                    this.pendingUser = null;
                }else{
                    this.pendingUser = socket;  //the user in the queue waiting to connect other
                }
            }

            if(message.type === MOVE){
                const game = this.games.find(game => game.player1 === socket || game.player2 === socket);
                if(game){
                    game.makeMove(socket, message.payload.move);  //(specific user, specific move);
                }
            }
        })
    }
}