import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";

import { sendChildCommand } from "../../api/childCommands";
import { QUICK_ACTIONS, type QuickActionId } from "../../config/quickActions";
import { AppText } from "../common/AppText";
import type { ChildCardData } from "../dashboard/ChildCard";
import { QuickActionCard } from "../dashboard/QuickActionCard";

type Props = {
  childrenList: ChildCardData[];
  selectedChildId: number | null;
};

export const DashboardQuickActionsSection: React.FC<Props> = ({
  childrenList,
  selectedChildId,
}) => {
  const { t } = useTranslation();
  const [quickActionLoading, setQuickActionLoading] =
    React.useState<QuickActionId | null>(null);

  const handleQuickAction = React.useCallback(
    async (actionId: QuickActionId) => {
      if (!childrenList.length || !selectedChildId) return;

      const targetChild = childrenList.find((c) => c.id === selectedChildId);
      if (!targetChild) return;

      const config = QUICK_ACTIONS.find((qa) => qa.id === actionId);
      if (!config) return;

      try {
        setQuickActionLoading(actionId);

        await sendChildCommand({
          childId: targetChild.id,
          commandType: config.commandType,
        });
      } catch (e) {
        console.log("quick action error", e);
      } finally {
        setQuickActionLoading(null);
      }
    },
    [childrenList, selectedChildId]
  );

  if (!childrenList.length || !selectedChildId) {
    return null;
  }

  return (
    <>
      {/* HEADER */}
      <View style={styles.sectionHeaderRow}>
        <AppText size={16} weight="heavy" style={styles.sectionTitle}>
          {t("dashboard.quickActions.title", "Quick Actions")}
        </AppText>
      </View>

      {/* CARDS */}
      <View style={styles.container}>
        {QUICK_ACTIONS.map((qa) => (
          <QuickActionCard
            key={qa.id}
            title={t(qa.titleKey)}
            subtitle={t(qa.subtitleKey)}
            buttonLabel={
              quickActionLoading === qa.id
                ? t("dashboard.quickActions.common.sending")
                : t(qa.buttonLabelKey)
            }
            loading={quickActionLoading === qa.id}
            onPress={() => handleQuickAction(qa.id)}
          />
        ))}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
    marginTop: 8,
  },
  sectionTitle: {
    // tik spacing / spalva jei reikia
  },
  container: {
    gap: 12,
    marginBottom: 16,
  },
});
