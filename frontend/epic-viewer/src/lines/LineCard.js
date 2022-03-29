import React from 'react';
import {Link} from 'react-router-dom';

/** Show limited information about a line
 * 
 *  Is rendered by LineCardList to show a card for each line.
 * 
 *  Each line links to the corresponding full LineDetail page
 * 
 *  LineCardList -> LineCard -> LineDetail
 */

function LineCard ({id, lineNum, lineText, bookNum}) {
  console.debug("LineCard");

  return (
    <Link className='LineCard card' to={`/lines/${id}`}>
      <div className='card-body'>
        <p><small>{bookNum}.{lineNum}</small></p>
        <h6>{lineText}</h6>
      </div>
    </Link>
  );
}

export default LineCard;