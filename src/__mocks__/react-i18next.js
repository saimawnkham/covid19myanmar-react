import i18next from '../i18n';

const en = require('./../../public/locales/en.json');
i18next.addResourceBundle('en', 'translation', en, true, true);

const useMock = [k => k, {}];
useMock.t = k => i18next.t(k);
useMock.i18n = {};

module.exports = {
  useTranslation: () => useMock,
};