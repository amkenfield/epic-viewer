import React from 'react';
import {Link} from 'react-router-dom';

/** Show limited information about a work
 * 
 *  Is rendered by WorkCardList to show a card for each work.
 * 
 *  Each card links to the corresponding full WorkDetail page
 *    (containing all lines, etc.)
 * 
 *  WorkCardList -> WorkCard -> WorkDetail
 */

function WorkCard({id, shortTitle, fullTitle, langCode, authorId}) {
  console.debug("WorkCard");

  return (
    <Link className='WorkCard card' to={`/works/${id}`}>
      <div className='card-body'>
        <h6 className='card-title'>
          {shortTitle}
        </h6>
        <p><small>{fullTitle}</small></p>
        <p><small>Language: {langCode}</small></p>
      </div>
    </Link>
  );
}

export default WorkCard;