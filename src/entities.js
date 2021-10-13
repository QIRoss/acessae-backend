const Comment = {
  id: Number,
  name: String,
  body: String,
  created_at: String,
  score: String,
};

const Response = {
  id: String,
  a11y_score: String,
  user_score: {
    type: String,
    default: "S/N",
  },
  hits: Number,
  url: String,
  comments: [Comment],
};

module.exports = { Response, Comment };
