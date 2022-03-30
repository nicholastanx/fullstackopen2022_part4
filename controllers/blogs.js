const express = require('express')
const Blog = require('../models/blog')

const blogRouter = express.Router()

blogRouter.get('', (request, response, next) => {
  Blog
    .find({})
    .populate('user', { username: 1, name: 1 })
    .then(blogs => {
      response.json(blogs)
    })
    .catch(err => next(err))
})

blogRouter.post('', async (request, response) => {
  const body = request.body
  const user = request.user
  if (!user) {
    response.status(401).send('user token must be provided in the request')
    return
  }
  
  const blog = new Blog({
    title: body.title,
    author: body.author,
    likes: body.likes,
    url: body.url,
    user: user._id,
  })

  const savedBlog = await blog.save()
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()

  response.status(201).json(savedBlog)
})

blogRouter.delete('/:id', async (request, response) => {
  const requestedId = request.params.id

  const user = request.user
  if (!user) {
    response.status(401).send('user token must be provided in the request')
    return
  }

  const result = await Blog.findById(requestedId)
  if (!result) {
    response.status(404).send(`blog with id ${requestedId} was not found`)
    return
  }

  if (result.user.toString() !== user.id) {
    response.status(401).json({ error: 'you do not have access to this resource' })
    return
  }

  await Blog.deleteOne({ _id: requestedId })
  response.status(204).end()
})

blogRouter.put('/:id', async (request, response) => {
  const requestedId = request.params.id
  const data = request.body

  const result = await Blog.findByIdAndUpdate(requestedId, data)
  if (result) {
    response.status(200).end()
  } else {
    response.status(404).send(`blog with id ${requestedId} was not found`)
  }
})

module.exports = blogRouter