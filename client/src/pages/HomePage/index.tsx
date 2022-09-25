import React, { useEffect, useState } from 'react';

import { useGetFeedsQuery } from '../../features/feeds/feedsApiSlice';

const HomePage: React.FC = () => {
	const { data, isLoading, isSuccess, isError, error } = useGetFeedsQuery('');

	return <div>{isSuccess && data.feeds.message}</div>;
};

export default HomePage;
