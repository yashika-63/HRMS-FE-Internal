import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const GlobalSearchBar = ({ routes }) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter routes based on search query
  const filteredRoutes = routes.filter(route =>
    route.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="search-bar-container">
      <input
        type="text"
        placeholder="Search..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      
      <div className="search-results">
        {filteredRoutes.length > 0 ? (
          filteredRoutes.map((route, index) => (
            <Link key={index} to={route.path}>
              <div className="search-item">{route.title}</div>
            </Link>
          ))
        ) : (
          <div className="no-results">No results found</div>
        )}
      </div>
    </div>
  );
};

export default GlobalSearchBar;
