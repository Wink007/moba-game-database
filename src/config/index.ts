export const API_URL = process.env.REACT_APP_API_URL || 'https://web-production-8570.up.railway.app/api';

/**
 * Feature flag: social features (profile, voting, main heroes).
 * Enable via console: localStorage.setItem('ff_social', '1'); location.reload();
 * Disable: localStorage.removeItem('ff_social'); location.reload();
 */
export const FF_SOCIAL = localStorage.getItem('ff_social') === '1';