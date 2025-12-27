package com.kidcan.config

import android.content.Context

data class TrackingConfig(
    val baseLocationMs: Long,
    val boostLocationMs: Long,
    val baseBatteryMs: Long,
    val boostBatteryMs: Long,
)

object TrackingConfigStorage {
    private const val PREFS = "kidcan_tracking"
    private const val KEY_BASE_LOC = "base_loc"
    private const val KEY_BOOST_LOC = "boost_loc"
    private const val KEY_BASE_BAT = "base_bat"
    private const val KEY_BOOST_BAT = "boost_bat"

    fun save(ctx: Context, cfg: TrackingConfig) {
        ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
            .edit()
            .putLong(KEY_BASE_LOC, cfg.baseLocationMs)
            .putLong(KEY_BOOST_LOC, cfg.boostLocationMs)
            .putLong(KEY_BASE_BAT, cfg.baseBatteryMs)
            .putLong(KEY_BOOST_BAT, cfg.boostBatteryMs)
            .apply()
    }

    fun get(ctx: Context): TrackingConfig {
        val sp = ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE)

        return TrackingConfig(
            baseLocationMs = sp.getLong(KEY_BASE_LOC, 300_000L),   // 5 min
            boostLocationMs = sp.getLong(KEY_BOOST_LOC, 60_000L),  // 1 min
            baseBatteryMs = sp.getLong(KEY_BASE_BAT, 1_800_000L),  // 30 min
            boostBatteryMs = sp.getLong(KEY_BOOST_BAT, 300_000L),  // 5 min
        )
    }
}
