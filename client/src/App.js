import React, {useEffect, useState} from 'react'
import {BrowserRouter as Router, Route, Routes,} from "react-router-dom";
import axios from "axios";
import Lobby from './Lobby';
import CodeBlock from './CodeBlock';

function App() {
  const baseURL = "http://localhost:3080";

  const [blocks, setBlocks] = useState([]);
  const [userId, setUserId] = useState([]);

  useEffect(() => {
    getBlocks();
    getUser();
  }, []);

const getBlocks = () => {
  axios.get(`${baseURL}/blocks`)
      .then((response) => setBlocks(response.data.Blocks))
      .catch((error) => console.error(error));
}

const getUser = () => {
  console.log('in getUser');
  axios.get(`${baseURL}/user`).then((response) => {
      setUserId(response.data.id);
  }).catch(error => {
      console.log(error)
  });
}

  return (
    <div className="App">
            <Router>
                <Routes>
                    <Route
                        path="/"
                        element={
                            <Lobby
                              blocks = {blocks}
                            />
                        }
                    />
                    <Route
                        path="/block/:blockId"
                        element={
                            <CodeBlock
                            userId = {userId}
                            />
                        }
                    />
                </Routes>
            </Router>
        </div>
  )
}

export default App
