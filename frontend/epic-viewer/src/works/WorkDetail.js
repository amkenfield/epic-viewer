import React, {useState, useEffect} from "react";
import { useParams } from "react-router-dom";
import EpicViewerApi from "../api/api";
import LineCardList from "../lines/LineCardList";
import LoadingSpinner from "../common/LoadingSpinner";

/** Work Detail page.
 * 
 *  Renders information about work, including the lines of the text.
 * 
 *  Routed at /works/:id
 * 
 *  Routes -> WorkDetail -> LineCardList
 */

function WorkDetail() {
  const {id} = useParams();
  console.debug("WorkDetail", "id=", id);

  const [work, setWork] = useState(null);

  useEffect(function getWorkAndLines() {
    async function getWork() {
      setWork(await EpicViewerApi.getWork(id));
    }

    getWork();
  }, [id]);

  if(!work) return <LoadingSpinner />

  return (
    <div className="WorkDetail col-md-8 offset-md-2">
      <h4>{work.shortTitle}</h4>
      <LineCardList lines={work.lines} />
    </div>
  );
}

export default WorkDetail;