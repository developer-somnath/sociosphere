<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        {{-- Theme pre-loader: applies .dark before React mounts to prevent FOUC.
             Key 'theme' matches next-themes default storageKey.
             Handles: 'dark', 'light', 'system' (checks OS preference). --}}
        <script>
            (function() {
                try {
                    var theme = localStorage.getItem('theme') || 'system';
                    var isDark = theme === 'dark' ||
                        (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
                    if (isDark) {
                        document.documentElement.classList.add('dark');
                    } else {
                        document.documentElement.classList.remove('dark');
                    }
                } catch (e) {}
            })();
        </script>

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.tsx'])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>

