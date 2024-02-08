import dayJs from 'dayjs';
import utcDayJs from 'dayjs/plugin/utc.js';
import tzDayJs from 'dayjs/plugin/timezone.js';
import {environments, regexes} from '@/config.js';
import consola from 'consola';
import {commonGlobals} from '@/Globals/common.js';
import {GraphQLSubscriptions, type MessageSyncMessage, SkywalkerSubscriptions, withRealtime} from 'instagram_mqtt';
import {IgApiClient} from 'instagram-private-api';
import {deletePost, getDeletionDataUser} from '@/Services/deletionService.js';

async function igBoot() {
	dayJs.extend(utcDayJs);
	dayJs.extend(tzDayJs);

	const ig = withRealtime(new IgApiClient());

	consola.warn('Logging in instagram user');
	ig.state.generateDevice(environments.igUsername);
	if (environments.preloginFlow) {
		await ig.simulate.preLoginFlow();
	}

	const user = await ig.account.login(environments.igUsername, environments.igPassword);
	consola.info('Instagram logged in as %s', user.username);
	commonGlobals.ig = ig;

	ig.realtime.on('error', console.error);
	ig.realtime.on('message', async message => {
		if (message.message.thread_id && 'replied_to_message' in message.message) {
			const repliedMessage = message.message.replied_to_message as MessageSyncMessage;
			if (regexes.postDeletionRequestMessage.test(message.message.text ?? '') && repliedMessage.media_share?.user.username === environments.igUsername) {
				const user = await getDeletionDataUser(message.message.user_id.toString());
				const deletionConfirm = await deletePost({
					...user,
					id: message.message.user_id.toString(),
				}, repliedMessage.media_share.id);

				if (deletionConfirm) {
					await ig.entity.directThread(message.message.thread_id ?? message.message.thread_v2_id).broadcastText(
						`Postingan telah sukses dihapus, limit hapus postingan harian kamu tersisa ${environments.postDeletionLimitsPerUser - (user.todayDeletionRequests + 1)}x lagi untuk hari ini`,
					);
				} else {
					await ig.entity.directThread(message.message.thread_id ?? message.message.thread_v2_id).broadcastText(
						'Postingan gagal dihapus, biasanya disebabkan oleh error sistem atau limit harian hapus postingan kamu telah habis',
					);
				}
			}
		}
	});

	await ig.account.setBiography(`Menfess IG Otomatis (BOT), program aktif sejak ${dayJs().locale('id').tz('Asia/Makassar').format(
		'DD MMMM YYYY, HH:mm:ss',
	)} WITA \n\n- Dikelola oleh @hanif.dwy.sembiring20`);

	await ig.realtime.connect({
		// AutoReconnect: true,
		graphQlSubs: [
			GraphQLSubscriptions.getAppPresenceSubscription(),
			GraphQLSubscriptions.getZeroProvisionSubscription(ig.state.phoneId),
			GraphQLSubscriptions.getDirectStatusSubscription(),
			GraphQLSubscriptions.getDirectTypingSubscription(ig.state.cookieUserId),
			GraphQLSubscriptions.getAsyncAdSubscription(ig.state.cookieUserId),
		],
		irisData: await ig.feed.directInbox().request(),
		skywalkerSubs: [
			SkywalkerSubscriptions.directSub(ig.state.cookieUserId),
			SkywalkerSubscriptions.liveSub(ig.state.cookieUserId),
		],
	});

	await ig.realtime.direct.sendForegroundState({
		inForegroundApp: true,
		inForegroundDevice: true,
		keepAliveTimeout: 60,
	});
}

void igBoot();
