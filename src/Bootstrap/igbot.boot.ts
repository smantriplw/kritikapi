import dayJs from 'dayjs';
import utcDayJs from 'dayjs/plugin/utc.js';
import tzDayJs from 'dayjs/plugin/timezone.js';
import {environments} from '@/config.js';
import {IgApiClient} from 'instagram-private-api';
import consola from 'consola';
import {commonGlobals} from '@/Globals/common.js';

async function igBoot() {
	dayJs.extend(utcDayJs);
	dayJs.extend(tzDayJs);

	const ig = new IgApiClient();

	consola.warn('Logging in instagram user');
	ig.state.generateDevice(environments.igUsername);
	if (environments.preloginFlow) {
		await ig.simulate.preLoginFlow();
	}

	const user = await ig.account.login(environments.igUsername, environments.igPassword);
	consola.info('Instagram logged in as %s', user.username);

	await ig.account.setBiography(`Menfess IG Otomatis (just for fun), aktif sejak ${dayJs().locale('id').tz('Asia/Makassar').format(
		'DD MMMM YYYY, HH:mm:ss',
	)} WITA \n\nMade w/ ❤️ by @hanif.dwy.sembiring20`);

	commonGlobals.ig = ig;
}

void igBoot();
