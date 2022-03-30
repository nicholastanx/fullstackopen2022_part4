const bcrypt = require('bcrypt')
const Blog = require('../models/blog')
const User = require('../models/user')

const initialBlogs = [
  {
    _id: '5a422a851b54a676234d17f7',
    title: 'React patterns',
    author: 'Michael Chan',
    url: 'https://reactpatterns.com/',
    likes: 7,
    __v: 0
  },
  {
    _id: '5a422aa71b54a676234d17f8',
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
    likes: 5,
    __v: 0
  },
  {
    _id: '5a422b3a1b54a676234d17f9',
    title: 'Canonical string reduction',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
    likes: 12,
    __v: 0
  },
  {
    _id: '5a422b891b54a676234d17fa',
    title: 'First class tests',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
    likes: 10,
    __v: 0
  },
  {
    _id: '5a422ba71b54a676234d17fb',
    title: 'TDD harms architecture',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html',
    likes: 0,
    __v: 0
  },
  {
    _id: '5a422bc61b54a676234d17fc',
    title: 'Type wars',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
    likes: 2,
    __v: 0
  }  
]

const initialBlogsWithIds = () => {
  return initialBlogs.map((m) => {
    let n = {...m}
    n.id = n._id
    delete n._id
    delete n.__v
    return n
  })
}

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blogs => blogs.toJSON())
}

const blogsAreEqual = (a, b) => {
  //  Use == for id because the ones pulled from db might still be Mongoose 'ObjectId' type
  return a.id == b.id
    && a.title === b.title
    && a.author === b.author
    && a.likes === b.likes
    && a.url === b.url
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(users => users.toJSON())
}

const prepareRootUserOnly = async () => {
  await User.deleteMany({})

  const passwordHash = await bcrypt.hash('secret', 10)
  const user = new User({ username: 'root', name: 'root user', passwordHash })
  await user.save()

  return await User.findOne({})
}

const getRootUserToken = async (api) => {
  const resp = await api
    .post('/api/login')
    .send({ username: 'root', password: 'secret' })

  return resp.body.token
}

module.exports = {
  initialBlogs,
  initialBlogsWithIds,
  blogsInDb,
  blogsAreEqual,
  usersInDb,
  prepareRootUserOnly,
  getRootUserToken,
}