import { FaGithub, FaLinkedin } from "react-icons/fa";

export const HEADER_BLOG_NAME = "CodingBlog";

export const SIDEBAR = {
  pic: "assets/pic.JPG",
  title: "Gary Chen",

  homepages: [
    {
      name: "Github",
      link: "www.github.com/GaryChen513",
      icon: <FaGithub className="homepage-icon" />,
    },
    {
      name: "Linkedin",
      link: "www.linkedin.com/in/gary-chen513",
      icon: <FaLinkedin className="homepage-icon" />,
    },
  ],
};
