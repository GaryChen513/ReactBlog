import React, { useState, useEffect } from "react";
import ArticleList from "./List";
import "./home.css";
import API from "utils/API";

const Home = (props) => {
  const [articles, setArticles] = useState([]);
  const { user } = props;

  useEffect(() => {
    loadArticles();
  }, [user]);

  function loadArticles() {
    API.getArticles()
      .then((res) => {
        setArticles(res.data);
      })
      .catch((err) => console.log(err));
  }

  return (
    <div className="app-home">
      <ArticleList articles={articles} user={user} />
    </div>
  );
};

export default Home;
