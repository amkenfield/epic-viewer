import React, {useState, useEffect} from 'react';
import {BrowserRouter} from "react-router-dom";
import useLocalStorage from './hooks/useLocalStorage';
import LoadingSpinner from "./common/LoadingSpinner";
import EpicViewerApi from "./api/api";
import UserContext from './auth/UserContext';
import jwt from 'jsonwebtoken';

// Key name for storing token in localStorage for "remember me" re-login
export const TOKEN_STORAGE_ID = "epic-viewer-token";

function App() {
  const [infoLoaded, setInfoLoaded] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useLocalStorage(TOKEN_STORAGE_ID);

  // for future development:
  // const [lineIds, setLineIds] = useState(new Set([]));
  // -- Works too?

  console.debug(
      "App",
      "infoloaded=", infoLoaded,
      "currentUser=", currentUser,
      "token=", token
  );

  useEffect(function loadUserInfo() {
    console.debug("App useEffect loadUserInfo", "token=", token);

    async function getCurrentUser() {
      if(token) {
        try {
          let {username} = jwt.decode(token);
          EpicViewerApi.token = token;
          let currentUser = await EpicViewerApi.getCurrentUser(username);
          setCurrentUser(currentUser);
          // setLineIds (etc) would go here
        } catch(e) {
          console.error("App loadUserInfo: problem loading", err);
          setCurrentUser(null);
        }
      }
      setInfoLoaded(true);
    }

    setInfoLoaded(false);
    getCurrentUser();
  }, [token]);

  /** Handles site-wide logout. */
  function logout() {
    setCurrentUser(null);
    setToken(null);
  }

    /** Handles site-wide signup.
   *
   * Automatically logs them in (set token) upon signup.
   */

  async function signup(signupData) {
    try {
      let token = await EpicViewerApi.signup(signupData);
      setToken(token);
      return { success: true };
    } catch(e) {
      console.error("login failed", e);
      return { success: false, e };
    }
  }

  if(!infoLoaded) return <LoadingSpinner />;

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
