import React, { useState, useEffect } from "react";
import { SIDEBAR as SB } from "config.js";

import { Link } from "react-router-dom";
import Href from "../common/Href";
import pic from "assets/pic.JPG";
import { Divider, Tag } from "antd";
// import { articleList, tagList } from "dummy.js";
import API from "utils/API";
import "./sideBar.css";

const SideBar = () => {
  const [articleList, setArticleList] = useState([]);
  const [tagList, setTagList] = useState([]);

  useEffect(() => {
    loadFiveArticles();
    loadTags();
  }, []);

  function loadFiveArticles() {
    API.getArticles()
      .then((res) => {
        setArticleList(res.data.slice(1, 6));
      })
      .catch((err) => console.log(err));
  }

  function loadTags() {
    API.getTopics()
      .then((res) => {
        setTagList(res.data);
      })
      .catch((err) => console.log(err));
  }

  return (
    <aside className="app-sidebar">
      <img
        className="side-pic"
        src={pic}
        alt=""
        style={{ width: "132px", height: "132px", borderRadius: "50%" }}
      />
      <h2 className="title">{SB.title}</h2>
      <ul className="home-page">
        {SB.homepages.map((item) => {
          return (
            <li key={item.name}>
              {item.icon}
              <Href href={item.link} children={item.name} />
            </li>
          );
        })}
      </ul>

      <Divider orientation="left"> Top Article </Divider>
      <ul className="article-list">
        {articleList.map((d) => (
          <li key={d._id}>
            <Link to={"/articles/" + d._id}>{d.title}</Link>
          </li>
        ))}
      </ul>

      <Divider orientation="left"> Tags </Divider>
      <div className="tag-list">
        {tagList.map((tag, i) => (
          <Tag key={i} color={tag.color}>
            <Link to="#">{tag.name}</Link>
          </Tag>
        ))}
      </div>
    </aside>
  );
};

export default SideBar;
