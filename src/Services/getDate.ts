import {ntpInstance} from '@/Globals/ntp-time.js';

export const getDate = async (): Promise<Date> => {
	const ntpResults = await ntpInstance.getTime(true);
	return new Date(ntpResults.now);
};
