import React from "react";
import {Routes, Route} from "react-router-dom";
import Homepage from "../homepage/Homepage";

function EVRoutes({login, signup}) {
  console.debug("Routes", `login=${typeof login}`, `signup=${typeof signup}`);

  return (
    <div className="pt-5">
      <Routes>

        <Route path="/" element={<Homepage />} />

        {/* Redirect doesn't exist in r-r-d v6;
            somewhat unsure at the moment how to implement,
            see their github post for further info/advice/etc */}
        {/* <Redirect to="/" /> */}
      </Routes>
    </div>
  )
}

export default EVRoutes;