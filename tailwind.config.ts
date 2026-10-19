import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        forest: "#103c33",
        gold: "#c7a65c",
        mist: "#f4f7f2",
      },
    },
  },
  plugins: [],
};

export default config;
