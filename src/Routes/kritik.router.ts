
import {commonGlobals} from '@/Globals/common.js';
import {type FastifyInstance} from 'fastify';

export const kritikRouter = (app: FastifyInstance) => {
	app.post('/feedback', {
		schema: {
			body: {
				type: 'object',
				properties: {
					message: {
						type: 'string',
						minLength: 10,
					},
					type: {
						type: 'string',
						enum: ['kritik', 'saran'],
					},
				},
				required: ['message', 'type'],
			},
		},
	}, async (req, reply) => {
		const {message, type} = req.body as Record<string, string>;

		await commonGlobals.db.push(type.toLowerCase(), message);
		await reply.send(JSON.stringify({message: 'Successfuly saved'}));
	});

	app.get('/feedback', async (_, reply) => {
		const [kritik, saran] = [await commonGlobals.db.get<string[]>('kritik'), await commonGlobals.db.get<string[]>('saran')];

		return reply.send(JSON.stringify({data: {kritik, saran}}));
	});
};
