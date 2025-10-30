import '../css/app.css';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { SnackbarProvider } from 'notistack';
import { createRoot } from 'react-dom/client';
import { ThemeProvider, CssBaseline } from '@mui/material';
import Layout from './components/Layout';
import theme from '../theme'; // 👈 import your theme
import '@fontsource/inter/300.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import './echo';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

// createInertiaApp({
//   title: (title) => `${title} - ${appName}`,
//   resolve: (name) =>
//     resolvePageComponent(`./pages/${name}.jsx`, import.meta.glob('./pages/**/*.jsx')),
//   setup({ el, App, props }) {
//     const root = createRoot(el);

//     root.render(
//       <ThemeProvider theme={theme}>
//         <CssBaseline /> {/* resets default browser styling */}
//         <SnackbarProvider maxSnack={8}>
//           <App {...props} />
//         </SnackbarProvider>
//       </ThemeProvider>
//     );
//   },
//   progress: {
//     color: '#4B5563',
//   },
// });

createInertiaApp({
  title: (title) => `${title} - ${appName}`,
  resolve: (name) => {
    return resolvePageComponent(
      `./pages/${name}.jsx`,
      import.meta.glob('./pages/**/*.jsx')
    ).then((module) => {
      // If the page exports a custom layout, use it; otherwise, use the default Layout
      const Page = module.default;
      Page.layout = Page.layout || ((page) => <Layout>{page}</Layout>);
      return Page;
    });
  },
  setup({ el, App, props }) {
    const root = createRoot(el);

    root.render(
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SnackbarProvider maxSnack={8}>
          <App {...props} />
        </SnackbarProvider>
      </ThemeProvider>
    );
  },
  progress: {
    color: '#4B5563',
  },
});