const express = require('express');
const {
  signup,
  getUsers,
  getUserById,
  login,
  deleteUser,
  getMyUserData
} = require('../controllers/usersController')
const {
  authenticateToken
} = require('../controllers/middleware')
const { check } = require('express-validator')

const router = express.Router();

router.get('/', getUsers)
router.get('/myUserData', authenticateToken, getMyUserData)
router.get('/:id', getUserById)
router.post('/login', login)
router.delete('/:id', deleteUser)
router.post(
  '/signup',
  [
    check('firstName')
      .not()
      .isEmpty(),
    check('lastName')
      .not()
      .isEmpty(),
/*     check('avatarUri')
      .isURL(), */
    check('email')
      .normalizeEmail()
      .isEmail(),
    check('password')
      .isLength({min:8})
  ],
   signup)

module.exports = router;