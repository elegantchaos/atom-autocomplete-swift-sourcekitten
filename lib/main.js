'use babel';

import swiftProvider from './swift-provider';

export default {
    activate() {
      console.debug("swift-autocomplete activated")
    },

    deactivate() {
      console.debug("swift-autocomplete deactivated")
    },

    getProvider() {
        // return a single provider, or an array of providers to use together
        return swiftProvider;
    }
};
