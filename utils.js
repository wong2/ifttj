function parse(body) {
  let parts = body.split(/\n={3,}\n/)
  return {
    text: parts[0],
    link: parts[1] || ''
  }
}

module.exports = { parse }
