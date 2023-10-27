import {commonGlobals} from '@/Globals/common.js';
import {generateMenfessFrame} from '@/Services/generateMenfess.js';

export const sendMenfessIg = async (username: string, text: string) => {
	const menfess = await generateMenfessFrame(username, text.trim());
	const results = await commonGlobals.ig?.publish.photo({
		file: menfess,
		caption: 'Hai SMANTIFess! Ada menfess atau pesan baru nih untuk (@)' + username.replace(/@/g, '') + ' pada ' + new Date().toLocaleDateString('id-ID', {
			day: '2-digit',
			month: 'long',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		}).replace('.', ':') + '\n\n#sman3palumenfess #menfess #smantipalu #smantipalumenfess',
	});

	return results;
};
