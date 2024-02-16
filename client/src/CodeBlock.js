import React, {useEffect, useRef, useState} from 'react'
import {useNavigate, useParams} from "react-router-dom";
import {Button} from '@mui/material';
import Editor from './Editor';
import {initSocket} from './socket';
import axios from 'axios';

function CodeBlock() {

  const socket = useRef(null);
  const codeRef = useRef(null);
  const {blockId} = useParams();
  const navigate = useNavigate();

  const [userId, setUserId] = useState([]);
  

  const baseURL = "http://localhost:3080";
 
  const getUser = () => {
    axios.get(`${baseURL}/user`).then((response) => {
        setUserId(response.data.id);
    }).catch(error => {
        console.log(error)
    });
}
  useEffect(() => {
    // init socket
    const init = async () => {
      
      getUser();
      console.log("userId in codeblocke: ", userId);
      socket.current = await initSocket();
      socket.current.on('connect_error', (err) => handleErrors(err));
      socket.current.on('connect_failed', (err) => handleErrors(err));

      function handleErrors(e) {
          console.log('socket error', e);
          navigate('/');
      }

      socket.current.emit('join', {
        blockId,
        userId,
      });

      socket.current.on(
        'joined',
        (socketId) => {
          socket.current.emit('sync-code', {
            code: codeRef.current,
            blockId,
            });
       });
       
    }
    init();

    // listener cleaning function
    return () => {
      if (socket.current) {
          socket.current.disconnect();
          socket.current.off('joined');
      }
  }

  }, [navigate, blockId, userId]);

  
  const onLobbyBtn = () => {
      navigate('/')
  }

    return (
      <div>
        <h1>Code Block</h1>
        <Editor
          socket={socket}
          blockId={blockId}
          userId = {userId}
          onCodeChange={(code) => {codeRef.current = code}}
        />
        <Button variant="contained" disableElevation
        onClick={() => onLobbyBtn()}
        >
        Back To Lobby
        </Button>
                
      </div>
    )
}

export default CodeBlock
