import type {IgApiClientRealtime} from 'instagram_mqtt';
import PQueue from 'p-queue';
import {QuickDB} from 'quick.db';

export const commonGlobals: {
	ig: IgApiClientRealtime | undefined;
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
