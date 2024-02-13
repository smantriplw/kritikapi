import dayJs from 'dayjs';
import {commonGlobals} from '@/Globals/common.js';
import {generateMenfessFrame} from '@/Services/generateMenfess.js';
import {environments} from '@/config.js';

export const sendMenfessIg = async (username: string, text: string, randomName = false) => {
	const menfess = await generateMenfessFrame(username, text.trim());
	const results = await commonGlobals.ig?.publish.photo({
		file: menfess,
		caption: 'Hai SMANTIFess! Ada menfess atau pesan baru nih untuk ' + (randomName ? username.replace(/@/g, '') : username) + ' pada ' + dayJs().locale('id').tz('Asia/Makassar').format(
			'DD MMMM YYYY HH:mm:ss',
		) + ' WITA\n\nDemi kenyamanan bersama apabila kamu keberatan dengan isi menfess ini, kamu bisa melakukan pengajuan untuk menghapus postingan ini dengan cara:\n1. Share/forward postingan ini ke DM @' + environments.igUsername + '\n2. Balas pesan postingan yang telah kalian kirim di DM dengan pesan "request hapus" (ulangi apabila tidak ada respons dalam 10 detik) \n\n#sman3palumenfess #menfess #smantipalu #smantipalumenfess',
	});

	await commonGlobals.db.set(`posts.${results!.media.id}`, {
		text: results?.media.caption,
		date: Date.now(),
		deleted: false,
	});

	return results;
};
