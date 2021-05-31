import axios from "axios";

export default {
  getArticles: function () {
    return axios.get("/api/articles");
  },

  getArticle: function (id) {
    return axios.get("/api/articles/" + id);
  },

  addArticle: function (data) {
    return axios.post("/api/articles", data);
  },

  updateArticle: function (id, data) {
    return axios.put("/api/articles/" + id, data);
  },

  deleteArticle: function (id) {
    return axios.delete("/api/articles/"+ id)
  },

  getTopics: function () {
    return axios.get("/api/topics");
  },

  login: function (data) {
    return axios.post("/login", data);
  },

  signup: function (data) {
    return axios.post("/signup", data);
  },

  getUser: function () {
    return axios.get("/login");
  },

  logout: function () {
    return axios.post("/logout");
  },
};
