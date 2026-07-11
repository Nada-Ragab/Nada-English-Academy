const APP_VERSION = '26.4.0';
const APP_DATA_KEY = 'nada_english_academy_v18_data';

function safeParse(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    console.warn('Could not parse saved academy data.', error);
    return fallback;
  }
}

function storageAvailable() {
  try {
    const key = '__nea_storage_test__';
    localStorage.setItem(key, '1');
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.warn('Browser storage is unavailable.', error);
    return false;
  }
}
