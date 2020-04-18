export default {
  name: 'default',
  lookup(options) {
    if (localStorage.getItem('i18nextLng')) {
      return undefined
    }
    // defaults
    return 'mm';
  }
};