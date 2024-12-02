/** @type {import('tailwindcss').Config} */
const { nextui } = require("@nextui-org/react")

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "border-color": "var(--border-color)",
        "hover-border-color": "var(--hover-border-color)",
      }
    },
  },
  darkMode: "class",
  plugins: [
    nextui({
      themes: {
        light: {
          colors: {
            primary: {
              50: "#E3F2FD",
              100: "#BBDEFB",
              200: "#90CAF9",
              300: "#64B5F6",
              400: "#42A5F5",
              500: "#2196F3",
              600: "#1E88E5",
              700: "#1976D2",
              800: "#1565C0",
              900: "#0D47A1",
              foreground: "#FFFFFF",
              DEFAULT: "#006FEE",
            },
            secondary: {
              50: "#E8F5E9",
              100: "#C8E6C9",
              200: "#A5D6A7",
              300: "#81C784",
              400: "#66BB6A",
              500: "#4CAF50",
              600: "#43A047",
              700: "#388E3C",
              800: "#2E7D32",
              900: "#1B5E20",
              foreground: "#FFFFFF",
              DEFAULT: "#4CAF50",
            },
            background: {
              DEFAULT: "#F9FAFB",
            },
            text: {
              DEFAULT: "#333333",
            },
            success: {
              DEFAULT: "#17c964",
            },
            warning: {
              DEFAULT: "#f5a524",
            },
            danger: {
              DEFAULT: "#f31260",
            }
          },
        },
        dark: {
          colors: {
            primary: {
              50: "#294661",
              100: "#2C5073",
              200: "#35648F",
              300: "#4078AA",
              400: "#4A8CC6",
              500: "#53A0E2",
              600: "#5CB5FF",
              700: "#4D8FCF",
              800: "#3B6FA5",
              900: "#2A4F7B",
              foreground: "#FFFFFF",
              DEFAULT: "#006FEE",
            },
            secondary: {
              50: "#1F3721",
              100: "#264828",
              200: "#306031",
              300: "#3A783A",
              400: "#46904A",
              500: "#52A859",
              600: "#60BF68",
              700: "#70D477",
              800: "#86DD8D",
              900: "#A1E6A4",
              foreground: "#FFFFFF",
              DEFAULT: "#4CAF50",
            },
            background: {
              DEFAULT: "#121212",
            },
            text: {
              DEFAULT: "#E0E0E0",
            },
            success: {
              DEFAULT: "#17c964",
            },
            warning: {
              DEFAULT: "#f5a524",
            },
            danger: {
              DEFAULT: "#f31260",
            }
          },
        },
      }
    })
  ],
}

