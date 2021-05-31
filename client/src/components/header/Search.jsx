import React from "react";
import { FaSearch } from "react-icons/fa";

const Search = () => {
  return (
    <div id="search-box">
      <span>
        <FaSearch className="search-icon" />
      </span>
      <input
        className="search-input"
        type="text"
        placeholder="Search "
        style={{ width: 150 }}
      />
    </div>
  );
};

export default Search;
