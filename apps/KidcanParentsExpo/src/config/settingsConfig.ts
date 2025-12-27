// src/config/settingsConfig.ts
export type SettingsActionId =
  | "logout"
  | "debugLog"
  | "deleteAccount"
  | "addChild"
  | "inviteParent"
  | "trackingConfig";

type BaseItem = {
  id: string;
  titleKey: string;
  subtitleKey?: string;
  iconName?: string;
};

export type SettingsItem =
  | (BaseItem & {
      type: "navigation";
      targetScreen: string;
      params?: Record<string, any>;
    })
  | (BaseItem & {
      type: "toggle";
      storageKey: string;
      defaultValue: boolean;
    })
  | (BaseItem & {
      type: "action";
      actionId: SettingsActionId;
    });

export type SettingsSection = {
  id: string;
  titleKey?: string;
  data: SettingsItem[];
};

export const SETTINGS_SECTIONS: SettingsSection[] = [
  {
    id: "account",
    titleKey: "settings.section.account",
    data: [
      {
        id: "profile",
        type: "navigation",
        titleKey: "settings.account.profile",
        subtitleKey: "settings.account.profile_subtitle",
        iconName: "user",
        targetScreen: "Profile",
      },
      {
        id: "children",
        type: "navigation",
        titleKey: "settings.account.children",
        iconName: "users",
        targetScreen: "ChildrenList",
      },
      {
        id: "addChild",
        type: "action",
        titleKey: "settings.account.addChild",
        subtitleKey: "settings.account.addChild_subtitle",
        iconName: "user-plus",
        actionId: "addChild",
      },
      {
        id: "inviteParent",
        type: "action",
        titleKey: "settings.account.inviteParent",
        subtitleKey: "settings.account.inviteParent_subtitle",
        iconName: "user-check",
        actionId: "inviteParent",
      },
    ],
  },
  {
    id: "app",
    titleKey: "settings.section.app",
    data: [
      {
        id: "notifications",
        type: "toggle",
        titleKey: "settings.app.notifications",
        iconName: "bell",
        storageKey: "notifications_enabled",
        defaultValue: true,
      },
      {
        id: "language",
        type: "navigation",
        titleKey: "settings.app.language",
        iconName: "globe",
        targetScreen: "LanguageSettings",
      },
      {
        id: "trackingConfig",
        type: "navigation",
        titleKey: "settings.app.trackingConfig",
        subtitleKey: "settings.app.trackingConfig_subtitle",
        iconName: "navigation",
        targetScreen: "TrackingSettings", // 👈 naujas screen
      },
    ],
  },
  {
    id: "other",
    data: [
      {
        id: "logout",
        type: "action",
        titleKey: "settings.other.logout",
        iconName: "log-out",
        actionId: "logout",
      },
    ],
  },
];
