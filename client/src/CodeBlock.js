import React, {useEffect, useState} from 'react'
import {useNavigate, useParams} from "react-router-dom";
import axios from 'axios';
import {Button} from '@mui/material';
import Editor from "@monaco-editor/react"

function CodeBlock() {

const {blockId} = useParams();
const navigate = useNavigate();

const [block, setBlock] = useState([]);

const baseURL = "http://localhost:3080";

useEffect(() => {
  getBlock();
})

const getBlock = () => {
  axios.get(`${baseURL}/blocks/${blockId}`)
      .then((response) => setBlock(response.data.block))
      .catch((error) => console.error(error));
}

const onLobbyBtn = () => {
    navigate('/')
}

  return (
    <div>
      <h1>Code Block</h1>
      <Editor
        height = "700px"
        width = "700px"
        theme = "vs-dark"
        defaultLanguage = "javascript"
      />
      <Button variant="contained" disableElevation
      onClick={() => onLobbyBtn(block.id)}
      >
      Back To Lobby
      </Button>
              
    </div>
  )
}

export default CodeBlock
