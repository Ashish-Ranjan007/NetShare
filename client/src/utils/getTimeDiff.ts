export default (date: Date): string => {
	const date1 = new Date();
	const date2 = new Date(date);

	const diffInSeconds = Math.floor(
		(date1.getTime() - date2.getTime()) / 1000
	);

	if (diffInSeconds < 60) {
		return `${diffInSeconds} seconds ago`;
	}

	if (diffInSeconds < 60 * 60) {
		return `${Math.floor(diffInSeconds / 60)} minutes ago`;
	}

	if (diffInSeconds < 24 * 60 * 60) {
		return `${Math.floor(diffInSeconds / (60 * 60))} hours ago`;
	}

	if (diffInSeconds < 30 * 24 * 60 * 60) {
		return `${Math.floor(diffInSeconds / (24 * 60 * 60))} days ago`;
	}

	if (diffInSeconds < 12 * 30 * 24 * 60 * 60) {
		return `${Math.floor(diffInSeconds / (30 * 24 * 60 * 60))} months ago`;
	}

	return `${Math.floor(diffInSeconds / (12 * 30 * 24 * 60 * 60))} years ago`;
};
