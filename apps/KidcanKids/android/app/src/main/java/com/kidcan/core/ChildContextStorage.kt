// android/app/src/main/java/com/kidcan/core/ChildContextStorage.kt
package com.kidcan.core

import android.content.Context

object ChildContextStorage {

    private const val PREFS_NAME = "kidcan_prefs"
    private const val KEY_CHILD_ID = "child_id"
    private const val KEY_DEVICE_ID = "device_id"

    fun save(context: Context, childId: Int, deviceId: String) {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        prefs.edit()
            .putInt(KEY_CHILD_ID, childId)
            .putString(KEY_DEVICE_ID, deviceId)
            .apply()
    }

    fun getChildId(context: Context): Int? {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val value = prefs.getInt(KEY_CHILD_ID, -1)
        return if (value == -1) null else value
    }

    fun getDeviceId(context: Context): String? {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        return prefs.getString(KEY_DEVICE_ID, null)
    }

    fun getChildContext(context: Context): Pair<Int, String>? {
        val childId = getChildId(context) ?: return null
        val deviceId = getDeviceId(context) ?: return null
        return childId to deviceId
    }
}
