import React, {useState, useEffect} from 'react';
import {BrowserRouter} from "react-router-dom";
import useLocalStorage from './hooks/useLocalStorage';
import UserContext from './auth/UserContext';

// Key name for storing token in localStorage for "remember me" re-login
export const TOKEN_STORAGE_ID = "epic-viewer-token";

function App() {
  const [infoLoaded, setInfoLoaded] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useLocalStorage(TOKEN_STORAGE_ID);

  // for future development:
  // const [lineIds, setLineIds] = useState(new Set([]));

  console.debug(
      "App",
      "infoloaded=", infoLoaded,
      "currentUser=", currentUser,
      "token=", token
  );

  /** Handles site-wide logout. */
  function logout() {
    setCurrentUser(null);
    setToken(null);
  }

  return (
    <BrowserRouter>
      <UserContext.Provider
          value={{ currentUser, setCurrentUser }}>
        <div className="App">
        </div>
      </UserContext.Provider>
    </BrowserRouter>
  );
}

export default App;
