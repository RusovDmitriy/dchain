const moment = require('moment')
class Logger {
  constructor(space) {
    this.space = space || 'APP'
  }

  get spaceText() {
    return `[${this.space.toUpperCase()}]`
  }

  get time() {
    return moment().format()
  }

  debug() {
    console.info.apply(console, ['DEBUG', this.time, this.spaceText, ...arguments])
  }

  error() {
    console.error.apply(console, ['ERROR', this.time, this.spaceText, ...arguments])
  }

  info() {
    console.info.apply(console, ['INFO', this.time, this.spaceText, ...arguments])
  }
}

module.exports = Logger