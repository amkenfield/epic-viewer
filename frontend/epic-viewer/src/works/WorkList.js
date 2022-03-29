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
}

export default WorkList;