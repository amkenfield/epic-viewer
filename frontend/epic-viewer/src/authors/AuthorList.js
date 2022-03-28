import React, {useState, useEffect} from 'react';
import SearchForm from '../common/SearchForm';
import EpicViewerApi from '../api/api';
import AuthorCard from './AuthorCard';
import LoadingSpinner from '../common/LoadingSpinner';

/** Show page with list of Authors.
 * 
 *  On mount, loads authors from API.
 *  Re-loads filtered authors on submit fromo search form.
 * 
 *  This is routed to at /authors
 * 
 *  Routes -> {AuthorCard, SearchForm}
 */

function AuthorList() {
  console.debug("AuthorList");

  const [authors, setAuthors] = useState(null);

  useEffect(function getAuthorsOnMount() {
    console.debug("AuthorList useEffect getAuthorsOnMount");
    search();
  }, []);

  async function search(name) {
    let authors = await EpicViewerApi.getAuthors(name);
    setAuthors(authors);
  }

  // Below *may* not be necessary;
  //  seems also an opportunity for broad creativity
  if(!authors) return <LoadingSpinner />;

  return (
    <div className='AuthorsList col-md-8 offset-md-2'>
      <SearchForm searchFor={search}/>
      {authors.length
          ? (
              <div className='AuthorList-list'>
                {authors.map(a => (
                  <AuthorCard 
                    key={a.id}
                    id={a.id}
                    shortName={a.shortName}
                    fullName={a.fullName}
                  />
                ))}
              </div>
          ) : (
              <p className='lead'>Sorry, no results were found!</p>
          )}      
    </div>
  );
}

export default AuthorList;