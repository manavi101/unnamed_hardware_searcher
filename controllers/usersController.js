const { validationResult } = require('express-validator')
const HttpError = require('../models/http-error')
const User = require('../models/user')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
require('dotenv').config();

const getUsers = async (req, res, next) => {
  let users
  try {
    users = await User.find()
  } catch (error) {
    return next(
      new HttpError('Internal error getting users', 500)
    )
  }
  res.status(200).json({users: users.map( user => user.toObject({getters: true}))})
}

const getUserById = async (req, res, next) => {
  const { id } = req.params

  let user
  try {
    user = await User.findById(id)
  } catch (error) {
    return next(
      new HttpError('Internal error getting the user by id', 500)
    )
  }

  if(!user) 
    return next(
      new HttpError('Could not find a user with the provided id', 404)
    )

  res.status(200).json({user: user.toObject({getters: true})})
}

const signup = async (req, res, next) => {

  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    )
  }

  const { firstName, lastName, email, password, avatarUri, birthDate } = req.body

  let existingUser
  try {
    existingUser = await User.findOne({email})
  } catch (error) {
    return next(
      new HttpError('Signing up failed, please try again later.', 500)
    )
  }

  if (existingUser) {
    return next(
      new HttpError('User exists already, please login instead.', 422)
    )
  }

  let hashedPassword
  try {
    hashedPassword = await bcrypt.hash(password, 12)
  } catch (error) {
    return next(
      new HttpError('Could not create user, please try again.', 500)
    )
  }

  const createdUser = new User({
    firstName,
    lastName,
    email,
    avatarUri: avatarUri ? avatarUri : 'https://www.sogapar.info/wp-content/uploads/2015/12/default-user-image.png',
    password: hashedPassword,
    birthDate
  })

  try {
    await createdUser.save()
  } catch (error) {
    return next(
      new HttpError('Siging up failed, please try again later.', 500)
    )
  }

  let token
  try {
    token = jwt.sign(
      { 
        userId: createdUser.id, 
        email: createdUser.email, 
        firstName: createdUser.firstName, 
        lastName: createdUser.lastName, 
        avatarUri: createdUser.avatarUri 
      }, 
      process.env.JWT, 
      {expiresIn: '24hr'}
    )
  } catch (error) {
    return next(
      new HttpError('Siging up failed, please try again.', 500)
    )
  }

  res.status(201).json({ token })

}

const login = async (req, res, next) => {
  const { email, password } = req.body

  let existingUser
  try {
    existingUser = await User.findOne({email}).select('+password')
  } catch (error) {
    return next(
      new HttpError('Logging in failed, please try again later.', 500)
    )
  }

  if(!existingUser) {
    return next(
      new HttpError('Invalid credentials, could not log you in.', 401)
    )
  }
  
  let isValidPassword = false
  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password)
  } catch (error) {
    return next(
      new HttpError('Could not log you in, please check you credentials and try again.', 500)
    )
  }

  if(!isValidPassword) {
    return next(
      new HttpError('Invalid credentials, could not log you in.', 401)
    )
  }

  let token
  try {
    token = jwt.sign(
      { 
        userId: existingUser.id, 
        email: existingUser.email, 
        firstName: existingUser.firstName, 
        lastName: existingUser.lastName, 
        avatarUri: existingUser.avatarUri 
      }, 
      process.env.JWT, 
      {expiresIn: '24hr'}
    )
  } catch (error) {
    return next(
      new HttpError('Logging in failed, please try again.', 500)
    )
  }


  res.json({
    token
  })
}

const deleteUser = async (req, res, next) => {
  const { id } = req.params

  let user
  try {
    user = await User.findById(id)
  } catch (error) {
    return next(
      new HttpError('Something went wrong, could not delete user.', 500)
    )
  }

  try {
    await user.remove()
  } catch (error) {
    return next(
      new HttpError('Something went wrong, could not delete user.', 500)
    )
  }

  res.status(200).json({message: "Deleted user."})
}

const getMyUserData = async (req, res, next) => {
  const { userToken } = req
  console.log('user', userToken)
  let user
  try {
    user = await User.findById(userToken.userId)
  } catch (error) {
    return next(
      new HttpError('Something went wrong, could not find user data.', 500)
    )
  }
  
  res.status(200).json({user})
}


module.exports = {
  getUsers,
  getUserById,
  signup,
  login,
  deleteUser,
  getMyUserData
}