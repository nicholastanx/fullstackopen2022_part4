const bcrypt = require('bcrypt')
const express = require('express')
const User = require('../models/user.js')

const usersRouter = express.Router()

usersRouter.post('', async (request, response) => {
  const { username, name, password } = request.body

  if (password.length < 3) {
    response.status(400).send({ error: 'password must be at least 3 characters long' })
    return
  }

  const existingUser = await User.find({ username })
  if (existingUser.length !== 0) {
    response.status(400).json({ error: 'a user with that username already exists' })
    return
  }

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const user = new User({
    username,
    name,
    passwordHash,
  })

  const savedUser = await user.save()
  response.status(201).json(savedUser)
})

usersRouter.get('/', async (request, response) => {
  const users = await User.find({}).populate('blogs', { title: 1, author: 1, url: 1 })
  response.json(users)
})

module.exports = usersRouter