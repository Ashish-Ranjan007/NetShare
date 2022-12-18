import { ProfileReference } from '../../@types/responseType';
import { apiSlice } from '../api/apiSlice';

const widgetsApiSlice = apiSlice.injectEndpoints({
	endpoints: (builder) => ({
		getBirthdays: builder.query<
			{
				success: boolean;
				data: { friends: ProfileReference[] };
				error: string;
			},
			void
		>({
			query: () => ({
				url: '/widgets/birthdays',
				method: 'GET',
			}),
		}),
		getSuggestedProfiles: builder.query<
			{
				success: boolean;
				data: { suggestedProfiles: ProfileReference[] };
				error: string;
			},
			void
		>({
			query: () => ({
				url: 'widgets/suggested-profiles',
				method: 'GET',
			}),
		}),
	}),
});

export const { useLazyGetBirthdaysQuery, useLazyGetSuggestedProfilesQuery } =
	widgetsApiSlice;
