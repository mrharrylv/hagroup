import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { I18nProvider } from './i18n/I18nProvider';
import { KopaProvider } from './state/KopaProvider';
import './index.css';

const container = document.getElementById('root');
if (container === null) throw new Error('#root is missing from index.html');

createRoot(container).render(
  <StrictMode>
    <BrowserRouter>
      <I18nProvider>
        <KopaProvider>
          <App />
        </KopaProvider>
      </I18nProvider>
    </BrowserRouter>
  </StrictMode>,
);
