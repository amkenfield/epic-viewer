import React from 'react';
import {Link} from "react-router-dom";

function AuthorCard({shortName, fullName, id}) {
  console.debug("AuthorCard", shortName);

  return (
    <Link className='AuthorCard card' to={`/authors/${id}`}>
      <div className='card-body'>
        <h5 className='card-title'>
          {shortName}
        </h5>
        <p>{fullName}</p>
      </div>
    </Link>
  );
}

export default AuthorCard;