import React, {useEffect, useState, useRef} from 'react'
import axios from 'axios';

import CodeMirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/dracula.css';
import 'codemirror/theme/darcula.css';
import 'codemirror/theme/nord.css';

import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/edit/closetag';
import 'codemirror/addon/edit/closebrackets';

function Editor({socket, blockId, userId, onCodeChange}) {
    const editor = useRef(null);
    const [block, setBlock] = useState([]);

    const baseURL = "http://localhost:3080";

    useEffect(() => {
        getBlock();
        console.log("mentorUserId: ", block.mentorUserId);
        console.log("userId: ", userId);
        // Initialize CodeMirror instance
        const textarea = document.getElementById('realtimeEditor');
        editor.current = CodeMirror.fromTextArea(textarea, {
            mode: 'javascript',
            theme: 'nord',
            autoCloseTags: true,
            autoCloseBrackets: true,
            lineNumbers: true,
            readOnly: block.mentorUserId === userId,
        });

        // Handle local code changes and emit to other clients
        const handleCodeChange = (instance, changes) => {
            const {origin} = changes;
            const code = instance.getValue();

            onCodeChange(code);

            // Emit the code change to other clients in the same block
            if (origin !== 'setValue' && socket.current) {
                socket.current.emit('code-change', {
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
    }, [onCodeChange, blockId, socket]);


    useEffect(() => {
        // Listen for code changes from other clients
        if (socket.current) {
            socket.current.on('code-change', ({code}) => {
                if (code !== null) {
                    editor.current.setValue(code);
                }
            });
        }

        return () => {
            if (socket.current) {
                socket.current.off('code-change');
            }
        };
    }, [socket.current]);

    const getBlock = () => {
        axios.get(`${baseURL}/blocks/${blockId}`)
            .then((response) => setBlock(response.data.block))
            .catch((error) => console.error(error));
      }

    return <textarea id="realtimeEditor"></textarea>;

}

export default Editor;