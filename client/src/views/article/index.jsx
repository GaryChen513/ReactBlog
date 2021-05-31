import React, { useState, useEffect } from "react";
import API from "utils/API";
import { Divider } from "antd";
import { FaCalendar } from "react-icons/fa";
import ArticleTag from "components/common/ArticleTag";
import MDEditor from "@uiw/react-md-editor";
import "./article.css";

const Article = (props) => {
  const [article, setArticle] = useState({
    title: "",
    content: "",
    createdAt: "",
    topics: [],
  });

  const articleID = props.match.params.id;

  useEffect(() => {
    loadArticle();
  });

  function loadArticle() {
    API.getArticle(articleID)
      .then((res) => {
        console.log(res);
        setArticle(res.data);
      })
      .catch((err) => console.log(err));
  }

  const { title, content, createdAt, topics } = article;

  return (
    <div className="app-article">
      <div className="post-header">
        <h1 className="post-title">{title}</h1>
        <div className="article-desc">
          <span className="post-time">
            <FaCalendar />
            &nbsp; Posted on &nbsp;
            <span>{createdAt.slice(0, 10)}</span>
          </span>
          <ArticleTag topics={topics} />
          <Divider type="vertical" />
        </div>
      </div>

      <MDEditor.Markdown source={content} className="article-detail" />
    </div>
  );
};

export default Article;
