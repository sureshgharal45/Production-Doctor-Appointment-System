const JWT = require("jsonwebtoken");

module.exports = async (req, res, next) => {
  try {
    const token = req.headers["authorization"].split(" ")[1];
    JWT.verify(token, process.env.JWT_SECRET, (err, decode) => {
      if (err) {
        return res.status(200).send({ message: "Auth failed", success: false });
      } else {
        req.body.userId = decode.id;
        // console.log('req.body.userId',req.body.userId);
        // console.log('decode',decode);
        next();
      }
    });
  } catch (err) {
    console.log(err);
    res.status(401).send({ message: "Auth failed", success: false });
  }
};
