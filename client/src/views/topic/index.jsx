import React, { useState, useEffect } from "react";
import { Badge, Tag } from "antd";
import { Link } from "react-router-dom";
import API from "utils/API";
import "./topic.css";

const Topic = () => {
  const [topics, setTopics] = useState([]);

  useEffect(() => {
    loadTopics();
  }, []);

  function loadTopics() {
    API.getTopics()
      .then((res) => {
        setTopics(res.data);
      })
      .catch((err) => console.log(err));
  }

  return (
    <div className="app-topics">
      <h2 className="title">Topics</h2>
      <p className="topic-all-title">{`${topics.length} tags in total`}</p>

      <div className="topic-list">
        {topics.map((item, i) => (
          <Badge count={item.articles.length} key={item.name}>
            <Tag color={item.color}>
              <Link to={"#"}>{item.name}</Link>
            </Tag>
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default Topic;
