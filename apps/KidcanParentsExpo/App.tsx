// App.tsx
import { useFonts } from "expo-font";
import React, { useEffect } from "react";
import { Linking } from "react-native";
import { Provider } from "react-redux";

import { supabase } from "./src/api/supabaseClient";
import { store } from "./src/store";
import { initAuth, postAuthEnsureThunk } from "./src/store/slices/authSlice";

import { LanguageProvider } from "./src/context/LanguageContext";
import { OnboardingFlagProvider } from "./src/context/OnboardingFlagContext";
import "./src/i18n";
import { AppNavigator } from "./src/navigation/AppNavigator";
import { CurrentChildProvider } from "./src/context/CurrentChildContext";

const REDIRECT_PREFIX = "kidcanparent://auth/callback";

function parseHashParams(url: string): Record<string, string> {
  const hashIndex = url.indexOf("#");
  if (hashIndex === -1) return {};
  const hash = url.slice(hashIndex + 1);
  return Object.fromEntries(
    hash.split("&").map((part) => {
      const [k, v] = part.split("=");
      return [decodeURIComponent(k), decodeURIComponent(v ?? "")];
    })
  );
}

async function handleDeepLink(url: string) {
  if (!url.startsWith(REDIRECT_PREFIX)) return;

  const params = parseHashParams(url);
  const access_token = params.access_token;
  const refresh_token = params.refresh_token;

  console.log("Deep link URL:", url);
  console.log("Parsed params:", params);

  if (!access_token) {
    console.log("No access_token in deep link");
    return;
  }

  const { data, error } = await supabase.auth.setSession({
    access_token,
    refresh_token: refresh_token || undefined,
  });

  if (error) {
    console.log("setSession error:", error.message);
  } else {
    console.log("setSession OK, user:", data.session?.user?.email);
    // ✅ po setSession – padarom stub attach + ensure parent
    store.dispatch(postAuthEnsureThunk());
  }
}

export default function App() {
  const [fontsLoaded] = useFonts({
    "Gilroy-Bold": require("./src/assets/fonts/Gilroy-Bold.ttf"),
    "Gilroy-Medium": require("./src/assets/fonts/Gilroy-Medium.ttf"),
    "Gilroy-Heavy": require("./src/assets/fonts/Gilroy-Heavy.ttf"),
  });

  useEffect(() => {
    // init auth state
    store.dispatch(initAuth());

    (async () => {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) await handleDeepLink(initialUrl);
    })();

    const sub = Linking.addEventListener("url", ({ url }) => {
      handleDeepLink(url);
    });

    return () => sub.remove();
  }, []);

  if (!fontsLoaded) return null;

 return (
  <Provider store={store}>
    <OnboardingFlagProvider>
      <LanguageProvider>
        <CurrentChildProvider>
          <AppNavigator />
        </CurrentChildProvider>
      </LanguageProvider>
    </OnboardingFlagProvider>
  </Provider>
);

}
