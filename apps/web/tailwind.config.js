/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: '#0f172a', // slate-950
                surface: '#1e293b',    // slate-800
                primary: '#3b82f6',    // blue-500
                secondary: '#64748b',  // slate-500
                accent: '#f59e0b',     // amber-500 (for synthesis)
            },
            fontFamily: {
                mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
            }
        },
    },
    plugins: [],
}
