import React from "react";
import Navbar from "./Navbar";
import Search from "./Search";
import Logo from "./Logo";
import UserInfo from "./UserInfo";
import "./header.css";

const Header = (props) => {
  const {user, setUser , loadUser} = props

  return (
    <div className="header">
      <div className="row d-flex align-items-center">
        <div className="col col-md-2">
          <Logo />
        </div>
        <div className="col col-md-2" id="search">
          <Search />
        </div>
        <div className="col ">
          <Navbar user={user} />
        </div>
        <div className="col-md-2">
          <UserInfo user={user} setUser={setUser} loadUser={loadUser}/>
        </div>
      </div>
    </div>
  );
};

export default Header;
