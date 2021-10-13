const express = require("express");
const LighthouseModel = require("./db");
const getLighthouseScore = require("./lighthouse");

const router = express.Router();

router.get("/accessibility", (_, res) => {
  LighthouseModel.find({}, (_, data) => {
    res.json(data);
  });
});

router.post("/accessibility", async (req, res) => {
  const url = req.body.url;
  const lighthouseResults = await getLighthouseScore(url);

  try {
    LighthouseModel.findOneAndUpdate(
      { url: lighthouseResults.finalUrl },
      {
        $set: { a11y_score: lighthouseResults.accessibilityScore },
        $inc: { hits: 1 },
      },
      { useFindAndModify: false, new: true },
      (_, data) => {
        if (!data) {
          data = new LighthouseModel({
            url: lighthouseResults.finalUrl,
            a11y_score: lighthouseResults.accessibilityScore,
          });
          data.save((err) => {
            if (!err) {
              console.log("New site a11y_score created");
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

  // const lighthouseResults = await getLighthouseScore(url);
  let lighthouseResults = {
    finalUrl: url,
    accessibilityScore: undefined
  }
  console.log(lighthouseResults);
  try {
    LighthouseModel.findOneAndUpdate(
      { url: lighthouseResults.finalUrl },
      {
        $set: { a11y_score: lighthouseResults.accessibilityScore },
        $inc: { hits: 1 },
      },
      { useFindAndModify: false, new: true },
      async (_, data) => {
        if (!data) {
          lighthouseResults = await getLighthouseScore(url);
          data = new LighthouseModel({
            url: lighthouseResults.finalUrl,
            a11y_score: lighthouseResults.accessibilityScore,
          });
        }
        
        data.save((err) => {
          if (!err) {
            console.log("New site a11y_score created/updated");
          }
        });
        const response = {
          id: data._id,
          a11y_score: data.a11y_score,
          user_score: data.user_score ?? null,
          hits: data.hits,
          url: data.url,
          comments: data.comments || [],
        };
        console.log(response)
        res.status(200).json(response);
      }
    );
  } catch (e) {
    res.status(500).send(e);
  }
});

router.route("/feedback").post(async (req, res) => {
  const { name, user_score, url, body } = req.body;
  const currentTime = new Date();

  let finalUserScore = 0;
  let numberOfRatings = 0;

  try {
    LighthouseModel.findOneAndUpdate(
      { url },
      {
        $push: {
          comments: {
            name,
            body,
            user_score: user_score,
            created_at: currentTime.toISOString(),
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

        data.comments.forEach((comment) => {
          if (comment.user_score !== null) {
            finalUserScore += comment.user_score;
            numberOfRatings++;
          }
        });

        finalUserScore /= numberOfRatings;
      }
    );
  } catch (e) {
    res.status(500).send(e);
  }

  LighthouseModel.findOneAndUpdate(
    { url },
    {
      $set: {
        user_score: finalUserScore,
      },
    },
    { useFindAndModify: false },
    (err, data) => {
      if (err) {
        res.status(400).send(err);
        return;
      }

      if (!data) {
        res.status(404).send("Data not found 2");
        return;
      }

      res.status(200).json(data);
    }
  );
});

module.exports = router;
