// android/app/src/main/java/com/kidcan/accessibility/KidcanAccessibilityService.kt
package com.kidcan.accessibility

import android.accessibilityservice.AccessibilityService
import android.content.Context
import android.os.BatteryManager
import android.util.Log
import android.view.accessibility.AccessibilityEvent
import com.kidcan.core.ChildContextStorage
import com.kidcan.core.KidcanCore
import com.kidcan.overlay.OverlayController
import com.kidcan.policy.PolicyEngine
import kotlinx.coroutines.*



class KidcanAccessibilityService : AccessibilityService() {

    companion object {
        @Volatile private var instance: KidcanAccessibilityService? = null
        @Volatile private var _policy: PolicyEngine? = null
        @Volatile private var _overlay: OverlayController? = null

        fun init(policy: PolicyEngine, overlay: OverlayController) {
            _policy = policy
            _overlay = overlay
        }

        fun snooze(ms: Long) { _policy?.snooze(ms) }
        fun getPolicyOrNull(): PolicyEngine? = _policy

        fun hideShieldNow() {
            _overlay?.hideShield()
        }


    }


    override fun onServiceConnected() {
        super.onServiceConnected()
        instance = this
        Log.d("Kidcan main", "Accessibility service connected")


    }

    override fun onDestroy() {
        super.onDestroy()
        Log.d("Kidcan main", "Accessibility service destroyed")
        instance = null


    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        if (event == null) return
        if (event.eventType != AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) return

        val pkg = event.packageName?.toString() ?: return
        val policy = _policy ?: return
        val overlay = _overlay ?: return

        if (policy.isWhitelisted(pkg) || policy.isAlwaysAllowed(pkg)) {
            overlay.hideShield()
            return
        }

        if (policy.shouldBlock(pkg)) {
            overlay.showShield(KidcanCore.getShieldMessage())
        } else {
            overlay.hideShield()
        }
    }

    override fun onInterrupt() { }




}
