import {bool, cleanEnv, port, str} from 'envalid';

export const environments = cleanEnv(process.env, {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	PORT: port(),
	igPassword: str(),
	igUsername: str(),
	preloginFlow: bool(),
});
