export const safeJsonParse = <T>(data: string, defaultData?: T): T => {
	try {
		return JSON.parse(data) as T;
	} catch {
		// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
		return defaultData ?? {} as T;
	}
};
