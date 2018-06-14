# koa-offline
Send requests to koa handlers without any network traffic.
  * Convenience for using koa as some kinds of backend service, and reseal the external interface to any other protocols.
  * Convenience for unit test

# install

```bash
npm i koa-offline
```

# usage

```js
const KoaOffline = require('koa-offline')
const Koa = require('koa')
const Router = require('koa-router')

// config your koa as needed
const app = new Koa()
const router = new Router()

router.get('/', async (ctx) => {
	ctx.body = 'hello world'
})

app.use(router.routes())
app.use(router.allowedMethods())

// use koa offline
const ko = new KoaOffline(app)
let res
res = await ko.request('/')
console.log(res.statusCode, res.body) // 200 hello world

res = await ko.request({ url: '/', method: 'POST', json: {} })
console.log(res.statusCode, res.body) // 405 Not Implement

res = await ko.request('/not/exist')
console.log(res.statusCode, res.body) // 404 Not Found
```

See more examples in unit test.

# options

| name | desc | type | default |
|:----|:----|:----|:----|
| url | request url | string | required |
| method | http actions: GET,POST,PUT,DELETE,... | string | 'GET' |
| body/form/json | set to ctx.request.body and ctx.req.body if provided | object | undefined |
| query | set to ctx.request.query and ctx.req.query if provided | object | undefined |

# run test

```bash
npm test
```
