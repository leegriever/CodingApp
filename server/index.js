const express = require('express');
const app = express();
const {Blocks} = require("./Blocks");
app.use(express.json());
const cors = require('cors');

const http = require('http');
const {Server} = require('socket.io');

const server = http.createServer(app);
const io = new Server(server);


const baseUrl = {
    client: "http://localhost:3000",
    server: "http://localhost:3080"
};
const port = 3080;

app.use(express.json());

const corsOptions = {
    origin: `${baseUrl.client}`,
    credentials: true
}
app.use(cors(corsOptions));


io.on('connection', (socket) => {
    console.log(`a user connected with socketId; ${socket.id}`);

    socket.on('user_joined', ({userId, blockId}) => {
        console.log(`user: ${userId}} connected with block: ${blockId}`);
        socket.join(blockId);
        role = assignUserRole(blockId, userId);
        console.log("user role: ", role);
        socket.emit('user-role', {role});
    });

    // for sync
    socket.on('code-change', ({blockId, code}) => {
        console.log("code changed: ", code);
        console.log("send code", code, "to blockId: ", blockId);
        io.to(blockId).emit('code-change', {code});
    });

    socket.on('disconnect', () => {
        console.log('user disconnected with socketId: ', socket.id);
    });
});


app.get("/", cors(corsOptions), (req, res) => {
    res.send("Welcome to the server port!");
});

app.get('/blocks', cors(corsOptions), (req, res) => {
    let blocksToReturn = Blocks;
    res.send({Blocks: blocksToReturn});
});


app.get('/blocks/:blockId', cors(corsOptions), (req, res) => {
    const {blockId} = req.params
    const block = Blocks[blockId-1]
    if (!block) {
        res.status(400).json({message: 'Block not found'}).end();
        return;
    }
    res.send({block});
});

server.listen(port, () =>
    console.log(`Listening on port ${port}`)
);

const assignUserRole = (blockId, userId) => {
    if (Blocks[blockId-1].mentorUserId === null){
        Blocks[blockId-1].mentorUserId = userId;
        return "mentor"
    }
    else {
        if (Blocks[blockId-1].studentUserId === null){
            Blocks[blockId-1].studentUserId = userId;
            return "student" 
        }
    }
    return "other"
}