/* eslint-disable no-undef */
require('mocha')
require('should')
const Koa = require('koa')
const Router = require('koa-router')
const qs = require('koa-qs')
const KoaOffline = require('../index.js')

describe('koa wrapper', () => {
	let ko
	const okText = 'route is ok'
	const multi1Text = 'handle by first handler.'
	const multi2Text = ' handle by second handler'
	const headerKey = 'x-my-header-key'
	const headerValue = 'x-my-header-value'

	before(() => {
		const app = new Koa()
		const router = new Router()

		router.get('/', async (ctx) => {
			ctx.body = okText
		})

		router.post('/multi', async (ctx, next) => {
			ctx.body = multi1Text
			next()
		})

		router.post('/multi', async (ctx, next) => {
			ctx.body += multi2Text
			next()
		})

		router.get('/status/code', async (ctx) => {
			ctx.body = okText
			ctx.status = 201
		})

		router.get('/header', async (ctx) => {
			ctx.body = okText
			ctx.res.setHeader(headerKey, headerValue)
		})

		app.use(router.routes())
		app.use(router.allowedMethods())
		ko = new KoaOffline(app)
	})

	it('can progammatically call /not/found', async () => {
		let res
		res = await ko.request('/not/found')
		res.statusCode.should.equal(404)
		res.body.should.equal('Not Found')

		res = await ko.request({ url: '/not/found', method: 'POST' })
		res.statusCode.should.equal(404)
		res.body.should.equal('Not Found')
	})

	it('can progammatically get /', async () => {
		const res = await ko.request('/')
		res.statusCode.should.equal(200)
		res.body.should.equal(okText)
	})

	it('can not progammatically post /', async () => {
		const res = await ko.request({ url: '/', method: 'POST' })
		res.statusCode.should.equal(405)
		res.body.should.equal('Method Not Allowed')
	})

	it('can progammatically post to multi handler', async () => {
		const res = await ko.request({ url: '/multi/', method: 'POST' })
		res.statusCode.should.equal(200)
		res.body.should.equal(multi1Text + multi2Text)
	})

	it('can progammatically handle status code', async () => {
		const res = await ko.request('/status/code')
		res.statusCode.should.equal(201)
		res.body.should.equal(okText)
	})

	it('can progammatically handle setHeader', async () => {
		const res = await ko.request('/header')
		res.getHeaders().should.have.value(headerKey, headerValue)
		res.body.should.equal(okText)
	})
})


describe('koa wrapper', () => {
	let ko

	before(() => {
		const app = new Koa()
		const router = new Router()

		router.get('/param/:a/:b/c/:d', async (ctx) => {
			const { a, b, d } = ctx.params
			ctx.body = [a, b, d].join(' ')
		})

		router.get('/query', async (ctx) => {
			const { a, b, c: { d } } = ctx.query
			ctx.body = [a, b, d].join(' ')
		})

		router.post('/form', async (ctx) => {
			const { a, b, c: { d } } = ctx.request.body
			ctx.body = [a, b, d].join(' ')
		})

		qs(app)
		app.use(router.routes())
		app.use(router.allowedMethods())
		ko = new KoaOffline(app)
	})

	function doAssert(p, res) {
		res.statusCode.should.equal(200)
		res.body.should.equal([p.a, p.b, p.c.d].join(' '))
	}

	it('can progammatically use params', async () => {
		const p = { a: Math.random(), b: Math.random(), c: { d: Math.random() } }
		const res = await ko.request(`/param/${p.a}/${p.b}/c/${p.c.d}`)
		doAssert(p, res)
	})

	it('can progammatically use querystring', async () => {
		const p = { a: Math.random(), b: Math.random(), c: { d: Math.random() } }
		const res = await ko.request(`/query?a=${p.a}&b=${p.b}&c[d]=${p.c.d}`)
		doAssert(p, res)
	})

	it('can progammatically use query', async () => {
		const p = { a: Math.random(), b: Math.random(), c: { d: Math.random() } }
		const res = await ko.request({ url: '/query', method: 'GET', query: p })
		doAssert(p, res)
	})

	it('can progammatically use form', async () => {
		const p = { a: Math.random(), b: Math.random(), c: { d: Math.random() } }
		const res = await ko.request({ url: '/form', method: 'POST', form: p })
		doAssert(p, res)
	})

	it('can progammatically use json', async () => {
		const p = { a: Math.random(), b: Math.random(), c: { d: Math.random() } }
		const res = await ko.request({ url: '/form', method: 'POST', json: p })
		doAssert(p, res)
	})

	it('can progammatically use body', async () => {
		const p = { a: Math.random(), b: Math.random(), c: { d: Math.random() } }
		const res = await ko.request({ url: '/form', method: 'POST', body: p })
		doAssert(p, res)
	})
})
