import React, { useState, useEffect } from "react";
import { Link, useHistory } from "react-router-dom";
import _ from "lodash";
import ArticleTag from "components/common/ArticleTag";
import { Divider } from "antd";
import MDEditor from "@uiw/react-md-editor";

const ArticleList = (props) => {
  const history = useHistory();
  const list = props.articles;
  const { user } = props;
  const [newUser, setNewUser] = useState("")

  function jumpTo(id) {
    if (!_.isEmpty(newUser) && newUser.role === 1) {
      history.push("/edit/" + id);
    } else {
      history.push("/articles/" + id);
    }
  }

  useEffect(()=> {
    setNewUser(user)
  }, [user])

  return (
    <ul className="app-home-list">
      {list.map((item) => (
        <li key={item._id} className="app-home-list-item">
          <Divider orientation="left">
            {!_.isEmpty(newUser) && newUser.role === 1 ? (
              <Link className="title" to={"/edit/" + item._id}>
                {item.title}
              </Link>
            ) : (
              <Link className="title" to={"/articles/" + item._id}>
                {item.title}
              </Link>
            )}
            <span className="posted-time">{item.createdAt.slice(0, 10)}</span>
          </Divider>

          <div className="article-detail" onClick={() => jumpTo(item._id)}>
            <MDEditor.Markdown source={item.content} className="content" />
          </div>

          <div className="list-item-others">
            <ArticleTag topics={item.topics} />
          </div>
        </li>
      ))}
    </ul>
  );
};

// {item.createdAt.slice(0, 10)} !!!! at line 23
export default ArticleList;
