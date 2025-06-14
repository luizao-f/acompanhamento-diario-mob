
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
				// Cores específicas da temática natural
				'rose-earth': {
					50: '#fdf6f7',
					100: '#fbeef0',
					200: '#f7dde1',
					300: '#f1c1c8',
					400: '#e89ca8',
					500: '#c9818b', // primary
					600: '#b56872',
					700: '#9a5561',
					800: '#7d4651',
					900: '#5f3640'
				},
				'sage-natural': {
					50: '#f6f7f4',
					100: '#edefea',
					200: '#dde0d7',
					300: '#c6cabe',
					400: '#a8b09d',
					500: '#949a7e', // secondary
					600: '#7d8367',
					700: '#676d54',
					800: '#525745',
					900: '#3f4437'
				},
				'terracota-warm': {
					50: '#faf7f5',
					100: '#f4efeb',
					200: '#e9ddd5',
					300: '#dbc6b8',
					400: '#c8a694',
					500: '#bc846c', // accent
					600: '#a56b54',
					700: '#8a5847',
					800: '#6f473d',
					900: '#543630'
				},
				'coral-gentle': {
					50: '#fdf7f6',
					100: '#faedeb',
					200: '#f4dbd6',
					300: '#ecc0b7',
					400: '#e19b90',
					500: '#d07662', // destructive
					600: '#b85e49',
					700: '#9a4d3c',
					800: '#7c3f33',
					900: '#5e312a'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
				'organic': '2rem 1.5rem 2rem 1.5rem',
				'petal': '3rem 1rem 3rem 1rem',
				'leaf': '1.5rem 0.5rem 1.5rem 0.5rem'
			},
			fontFamily: {
				'inter': ['Inter', 'sans-serif'],
				'crimson': ['Crimson Text', 'serif'],
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
				'breathe': {
					'0%, 100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' },
					'50%': { transform: 'scale(1.02) rotate(0.5deg)', opacity: '0.9' }
				},
				'sway': {
					'0%, 100%': { transform: 'translateX(0px) rotate(0deg)' },
					'33%': { transform: 'translateX(-2px) rotate(-0.5deg)' },
					'66%': { transform: 'translateX(2px) rotate(0.5deg)' }
				},
				'bloom': {
					'0%, 100%': { transform: 'scale(1)', opacity: '0.7' },
					'50%': { transform: 'scale(1.05)', opacity: '1' }
				},
				'flow': {
					'0%': { left: '-100%' },
					'50%': { left: '100%' },
					'100%': { left: '-100%' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'breathe': 'breathe 4s ease-in-out infinite',
				'sway': 'sway 6s ease-in-out infinite',
				'bloom': 'bloom 3s ease-out infinite',
				'flow': 'flow 4s infinite ease-in-out'
			},
			backgroundImage: {
				'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
				'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
				'texture-paper': 'radial-gradient(circle at 2px 2px, rgba(201, 129, 139, 0.06) 1px, transparent 0)',
				'texture-linen': 'linear-gradient(45deg, rgba(148, 154, 126, 0.03) 25%, transparent 25%), linear-gradient(-45deg, rgba(148, 154, 126, 0.03) 25%, transparent 25%)',
				'texture-watercolor': 'linear-gradient(135deg, rgba(201, 129, 139, 0.02) 0%, rgba(188, 132, 108, 0.02) 25%, rgba(148, 154, 126, 0.02) 50%, rgba(201, 129, 139, 0.02) 75%, rgba(245, 240, 235, 0.05) 100%)'
			},
			boxShadow: {
				'soft': '0 4px 20px rgba(201, 129, 139, 0.08), 0 1px 3px rgba(78, 56, 45, 0.06)',
				'gentle': '0 8px 32px rgba(201, 129, 139, 0.12), 0 2px 8px rgba(78, 56, 45, 0.08), inset 0 1px 0 rgba(255, 252, 248, 0.8)',
				'warm': '0 12px 40px rgba(188, 132, 108, 0.15), 0 4px 12px rgba(78, 56, 45, 0.1), inset 0 1px 0 rgba(255, 252, 248, 0.9)',
				'inner-soft': 'inset 0 2px 8px rgba(201, 129, 139, 0.08)'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
