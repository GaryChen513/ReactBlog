import React from "react";
import { Link } from "react-router-dom";

import { Divider, Tag } from "antd";

const ArticleTag = (props) => {
  const tagList = props.topics;

  return (
    <>
      <Divider type="vertical" style={{ marginRight: 7 }} />
      {tagList.map((tag, i) => (
        <Tag key={i} color={tag.color}>
          <Link to="#">{tag.name}</Link>
        </Tag>
      ))}
    </>
  );
};

export default ArticleTag;
