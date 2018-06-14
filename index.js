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

function bodyInjector(ctx, next) {
	if (typeof ctx.req.body === 'object') {
		ctx.request.body = ctx.req.body
	}
	if (typeof ctx.req.query === 'object') {
		ctx.query = ctx.req.query
		ctx.request.query = ctx.req.query
	}
	return next()
}

class Wrapper {
	// set app.callback() to server
	constructor(app) {
		app.use(bodyInjector)
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
