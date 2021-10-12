const mongoose = require("mongoose");
const { Response } = require("./entities");

const lighthouseSchema = new mongoose.Schema(Response);

const LighthouseModel = mongoose.model(
  "Lighthouseaccessibility",
  lighthouseSchema
);

module.exports = LighthouseModel;
