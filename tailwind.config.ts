
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
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Lora', 'serif'],
      },
      colors: {
        background: '#FFF8F7',          // Creme pastel
        foreground: '#422B2F',          // Marrom quente, para contraste

        card: '#FFF2F4',                // Fundo card rosê bem claro
        'card-foreground': '#4c333b',

        popover: '#fff7f1',             // Fundo popover neutro
        'popover-foreground': '#422B2F',

        primary: {
          DEFAULT: '#EEB6C1',           // Rosê suave
          foreground: '#FFF8F7',
        },
        secondary: {
          DEFAULT: '#FFD6B6',           // Terracota clara
          foreground: '#7A4B27',        // Terracota escuro
        },
        muted: {
          DEFAULT: '#EAE3F7',           // Lilás claro
          foreground: '#716687',
        },
        accent: {
          DEFAULT: '#d4e6be',           // Verde oliva claro
          foreground: '#425a39',
        },
        destructive: {
          DEFAULT: '#F66B6B',           // Red suave
          foreground: '#FFF8F7'
        },
        border: '#F7D1D7',              // Rosê beeem suave
        input: '#FFE4EC',
        ring: '#EEB6C1',

        // Sidebar (mantendo, mas suavizando cores)
        sidebar: {
          DEFAULT: '#F9F6F4',
          foreground: '#886f81',
          primary: '#EEB6C1',
          'primary-foreground': '#FFF8F7',
          accent: '#d4e6be',
          'accent-foreground': '#425a39',
          border: '#F7D1D7',
          ring: '#EEB6C1'
        }
      },
      borderRadius: {
        lg: '2rem',
        md: '1.25rem',
        sm: '0.75rem'
      },
      boxShadow: {
        'soft': '0 6px 28px 0 hsla(338,53%,65%,0.08), 0 1.5px 8px 0 hsla(85,31%,88%,0.09)',
        'nature': '0 2px 12px hsla(85,31%,88%,0.07)'
      },
      keyframes: {
        'organic-fade': {
          "0%":   { opacity: ".88", transform: "scale(.97) rotate(-2deg)" },
          "100%": { opacity: "1", transform: "scale(1) rotate(0deg)" }
        },
        'nature-float': {
          "0%": { transform: "translateY(0px)" },
          "100%": { transform: "translateY(18px)" }
        }
      },
      animation: {
        'organic-fade': 'organic-fade 1.1s cubic-bezier(0.43,0.15,0.23,0.82) both',
        'nature-float': 'nature-float 3.8s ease-in-out infinite alternate'
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
