import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import App from './App';
import { HeadContext, type HeadData } from './components/Seo';

/** Build-time only: render one route to HTML and collect its <head> data from <Seo>. */
export function render(url: string) {
  const head: HeadData = {};
  const html = renderToString(
    <StrictMode>
      <HeadContext.Provider value={head}>
        <StaticRouter location={url}>
          <App />
        </StaticRouter>
      </HeadContext.Provider>
    </StrictMode>,
  );
  return { html, head };
}
