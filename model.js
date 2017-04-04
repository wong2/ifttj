const redis = require('redis')
const Promise = require('bluebird')

// promisify
Promise.promisifyAll(redis.RedisClient.prototype)
Promise.promisifyAll(redis.Multi.prototype)

const client = redis.createClient()

client.on('error', (err) => {
	console.log(`Redis error ${err}`)
})

function getNextId() {
  return client.hincrbyAsync('unique_ids', 'item', 1)
}

async function getItems(id) {
  let itemIds = client.lrangeAsync(`items:${id}`, 0, -1)
  return Promise.map(itemIds, (itemId) => {
    return client.hgetallAsync(`item:${itemId}`)
  })
}

async function addItem(id, item) {
  if (!item.time) {
    item.time = new Date()
  }
  const itemId = await getNextId()
  item.id = itemId
  await client.hmsetAsync(`item:${itemId}`, item)
  await client.lpushAsync(`items:${id}`, itemId)
}

module.exports = { getItems, addItem }
