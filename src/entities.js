const Comment = {
  id: Number,
  name: String,
  body: String,
  created_at: String,
  score: Number,
};

const Response = {
  id: String,
  a11y_score: String,
  user_score: String,
  hits: Number,
  url: String,
  comments: [Comment],
};

module.exports = { Response, Comment };
