const mongoose = require("mongoose");
const db = require("../models");
const articles = require("./seed");

mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost/codingblog", {
  useNewUrlParser: true,
  useFindAndModify: false,
});

const articleSeed = [
  {
    title: "ES2021: `String.prototype.replaceAll`",
    content: articles[0],
  },
  {
    title: "Techniques for instantiating classes",
    content: articles[1],
  },
  {
    title:
      "Looping over Arrays: `for` vs. `for-in` vs. `.forEach()` vs. `for-of`",
    content: articles[2],
  },
  {
    title: "Eliminating duplicate objects: three approaches",
    content: articles[3],
  },
  {
    title: "ES2019: Well-formed `JSON.stringify`",
    content: articles[4],
  },
  {
    title: "ES2019: `Object.fromEntries()`",
    content: articles[5],
  },
];

const topicSeed = [
  {
    color: "magenta",
    name: "Java",
  },
  {
    color: "volcano",
    name: "JavaScript",
  },
  {
    color: "orange",
    name: "Algorithm",
  },
  {
    color: "cyan",
    name: "React",
  },
  {
    color: "purple",
    name: "Python",
  },
];

const admin = {
  email: "admin",
  password: "Cgc@237862090",
  role: 1,
};

async function seed() {
  await db.Article.deleteMany({});
  await db.Topic.deleteMany({});
  await db.User.deleteMany({});

  for (t of topicSeed) {
    await db
      .Topic({
        color: t.color,
        name: t.name,
      })
      .save();
  }

  for (a of articleSeed) {
    await db
      .Article({
        title: a.title,
        content: a.content,
      })
      .save();
  }

  await db.User(admin).save();

  addTag("ES2021: `String.prototype.replaceAll`", ["Java", "Python"]);
  addTag("Techniques for instantiating classes", ["JavaScript"]);
  addTag(
    "Looping over Arrays: `for` vs. `for-in` vs. `.forEach()` vs. `for-of`",
    ["JavaScript", "React"]
  );
  addTag("Eliminating duplicate objects: three approaches", [
    "JavaScript",
    "Algorithm",
  ]);
  addTag("ES2019: Well-formed `JSON.stringify`", ["React", "JavaScript"]);
  addTag("ES2019: `Object.fromEntries()`", ["JavaScript"]);
}

async function addTag(title, tagNames) {
  const article = await db.Article.find({ title });
  const articleId = article[0]._id;
  for (t of tagNames) {
    const tag = await db.Topic.find({ name: t });
    article[0].topics.push({
      _id: tag[0]._id,
      color: tag[0].color,
      name: tag[0].name,
    });
    tag[0].articles.push(articleId);
    tag[0].save();
  }
  article[0].save();
}

seed();
