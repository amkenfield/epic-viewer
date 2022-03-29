import React, {useState, useEffect, useContext} from 'react';
import {BrowserRouter, Routes, Route} from "react-router-dom";
import useLocalStorage from './hooks/useLocalStorage';
import Navigation from './routes-nav/Navigation';
import EVRoutes from './routes-nav/EVRoutes';
import Homepage from './homepage/Homepage';
import RequireAuth from './auth/RequireAuth';
import LoginForm from './auth/LoginForm';
import SignupForm from './auth/SignupForm';
import LoadingSpinner from "./common/LoadingSpinner";
import EpicViewerApi from "./api/api";
import UserContext from './auth/UserContext';
import jwt from 'jsonwebtoken';
import AuthorList from './authors/AuthorList';
import AuthorDetail from './authors/AuthorDetail';
import WorkList from './works/WorkList';
import WorkDetail from './works/WorkDetail';
import LineDetail from './lines/LineDetail';

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

  /** Handles site-wide login
   * 
   */

  async function login(loginData) {
    try {
      let token = await EpicViewerApi.login(loginData);
      setToken(token);
      return { success: true };
    } catch(e) {
      console.error("login failed:", e);
      return { success: false, e };
    }
  }

  if(!infoLoaded) return <LoadingSpinner />;

  return (
    <BrowserRouter>
      <UserContext.Provider
          value={{ currentUser, setCurrentUser }}>
        <div className="App">
          <Navigation logout={logout}/>
          {/* <EVRoutes login={login} signup={signup} /> */}
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path='/login' element={<LoginForm login={login}/>} />
            <Route path='/signup' element={<SignupForm signup={signup}/>} />
            <Route path='/authors' element={<AuthorList />} />
            <Route path='/authors/:id' element={<AuthorDetail />} />
            <Route path='/works' element={<WorkList />} />
            <Route path='/works/:id' element={<WorkDetail />} />
            <Route path='/lines/:id' element={<LineDetail />} />
          </Routes>
        </div>
      </UserContext.Provider>
    </BrowserRouter>
  );
}

export default App;
