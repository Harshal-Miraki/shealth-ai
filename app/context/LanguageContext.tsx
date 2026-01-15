"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { DEFAULT_LABELS, TranslationType } from '../utils/translations';
import { translateObject } from '../utils/translator';

type Language = 'en' | 'es';

interface LanguageContextType {
    language: Language;
    translations: TranslationType;
    isLoading: boolean;
    changeLanguage: (lang: Language) => Promise<void>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguage] = useState<Language>('en');
    const [translations, setTranslations] = useState<TranslationType>(DEFAULT_LABELS);
    const [isLoading, setIsLoading] = useState(false);

    // Cache for translations to avoid re-fetching
    const [cache, setCache] = useState<Record<string, TranslationType>>({
        en: DEFAULT_LABELS
    });

    const changeLanguage = async (lang: Language) => {
        if (lang === language) return;

        // If caching English, ensure we reset to default
        if (lang === 'en') {
            setLanguage('en');
            setTranslations(DEFAULT_LABELS);
            return;
        }

        // Check cache
        if (cache[lang]) {
            setLanguage(lang);
            setTranslations(cache[lang]);
            return;
        }

        setIsLoading(true);
        try {
            const translated = await translateObject(DEFAULT_LABELS, lang) as TranslationType;
            setCache(prev => ({ ...prev, [lang]: translated }));
            setTranslations(translated);
            setLanguage(lang);
        } catch (error) {
            console.error("Failed to change language", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <LanguageContext.Provider value={{ language, translations, isLoading, changeLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
