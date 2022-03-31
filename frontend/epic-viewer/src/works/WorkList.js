import React, {useState, useEffect} from 'react';
import SearchForm from '../common/SearchForm';
import EpicViewerApi from '../api/api';
import WorkCardList from './WorkCardList';
import LoadingSpinner from '../common/LoadingSpinner';

/** Show page with list of works
 * 
 *  On mount, loads works from API.
 *  Re-loads filtered works on submit from search form.
 * 
 *  WorkList -> WorkCardList -> WorkCard
 * 
 *  Routed to at /works
 */

function WorkList() {
  console.debug("WorkList");

  const [works, setWorks] = useState(null);

  useEffect(function getAllWorksOnMount() {
    console.debug("WorkList useEffect getAllWorksOnMount");
    search();
  }, []);

  // Not quite sure if I'm doing the search filters correctly here
  async function search(data) {
    console.log("here be data: ", data)
    let works = await EpicViewerApi.getWorks(data);
    setWorks(works);
  }

  if(!works) return <LoadingSpinner />

  return (
    <div className='WorkList col-md-8 offset-md-2'>
      <SearchForm searchFor={search}/>
      {works.length
        ? <WorkCardList works={works} />
        : <p className='lead'>Sorry, no results were found!</p>
      }
    </div>
  );
}

export default WorkList;