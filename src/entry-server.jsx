import React from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom/server'
import App from './App'

export { ROUTES, pageMeta, headTags } from './lib/seo'
export { SITE_URL } from './data/business'

// Build-time only: renders a route to HTML for scripts/prerender.js.
// (App already wraps everything in BookingProvider.)
export function render(url) {
  return renderToString(
    <React.StrictMode>
      <StaticRouter location={url}>
        <App />
      </StaticRouter>
    </React.StrictMode>
  )
}
