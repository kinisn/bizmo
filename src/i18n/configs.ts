import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// 言語jsonファイルのimport
import translation_en from './common/en.json';
import translation_ja from './common/ja.json';
import translation_test from './common/test.json';

import account_en from './account/en.json';
import account_ja from './account/ja.json';
import account_test from './account/test.json';

i18n.use(initReactI18next) // passes i18n down to react-i18next
    .init({
        resources: {
            test: {
                translation: translation_test,
                account: account_test,
            },
            ja: {
                translation: translation_ja,
                account: account_ja,
            },
            en: {
                translation: translation_en,
                account: account_en,
            },
        },
        lng: 'ja',
        interpolation: {
            escapeValue: false, // react already safes from xss
        },
    });

export default i18n;
