import React, { useState, useEffect, Fragment } from "react";
import { Link } from "react-router-dom";
import { Timeline } from "antd";
import { groupBy } from "utils";
import { ClockCircleOutlined } from "@ant-design/icons";
import "./archive.css";
import API from "utils/API";

const Archive = (props) => {
  const [dataList, setDataList] = useState([]);

  useEffect(() => {
    loadArchive();
  }, []);

  async function loadArchive() {
    API.getArticles()
      .then((res) => setDataList(res.data))
      .catch((err) => console.log(err));
  }

  const list = groupBy(dataList, (item) => item.createdAt.slice(0, 4)); // group by year of creation

  return (
    <div className="app-archive">
      <Timeline>
        {list.map((d, i) => (
          <Fragment key={i}>
            {i === 0 && (
              <Timeline.Item>
                <span className="desc">{` ${dataList.length} articles `}</span>
                <br />
                <br />
              </Timeline.Item>
            )}

            <Timeline.Item
              dot={<ClockCircleOutlined style={{ fontSize: "16px" }} />}
              color="red"
            >
              <div className="year">
                {d[0]["createdAt"].slice(0, 4)}
                ...
              </div>
              <br />
            </Timeline.Item>

            {d.map((item) => (
              <Timeline.Item key={item._id}>
                <span style={{ fontSize: "13px", marginRight: "16px" }}>
                  {item.createdAt.slice(0, 10)}
                </span>
                <Link to={`/articles/${item._id}`}>{item.title}</Link>
              </Timeline.Item>
            ))}
          </Fragment>
        ))}
      </Timeline>
    </div>
  );
};

export default Archive;
