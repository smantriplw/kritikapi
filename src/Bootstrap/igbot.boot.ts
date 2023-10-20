import {environments} from '@/config.js';
import {IgApiClient} from 'instagram-private-api';
import consola from 'consola';
import {commonGlobals} from '@/Globals/common.js';

async function igBoot() {
	const ig = new IgApiClient();

	consola.warn('Logging in instagram user');
	ig.state.generateDevice(environments.igUsername);
	await ig.simulate.preLoginFlow();

	const user = await ig.account.login(environments.igUsername, environments.igPassword);
	consola.info('Instagram logged in as %s', user.username);

	await ig.account.setBiography(`Menfess IG Otomatis (just for fun), aktif sejak ${new Date().toLocaleDateString('id-ID', {
		day: '2-digit',
		month: 'long',
		hour: '2-digit',
		minute: '2-digit',
	}).replace('.', ':')}\n\nMade w/ ❤️ by @hanif.dwy.sembiring20`);

	commonGlobals.ig = ig;
}

void igBoot();
