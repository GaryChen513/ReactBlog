import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import MdEditor from "components/MdEditor";
import { Button, Input, message, Modal } from "antd";
import "./edit.css";
import API from "utils/API";
import List from "./Tag";

const Edit = (props) => {
  const [topics, setTopics] = useState([]);
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [selectedList, setSelectedList] = useState([]);
  const history = useHistory();

  const Id = props.match.params.id;

  useEffect(() => {
    loadArticle();
  }, []);

  async function loadArticle() {
    if (Id) {
      const article = await API.getArticle(Id);
      setTitle(article.data.title);
      setTopics(article.data.topics);
      setSelectedList(article.data.topics);
      setContent(article.data.content);
    } else {
      await loadTopics();
    }
  }

  function loadTopics() {
    API.getTopics()
      .then((res) => {
        setTopics(res.data);
      })
      .catch((err) => console.log(err));
  }

  function add() {
    if (!title) return message.warning("Title should not be empty");

    API.addArticle({
      title,
      content,
      topics: selectedList,
    })
      .then((res) => {
        message.success("Article Created");
        history.push("/home");
      })
      .catch((err) => console.log(err));
  }

  function update() {
    API.updateArticle(Id, {
      title,
      content,
      topics: selectedList,
    })
      .then((res) => {
        message.success("Article Updated");
      })
      .catch((err) => console.log(err));
  }

  function OnDelete() {
    API.deleteArticle(Id)
      .then(() => {
        message.success("Article Deleted");
        history.push("/home");
      })
      .catch((err) => console.log(err));
  }

  return (
    <div className="edit-article">
      <ul className="form-list">
        <li>
          <span className="label">Title: </span>
          <span style={{ flex: 1 }}>
            <Input
              placeholder="Input your title"
              className="title-input"
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </span>
        </li>
        <li>
          <span className="label">Topic: </span>
          <span>
            <List
              list={topics}
              selectedList={selectedList}
              setlist={setTopics}
              setSelectedList={setSelectedList}
            />
          </span>
        </li>
      </ul>

      <MdEditor value={content} onChange={setContent} />
      <Button
        type="primary"
        block
        disabled={!title}
        className="action-icon"
        onClick={() => {
          Id ? update() : add();
        }}
      >
        {Id ? "Update" : "Create"}
      </Button>
      {Id ? (
        <Button
          type="danger"
          block
          onClick={() => {
            Modal.confirm({
              title: "Are you sure to delete this post",
              onOk: OnDelete,
            });
          }}
          className="action-icon"
        >
          Delete
        </Button>
      ) : (
        <></>
      )}
    </div>
  );
};

export default Edit;
