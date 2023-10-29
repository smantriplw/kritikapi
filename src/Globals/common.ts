import {type IgApiClient} from 'instagram-private-api';
import PQueue from 'p-queue';
import {QuickDB} from 'quick.db';

export const commonGlobals: {
	ig: IgApiClient | undefined;
	queue: PQueue;
	db: QuickDB;
} = {
	ig: undefined,
	queue: new PQueue({
		concurrency: 3,
	}),
	db: new QuickDB({
		filePath: './databases/json.sqlite',
	}),
};
