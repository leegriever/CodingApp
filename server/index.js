const express = require('express');
const app = express();
const { v4: uuidv4 } = require("uuid");
const cookieParser = require("cookie-parser");
const {Blocks} = require("./Blocks");
app.use(express.json());
const cors = require('cors');

const http = require('http');
const {Server} = require('socket.io');

const server = http.createServer(app);
const io = new Server(server);


const {baseUrl} = require('../constants');

const port = 3080;
// let mentorSocketId = null;
// let studentSocketId = null;
// let socketId = null;

app.use(express.json());

const corsOptions = {
    origin: `${baseUrl.client}`,
    credentials: true
}
app.use(cors(corsOptions));

console.log("server 1");

// io.on('connection', (socket) => {
//     console.log('a user connected');
//   });

io.on('connection', (socket) => {
    console.log(`a user connected with socketId; ${socket.id}`);
       socket.on('join', ({blockId, userId}) => {
        // console.log(`a user connected with ${port}`);
        socket.join(blockId);
        Blocks[blockId-1].numberOfUsers += 1;
        console.log("userId: ", userId);
        if (Blocks[blockId-1].mentorUserId === null){
            Blocks[blockId-1].mentorUserId = userId;
        }
        io.to(blockId).emit('joined'), {
            socketId: socket.id,
        };
    });
    
    // for sync
    socket.on('code-change', ({blockId, code}) => {
        console.log("code changed: ", code);
        socket.to(blockId).emit('code-change', {code});
    });

    socket.on('sync-code', ({socketId, code}) => {
        io.to(socketId).emit('code-change', {code});
    });

    socket.on('disconnect', () => {
        console.log('user disconnected with socketId: ', socket.id);
    });
    });
    /*
    // disconnecting from socket
    socket.on('disconnecting', () => {
        const rooms = [...socket.rooms];
        rooms.forEach((roomId) => {
            socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
                socketId: socket.id,
                username: userSocketMap[socket.id]
            });
        });
        delete userSocketMap[socket.id];
        socket.leave();
    });

    socket.on(ACTIONS.LEAVE_ROOM, ({roomId, username}) => {
        const leavingSocketId = Object.keys(userSocketMap).find(key => userSocketMap[key] === username);

        if (leavingSocketId) {
            // Emit a custom event to notify other clients that the user left
            socket.to(roomId).emit(ACTIONS.DISCONNECTED, {
                socketId: leavingSocketId,
                username: userSocketMap[leavingSocketId],
            });

            // Remove the user from the userSocketMap
            delete userSocketMap[leavingSocketId];
        }
    });*/

    



app.get("/", cors(corsOptions), (req, res) => {
    res.send("Welcome to the server port!");
});

app.get("/user", cors(corsOptions), (req, res) => {
    const userId = req.cookies?.userId || uuidv4();
    res.cookie("userId", userId).send({id: userId});
});

app.get('/blocks', cors(corsOptions), (req, res) => {
    console.log("server 2");
    let blocksToReturn = Blocks;
    console.log((blocksToReturn[1].id));
    res.send({Blocks: blocksToReturn});
    console.log("server 3");
});

app.get('/blocks/:blockId', cors(corsOptions), (req, res) => {
    const {blockId} = req.params
    const block = Blocks.find((block) => block.id === blockId)
    if (!block) {
        res.status(400).json({message: 'Block not found'}).end();
        return;
    }

    res.send({block});
});

// app.listen(port, ()=> {
//     console.log(`Server started on port ${port}`);
// })

server.listen(port, () =>
    console.log(`Listening on port ${port}`)
);