import React, {useEffect, useRef, useState} from 'react'
import {useNavigate, useParams} from "react-router-dom";
import {Button} from '@mui/material';
import Editor from './Editor';
import { socket } from './socket';

function CodeBlock({userId}) {

  // const socket = useRef(null);
  const codeRef = useRef(null);
  const {blockId} = useParams();
  const navigate = useNavigate();

  
  console.log("userID in codeBlock: ", userId);
    
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [fooEvents, setFooEvents] = useState([]);

  useEffect(() => {
    console.log('in codeblock useeffect')
    function onConnect() {
      console.log('connect')
      socket.emit('send_user', {userId, blockId});
      setIsConnected(true);
    }

    function onDisconnect() {
      console.log('disconnect')
      setIsConnected(false);
    }

    // function onFooEvent(value) {
    //   setFooEvents(previous => [...previous, value]);
    // }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    // socket.on('foo', onFooEvent);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      // socket.off('foo', onFooEvent);
    };
  }, []);


  // useEffect(() => {
  //   // init socket
  //   const init = async () => {

  //     socket.current = await io('http://localhost:3000', {autoConnect: false});
  //     socket.current.on('connect_error', (err) => handleErrors(err));
  //     socket.current.on('connect_failed', (err) => handleErrors(err));

  //     function handleErrors(e) {
  //         console.log('socket error', e);
  //         navigate('/');
  //     }

  //     socket.current.emit('join', {
  //       blockId,
  //       userId,
  //     });

  //     socket.current.on(
  //       'joined',
  //       (socketId) => {
  //         socket.current.emit('sync-code', {
  //           code: codeRef.current,
  //           blockId,
  //           });
  //      });
       
  //   }
  //   init();

  //   // listener cleaning function
  //   return () => {
  //     if (socket.current) {
  //         socket.current.disconnect();
  //         socket.current.off('joined');
  //     }
  // }

  // }, [navigate, blockId]);

  
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
