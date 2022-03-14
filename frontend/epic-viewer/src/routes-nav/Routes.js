import React from "react";
import {Switch, Route, Redirect} from "react-router-dom";
import Homepage from "../homepage/Homepage";

function Routes({login, signup}) {
  console.debug("Routes", `login=${typeof login}`, `signup=${typeof signup}`);

  return (
    <div className="pt-5">
      <Switch>

        <Route exact path="/">
          <Homepage />
        </Route>

        <Redirect to="/" />
      </Switch>
    </div>
  )
}

export default Routes;