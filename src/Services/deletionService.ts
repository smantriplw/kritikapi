import {commonGlobals} from '@/Globals/common.js';
import {environments} from '@/config.js';
import dayjs from 'dayjs';

export type UserDeletionData = {
	postDeletionRequests: number;
	lastUpdate: number;
	affectedPostIds: string[];
	todayDeletionRequests: number;
};

export const getDeletionDataUser = async (id: string) => {
	const user = await commonGlobals.db.get<UserDeletionData>(`deletions_user.${id}`);
	if (!user) {
		return commonGlobals.db.set(`deletions_user.${id}`, {
			postDeletionRequests: 0,
			lastUpdate: Date.now(),
			affectedPostIds: [],
			todayDeletionRequests: 0,
		});
	}

	return user;
};

export const deletePost = async (requester: UserDeletionData & {id: string}, postId: string): Promise<boolean> => {
	// Reset todayDeletionRequests if the lastUpdate (in day) <= now (day)
	const dateLastUpdate = dayjs(requester.lastUpdate);
	if (requester.todayDeletionRequests >= 0 && dateLastUpdate.diff(new Date(), 'days') >= 1) {
		requester.todayDeletionRequests = 0;
		await commonGlobals.db.set(`deletions_user.${requester.id}.todayDeletionRequests`, 0);
	}

	const post = await commonGlobals.db.get<{text: string; deleted: boolean}>(`posts.${postId}`);
	if (!post?.deleted && requester.todayDeletionRequests <= environments.postDeletionLimitsPerUser) {
		await commonGlobals.db.add(`deletions_user.${requester.id}.todayDeletionRequests`, 1);
		await commonGlobals.db.add(`deletions_user.${requester.id}.postDeletionRequests`, 1);
		await commonGlobals.db.push(`deletions_user.${requester.id}.affectedPostIds`, postId);
		await commonGlobals.db.set(`deletions_user.${requester.id}.lastUpdate`, Date.now());

		await commonGlobals.db.set(`posts.${postId}.deleted`, true);

		const results = await commonGlobals.ig?.media.delete({
			mediaId: postId,
			mediaType: 'PHOTO',
		});
		return Boolean(results);
	}

	return false;
};
