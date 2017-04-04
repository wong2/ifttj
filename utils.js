function parse(body) {
  let parts = body.split(/={3,}/)
  return {
    text: parts[0].trimRight(),
    link: (parts[1] || '').trim()
  }
}

module.exports = { parse }
