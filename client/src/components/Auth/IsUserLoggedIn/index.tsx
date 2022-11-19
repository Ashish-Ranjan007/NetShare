import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../../../app/hooks';
import { FEED } from '../../../constants/routes';

interface Props {
	children: JSX.Element;
}

const IsUserLoggedIn = ({ children }: Props): JSX.Element => {
	const auth = useAppSelector((state) => state.auth);

	if (auth.isAuthenticated) {
		return <Navigate to="/" replace />;
	}

	return children;
};

export default IsUserLoggedIn;
