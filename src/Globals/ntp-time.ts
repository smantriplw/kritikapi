import {NtpTimeSync} from 'ntp-time-sync';

export const ntpInstance = NtpTimeSync.getInstance({
	servers: [
		'0.id.pool.ntp.org',
		'1.id.pool.ntp.org',
		'2.id.pool.ntp.org',
		'3.id.pool.ntp.org',
		'ntp.bmkg.go.id',
	],
});
