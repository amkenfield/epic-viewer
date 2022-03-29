import React, {useState, useEffect} from "react";
import { useParams } from "react-router-dom";
import EpicViewerApi from "../api/api";
import LoadingSpinner from "../common/LoadingSpinner";

/** Line Detail page.
 * 
 *  Renders information about individual line
 * 
 *  Routed at /lines/:id
 * 
 *  Routes -> LineDetail
 */

function LineDetail() {
  const {id} = useParams();
  console.debug("LineDetail", "id=", id);

  const [line, setLine] = useState(null);

  // this seems like an overly elaborate way to do this...
  useEffect(function getLineUE() {
    async function getLine() {
      setLine(await EpicViewerApi.getLine(id));
    }
    getLine();
  }, [id]);
  
  if(!line) return <LoadingSpinner />

  console.log("FFS: ", line.fifthFootSpondee)
  return (
    <div className="LineDetail col-md-8 offset-md-2">
      <p><small>{line.bookNum}.{line.lineNum}</small></p>
      <h5>{line.lineText}</h5>
      <h6>{line.scanPattern}</h6>
      <p><small>{line.fifthFootSpondee.toString()}</small></p>
    </div>
  );
}

export default LineDetail;