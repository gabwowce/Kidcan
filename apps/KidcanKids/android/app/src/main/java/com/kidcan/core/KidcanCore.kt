package com.kidcan.core

import android.app.AppOpsManager
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Binder
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.provider.Settings
import com.kidcan.accessibility.KidcanAccessibilityService
import com.kidcan.overlay.OverlayController
import com.kidcan.policy.PolicyEngine

object KidcanCore {

    // region Dependencies & state

    private lateinit var policy: PolicyEngine
    private lateinit var overlay: OverlayController

    @Volatile
    private var shieldMessage: String = "Pamokos režimas aktyvus"

    private val handler = Handler(Looper.getMainLooper())
    @Volatile private var countdownRunnable: Runnable? = null
    @Volatile private var blockEndTimeMs: Long = 0L

    fun init(appContext: Context) {
        if (!::policy.isInitialized) {
            policy = PolicyEngine(appContext)
            overlay = OverlayController(appContext)
            KidcanAccessibilityService.init(policy, overlay)
        }
    }

    // endregion

    // region Blocking state + shield

    fun setBlockingEnabled(enabled: Boolean) {
        policy.setBlockingEnabled(enabled)
    }

    fun isBlockingEnabled(): Boolean = policy.getBlockingEnabled()

    fun setShieldMessage(message: String) {
        shieldMessage = message
        // jei kada nors turėsi overlay.updateMessage(message) – gali kviesti čia
        // overlay.updateMessage(message)
    }

    fun getShieldMessage(): String = shieldMessage

    // endregion

    // region Permissions helpers

    fun openUsageAccessSettings(context: Context) {
        val intent = Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS).apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        context.startActivity(intent)
    }

    fun openOverlaySettings(context: Context) {
        val intent = Intent(
            Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
            Uri.parse("package:${context.packageName}")
        ).apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        context.startActivity(intent)
    }

    fun openAccessibilitySettings(context: Context) {
        val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS).apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        context.startActivity(intent)
    }

    fun isUsageAccessGranted(context: Context): Boolean {
        val appOps = context.getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
        val mode = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            appOps.unsafeCheckOpNoThrow(
                AppOpsManager.OPSTR_GET_USAGE_STATS,
                Binder.getCallingUid(),
                context.packageName
            )
        } else {
            appOps.checkOpNoThrow(
                AppOpsManager.OPSTR_GET_USAGE_STATS,
                Binder.getCallingUid(),
                context.packageName
            )
        }
        return mode == AppOpsManager.MODE_ALLOWED
    }

    fun isOverlayPermissionGranted(context: Context): Boolean {
        return Settings.canDrawOverlays(context)
    }

    fun isAccessibilityServiceEnabled(context: Context): Boolean {
        val enabled = Settings.Secure.getInt(
            context.contentResolver,
            Settings.Secure.ACCESSIBILITY_ENABLED,
            0
        )
        if (enabled != 1) return false

        val enabledServices = Settings.Secure.getString(
            context.contentResolver,
            Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES
        ) ?: return false

        val expectedId =
            "${context.packageName}/com.kidcan.accessibility.KidcanAccessibilityService"
        return enabledServices.split(':').any { it.equals(expectedId, ignoreCase = true) }
    }

    // endregion

    // region Timed blocking

    fun blockForDurationMinutes(minutes: Int) {
        val ms = minutes * 60_000L
        if (ms <= 0) return

        countdownRunnable?.let { handler.removeCallbacks(it) }
        countdownRunnable = null

        policy.setBlockingEnabled(true)
        blockEndTimeMs = System.currentTimeMillis() + ms

        val baseMsg = shieldMessage

        val r = object : Runnable {
            override fun run() {
                val now = System.currentTimeMillis()
                val left = blockEndTimeMs - now
                if (left <= 0L) {
                    policy.setBlockingEnabled(false)
                    overlay.hideShield()
                    countdownRunnable = null
                    return
                }

                val totalSec = left / 1000
                val mm = totalSec / 60
                val ss = totalSec % 60

                val text = "$baseMsg\nLiko: %02d:%02d".format(mm, ss)
                // čia vėliau galėsi daryti overlay.updateMessage(text)

                handler.postDelayed(this, 1000L)
            }
        }

        countdownRunnable = r
        handler.post(r)
    }

    fun cancelBlock() {
        countdownRunnable?.let { handler.removeCallbacks(it) }
        countdownRunnable = null
        policy.setBlockingEnabled(false)
        overlay.hideShield()
    }

    // endregion
}
