const mongoose = require("mongoose");

const lighthouseSchema = new mongoose.Schema({
  accessibility: Number,
  searches: {
    type: Number,
    default: 1,
  },
  usersVoted: {
    type: Array,
    default: [],
  },
  comments: {
    type: Array,
    default: [],
  },
  url: String,
});

const LighthouseModel = mongoose.model(
  "Lighthouseaccessibility",
  lighthouseSchema
);

module.exports = LighthouseModel;
