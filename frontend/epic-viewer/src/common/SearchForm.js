import React, {useState} from 'react';

/** Search widget.
 * (NTS - also some practice/experience for further widget expansion)
 * 
 *  Appears on all resource Lists: AuthorList, WorkList, Linelist,
 *    so that these can be filtered down.
 * 
 *  ATM the form only has one input field - and therefore
 *    only one search term. This is sufficient for the inital
 *      AuthorList component, and provides a fundament for further sophistication
 * 
 *  
 *  This component doesn't *do* the searching, but it renders the search
 *    form and calls the `searchFor` function prop that runs in a parent to do the
 *      searching.
 * 
 *  {AuthorList, WorkList, LineList} -> SearchForm
 */

function SearchForm({searchFor}) {
  console.debug("SearchForm", "searchFor=", typeof searchFor);

  const [searchTerm, setSearchTerm] = useState("");

  function handleSubmit(evt) {
    evt.preventDefault();
    searchFor(searchTerm.trim() || undefined);
    setSearchTerm(searchTerm.trim());
  }

  function handleChange(evt) {
    setSearchTerm(evt.target.value);
  }

  return (
    <div className='SearchForm mb-4'>
      <form className='form-inline' onSubmit={handleSubmit}>
        <input 
          className='form-control form-control-lg flex-grow-1'
          name='searchTerm'
          placeholder='Enter search term...'
          value={searchTerm}
          onChange={handleChange}
        />
        <button type='submit' className='btn btn-lg btn-primary'>
          Submit
        </button>
      </form>
    </div>
  );
}

export default SearchForm;