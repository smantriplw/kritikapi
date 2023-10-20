import {environments} from '@/config.js';
import fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimiter from '@fastify/rate-limit';
import {menfessRouter} from '@/Routes/menfess.router.js';
import {kritikRouter} from '@/Routes/kritik.router.js';

async function restBoot() {
	const app = fastify({
		trustProxy: true,
		logger: true,
	});

	await app.register(cors, {
		origin: true,
	});

	app.addContentTypeParser('application/json', {parseAs: 'string'}, (req, body, done) => {
		try {
			const json = JSON.parse(body as string) as Record<string, string>;
			done(null, json);
		} catch (err) {
			err.statusCode = 400;
			done(err as Error, undefined);
		}
	});

	await app.register(rateLimiter, {
		max: 5,
		ban: 3,
		hook: 'preHandler',
		keyGenerator(req) {
			return req.headers['X-Real-IP'] as string ?? req.headers['CF-Connecting-IP'] as string ?? req.ip;
		},
	});

	menfessRouter(app);
	kritikRouter(app);

	await app.listen({
		port: environments.PORT,
		host: '0.0.0.0',
	});
}

void restBoot();
