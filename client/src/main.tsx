import { Provider } from 'react-redux';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from '@mui/material/styles';
import { BrowserRouter as Router } from 'react-router-dom';

import App from './App';
import './styles/style.css';
import { store } from './app/store';
import { globalTheme } from './styles/globalTheme';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
	<Provider store={store}>
		<ThemeProvider theme={globalTheme}>
			<Router>
				<App />
			</Router>
		</ThemeProvider>
	</Provider>
);
