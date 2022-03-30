const isTest = () => {
  return process.env.NODE_ENV === 'test'
}

const info = (...params) => {
  if (!isTest()) {
    console.log(...params)
  }
}

const error = (...params) => {
  if (!isTest()) {
    console.error(...params)
  }
}

module.exports = {
  info, 
  error
}