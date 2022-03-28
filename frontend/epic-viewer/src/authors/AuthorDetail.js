import React, {useState, useEffect} from "react";
import {useParams} from "react-router-dom";
import EpicViewerApi from "../api/api";
import LoadingSpinner from "../common/LoadingSpinner";
import WorkCardList from "../works/WorkCardList";

function AuthorDetail() {
  const {id} = useParams();
  const [author, setAuthor] = useState(null);
  
  useEffect(function getAuthorAndWorks() {
    async function getAuthor() {
      setAuthor(await EpicViewerApi.getAuthor(id));
    }
    getAuthor();
  }, [id]);

  if(!author) return <LoadingSpinner />;

  return (
    <div className="AuthorDetail col-md-8 offset-md-2">
      <h4>{author.shortName}</h4>
      <p>{author.fullName}</p>
      <WorkCardList works={author.works} />
    </div>
  );
}

export default AuthorDetail;