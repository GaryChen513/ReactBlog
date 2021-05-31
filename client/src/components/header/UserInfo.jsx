import React, { useState} from "react";

import { Button } from "antd";
import _ from "lodash";
import { Avatar, Divider } from "antd";
import { UserOutlined } from "@ant-design/icons";
import API from "utils/API";

import Modal from "components/common/Modal";

const UserInfo = (props) => {
  const [type, setType] = useState("");
  const [visible, setVisible] = useState(false);
  const {user, setUser , loadUser} = props

  function setLogin() {
    setVisible(true);
    setType("log in");
  }

  function setSignup() {
    setVisible(true);
    setType("sign up");
  }

  function logout() {
    API.logout()
      .then(() => {
        loadUser();
      })
      .catch((err) => console.log(err));
  }


  return (
    <div className="header-userInfo">
      {!_.isEmpty(user) ? (
        <>
          <Avatar icon={<UserOutlined />}>{user.email}</Avatar>
          <Divider type="vertical" style={{ marginRight: 7 }} />
          <Button ghost type="danger" size="small" onClick={() => logout()}>
            Logout
          </Button>
        </>
      ) : (
        <>
          <Button
            ghost
            type="primary"
            size="small"
            style={{ marginRight: 20 }}
            onClick={(e) => setLogin()}
          >
            Login
          </Button>
          <Button ghost type="danger" size="small" onClick={() => setSignup()}>
            Sign up
          </Button>
          <Modal
            type={type}
            visible={visible}
            setVisible={setVisible}
            setUser={setUser}
            loadUser= {loadUser}
          />
        </>
      )}
    </div>
  );
};

export default UserInfo;
