import {environments} from '@/config.js';
import {IgApiClient} from 'instagram-private-api';
import consola from 'consola';
import {commonGlobals} from '@/Globals/common.js';
import {getDate} from '@/Services/getDate.js';

async function igBoot() {
	const ig = new IgApiClient();

	consola.warn('Logging in instagram user');
	ig.state.generateDevice(environments.igUsername);
	if (environments.preloginFlow) {
		await ig.simulate.preLoginFlow();
	}

	const user = await ig.account.login(environments.igUsername, environments.igPassword);
	consola.info('Instagram logged in as %s', user.username);

	const now = await getDate();
	await ig.account.setBiography(`Menfess IG Otomatis (just for fun), aktif sejak ${now.toLocaleDateString('id-ID', {
		day: '2-digit',
		month: 'long',
		hour: '2-digit',
		minute: '2-digit',
	}).replace('.', ':')}\n\nMade w/ ❤️ by @hanif.dwy.sembiring20`);

	commonGlobals.ig = ig;
}

void igBoot();
