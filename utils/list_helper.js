const _ = require('lodash')

const dummy = (blogs) => {
  if (blogs) {
    return 1
  }

  return 1
}

const totalLikes = (blogs) => {
  let total = 0
  blogs.forEach((b) => total += b.likes)
  return total
}

const favouriteBlog = (blogs) => {
  let lastMostLikes = 0
  let lastFavourite = {}

  blogs.forEach((b) => {
    if (b.likes >= lastMostLikes) {
      lastMostLikes = b.likes
      lastFavourite = { ...b }
    }
  })

  return lastFavourite
}

const mostBlogs = (blogs) => {
  if (blogs.length === 0) {
    return {}
  }

  const col = _.reduce(blogs, (res, val) => {
    res[val.author] = (res[val.author] || 0) + 1
    return res
  }, {})

  const most = _.maxBy(_.keys(col), (o) => { return col[o] })

  return {
    author: most,
    blogs: col[most],
  }
}

const mostLikes = (blogs) => {
  if (blogs.length === 0) {
    return {}
  }

  const likes = _.reduce(blogs, (res, val) => {
    res[val.author] = (res[val.author] || 0) + val.likes
    return res
  }, {})

  const most = _.maxBy(_.keys(likes), (o) => { return likes[o] })

  return {
    author: most,
    likes: likes[most]
  }
}

module.exports = {
  dummy,
  totalLikes,
  favouriteBlog,
  mostBlogs,
  mostLikes,
}