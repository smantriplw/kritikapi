/* eslint-disable @typescript-eslint/naming-convention */
import {commonGlobals} from '@/Globals/common.js';
import {sendMenfessIg} from '@/Jobs/sendMenfessIg.js';
import {addBadwordCountToIp, checkLegalityBadwordByIp} from '@/Services/badwordIpService.js';
import {detectBadwords} from '@/Services/generateMenfess.js';
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
		const isIlegalToPost = await checkLegalityBadwordByIp(req.ip);
		if (isIlegalToPost) {
			await reply.status(401).send({
				message: 'Banned, thanks',
			});
			return;
		}

		const {target, destination} = req.params as Record<string, string>;
		const {message, randomName} = req.body as Record<string, string>;

		if (target === 'wa') {
			await reply.status(400).send(JSON.stringify({
				message: 'WA Service currently not available',
			}));
			return;
		}

		const badwordsMatch = await detectBadwords(message);
		if (badwordsMatch) {
			await addBadwordCountToIp(req.ip);
			await reply.status(400).send(JSON.stringify({
				message: 'Your message contains blacklisted words',
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

		// eslint-disable-next-line no-control-regex
		user.username = user.username.replace(/[^\u0000-\u007E]/g, '').trim();
		if (!user.username.length) {
			await reply.status(400).send(JSON.stringify({
				message: 'Destination/user couldn\'t be empty',
			}));
			return;
		}

		const userBlacklisted = await detectBadwords(user.username.trim());
		if (userBlacklisted) {
			await addBadwordCountToIp(req.ip);
			await reply.status(400).send(JSON.stringify({
				message: 'Destination/user contains blacklisted words',
			}));
			return;
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
