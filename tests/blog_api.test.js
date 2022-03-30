const mongoose = require('mongoose')
const supertest = require('supertest')
const Blog = require('../models/blog')

const helper = require('./test_helper')

const app = require('../app')
const api = supertest(app)

let sandbox = {}

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

beforeEach(async () => {
  const user = await helper.prepareRootUserOnly()

  await Blog.deleteMany({})
  const blogObjects = initialBlogs.map(blog => new Blog({ ...blog, user: user._id }))
  const promises = blogObjects.map(blog => blog.save())
  await Promise.all(promises)
})

describe('getting blogs', () => {
  test('blogs ids are defined as id and not _id', async() => {
    const response = await api
      .get('/api/blogs')
      .expect(200)
    
    response.body.forEach((b) => {
      expect(b.id).toBeDefined()
    })
  })
  
  test('blogs are returned as json', async() => {
    const response = await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  
    expect(response.body).toHaveLength(helper.initialBlogs.length)
  })
})

describe('creating a blog', () => {
  beforeEach(async () => {
    const token = await helper.getRootUserToken(api)
    sandbox = {}
    sandbox.rootToken = `Bearer ${token}`
  })

  test('4.10. newly created blog is returned by API', async() => {
    const newBlog = {
      title: 'Adventures in the world of Nyonya Culture',
      author: 'David W. Ritestuff',
      url: 'http://blog.cleancoder.com/david-writestuff/2044/12/01/Adventures.html',
      likes: 44,
    }
  
    await api
      .post('/api/blogs')
      .set('Authorization', sandbox.rootToken)
      .send(newBlog)
      .expect(201)
  
    const blogsAfterPost = await helper.blogsInDb()
    expect(blogsAfterPost).toHaveLength(helper.initialBlogs.length + 1)
  
    const initialBlogsWithIds = helper.initialBlogsWithIds()
    const blogsNotInInitial = blogsAfterPost.filter(b => !initialBlogsWithIds.some(m => helper.blogsAreEqual(m, b)))
    expect(blogsNotInInitial).toHaveLength(1)
  
    const diffedBlog = blogsNotInInitial[0]
    newBlog.id = diffedBlog.id
    newBlog.user = diffedBlog.user
    expect(diffedBlog).toEqual(newBlog)
  })
  
  test('4.11. newly created blog defaults to 0 likes if not provided', async() => {
    const newBlog = {
      title: 'Adventures in the world of Nyonya Culture',
      author: 'David W. Ritestuff',
      url: 'http://blog.cleancoder.com/david-writestuff/2044/12/01/Adventures.html',
    }
  
    await api
      .post('/api/blogs')
      .set('Authorization', sandbox.rootToken)
      .send(newBlog)
      .expect(201)
  
    const blogsAfterPost = await helper.blogsInDb()
    expect(blogsAfterPost).toHaveLength(helper.initialBlogs.length + 1)
  
    const initialBlogsWithIds = helper.initialBlogsWithIds()
    const blogsNotInInitial = blogsAfterPost.filter(b => !initialBlogsWithIds.some(m => helper.blogsAreEqual(m, b)))
    expect(blogsNotInInitial).toHaveLength(1)
  
    const diffedBlog = blogsNotInInitial[0] 
    newBlog.id = diffedBlog.id
    newBlog.user = diffedBlog.user
    newBlog.likes = 0
    expect(diffedBlog).toEqual(newBlog)
  })
  
  test('4.12. 400 bad request if title is not provided', async() => {
    const newBlog = {
      author: 'David W. Ritestuff',
      url: 'http://blog.cleancoder.com/david-writestuff/2044/12/01/Adventures.html',
      likes: 44,
    }
  
    await api
      .post('/api/blogs')
      .set('Authorization', sandbox.rootToken)
      .send(newBlog)
      .expect(400)
  })
  
  test('400 bad request if url is not provided', async() => {
    const newBlog = {
      title: 'Adventures in the world of Nyonya Culture',
      author: 'David W. Ritestuff',
      likes: 44,
    }
    
    await api
      .post('/api/blogs')
      .set('Authorization', sandbox.rootToken)
      .send(newBlog)
      .expect(400)
  })

  test('401 unauthorized if token is not provided', async() => {
    const newBlog = {
      title: 'Adventures in the world of Nyonya Culture',
      author: 'David W. Ritestuff',
      url: 'http://blog.cleancoder.com/david-writestuff/2044/12/01/Adventures.html',
      likes: 44,
    }
    
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(401)
  })
})

describe('updating a blog', () => {
  const changeAuthor = {
    author: 'Henry',
  }

  test('succeeds with status code 204 if id is valid', async () => {
    const idToModify = '5a422aa71b54a676234d17f8'

    await api
      .put(`/api/blogs/${idToModify}`)
      .send(changeAuthor)
      .expect(200)
    
    const blogsInDb = await helper.blogsInDb()
    const modifiedBlog = blogsInDb.filter(b => b.id == idToModify)
    expect(modifiedBlog).toHaveLength(1)
    expect(modifiedBlog[0].author).toEqual(changeAuthor.author)
  })

  test('fails with status code 404 if id is not found', async () => {
    await api
      .put('/api/blogs/5a422aa71b54a676234222f8')
      .expect(404)
  })
})

describe('deleting a blog', () => {
  beforeEach(async () => {
    const token = await helper.getRootUserToken(api)
    sandbox = {}
    sandbox.rootToken = `Bearer ${token}`
  })

  test('succeeds with status code 204 if id is valid', async () => {
    await api
      .delete('/api/blogs/5a422aa71b54a676234d17f8')
      .set('Authorization', sandbox.rootToken)
      .expect(204)
    
    const blogsInDb = await helper.blogsInDb()
    expect(blogsInDb.filter(b => b.id == '5a422aa71b54a676234d17f8')).toHaveLength(0)
  })

  test('fails with status code 404 if id is not found', async () => {
    await api
      .delete('/api/blogs/5a422aa71b54a676234222f8')
      .set('Authorization', sandbox.rootToken)
      .expect(404)
  })

  test('fails with status code 401 if token is not provided', async () => {
    await api
      .delete('/api/blogs/5a422aa71b54a676234d17f8')
      .expect(401)
  })
})

afterAll(() => {
  mongoose.connection.close()
})