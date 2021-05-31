import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu } from "antd";
import { FaHome, FaEdit, FaFolderOpen, FaTags } from "react-icons/fa";
import navList from "./navList.js";
import _ from "lodash";

const Navbar = (props) => {
  const tagNames = {
    Home: <FaHome />,
    Archives: <FaEdit />,
    Edit: <FaFolderOpen />,
    Topics: <FaTags />,
  };
  const { user } = props;
  const [list, setList] = useState([]);

  useEffect(() => {
    if (!_.isEmpty(user) && user.role === 1) {
      setList(navList);
    } else {
      const newList = navList.filter((n) => n.title !== "Edit");
      setList(newList);
    }
  }, [user]);

  const location = useLocation();
  return (
    <Menu
      mode={"horizontal"}
      selectedKeys={[location.pathname]}
      className="header-nav"
    >
      {list.map((nav) => {
        return (
          <Menu.Item key={nav.link}>
            <Link to={nav.link} className="nav-link active" key={nav.title}>
              {tagNames[nav.title]}
              <span> {nav.title}</span>
            </Link>
          </Menu.Item>
        );
      })}
    </Menu>
  );
};

export default Navbar;
