const express = require('express');
const app = express();
const {Blocks} = require("./Blocks");
app.use(express.json());
const cors = require('cors');

const {baseUrl} = require('../constants');

const port = 3080;
app.use(express.json());

const corsOptions = {
    origin: `${baseUrl.client}`,
    credentials: true
}
app.use(cors(corsOptions));

console.log("server 1");

app.get("/", cors(corsOptions), (req, res) => {
    res.send("Welcome to the server port!");
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

app.listen(port, ()=> {
    console.log(`Server started on port ${port}`);
})

