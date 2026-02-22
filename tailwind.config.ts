import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
    darkMode: "class",
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
        extend: {
                colors: {
                        background: 'hsl(var(--background))',
                        foreground: 'hsl(var(--foreground))',
                        card: {
                                DEFAULT: 'hsl(var(--card))',
                                foreground: 'hsl(var(--card-foreground))'
                        },
                        popover: {
                                DEFAULT: 'hsl(var(--popover))',
                                foreground: 'hsl(var(--popover-foreground))'
                        },
                        primary: {
                                DEFAULT: 'hsl(var(--primary))',
                                foreground: 'hsl(var(--primary-foreground))'
                        },
                        secondary: {
                                DEFAULT: 'hsl(var(--secondary))',
                                foreground: 'hsl(var(--secondary-foreground))'
                        },
                        muted: {
                                DEFAULT: 'hsl(var(--muted))',
                                foreground: 'hsl(var(--muted-foreground))'
                        },
                        accent: {
                                DEFAULT: 'hsl(var(--accent))',
                                foreground: 'hsl(var(--accent-foreground))'
                        },
                        destructive: {
                                DEFAULT: 'hsl(var(--destructive))',
                                foreground: 'hsl(var(--destructive-foreground))'
                        },
                        border: 'hsl(var(--border))',
                        input: 'hsl(var(--input))',
                        ring: 'hsl(var(--ring)',
                        chart: {
                                '1': 'hsl(var(--chart-1))',
                                '2': 'hsl(var(--chart-2))',
                                '3': 'hsl(var(--chart-3))',
                                '4': 'hsl(var(--chart-4))',
                                '5': 'hsl(var(--chart-5))'
                        },
                        // Zee Empire - Midnight Blue & Gold Theme
                        'midnight': {
                                DEFAULT: '#0A192F',
                                light: '#112240',
                                lighter: '#1D3557',
                                border: '#233554',
                        },
                        'gold': {
                                DEFAULT: '#FFD700',
                                50: '#FFFBEB',
                                100: '#FEF3C7',
                                200: '#FDE68A',
                                300: '#FCD34D',
                                400: '#FBBF24',
                                500: '#FFD700',
                                600: '#DAA520',
                                700: '#B8860B',
                                800: '#9A7B0A',
                                900: '#7C6308',
                        },
                        'offwhite': '#E6E6E6',
                        'steel': '#8892B0',
                        'teal': '#64FFDA',
                        'coral': '#FF6B6B',
                },
                borderRadius: {
                        lg: 'var(--radius)',
                        md: 'calc(var(--radius) - 2px)',
                        sm: 'calc(var(--radius) - 4px)'
                },
                animation: {
                        'fade-in': 'fadeIn 0.3s ease-out forwards',
                        'slide-in': 'slideIn 0.3s ease-out forwards',
                        'shimmer': 'shimmer 2s infinite',
                        'float': 'float 3s ease-in-out infinite',
                        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
                },
                keyframes: {
                        fadeIn: {
                                '0%': { opacity: '0', transform: 'translateY(10px)' },
                                '100%': { opacity: '1', transform: 'translateY(0)' },
                        },
                        slideIn: {
                                '0%': { transform: 'translateX(-100%)' },
                                '100%': { transform: 'translateX(0)' },
                        },
                        shimmer: {
                                '0%': { backgroundPosition: '-200% 0' },
                                '100%': { backgroundPosition: '200% 0' },
                        },
                        float: {
                                '0%, 100%': { transform: 'translateY(0px)' },
                                '50%': { transform: 'translateY(-10px)' },
                        },
                        'glow-pulse': {
                                '0%, 100%': { boxShadow: '0 0 20px rgba(255, 215, 0, 0.3)' },
                                '50%': { boxShadow: '0 0 40px rgba(255, 215, 0, 0.5)' },
                        },
                },
        }
  },
  plugins: [tailwindcssAnimate],
};
export default config;
