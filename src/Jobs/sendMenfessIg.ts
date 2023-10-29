import dayJs from 'dayjs';
import {commonGlobals} from '@/Globals/common.js';
import {generateMenfessFrame} from '@/Services/generateMenfess.js';

export const sendMenfessIg = async (username: string, text: string, randomName = false) => {
	const menfess = await generateMenfessFrame(username, text.trim());
	const results = await commonGlobals.ig?.publish.photo({
		file: menfess,
		caption: 'Hai SMANTIFess! Ada menfess atau pesan baru nih untuk (@)' + (randomName ? username.replace(/@/g, '') : username) + ' pada ' + dayJs().locale('id').tz('Asia/Makassar').format(
			'DD MMMM YYYY [HH:mm:ss]',
		) + '\n\n#sman3palumenfess #menfess #smantipalu #smantipalumenfess',
	});

	return results;
};
