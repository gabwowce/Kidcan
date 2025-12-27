// src/i18n/index.ts
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      dashboard: {
        quickActions: {
          remoteSiren: {
            title: "REMOTE SIREN",
            subtitle: "Play loud sound even if silent",
            button: "PLAY SOUND",
          },
          common: {
            sending: "Sending...",
          },
        },
      },
      onboarding: {
        welcomeSubtitle:
          "A fun, effective and trust-based\nway to keep kids safe",
        start: "Start",
        haveAccount: "I already have an account",

        addOrJoin: {
          header: "Add kid or join",
          title:
            "Ready to add your kid, or does your family already use Kidcan?",
          addKidTitle: "Add a kid",
          joinFamilyTitle: "Join Family",
        },

        chooseRole: {
          header: "Choose role",
          question: "Who are you in the family?",
          continue: "Continue",
          roles: {
            mother: "Mother",
            father: "Father",
            grandparent: "Grandparent",
            guardian: "Guardian",
            sibling: "Sibling",
            other: "Other",
          },
        },

        connectChild: {
          header: "Add a Kid",
          sectionTitle: "CONNECT DEVICE",
          parentLabel: "Kidcan Guard\nFor a Parent",
          childLabel: "Kidcan Child\nFor a Kid",
          infoTitle: "Install the KidCan Child app on {{childName}}’s device.",
          infoText:
            "You must install the companion app on {{childName}}’s phone.",
          button: "Set up Kid's Phone",
        },

        joinFamily: {
          header: "Join Family",
          title: "Enter this code on the child's device",
          subtitlePrefix: "Open the",
          appName: "Kidcan Child",
          subtitleSuffix: "app and enter the code below",
          tapToCopy: "TAP TO COPY",
          enteredButton: "I have entered the code",
          sendCode: "📩 Send Code",
        },
      },
      auth: {
        login: "Log in",
        register: "Create an account",
        returning: {
          title: "Welcome back!",
          subtitle:
            "Login to manage your kid's family settings and view reports.",
        },
        afterPairing: {
          title: "Keep your family's data secured",
          subtitle:
            "Create a secure account to keep your kid's settings & information safe.",
        },
        google: "Continue with Google",
        apple: "Continue with Apple",
        facebook: "Continue with Facebook",
        haveFamilyCode: "I have a family code",
        or: "OR",
        agreePrefix: "By logging in, you agree to our",
        terms: "Terms",
        privacy: "Privacy Policy",
        and: "and",
      },
      settings: {
        section: {
          account: "Account",
          app: "App settings",
        },
        account: {
          profile: "Profile",
          profile_subtitle: "Update your name, email and password.",
          children: "Children",
          addChild: "Add a new child",
          addChild_subtitle: "Create a kid profile and pairing code.",
          inviteParent: "Invite another parent",
          inviteParent_subtitle: "Generate a code so other parents can join.",
        },
        app: {
          notifications: "Notifications",
          language: "Language",
        },
        other: {
          logout: "Log out",
        },
      },
    },
  },
  lt: {
    translation: {
      dashboard: {
        quickActions: {
          remoteSiren: {
            title: "NUOTOLINĖ SIRENA",
            subtitle: "Leisti garsų signalą net jei telefonas nutildytas",
            button: "Leisti garsą",
          },
          common: {
            sending: "Siunčiama...",
          },
        },
      },
      onboarding: {
        welcomeSubtitle:
          "Linksmas, veiksmingas ir pasitikėjimu grįstas\nbūdas pasirūpinti vaiko saugumu",
        start: "Pradėti",
        haveAccount: "Jau turiu paskyrą",

        addOrJoin: {
          header: "Pridėti vaiką ar prisijungti",
          title: "Ar nori pridėti vaiką, ar tavo šeima jau naudoja Kidcan?",
          addKidTitle: "Pridėti vaiką",
          joinFamilyTitle: "Prisijungti prie šeimos",
        },

        chooseRole: {
          header: "Pasirink vaidmenį",
          question: "Kas esi šioje šeimoje?",
          continue: "Tęsti",
          roles: {
            mother: "Mama",
            father: "Tėtis",
            grandparent: "Senelis / senelė",
            guardian: "Globėjas",
            sibling: "Brolis / sesė",
            other: "Kita rolė",
          },
        },

        connectChild: {
          header: "Pridėti vaiką",
          sectionTitle: "PRIJUNK ĮRENGINĮ",
          parentLabel: "Kidcan Guard\nTėvams",
          childLabel: "Kidcan Child\nVaikui",
          infoTitle: "Įdiek KidCan Child programėlę vaiko įrenginyje.",
          infoText: "Turi įdiegti papildomą programėlę vaiko telefone.",
          button: "Nustatyti vaiko telefoną",
        },

        joinFamily: {
          header: "Prisijungti prie šeimos",
          title: "Įvesk šį kodą vaiko įrenginyje",
          subtitlePrefix: "Atidaryk",
          appName: "Kidcan Child",
          subtitleSuffix: "programėlę ir įvesk žemiau pateiktą kodą",
          tapToCopy: "PALIESTI KOPIJAVIMUI",
          enteredButton: "Kodą įvedžiau",
          sendCode: "📩 Išsiųsti kodą",
        },
      },
      auth: {
        returning: {
          title: "Sveiki sugrįžę!",
          subtitle:
            "Prisijunkite, kad galėtumėte valdyti savo vaiko nustatymus ir peržiūrėti ataskaitas.",
        },
        afterPairing: {
          title: "Apsaugokite savo šeimos duomenis",
          subtitle:
            "Sukurkite saugią paskyrą, kad išsaugotumėte vaiko nustatymus ir informaciją.",
        },
        google: "Prisijungti su Google",
        apple: "Prisijungti su Apple",
        facebook: "Prisijungti su Facebook",
        haveFamilyCode: "Turiu šeimos kodą",
        or: "ARBA",
        agreePrefix: "Prisijungdami sutinkate su mūsų",
        terms: "Taisyklėmis",
        privacy: "Privatumo politika",
        and: "ir",
        login: "Prisijungti",
        register: "Sukurti paskyrą",
      },
      settings: {
        section: {
          account: "Paskyra",
          app: "Programėlės nustatymai",
        },
        account: {
          profile: "Profilis",
          profile_subtitle: "Atnaujink savo vardą, el. paštą ir slaptažodį.",
          children: "Vaikai",
          addChild: "Pridėti naują vaiką",
          addChild_subtitle: "Įvesk vardą, lytį ir gauk prisijungimo kodą.",
          inviteParent: "Pakviesti kitą tėvą",
          inviteParent_subtitle: "Sugeneruok kodą, kad kiti tėvai prisijungtų.",
        },
        app: {
          notifications: "Pranešimai",
          language: "Kalba",
        },
        other: {
          logout: "Atsijungti",
        },
      },
    },
  },
};

i18n.use(initReactI18next).init({
  lng: "en",
  fallbackLng: "en",
  resources,
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
