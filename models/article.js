const mongoose = require("mongoose");
const moment = require("moment");

const { Schema, model } = mongoose;

const articleSchema = new Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    topics: { type: Array, default: [], require: true },
  },
  { timestamps: true }
);

module.exports = model("Article", articleSchema);
