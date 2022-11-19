import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../../../app/hooks';
import { LOGIN } from '../../../constants/routes';

interface Props {
	children: JSX.Element;
}

const ProtectedRoute = ({ children }: Props): JSX.Element => {
	const auth = useAppSelector((state) => state.auth);

	if (auth.isAuthenticated) {
		return children;
	}

	return <Navigate to="/" />;
};

export default ProtectedRoute;
