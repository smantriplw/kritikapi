import {commonGlobals} from '@/Globals/common.js';
import {environments} from '@/config.js';

export const addBadwordCountToIp = async (ip: string) => {
	await commonGlobals.db.add(`badwordCountByIp.${ip}`, 1);
};

export const checkLegalityBadwordByIp = async (ip: string) => {
	const ipCount = await commonGlobals.db.get<number>(`badwordCountByIp.${ip}`);
	return (ipCount ?? 0) >= environments.banIpIfBadwordReach;
};
