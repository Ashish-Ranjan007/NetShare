import React from 'react';
import { useParams } from 'react-router-dom';

const SearchResultsPage = () => {
	const { searchTerm } = useParams();

	return (
		<div>
			SearchResultsPage <p>SearchKey: {searchTerm}</p>
		</div>
	);
};

export default SearchResultsPage;
