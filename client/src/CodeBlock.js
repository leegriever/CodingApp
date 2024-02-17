import React, {useEffect, useRef, useState} from 'react'
import {useNavigate, useParams} from "react-router-dom";
import {Button} from '@mui/material';
import { socket } from './socket';
import { v4 as uuidv4 } from 'uuid';

import CodeMirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/dracula.css';
import 'codemirror/theme/nord.css';

import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/edit/closetag';
import 'codemirror/addon/edit/closebrackets';

function CodeBlock() {

  // const codeRef = useRef(null);
  const editor = useRef(null);
  const {blockId} = useParams();
  const navigate = useNavigate();
  const userId = uuidv4();
  const userRole = useRef(null);
  console.log("userID in codeBlock: ", userId);
    
  // const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    onConnect();
  }, [blockId]);

  useEffect(() => {
    console.log('in codeblock useeffect')

    // socket.on('connect', onConnect);
    // socket.on('disconnect', onDisconnect);
    socket.on('code-change', (code) => {onCodeChange(code.code)});
    socket.on('user-role', (role) => {onsetUserRole(role.role)});

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, []);

  function onConnect() {
    console.log('connect123')
    socket.connect();
    socket.emit('user_joined', {userId, blockId});
  }

  function onDisconnect() {
    console.log('disconnect')

  }

  function onCodeChange(code) {
    if (code !== null) {
      console.log('ddd')
      editor.current.setValue(code);
    }
  }

  function onsetUserRole(role) {
    console.log("role is: ", role);
    if (role !== null) {
      userRole.current = role
      initCodeMirror();
    }
  }

  function initCodeMirror() {

    console.log("userId in editor: ", userId, userRole.current);
    //Initialize CodeMirror instance
    const textarea = document.getElementById('realtimeEditor');
    editor.current = CodeMirror.fromTextArea(textarea, {
        mode: 'javascript',
        theme: 'nord',
        autoCloseTags: true,
        autoCloseBrackets: true,
        lineNumbers: true,
        readOnly: userRole.current === "mentor",
    });

    // Handle local code changes and emit to other clients
    const handleCodeChange = (instance, changes) => {
        const {origin} = changes;
        const code = instance.getValue();
        
        console.log('code is: ', code)
        
        console.log('origin is: ', origin)
        console.log('socketid is: ', socket.current)

        // Emit the code change to other clients in the same block
        if (origin !== 'setValue' && socket) {
            console.log('code emit: ', code)
            socket.emit('code-change', {
                blockId,
                code,
            });
        }
    };

    editor.current.on('change', handleCodeChange);

    return () => {
        editor.current.off('change', handleCodeChange);
        editor.current.toTextArea(); // Clean up the CodeMirror instance
    };
  }

  function onLobbyBtn(){
      onDisconnect()
      navigate('/')
  }

    return (
      <div>
        <h1>Code Block</h1>
        <textarea id="realtimeEditor"></textarea>
        <Button variant="contained" disableElevation
        onClick={() => onLobbyBtn()}
        >
        Back To Lobby
        </Button>
                
      </div>
    )
}

export default CodeBlock
