import React, { useState, useEffect } from "react";
import { Route, Switch } from "react-router-dom";
import Header from "components/header";
import SideBar from "components/sideBar";
import Home from "./home";
import Edit from "./edit";
import Article from "./article";
import Archive from "./archive";
import Topic from "./topic";
import API from "utils/API";
import "./style.css";

const Layout = () => {
  const [user, setUser] = useState({});


  useEffect(() => {
    loadUser();
  }, []);

  function loadUser() {
    API.getUser()
      .then((res) => setUser(res.data))
      .catch((err) => console.log(err));
  }

  return (
    <>
      <Header user={user} setUser={setUser} loadUser={loadUser} />
      <div className="row app-wrapper">
        <div className="d-none d-lg-block col-lg-3">
          <SideBar />
        </div>
        <div className="col col-lg-9">
          <Switch>
            <Route
              exact
              path={["/", "/home"]}
              render={() => (
                <Home user={user} setUser={setUser} loadUser={loadUser}  />
              )}
            />
            <Route exact path="/archives" component={Archive} />
            <Route exact path="/articles/:id" component={Article} />
            <Route exact path="/edit/:id" component={Edit} />
            <Route exact path="/edit" component={Edit} />
            <Route exact path="/topics" component={Topic} />
            <Route path="/">
              <p>NoMatch</p>
            </Route>
          </Switch>
        </div>
      </div>
    </>
  );
};

export default Layout;
