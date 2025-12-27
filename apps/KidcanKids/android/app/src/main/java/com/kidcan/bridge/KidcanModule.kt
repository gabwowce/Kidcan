package com.kidcan.bridge

import android.content.Intent
import android.net.Uri
import android.provider.Settings
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.kidcan.config.TrackingConfig
import com.kidcan.config.TrackingConfigStorage
import com.kidcan.core.ChildContextStorage
import com.kidcan.core.KidcanCore
import com.kidcan.permissions.KidcanPermissions
import com.kidcan.tracking.KidcanTrackingService

class KidcanModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    init {
        KidcanCore.init(reactContext.applicationContext)
    }

    override fun getName(): String = "KidcanModule"

    // ---------------- BATTERY OPTIMIZATION ----------------

    @ReactMethod
    fun updateTrackingConfig(
        baseLocationMs: Int,
        boostLocationMs: Int,
        baseBatteryMs: Int,
        boostBatteryMs: Int
    ) {
        val ctx = reactApplicationContext

        val cfg = TrackingConfig(
            baseLocationMs = baseLocationMs.toLong(),
            boostLocationMs = boostLocationMs.toLong(),
            baseBatteryMs = baseBatteryMs.toLong(),
            boostBatteryMs = boostBatteryMs.toLong()
        )

        TrackingConfigStorage.save(ctx, cfg)

        // Jei nori, čia gali iškart perstartinti servisą su base režimu:
        KidcanTrackingService.startBase(ctx)
    }

    @ReactMethod
    fun isBatteryOptimizationIgnored(promise: Promise) {
        try {
            val ignored = KidcanPermissions.isBatteryOptimizationIgnored(reactContext)
            promise.resolve(ignored)
        } catch (e: Exception) {
            promise.reject("ERR_BATTERY_OPT_CHECK", e)
        }
    }

    @ReactMethod
    fun openBatteryOptimizationSettings(promise: Promise) {
        try {
            KidcanPermissions.openBatteryOptimizationSettings(reactContext)
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("ERR_BATTERY_OPT_SETTINGS", e)
        }
    }


    // ---------------- CHILD CONTEXT ----------------

    @ReactMethod
    fun setChildContext(childId: Int, deviceId: String, promise: Promise) {
        try {
            ChildContextStorage.save(reactContext, childId, deviceId)
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("SET_CHILD_CONTEXT_ERROR", e)
        }
    }

    // ---------------- FOREGROUND TRACKING SERVICE ----------------

    /**
     * Paleidžia ForegroundService su BAZINIAIS intervalais:
     * - lokacija kas ~1 min
     * - baterija kas ~30 min
     */
    @ReactMethod
    fun startBaseTracking(promise: Promise) {
        try {
            KidcanTrackingService.startBase(reactContext.applicationContext)
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("ERR_START_BASE_TRACKING", e)
        }
    }

    /**
     * Perjungia / paleidžia tracking’ą BOOST režimu:
     * - lokacija dažniau
     * - baterija dažniau
     * (naudosi, kai tėvas atsidaro Dashboard’ą).
     */
    @ReactMethod
    fun startBoostTracking(promise: Promise) {
        try {
            KidcanTrackingService.startBoost(reactContext.applicationContext)
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("ERR_START_BOOST_TRACKING", e)
        }
    }

    /**
     * Sustabdo ForegroundService, jei kada reikės hard stop.
     */
    @ReactMethod
    fun stopTracking(promise: Promise) {
        try {
            KidcanTrackingService.stop(reactContext.applicationContext)
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("ERR_STOP_TRACKING", e)
        }
    }

    // ---------------- PERMISSIONS / SETTINGS ----------------

    @ReactMethod
    fun openUsageAccessSettings(promise: Promise) {
        try {
            KidcanPermissions.openUsageAccessSettings(reactContext)
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("ERR_USAGE_SETTINGS", e)
        }
    }

    @ReactMethod
    fun openOverlaySettings(promise: Promise) {
        try {
            KidcanPermissions.openOverlaySettings(reactContext)
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("ERR_OVERLAY_SETTINGS", e)
        }
    }

    @ReactMethod
    fun openAccessibilitySettings(promise: Promise) {
        try {
            KidcanPermissions.openAccessibilitySettings(reactContext)
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("ERR_ACCESSIBILITY_SETTINGS", e)
        }
    }

    @ReactMethod
    fun isUsageAccessGranted(promise: Promise) {
        promise.resolve(KidcanPermissions.isUsageAccessGranted(reactContext))
    }

    @ReactMethod
    fun isOverlayPermissionGranted(promise: Promise) {
        promise.resolve(KidcanPermissions.isOverlayPermissionGranted(reactContext))
    }

    @ReactMethod
    fun isAccessibilityEnabled(promise: Promise) {
        promise.resolve(KidcanPermissions.isAccessibilityEnabled(reactContext))
    }

    // --------- LOCATION (foreground + nuvedimas į Settings) ---------

    @ReactMethod
    fun isLocationPermissionGranted(promise: Promise) {
        try {
            val granted = KidcanPermissions.isLocationPermissionGranted(reactContext)
            promise.resolve(granted)
        } catch (e: Exception) {
            promise.reject("ERR_LOCATION_CHECK", e)
        }
    }

    @ReactMethod
    fun requestLocationPermission(promise: Promise) {
        val activity = currentActivity
        if (activity == null) {
            promise.reject("NO_ACTIVITY", "Current activity is null")
            return
        }

        try {
            KidcanPermissions.requestLocationPermission(activity)
            // dialogas parodytas – realią būseną tikrinam vėliau per isLocationPermissionGranted
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("ERR_LOCATION_REQUEST", e)
        }
    }

    /**
     * Atidaro app'o Settings ekraną, kur user gali pasirinkti
     * "Allow all the time" (jei OS tai leidžia).
     */
    @ReactMethod
    fun openLocationSettings(promise: Promise) {
        try {
            KidcanPermissions.openLocationSettings(reactContext)
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("ERR_LOCATION_SETTINGS", e)
        }
    }

    // ---------------- BLOCKING / SHIELD ----------------

    @ReactMethod
    fun setBlockingEnabled(enabled: Boolean, promise: Promise) {
        KidcanBlocking.setBlockingEnabled(enabled)
        promise.resolve(null)
    }

    @ReactMethod
    fun isBlockingEnabled(promise: Promise) {
        promise.resolve(KidcanBlocking.isBlockingEnabled())
    }

    @ReactMethod
    fun setShieldMessage(message: String, promise: Promise) {
        KidcanBlocking.setShieldMessage(message)
        promise.resolve(null)
    }

    @ReactMethod
    fun hideShield(promise: Promise) {
        try {
            KidcanBlocking.hideShieldNow()
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("ERR_HIDE_SHIELD", e)
        }
    }

    @ReactMethod
    fun blockForMinutes(minutes: Int, message: String, promise: Promise) {
        try {
            KidcanBlocking.blockForMinutes(minutes, message)
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("ERR_BLOCK_FOR_MINUTES", e)
        }
    }

    @ReactMethod
    fun cancelBlock(promise: Promise) {
        try {
            KidcanBlocking.cancelBlock()
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("ERR_CANCEL_BLOCK", e)
        }
    }
}
