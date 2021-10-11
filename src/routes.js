const express = require("express");
const lighthouseModel = require("./db");
const getLighthouseScore = require("./lighthouseApp");

const router = express.Router();

router.get("/accessibility", (_, res) => {
  lighthouseModel.find({}, (_, data) => {
    res.json(data);
  });
});

router.post("/accessibility", async (req, res) => {
  const url = req.body.url;
  console.log(url);

  const lighthouseResults = await getLighthouseScore(url);
  console.log(lighthouseResults);
  try {
    lighthouseModel.findOneAndUpdate(
      { url: lighthouseResults.finalUrl },
      {
        $set: { accessibility: lighthouseResults.accessibilityScore },
        $inc: { searches: 1 },
      },
      { useFindAndModify: false, new: true },
      (_, data) => {
        if (!data) {
          data = new lighthouseModel({
            url: lighthouseResults.finalUrl,
            accessibility: lighthouseResults.accessibilityScore,
          });
          data.save((err) => {
            if (!err) {
              console.log("New site accessibility created");
            }
          });
        } else {
          data.save((err) => {
            if (!err) {
              console.log("Update success");
            }
          });
        }
        res.status(200).json({ url: lighthouseResults.finalUrl });
      }
    );
  } catch (e) {
    res.status(500).send(e);
  }
});

router.route("/accessibility/:url").get(async (req, res) => {
  const url = decodeURIComponent(req.params.url);

  const lighthouseResults = await getLighthouseScore(url);
  console.log(lighthouseResults);
  try {
    lighthouseModel.findOneAndUpdate(
      { url: lighthouseResults.finalUrl },
      {
        $set: { accessibility: lighthouseResults.accessibilityScore },
        $inc: { searches: 1 },
      },
      { useFindAndModify: false, new: true },
      (err, data) => {
        if (!data) {
          data = new lighthouseModel({
            url: lighthouseResults.finalUrl,
            accessibility: lighthouseResults.accessibilityScore,
          });
          data.save((err) => {
            if (!err) {
              console.log("New site accessibility created");
            }
          });
        } else {
          data.save((err) => {
            if (!err) {
              console.log("Update success");
            }
          });
        }
        res.status(200).json(data);
      }
    );
  } catch (e) {
    res.status(500).send(e);
  }
});

router.route("/feedback").post(async (req, res) => {
  const { name, userScore, url } = req.body;

  try {
    lighthouseModel.findOneAndUpdate(
      { url: url },
      {
        $push: {
          users_voted: {
            name: name,
            userScore: userScore,
          },
        },
      },
      { useFindAndModify: false },
      (err, data) => {
        if (err) {
          res.status(400).send(err);
          return;
        }
        if (!data) {
          res.status(404).send("Data not found");
          return;
        }
        res.status(200).json(data);
      }
    );
  } catch (e) {
    res.status(500).send(e);
  }
});

module.exports = router;
