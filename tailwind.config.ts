
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				// Cores específicas da temática
				'rose-soft': {
					50: '#fdf2f4',
					100: '#fce7eb',
					200: '#f9d1d9',
					300: '#f4aab8',
					400: '#ed7991',
					500: '#cd8595', // primary
					600: '#b8677a',
					700: '#9a5465',
					800: '#7d4553',
					900: '#5f3340'
				},
				'olive-soft': {
					50: '#f6f7f2',
					100: '#eaede1',
					200: '#d7dcc6',
					300: '#bec5a2',
					400: '#9ea486', // secondary
					500: '#7d8769',
					600: '#646c54',
					700: '#505744',
					800: '#404637',
					900: '#2f342a'
				},
				'cream': {
					50: '#fdfcfb',
					100: '#fbf8f6',
					200: '#f7f0ed',
					300: '#f1e7e0',
					400: '#e8d9d0',
					500: '#ddc8b8',
					600: '#c9ad96',
					700: '#b59376',
					800: '#8f7459',
					900: '#5b4030'
				},
				'terracota': {
					50: '#fdf4f2',
					100: '#fae6e1',
					200: '#f5d1c7',
					300: '#edb4a1',
					400: '#e28d72',
					500: '#bf7259', // destructive
					600: '#a65940',
					700: '#8a4a35',
					800: '#6e3c2d',
					900: '#4d2a1f'
				},
				'lilac-soft': {
					50: '#faf9fb',
					100: '#f4f1f6',
					200: '#ebe4ed',
					300: '#ddd1dd',
					400: '#cbbbcd', // accent
					500: '#b5a0b8',
					600: '#9d849f',
					700: '#836c85',
					800: '#665366',
					900: '#4a3d4b'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
				'organic': '2rem 1rem 2rem 1rem',
				'petal': '3rem 1rem 3rem 1rem'
			},
			fontFamily: {
				'inter': ['Inter', 'sans-serif'],
				'playfair': ['Playfair Display', 'serif'],
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
					'33%': { transform: 'translateY(-10px) rotate(1deg)' },
					'66%': { transform: 'translateY(-5px) rotate(-1deg)' }
				},
				'pulse-soft': {
					'0%, 100%': { opacity: '1', transform: 'scale(1)' },
					'50%': { opacity: '0.8', transform: 'scale(1.02)' }
				},
				'shimmer': {
					'0%': { left: '-100%' },
					'100%': { left: '100%' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'float': 'float 6s ease-in-out infinite',
				'pulse-soft': 'pulse-soft 4s ease-in-out infinite',
				'shimmer': 'shimmer 3s infinite'
			},
			backgroundImage: {
				'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
				'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
				'texture-paper': 'radial-gradient(circle at 1px 1px, rgba(205, 133, 149, 0.08) 1px, transparent 0)',
				'texture-linen': 'linear-gradient(45deg, rgba(158, 164, 134, 0.05) 25%, transparent 25%), linear-gradient(-45deg, rgba(158, 164, 134, 0.05) 25%, transparent 25%)'
			},
			boxShadow: {
				'soft': '0 8px 32px rgba(205, 133, 149, 0.1), 0 2px 8px rgba(91, 64, 48, 0.05)',
				'petal': '0 4px 20px rgba(205, 133, 149, 0.15), 0 1px 4px rgba(91, 64, 48, 0.1), inset 0 1px 0 rgba(255, 253, 252, 0.3)',
				'glow': '0 0 20px rgba(205, 133, 149, 0.3)',
				'inner-soft': 'inset 0 2px 8px rgba(205, 133, 149, 0.1)'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
