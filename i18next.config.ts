import { defineConfig } from 'i18next-cli';

export default defineConfig({
  locales: [
    "en",
    "sv"
  ],
  extract: {
    input: "src/**/*.{js,jsx,ts,tsx}",
    output: "src/locales/{{language}}/{{namespace}}.json"
  }
});