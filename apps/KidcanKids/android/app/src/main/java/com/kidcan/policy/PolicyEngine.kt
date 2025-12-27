package com.kidcan.policy

import android.content.Context
import android.provider.Telephony
import android.telecom.TelecomManager
import java.util.Calendar

data class TimeWindow(
    val dayOfWeek: Int,      // 1=Mon .. 7=Sun
    val startMinutes: Int,   // nuo dienos pradžios minutėmis
    val endMinutes: Int
)

class PolicyEngine(ctx: Context) {

    @Volatile private var manualEnabled: Boolean = false
    @Volatile private var scheduleWindows: List<TimeWindow> = emptyList()
    @Volatile private var whitelist: Set<String> = defaultWhitelist(ctx)
    @Volatile private var snoozeUntilMs: Long = 0L

    fun setBlockingEnabled(enabled: Boolean) {
        manualEnabled = enabled
    }

    fun getBlockingEnabled(): Boolean = manualEnabled

    fun setSchedule(windows: List<TimeWindow>) {
        scheduleWindows = windows
    }

    /** Laikinas „neblokuoti iki ...“ */
    fun snooze(ms: Long) {
        snoozeUntilMs = System.currentTimeMillis() + ms
    }

    fun isWhitelisted(pkg: String): Boolean = pkg in whitelist
    fun isAlwaysAllowed(pkg: String): Boolean = pkg in ALWAYS_ALLOW

    fun shouldBlock(pkg: String, nowMillis: Long = System.currentTimeMillis()): Boolean {
        // jeigu „snooze“ – nieko neblokuojam
        if (nowMillis < snoozeUntilMs) return false

        val effective = manualEnabled || isWithinAnyWindow(scheduleWindows, nowMillis)
        if (!effective) return false

        if (pkg in whitelist || pkg in ALWAYS_ALLOW) return false

        return true
    }

    private fun isWithinAnyWindow(
        windows: List<TimeWindow>,
        nowMillis: Long
    ): Boolean {
        val c = Calendar.getInstance().apply { timeInMillis = nowMillis }

        // paverčiam į Mon=1..Sun=7
        val dow = ((c.get(Calendar.DAY_OF_WEEK) + 5) % 7) + 1
        val m = c.get(Calendar.HOUR_OF_DAY) * 60 + c.get(Calendar.MINUTE)

        return windows.any { w ->
            w.dayOfWeek == dow && m in w.startMinutes..w.endMinutes
        }
    }

    companion object {
        private val ALWAYS_ALLOW = setOf(
            "com.android.systemui",
            "com.android.settings"
        )

        fun defaultWhitelist(ctx: Context): Set<String> {
            val defaultSms = Telephony.Sms.getDefaultSmsPackage(ctx)

            val smsCandidates = setOf(
                "com.google.android.apps.messaging",
                "com.samsung.android.messaging",
                "com.android.messaging"
            )

            val tm = ctx.getSystemService(Context.TELECOM_SERVICE) as? TelecomManager
            val defaultDialer = tm?.defaultDialerPackage

            val dialerCandidates = setOf(
                "com.google.android.dialer",
                "com.android.dialer"
            )

            val contacts = setOf(
                "com.google.android.contacts",
                "com.android.contacts"
            )

            return buildSet {
                addAll(dialerCandidates)
                defaultDialer?.let { add(it) }

                addAll(smsCandidates)
                defaultSms?.let { add(it) }

                addAll(contacts)
            }
        }
    }
}
