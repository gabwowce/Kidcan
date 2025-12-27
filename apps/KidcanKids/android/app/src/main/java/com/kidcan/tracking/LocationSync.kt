package com.kidcan.tracking

import android.content.Context
import android.util.Log
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody

object LocationSync {

    private val client = OkHttpClient()

    // 👇 tavo Supabase edge URL
    private const val EDGE_URL =
        "https://ysvokjlcxqvrjqqjvxmi.supabase.co/functions/v1/child_location_sync"


    private const val API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlzdm9ramxjeHF2cmpxcWp2eG1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0MjkwOTUsImV4cCI6MjA3OTAwNTA5NX0.ze_EUiOMX7njpUsjWL9auXCxovJidQ5-nPWFL6-2IEo"


    fun sendLocation(
        context: Context,
        childId: Int,
        deviceId: String,
        lat: Double,
        lng: Double
    ) {
        val json = """
            {
              "childId": $childId,
              "deviceId": "$deviceId",
              "lat": $lat,
              "lng": $lng
            }
        """.trimIndent()

        val mediaType = "application/json; charset=utf-8".toMediaType()
        val body = json.toRequestBody(mediaType)

        val request = Request.Builder()
            .url(EDGE_URL)
            .addHeader("Authorization", "Bearer $API_KEY")
            .addHeader("apikey", API_KEY)
            .post(body)
            .build()

        client.newCall(request).enqueue(object : okhttp3.Callback {
            override fun onFailure(call: okhttp3.Call, e: java.io.IOException) {
                Log.e("Kidcan main", "LocationSync sendLocation error", e)
            }

            override fun onResponse(call: okhttp3.Call, response: okhttp3.Response) {
                if (!response.isSuccessful) {
                    Log.e("Kidcan main", "LocationSync response not OK: ${response.code}")
                } else {
                    Log.d("Kidcan main", "LocationSync OK")
                }
                response.close()
            }
        })
    }
}
