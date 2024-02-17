import React, {useEffect, useRef, useState} from 'react'
import {useNavigate, useParams} from "react-router-dom";
import {Button} from '@mui/material';
import Editor from './Editor';
import { socket } from './socket';


import CodeMirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/dracula.css';
import 'codemirror/theme/nord.css';

import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/edit/closetag';
import 'codemirror/addon/edit/closebrackets';

function CodeBlock({userId}) {

  // const socket = useRef(null);
  // const codeRef = useRef(null);
  const editor = useRef(null);
  const {blockId} = useParams();
  const navigate = useNavigate();
  
  console.log("userID in codeBlock: ", userId);
    
  const [isConnected, setIsConnected] = useState(socket.connected);
  // const [userRole, setUserRole] = useState([]);


  useEffect(() => {
    console.log('in codeblock useeffect')
    function onConnect() {
      console.log('connect')
      setIsConnected(true);
      socket.emit('user_joined', {userId, blockId});
    }

    socket.on('connect', onConnect);
    // socket.on('joined', {})
    socket.on('disconnect', onDisconnect);
    socket.on('code-change', (code) => {onCodeChange(code.code)});

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      // socket.off('foo', onFooEvent);
    };
  }, []);

  useEffect(() => {
    console.log("userId in editor: ", userId);
    //Initialize CodeMirror instance
    const textarea = document.getElementById('realtimeEditor');
    editor.current = CodeMirror.fromTextArea(textarea, {
        mode: 'javascript',
        theme: 'nord',
        autoCloseTags: true,
        autoCloseBrackets: true,
        lineNumbers: true,
        // readOnly: block.mentorUserId === userId,
    });

    // Handle local code changes and emit to other clients
    const handleCodeChange = (instance, changes) => {
        const {origin} = changes;
        const code = instance.getValue();
        
        console.log('code is: ', code)
        // codeRef.current = code;
        // console.log('codeRef is: ', codeRef.current)
        
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
}, []);

// useEffect(() => {
//   socket.on('code-change', ({code}) => {
//     console.log('code recived: ', code);
//     if (code !== null) {
//         editor.current.setValue(code);
        
//     }
//   });

//   return () => {
//     if (socket) {
//       socket.off('code-change');
//   }
//   };
// });


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

  function onDisconnect() {
    console.log('disconnect')
    setIsConnected(false);
  }

  function onCodeChange(code) {
    if (code !== null) {
      console.log('code changeg!!!!', code)
      console.log('code changeg!!!!', typeof(code))
      editor.current.setValue(code);
    }
  }

  const onLobbyBtn = () => {
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
