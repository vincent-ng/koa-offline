const { IncomingMessage, ServerResponse } = require('http')

class FakeResponse extends ServerResponse {
	constructor(end) {
		super({}) // empty req is fine
		this.end = end
		this.headers = {}
	}
	setHeader(k, v) {
		this.headers[k] = v
	}
	getHeaders() {
		return this.headers
	}
}

class FakeRequest extends IncomingMessage {
	constructor(opt) {
		super({}) // empty socket is fine
		let option = opt
		if (typeof (option) === 'string') {
			option = { url: opt, method: 'GET' }
		}
		this.url = option.url
		this.method = option.method || 'GET'
		this.query = option.query
		this.body = option.form || option.json || option.body || undefined
	}
}

function freeze(object, property, value) {
	Object.defineProperty(object, property, {
		get: () => value,
		set: () => {},
	})
}

function bodyInjector(ctx, next) {
	const { body, query } = ctx.req
	if (typeof body === 'object') {
		freeze(ctx.req, 'body', body)
		freeze(ctx.request, 'body', body)
	}
	if (typeof ctx.req.query === 'object') {
		freeze(ctx, 'query', query)
		freeze(ctx.req, 'query', query)
		freeze(ctx.request, 'query', query)
	}
	return next()
}

class Wrapper {
	constructor(app) {
		app.middleware.unshift(bodyInjector)
		this.server = app.callback()
	}
	request(opt) {
		return new Promise((rs, rj) => {
			const req = new FakeRequest(opt)
			const res = new FakeResponse((body) => {
				res.body = body
				rs(res)
			})
			this.server(req, res).catch(rj)
		})
	}
}

module.exports = Wrapper
