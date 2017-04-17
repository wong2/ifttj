const Koa = require('koa')
const Router = require('koa-router')
const bodyParser = require('koa-bodyparser')
const logger = require('koa-logger')
const views = require('koa-views')
const static = require('koa-static')
const mount = require('koa-mount')
const shortid = require('shortid')
const RSS = require('rss')
const htmlToText = require('html-to-text')
const model = require('./model')
const utils = require('./utils')

const app = new Koa()
const router = new Router()


async function checkId(ctx, next) {
  const id = ctx.params.id
  ctx.assert(shortid.isValid(id), 404)
  await next()
}

router.get('/', async (ctx, next) => {
  const id = shortid.generate()
  const url = `${ctx.request.origin}/${id}`
  await ctx.render('index.mustache', { url })
})

router.get('/:id', checkId, async (ctx, next) => {
  const id = ctx.params.id
  const items = await model.getItems(id)
  const feed = new RSS({title: `IFTTJ: ${id}`})
  for (let item of items) {
    let text = htmlToText.fromString(item.text, {
      ignoreHref: true,
      ignoreImage: true,
    })
    feed.item({
      guid: item.id,
      title: text,
      description: item.text,
      url: item.link,
      date: item.time,
    })
  }
  ctx.type = 'text/xml'
  ctx.body = feed.xml()
})

router.post('/:id', checkId, async (ctx, next) => {
  const id = ctx.params.id
  const body = ctx.request.body
  ctx.assert(body, 400)
  const item = utils.parse(body)
  await model.addItem(id, item)
  ctx.body = 'ok'
})


app.proxy = true
app.use(logger())
app.use(bodyParser({
  enableTypes: ['text', 'json', 'form']
}))
app.use(views(__dirname + '/templates'))
app.use(mount('/static', static('public')))

app.use(router.routes())
app.use(router.allowedMethods())


const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`server started at ${port}`)
})
