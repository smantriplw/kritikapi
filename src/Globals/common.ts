import {type IgApiClient} from 'instagram-private-api';
import PQueue from 'p-queue';

export const commonGlobals: {
	ig: IgApiClient | undefined;
	queue: PQueue;
} = {
	ig: undefined,
	queue: new PQueue({
		concurrency: 3,
	}),
};
