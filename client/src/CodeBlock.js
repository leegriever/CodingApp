import React, {useEffect, useState, useRef} from 'react'
import {useNavigate, useParams} from "react-router-dom";
import axios from 'axios';
import {Button} from '@mui/material';

import CodeMirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/dracula.css';
import 'codemirror/theme/darcula.css';
import 'codemirror/theme/nord.css';

import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/edit/closetag';
import 'codemirror/addon/edit/closebrackets';

import {initSocket} from './socket';

function CodeBlock() {

  const socketRef = useRef(null);
  const codeRef = useRef(null);
  const {blockId} = useParams();
  const navigate = useNavigate();
  const editorRef = useRef(null);
  const roomId = 1;

  const [block, setBlock] = useState([]);

  const baseURL = "http://localhost:3080";


  useEffect(() => {
    // init socket
    const init = async () => {
      socketRef.current = await initSocket();
      socketRef.current.on('connect_error', (err) => handleErrors(err));
      socketRef.current.on('connect_failed', (err) => handleErrors(err));

      function handleErrors(e) {
          console.log('socket error', e);
          navigate('/');
      }

      socketRef.current.emit('join', {
          roomId,
      });
    }
    init();
  }, [navigate]);

  useEffect(() => {
    getBlock();
  });

  useEffect(() => {
    // Initialize CodeMirror instance
      const textarea = document.getElementById('realtimeEditor');
      editorRef.current = CodeMirror.fromTextArea(textarea, {
          mode: 'javascript',
          theme: 'nord',
          autoCloseTags: true,
          autoCloseBrackets: true,
          lineNumbers: true,
      });


      // Handle local code changes and emit to other clients
      const handleCodeChange = (instance, changes) => {
        const {origin} = changes;
        const code = instance.getValue();
        console.log(code)

        codeRef.current = code;

        // Emit the code change to other clients in the same room
        if (origin !== 'setValue' && socketRef.current) {
            socketRef.current.emit('code-change', {
                roomId,
                code,
            });
        }
    };
    editorRef.current.on('change', handleCodeChange);

    return () => {
      editorRef.current.off('change', handleCodeChange);
      editorRef.current.toTextArea(); // Clean up the CodeMirror instance
    };
    
  });

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
        <textarea id="realtimeEditor"></textarea>
        <Button variant="contained" disableElevation
        onClick={() => onLobbyBtn(block.id)}
        >
        Back To Lobby
        </Button>
                
      </div>
    )
}

export default CodeBlock
