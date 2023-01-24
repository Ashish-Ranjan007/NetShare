const months = [
	'Jan',
	'Feb',
	'Mar',
	'Apr',
	'May',
	'Jun',
	'Jul',
	'Aug',
	'Sep',
	'Oct',
	'Nov',
	'Dec',
];

export default (date: Date): string => {
	const today = new Date();
	const newDate = new Date(date);

	// If date is today
	if (
		newDate.getFullYear() === today.getFullYear() &&
		newDate.getMonth() === today.getMonth() &&
		newDate.getDate() === today.getDate()
	) {
		return `${newDate.getHours()}:${newDate.getMinutes()}`;
	}

	// If date was of yesterday
	if (
		newDate.getFullYear() === today.getFullYear() &&
		newDate.getMonth() === today.getMonth() &&
		newDate.getDate() === today.getDate() - 1
	) {
		return 'Yesterday';
	}

	// If date was this year
	if (
		newDate.getFullYear() === today.getFullYear() &&
		newDate.getMonth() === today.getMonth()
	) {
		return `${newDate.getDate()} ${months[newDate.getMonth()]}`;
	}

	// return year
	return newDate.getFullYear().toString();
};
