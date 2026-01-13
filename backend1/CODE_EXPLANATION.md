# Complete Backend1 Code Explanation - Line by Line

## Project Overview
This is a WebSocket-based chess game server that allows two players to connect and play chess in real-time. It uses:
- **WebSocket (ws)** for real-time bidirectional communication
- **chess.js** library for chess game logic and validation
- **TypeScript** for type safety

---

## File 1: `messages.ts` - Message Type Constants

```typescript
export const  INIT_GAME = "init_game";
export const MOVE = "move";
export const GAME_OVER = "game_over";
```

**Purpose**: This file defines constant strings that represent different message types used for communication between the client and server.

- **Line 3**: `INIT_GAME = "init_game"` - Message type sent when a game is initialized/started
- **Line 4**: `MOVE = "move"` - Message type sent when a player makes a move
- **Line 5**: `GAME_OVER = "game_over"` - Message type sent when the game ends

These constants prevent typos and make the code more maintainable. Instead of using magic strings like `"init_game"` everywhere, we use these constants.

---

## File 2: `Game.ts` - Individual Game Logic

### Imports (Lines 1-3)

```typescript
import type WebSocket from "ws";
import { Chess } from 'chess.js'
import { GAME_OVER, INIT_GAME, MOVE } from "./messages.js";
```

- **Line 1**: Imports the WebSocket type definition (for TypeScript type checking). The `type` keyword means this is only used for types, not at runtime.
- **Line 2**: Imports the `Chess` class from the chess.js library. This handles all chess rules, move validation, and game state.
- **Line 3**: Imports the message type constants we defined in messages.ts

### Class Declaration (Lines 6-11)

```typescript
export class Game {
    public player1 : WebSocket;
    public player2 : WebSocket;
    private board : Chess;
    private startTime : Date;
```

- **Line 6**: Declares a class `Game` that represents a single chess game between two players
- **Line 7**: `player1` - WebSocket connection for the first player (public, can be accessed outside the class)
- **Line 8**: `player2` - WebSocket connection for the second player (public)
- **Line 9**: `board` - Private Chess instance that maintains the game state, validates moves, and enforces rules
- **Line 10**: `startTime` - Private Date object storing when the game started (currently not used but could be used for timing)

### Constructor (Lines 13-32)

```typescript
constructor(player1 : WebSocket, player2 : WebSocket){
    this.player1 = player1;
    this.player2 = player2;
    this.board = new Chess()
    this.startTime = new Date();

    //let the players know the game is started
    this.player1.send(JSON.stringify({
        type : INIT_GAME,
        payload : {
            color : "white"
        }
    }));
    this.player2.send(JSON.stringify({
        type : INIT_GAME ,
        payload : {
            color : "black"
        }
    }));
}
```

**Purpose**: Initializes a new game when two players are matched.

- **Line 13**: Constructor takes two WebSocket connections as parameters
- **Line 14-15**: Stores the player WebSocket connections
- **Line 16**: Creates a new Chess board instance (starts with the standard starting position)
- **Line 17**: Records the current time as the game start time

**Lines 20-25**: Sends a message to player1:
- Uses `JSON.stringify()` to convert the object to a JSON string (WebSocket sends strings)
- Sends message type `INIT_GAME` to notify the game has started
- Assigns player1 the "white" color (white moves first in chess)

**Lines 26-31**: Sends a message to player2:
- Same structure, but assigns player2 the "black" color

Both players now know the game has started and which color they're playing.

### makeMove Method (Lines 34-81)

```typescript
makeMove(socket : WebSocket, move : {
    from : string,
    to : string
}){
```

**Purpose**: Validates and processes a move made by a player.

**Parameters**:
- `socket`: The WebSocket connection of the player making the move
- `move`: An object with `from` (starting square like "e2") and `to` (destination square like "e4")

#### Turn Validation (Lines 39-44)

```typescript
if(this.board.moves.length %2 === 0 && socket !== this.player1){
    return;
}
if(this.board.moves.length %2 === 1 && socket !== this.player2){
    return;
}
```

**Purpose**: Ensures players take turns correctly.

- **Line 39**: If the number of moves is even (0, 2, 4...), it's white's turn
  - If the socket making the move is NOT player1 (white), reject and return
- **Line 42**: If the number of moves is odd (1, 3, 5...), it's black's turn
  - If the socket making the move is NOT player2 (black), reject and return

This prevents players from moving out of turn.

#### Move Execution (Lines 46-50)

```typescript
try {
    this.board.move(move);
} catch (error) {
    return; //invalid move
}
```

- **Line 47**: Attempts to make the move on the chess board
  - The Chess.js library validates the move (checks if it's legal)
- **Line 48-49**: If the move is invalid, `chess.js` throws an error, which is caught here
  - The method returns early, effectively rejecting the invalid move

#### Game Over Check (Lines 52-66)

```typescript
if(this.board.isGameOver()){
    this.player1.emit(JSON.stringify({
        type : GAME_OVER,
        payload : {
            winner : this.board.turn() === "w" ?"black" : "white"
        }
    }))
    this.player2.emit(JSON.stringify({
        type : GAME_OVER,
        payload : {
            winner : this.board.turn() === "w" ?"black" : "white"
        }
    }))
    return;
}
```

- **Line 52**: Checks if the game is over (checkmate, stalemate, etc.)
- **Line 53-58**: Sends GAME_OVER message to player1
  - **Note**: There's a bug here - should use `.send()` not `.emit()` (WebSocket doesn't have emit)
  - **Line 56**: Determines the winner
    - `this.board.turn()` returns "w" (white) or "b" (black) - whose turn it is NOW
    - If it's white's turn now, that means black just won (they made the last move that ended the game)
    - So: if turn is "w", winner is "black", else winner is "white"
- **Line 59-64**: Sends the same message to player2
- **Line 65**: Returns early since the game is over

#### Send Move to Opponent (Lines 69-79)

```typescript
if(this.board.moves.length % 2 === 0){
    this.player2.emit(JSON.stringify({
        type : MOVE,
        payload : move
    }))
}else {
    this.player1.emit(JSON.stringify({
        type : MOVE,
        payload : move
    }))
}
```

**Purpose**: If the game isn't over, notify the opponent about the move.

- **Line 69**: After a move, if move count is even (white just moved)
  - Send the move to player2 (black) so they can update their board
- **Line 74**: If move count is odd (black just moved)
  - Send the move to player1 (white) so they can update their board

**Note**: Again, should use `.send()` not `.emit()` - this is a bug in the code.

---

## File 3: `GameManager.ts` - Managing Multiple Games

### Imports (Lines 1-3)

```typescript
import type WebSocket from "ws";
import { INIT_GAME, MOVE } from "./messages.js";
import { Game } from "./Game.js";
```

- **Line 1**: WebSocket type for TypeScript
- **Line 2**: Message constants for INIT_GAME and MOVE
- **Line 3**: The Game class we just discussed

### Class Declaration (Lines 6-9)

```typescript
export class GameManager {
    private games : Game[];
    private pendingUser : WebSocket | null;
    private users : WebSocket[];  //list of currentlly active users on server
```

- **Line 6**: GameManager class manages all games and users on the server
- **Line 7**: `games` - Array storing all active Game instances
- **Line 8**: `pendingUser` - WebSocket of a user waiting to be matched (null if no one is waiting)
- **Line 9**: `users` - Array of all currently connected users (for tracking)

### Constructor (Lines 11-15)

```typescript
constructor(){
    this.games=[];
    this.pendingUser = null;
    this.users = [];
}
```

Initializes empty arrays and null pending user.

### addUser Method (Lines 17-21)

```typescript
addUser(socket : WebSocket){
    this.users.push(socket);  //this users will be pushed in the Users array
    this.addHandler(socket);  //this will handle the operations on each user, wheather to add in game or in pending user
}
```

**Purpose**: Called when a new user connects to the server.

- **Line 18**: Adds the new user's WebSocket to the users array
- **Line 19**: Sets up message handlers for this user (so the server can respond to their messages)

### removeUser Method (Lines 23-26)

```typescript
removeUser(socket : WebSocket){
    this.users.filter(user => user !== socket);
    //stop the game here because the user left
}
```

**Purpose**: Called when a user disconnects.

- **Line 24**: **BUG**: `filter()` returns a new array but doesn't modify the original! Should be:
  ```typescript
  this.users = this.users.filter(user => user !== socket);
  ```
- The comment mentions stopping the game, but this isn't implemented

### handleMessage Method (Lines 28-30)

```typescript
private handleMessage(){
     
}
```

**Empty method** - not used. Appears to be a placeholder or leftover code.

### addHandler Method (Lines 32-54) - THE CORE LOGIC

```typescript
private addHandler(socket : WebSocket){ //receives a user
    socket.on("message", (data)=>{
        const message = JSON.parse(data.toString());

        if(message.type == INIT_GAME){
            if(this.pendingUser){
                const game = new Game(this.pendingUser, socket);   
                this.games.push(game);  //pushing in the global array  
                this.pendingUser = null;
            }else{
                this.pendingUser = socket;  //the user in the queue waiting to connect other
            }
        }

        if(message.type === MOVE){
            
            const game = this.games.find(game => game.player1 === socket || game.player2 === socket);
            if(game){
                game.makeMove(socket, message.move);  //(specific user, specific move);
            }
        }
    })
}
```

**Purpose**: Sets up a message listener for each user to handle incoming messages.

#### Setup (Lines 33-34)

- **Line 33**: Registers a listener for "message" events on this WebSocket
  - When the client sends a message, this callback is executed
- **Line 34**: Parses the incoming message
  - `data` is a Buffer, so `data.toString()` converts it to a string
  - `JSON.parse()` converts the JSON string to a JavaScript object

#### Handling INIT_GAME (Lines 36-44)

```typescript
if(message.type == INIT_GAME){
    if(this.pendingUser){
        const game = new Game(this.pendingUser, socket);
        this.games.push(game);  //pushing in the global array  
        this.pendingUser = null;
    }else{
        this.pendingUser = socket;  //the user in the queue waiting to connect other
    }
}
```

**Purpose**: Matches players together using a queue system.

- **Line 36**: Checks if the message type is INIT_GAME (player wants to start a game)
- **Line 37**: If there's already a pending user waiting:
  - **Line 38**: Create a new Game with the pending user and the current user
  - **Line 39**: Add the game to the games array
  - **Line 40**: Clear the pending user (they're now in a game)
- **Line 41**: If no one is waiting:
  - **Line 42**: Make the current user the pending user (they wait for another player)

**Flow Example**:
1. User A connects and sends INIT_GAME → becomes pendingUser
2. User B connects and sends INIT_GAME → Game created with A and B, pendingUser = null
3. User C connects and sends INIT_GAME → becomes pendingUser
4. User D connects and sends INIT_GAME → Game created with C and D

#### Handling MOVE (Lines 46-52)

```typescript
if(message.type === MOVE){
    
    const game = this.games.find(game => game.player1 === socket || game.player2 === socket);
    if(game){
        game.makeMove(socket, message.move);  //(specific user, specific move);
    }
}
```

**Purpose**: Processes a move from a player.

- **Line 46**: Checks if the message is a MOVE type
- **Line 48**: Finds the game where this socket is either player1 or player2
  - `find()` searches through the games array
  - Returns the first game where the condition is true, or undefined
- **Line 49-51**: If a game was found:
  - Calls the `makeMove()` method on that game instance
  - Passes the socket (to identify the player) and the move data

---

## File 4: `index.ts` - Server Entry Point

```typescript
import { WebSocketServer } from 'ws';
import { GameManager } from './GameManager.js';

const wss = new WebSocketServer({ port: 8080 });

const gameManager = new GameManager();

wss.on('connection', function connection(ws) {
  gameManager.addUser(ws);
  ws.on('disconnect', ()=> gameManager.removeUser(ws))
});
```

**Purpose**: This is the main server file that starts the WebSocket server.

- **Line 1**: Imports WebSocketServer from the 'ws' library
- **Line 2**: Imports our GameManager class
- **Line 4**: Creates a WebSocket server listening on port 8080
  - Clients will connect to `ws://localhost:8080`
- **Line 6**: Creates a single GameManager instance to manage all games
- **Line 8**: Registers a connection event listener
  - When a new client connects, this callback runs
  - `ws` is the WebSocket connection for the new client
- **Line 9**: Adds the new user to the GameManager (which sets up their handlers)
- **Line 10**: Registers a disconnect event listener
  - **Note**: WebSocket from 'ws' library uses `'close'` event, not `'disconnect'`
  - This should probably be `ws.on('close', ...)` instead

---

## Complete Flow Diagram

```
1. Server starts (index.ts)
   ↓
2. WebSocketServer listens on port 8080
   ↓
3. Client A connects
   ↓
4. GameManager.addUser(A) is called
   ↓
5. addHandler(A) sets up message listeners for A
   ↓
6. Client A sends INIT_GAME message
   ↓
7. A becomes pendingUser
   ↓
8. Client B connects
   ↓
9. GameManager.addUser(B) is called
   ↓
10. Client B sends INIT_GAME message
   ↓
11. Game created: new Game(A, B)
   ↓
12. Both A and B receive INIT_GAME with their colors
   ↓
13. Client A sends MOVE message
   ↓
14. GameManager finds the game with A
   ↓
15. Game.makeMove(A, move) is called
   ↓
16. Move is validated and executed
   ↓
17. Client B receives MOVE message
   ↓
18. Process repeats for all moves
```

---

## Bugs Found in the Code

1. **Game.ts Line 53, 59, 70, 75**: Uses `.emit()` instead of `.send()`
   - WebSocket objects use `.send()` method, not `.emit()` (that's for Socket.IO)

2. **GameManager.ts Line 24**: `filter()` doesn't mutate the array
   - Should be: `this.users = this.users.filter(...)`

3. **index.ts Line 10**: Uses `'disconnect'` event
   - Should be `'close'` event for WebSocket from 'ws' library

4. **Game.ts Line 46**: Comment mentions Zod validation but Zod isn't used
   - Move validation is done by chess.js instead

---

## Key Concepts

1. **WebSocket**: Allows real-time bidirectional communication (unlike HTTP which is request-response)

2. **Queue-based Matching**: Simple matching system where the first player waits, second player gets matched

3. **Game State**: Each Game instance maintains its own board state using chess.js

4. **Turn Validation**: The server ensures players can only move on their turn

5. **Move Validation**: chess.js library handles all chess rules automatically

