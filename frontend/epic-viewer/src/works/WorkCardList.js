import React from "react";
import WorkCard from "./WorkCard";

/** Shows list of work cards.
 * 
 *  Used by both WorkList and AuthorDetail to lst works.
 * 
 *  AuthorDetail -> WorkCardList -> WorkCard
 *  WorkList -> WorkCardList -> WorkCard -> WorkDetail
 */

function WorkCardList ({works}) {
  console.debug("WorkCardList", "works=", works);

  return (
    <div className="WorkCardList">
      {works.map(work => (
        <WorkCard 
          key={work.id}
          id={work.id}
          shortTitle={work.shortTitle}
          fullTitle={work.fullTitle}
          langCode={work.langCode}
          authorId={work.authorId}
        />
      ))}
    </div>
  )
}

export default WorkCardList;