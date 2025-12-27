// src/config/languages.ts
export type AppLanguage = 'en' | 'lt'; // vėliau pridėsi: | 'pl' | 'de' ir t.t.

type LanguageOption = {
  code: AppLanguage;
  flag: string;
  label: string; // arba labelKey, jei naudosim i18n
};

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  {
    code: 'en',
    flag: '🇬🇧',
    label: 'English',
  },
  {
    code: 'lt',
    flag: '🇱🇹',
    label: 'Lietuvių',
  },
];
