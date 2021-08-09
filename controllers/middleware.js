const jwt = require('jsonwebtoken')
require('dotenv').config();


const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if(token == null) return res.sendStatus(401)

  jwt.verify(token, process.env.JWT, (err, userToken) => {
    if(err) return res.sendStatus(403)
    req.userToken = userToken
    next()
  }) 
}

module.exports = {
  authenticateToken
}