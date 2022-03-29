import React from "react";
import LineCard from "./LineCard";

function LineCardList({lines}) {
  console.debug("LineCardList", "lines=", lines);

  return (
    <div className="LineCardList">
      {lines.map(line => (
        <LineCard 
          key={line.id}
          id={line.id}
          lineNum={line.lineNum}
          lineText={line.lineText}
          scanPattern={line.scanPattern}
          fifthFootSpondee={line.fifthFootSpondee}
          bookNum={line.bookNum}
        />
      ))}
    </div>
  );
}

export default LineCardList;