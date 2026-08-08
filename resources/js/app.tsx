import '../css/app.css';
import './bootstrap';
import { ThemeProvider } from "@/components/theme/theme-provider";
import { I18nProvider } from "@/lib/i18n";
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./${name}.tsx`,
            import.meta.glob('./**/*.tsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <ThemeProvider>
                {/* Inertia's App render-prop children run INSIDE the Inertia
                    context provider, so I18nProvider (which calls usePage) must
                    wrap the page component here rather than wrapping <App/>. */}
                <App {...props}>
                    {({ Component, key, props: pageProps }) => (
                        <I18nProvider>
                            <Component key={key} {...pageProps} />
                        </I18nProvider>
                    )}
                </App>
            </ThemeProvider>
        );
    },
    progress: {
        color: '#4F46E5',
    },
});
