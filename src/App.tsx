import { lazy, Suspense, type ReactNode } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router';
import { Layout } from './components/Layout';
import { Loading } from './components/Loading';
// The landing page is part of the main bundle: no extra round trip before first paint.
import Home from './views/Home';

const Search = lazy(() => import('./views/Search'));
const Record = lazy(() => import('./views/Record'));
const Stats = lazy(() => import('./views/Stats'));
const Methodology = lazy(() => import('./views/Methodology'));
const Styleguide = lazy(() => import('./views/Styleguide'));
const NotFound = lazy(() => import('./views/NotFound'));

const page = (node: ReactNode) => <Suspense fallback={<Loading />}>{node}</Suspense>;

/*
 * Routes. URLs are Hungarian because they are user-facing.
 * Reserved for later (B-dosszié, see SPEC §12): "/akta/:id/oldal/:page" for the
 * multi-page document viewer. Records of every source type share "/akta/:id";
 * the record view picks the template from `record.source`.
 */
export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'kereses', element: page(<Search />) },
      { path: 'akta/:id', element: page(<Record />) },
      { path: 'kimutatas', element: page(<Stats />) },
      { path: 'modszertan', element: page(<Methodology />) },
      { path: 'styleguide', element: page(<Styleguide />) },
      { path: '*', element: page(<NotFound />) },
    ],
  },
]);

export function App() {
  return <RouterProvider router={router} />;
}
