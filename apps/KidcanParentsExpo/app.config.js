// app.config.js
export default {
  expo: {
    owner: "gabwowce",
    name: "KidcanParents",
    slug: "kidcan-parent",

    android: {
      package: "com.kidcan.parents",
    },

    ios: {
      bundleIdentifier: "com.kidcan.parents",
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
      },
    },

    // 👇 BŪTINA EAS Update dalis
    updates: {
      url: "https://u.expo.dev/2df8f2df-9a80-4428-9b2e-c00bbf66c7f2",
    },
    runtimeVersion: {
      policy: "appVersion",
    },

    extra: {
      SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
      SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      eas: {
        projectId: "2df8f2df-9a80-4428-9b2e-c00bbf66c7f2",
      },
    },
  },
};
