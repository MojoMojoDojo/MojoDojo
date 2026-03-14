import { en } from './en';
import { fr } from './fr';

export type Language = 'en' | 'fr';
export type Translations = typeof en;

export const translations: Record<Language, Translations> = { en, fr };

export { en, fr };
