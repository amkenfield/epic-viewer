import React, {useContext} from 'react';
import { Navigate } from 'react-router-dom';
import UserContext from './UserContext';

/** Component which allows for protected routes
 *  and is compliant w/syntax, etc. of React Router v6
 */

function RequireAuth({children, redirectTo}) {
  const {currentUser} = useContext(UserContext);
  return currentUser ? children : <Navigate to={redirectTo} />
}

export default RequireAuth;