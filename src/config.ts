import {bool, cleanEnv, port, str, num} from 'envalid';

export const environments = cleanEnv(process.env, {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	PORT: port(),
	igPassword: str(),
	igUsername: str(),
	preloginFlow: bool(),
	postDeletionLimitsPerUser: num({
		default: 2,
	}),
	banIpIfBadwordReach: num({
		default: 2,
	}),
});

export const regexes = {
	postDeletionRequestMessage: /^(req(uest)?\s+hapus(in)?(\s+don(g)?)?)$/gi,
};
