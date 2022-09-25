import { apiSlice } from '../api/apiSlice';

const feedApiSlice = apiSlice.injectEndpoints({
	endpoints: (builder) => ({
		getFeeds: builder.query({
			query: () => ({
				url: '/home/feeds',
			}),
		}),
	}),
});

export const { useGetFeedsQuery } = feedApiSlice;
