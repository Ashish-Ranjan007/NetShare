import React from 'react';
import { useParams } from 'react-router-dom';

const ProfilePage = () => {
	const { username } = useParams();
	return (
		<div>
			<p>username: {username}</p>ProfilePage
		</div>
	);
};

export default ProfilePage;
