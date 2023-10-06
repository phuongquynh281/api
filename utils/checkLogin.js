const jwt = require("./jwt.js");

module.exports = async function checkLoggedIn(req, res, next) {
  let { token } = req.session;
  if (token) {
    let user = await jwt.verify(token);
    data.infoUser = user.data;
    next();
  } else {
    res.status(401).json({ error: "Chưa đăng nhập" });
  }
};
