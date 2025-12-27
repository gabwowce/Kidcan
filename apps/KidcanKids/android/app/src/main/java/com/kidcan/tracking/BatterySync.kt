// android/app/src/main/java/com/kidcan/accessibility/BatterySync.kt
package com.kidcan.tracking

import android.content.Context
import android.util.Log
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody

object BatterySync {

    // ⚠️ ČIA įsidėsi savo Supabase project URL
    private const val SUPABASE_URL =
        "https://ysvokjlcxqvrjqqjvxmi.supabase.co/rest/v1/rpc/upsert_child_device_status"

    // ⚠️ ČIA – API KEY (geriau per BuildConfig / .env)
    private const val SUPABASE_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlzdm9ramxjeHF2cmpxcWp2eG1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0MjkwOTUsImV4cCI6MjA3OTAwNTA5NX0.ze_EUiOMX7njpUsjWL9auXCxovJidQ5-nPWFL6-2IEo"

    private val jsonMediaType = "application/json".toMediaType()
    private val client = OkHttpClient()

    fun sendBatteryStatus(
        context: Context,
        childId: Int,
        deviceId: String,
        batteryPercent: Int
    ) {
        // JSON body pagal RPC parametrus
        val bodyJson = """
            {
              "_child_id": $childId,
              "_device_id": "${deviceId}",
              "_battery_percent": $batteryPercent
            }
        """.trimIndent()

        val requestBody = bodyJson.toRequestBody(jsonMediaType)

        val request = Request.Builder()
            .url(SUPABASE_URL)
            .post(requestBody)
            .addHeader("apikey", SUPABASE_API_KEY)
            .addHeader("Content-Type", "application/json")
            // jei naudoji service role: .addHeader("Authorization", "Bearer $SUPABASE_API_KEY")
            .build()

        try {
            client.newCall(request).execute().use { response ->
                if (!response.isSuccessful) {
                    Log.e(
                        "Kidcan main",
                        "Battery upsert failed: HTTP ${response.code} ${response.message}"
                    )
                } else {
                    Log.d("Kidcan main", "Battery upsert OK")
                }
            }
        } catch (e: Exception) {
            Log.e("Kidcan main", "Battery upsert exception", e)
        }
    }
}
