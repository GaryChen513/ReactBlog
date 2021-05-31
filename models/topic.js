const mongoose = require("mongoose");

const { Schema, model } = mongoose;

const topicSchema = new Schema(
  {
    name : {type: String, required: true},
    color: {type: String, required: true},
    articles: {type: Array, default:[],require: true}
  },
  { timestamps: true }
)

module.exports = model('Topic', topicSchema)