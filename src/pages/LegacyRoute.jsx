import { useEffect, useState } from 'react';
import { useLanguage } from '../state/LanguageContext.jsx';
import { LegacyPage } from './LegacyPage.jsx';

const legacyLoaders = {
  home: () => import('../legacy/home.fragment.html?raw'),
  about: () => import('../legacy/about.fragment.html?raw'),
  contact: () => import('../legacy/contact.fragment.html?raw'),
  donate: () => import('../legacy/donate.fragment.html?raw'),
  poli: () => import('../legacy/poli.fragment.html?raw')
};

export function LegacyRoute({ pageKey }) {
  const { t } = useLanguage();
  const [state, setState] = useState({ html: '', error: null });

  useEffect(() => {
    let active = true;
    setState({ html: '', error: null });

    legacyLoaders[pageKey]()
      .then((module) => {
        if (active) setState({ html: module.default, error: null });
      })
      .catch((error) => {
        if (active) setState({ html: '', error });
      });

    return () => {
      active = false;
    };
  }, [pageKey]);

  if (state.error) {
    return (
      <main className="container">
        <section className="card content">{t('notFound')}</section>
      </main>
    );
  }

  if (!state.html) {
    return (
      <main className="container">
        <section className="card content loading-state">{t('loading')}</section>
      </main>
    );
  }

  return <LegacyPage html={state.html} pageKey={pageKey} />;
}
