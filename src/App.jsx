import { Layout } from './components/Layout.jsx';
import { LegacyRoute } from './pages/LegacyRoute.jsx';
import { CollectionPage } from './pages/CollectionPage.jsx';
import { PaymentsPage } from './pages/PaymentsPage.jsx';
import { RegionPage } from './pages/RegionPage.jsx';
import { LanguageProvider } from './state/LanguageContext.jsx';
import { ThemeProvider } from './state/ThemeContext.jsx';
import { useHashRoute } from './router/useHashRoute.js';

const legacyPages = {
  '/': 'home',
  '/about': 'about',
  '/contact': 'contact',
  '/donate': 'donate',
  '/poli': 'poli'
};

function resolvePage(route) {
  if (route.path === '/activities') {
    return <CollectionPage type="activities" slug={route.params.slug} />;
  }
  if (route.path === '/statements') {
    return <CollectionPage type="statements" slug={route.params.slug} />;
  }
  if (route.path === '/payments') {
    return <PaymentsPage />;
  }
  if (route.path === '/region') {
    return <RegionPage />;
  }
  return <LegacyRoute pageKey={legacyPages[route.path] || legacyPages['/']} />;
}

export default function App() {
  const route = useHashRoute();

  return (
    <ThemeProvider>
      <LanguageProvider>
        <Layout activePath={route.path}>{resolvePage(route)}</Layout>
      </LanguageProvider>
    </ThemeProvider>
  );
}
