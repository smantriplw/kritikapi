/* eslint-disable @typescript-eslint/naming-convention */
import {commonGlobals} from '@/Globals/common.js';
import {sendMenfessIg} from '@/Jobs/sendMenfessIg.js';
import {type FastifyInstance} from 'fastify';

export const menfessRouter = (app: FastifyInstance) => {
	app.post('/menfess/:target/:destination', {
		schema: {
			params: {
				type: 'object',
				properties: {
					target: {
						type: 'string',
						enum: ['wa', 'ig'],
					},
					destination: {
						type: 'string',
					},
				},
			},
			body: {
				type: 'object',
				properties: {
					message: {
						type: 'string',
						minLength: 10,
					},
					randomName: {
						type: 'boolean',
					},
				},
				required: ['message', 'randomName'],
			},
		},
	}, async (req, reply) => {
		const {target, destination} = req.params as Record<string, string>;
		const {message, randomName} = req.body as Record<string, string>;

		if (target === 'wa') {
			await reply.status(400).send(JSON.stringify({
				message: 'WA Service currently not available',
			}));
			return;
		}

		let user = {
			username: destination.trim(),
			full_name: destination,
			profile_pic_url: '',
		};

		if (user.username.startsWith('@')) {
			user.username = user.username.slice(1);
		}

		if (!randomName) {
			const usr = await commonGlobals.ig?.user.usernameinfo(destination).catch(() => undefined);
			if (!usr) {
				await reply.status(404).send(JSON.stringify({
					message: `We couldn't find ${destination} account`,
				}));
				return;
			}

			user = {
				username: '@' + usr.username,
				profile_pic_url: usr.profile_pic_url,
				full_name: usr.full_name,
			};
		}

		if (message.trim().length > 300) {
			await reply.status(401).send(JSON.stringify({
				message: 'Limit text reached',
			}));
			return;
		}

		await commonGlobals.queue.add(async () => {
			await sendMenfessIg(user.username, message.trim(), Boolean(randomName));
		});

		await reply.status(200).send(JSON.stringify({
			data: {
				pictureUrl: user.profile_pic_url,
				name: user.full_name,
			},
			text: message.trim(),
		}));
	});
};
