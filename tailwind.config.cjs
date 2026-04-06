/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
    theme: {
        extend: {
            gridTemplateColumns: {
                auto24auto: '1fr 24px 1fr',
                auto240auto: '1fr 240px 1fr',
            },
        },
    },
    important: true, // to overwrite MUI style
};
