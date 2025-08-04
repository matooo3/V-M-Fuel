import { registerPlugin } from '@capacitor/core';
const Http = registerPlugin('Http', {
    web: () => import('./web').then(m => new m.HttpWeb()),
    electron: () => import('./web').then(m => new m.HttpWeb()),
});
export * from './definitions';
export { Http };
//# sourceMappingURL=index.js.map