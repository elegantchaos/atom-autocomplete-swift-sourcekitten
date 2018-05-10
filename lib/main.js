'use babel';

import swiftProvider from './swift-provider';

export default {
    getProvider() {
        // return a single provider, or an array of providers to use together
        return [swiftProvider];
    }
};
