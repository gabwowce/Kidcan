import { useFocusEffect } from "@react-navigation/native";
import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import { UiActivityEvent } from "../../api/activity";
import { fetchRecentBatteryEventsForChildren } from "../../api/battery";
import { fetchRecentGeofenceEventsForChildren } from "../../api/geofences";
import { BATTERY_REFRESH_MS } from "../../config/battery";
import { colors, spacing } from "../../theme";
import { AppText } from "../common/AppText";

type Props = {
  childIds: number[];
};

export const RecentActivityFeed: React.FC<Props> = ({ childIds }) => {
  const [events, setEvents] = React.useState<UiActivityEvent[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [showAll, setShowAll] = React.useState(false);

  const formatRelativeTime = (iso: string) => {
    const created = new Date(iso).getTime();
    if (Number.isNaN(created)) return "";

    const diffSec = Math.max(0, (Date.now() - created) / 1000);

    if (diffSec < 60) return "Just now";

    const diffMin = Math.round(diffSec / 60);
    if (diffMin < 60) return `${diffMin} min ago`;

    const diffHours = Math.round(diffMin / 60);
    if (diffHours < 24) return `${diffHours} hours ago`;

    const diffDays = Math.round(diffHours / 24);
    return `${diffDays} days ago`;
  };

  const mergeEvents = React.useCallback(
    (prev: UiActivityEvent[], next: UiActivityEvent[]) => {
      if (!prev.length) return next;

      const prevIds = new Set(prev.map((e) => e.id));
      const merged = [...next.filter((e) => !prevIds.has(e.id)), ...prev];

      return merged.sort(
        (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)
      );
    },
    []
  );

  const loadEvents = React.useCallback(
    async (opts?: { replace?: boolean; showSpinner?: boolean }) => {
      const { replace = false, showSpinner = false } = opts ?? {};

      if (!childIds.length) {
        setEvents([]);
        return;
      }

      try {
        if (showSpinner) setLoading(true);

        const [geo, battery] = await Promise.all([
          fetchRecentGeofenceEventsForChildren(childIds, 10),
          fetchRecentBatteryEventsForChildren(childIds, 10),
        ]);

        const combined = [...geo, ...battery].sort(
          (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)
        );

        setEvents((prev) => {
          if (replace || prev.length === 0) {
            return combined;
          }
          return mergeEvents(prev, combined);
        });
      } catch (e) {
        console.log("RecentActivityFeed loadEvents error", e);
        if (replace) setEvents([]);
      } finally {
        if (showSpinner) setLoading(false);
      }
    },
    [childIds, mergeEvents]
  );

  React.useEffect(() => {
    void loadEvents({ replace: true, showSpinner: true });
  }, [loadEvents]);

  useFocusEffect(
    React.useCallback(() => {
      if (!childIds.length) return;

      let isActive = true;

      const tick = async () => {
        if (!isActive) return;
        try {
          await loadEvents({ replace: false, showSpinner: false });
        } catch (e) {
          console.log("RecentActivityFeed auto poll error", e);
        }
      };

      void tick();

      const intervalId = setInterval(() => {
        void tick();
      }, BATTERY_REFRESH_MS);

      return () => {
        isActive = false;
        clearInterval(intervalId);
      };
    }, [childIds.join(","), loadEvents])
  );

  const visibleEvents = React.useMemo(
    () => (showAll ? events : events.slice(0, 3)),
    [events, showAll]
  );

  const handleToggleViewAll = () => {
    setShowAll((prev) => {
      const next = !prev;
      if (!prev) {
        void loadEvents({ replace: true, showSpinner: true });
      }
      return next;
    });
  };

  const headerRightLabel = loading
    ? "Refreshing..."
    : showAll
    ? "Show less"
    : "View all";

  return (
    <>
      {/* HEADER */}
      <View style={styles.sectionHeaderRow}>
        <AppText size={16} weight="heavy" style={styles.sectionTitle}>
          Recent activity
        </AppText>
        <TouchableOpacity onPress={handleToggleViewAll}>
          <AppText
            size={13}
            weight="bold"
            color="#0065F4"
            style={styles.sectionLink}
          >
            {headerRightLabel}
          </AppText>
        </TouchableOpacity>
      </View>

      {/* CARD */}
      <View style={styles.activityCard}>
        {loading && events.length === 0 ? (
          <View style={styles.activityLoading}>
            <ActivityIndicator size="small" />
          </View>
        ) : events.length === 0 ? (
          <AppText
            size={12}
            weight="medium"
            color={colors.textMuted ?? "#9CA3AF"}
          >
            No recent events yet.
          </AppText>
        ) : (
          visibleEvents.map((ev, index) => {
            const isLast = index === visibleEvents.length - 1;
            return (
              <View key={ev.id}>
                <View style={styles.activityRow}>
                  <View style={styles.activityDot} />
                  <AppText
                    size={13}
                    weight="medium"
                    style={styles.activityText}
                    numberOfLines={1}
                  >
                    {ev.text}
                  </AppText>
                  <AppText
                    size={12}
                    weight="medium"
                    color={colors.textMuted ?? "#A1A1AA"}
                    style={styles.activityTime}
                  >
                    {formatRelativeTime(ev.createdAt)}
                  </AppText>
                </View>
                {!isLast && <View style={styles.activityDivider} />}
              </View>
            );
          })
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    marginTop: spacing.sm,
  },
  sectionTitle: {},
  sectionLink: {},
  activityCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ECEFF5",
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 16,
  },
  activityLoading: {
    paddingVertical: 16,
    alignItems: "center",
  },
  activityRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  activityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#E5E7EB",
    marginRight: 10,
  },
  activityText: {
    flex: 1,
  },
  activityTime: {
    marginLeft: 10,
  },
  activityDivider: {
    height: 1,
    backgroundColor: "#F1F3F9",
  },
});
