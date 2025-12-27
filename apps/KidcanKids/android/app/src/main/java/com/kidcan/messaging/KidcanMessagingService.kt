package com.kidcan.messaging

import android.content.Context
import android.media.AudioAttributes
import android.media.AudioManager
import android.media.MediaPlayer
import android.net.Uri
import android.util.Log
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import com.kidcan.R
import com.kidcan.config.TrackingConfig
import com.kidcan.config.TrackingConfigStorage
import com.kidcan.core.ChildContextStorage
import com.kidcan.tracking.KidcanTrackingService

class KidcanMessagingService : FirebaseMessagingService() {

    override fun onNewToken(token: String) {
        super.onNewToken(token)
        Log.d("KidcanFCM", "New FCM token: $token")
        // TODO: vėliau išsiųsti į Supabase / backend
    }

    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        super.onMessageReceived(remoteMessage)

        Log.d("KidcanFCM", "onMessageReceived called")
        val data = remoteMessage.data
        Log.d("KidcanFCM", "Message data: $data")

        val commandType = data["type"] ?: data["commandType"]
        val commandId = data["command_id"] ?: data["id"]

        if (commandType == null) {
            Log.w("KidcanFCM", "No commandType/type in payload, ignoring")
            return
        }

        when (commandType) {
            "REMOTE_SIREN" -> {
                Log.d("KidcanFCM", "Executing REMOTE_SIREN command (id=$commandId)")
                handleRemoteSiren()
            }

            "START_BATTERY_SYNC",
            "START_LOCATION_SYNC" -> {
                Log.d("KidcanFCM", "Executing START_*_SYNC -> BOOST tracking")
                KidcanTrackingService.startBoost(applicationContext)
            }

            "STOP_BATTERY_SYNC",
            "STOP_LOCATION_SYNC" -> {
                Log.d("KidcanFCM", "Executing STOP_*_SYNC -> BASE tracking")
                // Grįžtam į bazinius intervalus, bet serviso nestabdom
                KidcanTrackingService.startBase(applicationContext)
            }

            "UPDATE_TRACKING_CONFIG" -> {
                Log.d("KidcanFCM", "Executing UPDATE_TRACKING_CONFIG")
                handleUpdateTrackingConfig(data)
            }

            else -> {
                Log.w("KidcanFCM", "Unknown commandType: $commandType")
            }
        }
    }

    // ------------------------------------------------------
    // UPDATE_TRACKING_CONFIG handler'is
    // ------------------------------------------------------

    private fun handleUpdateTrackingConfig(data: Map<String, String>) {
        try {
            val childIdStr = data["childId"] ?: data["child_id"]
            if (childIdStr.isNullOrBlank()) {
                Log.w("KidcanFCM", "UPDATE_TRACKING_CONFIG: missing childId")
                return
            }

            val remoteChildId = childIdStr.toLongOrNull()
            if (remoteChildId == null) {
                Log.w("KidcanFCM", "UPDATE_TRACKING_CONFIG: invalid childId=$childIdStr")
                return
            }

            // Pasitikrinam, ar lokaliame įrenginyje turim tą patį child context
            val ctxPair = ChildContextStorage.getChildContext(this)
            if (ctxPair == null) {
                Log.d("KidcanFCM", "No local child context, skip UPDATE_TRACKING_CONFIG")
                return
            }
            val (localChildId, _) = ctxPair

            if (localChildId.toLong() != remoteChildId) {
                Log.d(
                    "KidcanFCM",
                    "Config for childId=$remoteChildId, but local=$localChildId – skip"
                )
                return
            }

            val baseLocationMs =
                data["base_location_ms"]?.toLongOrNull() ?: 300_000L      // 5 min
            val boostLocationMs =
                data["boost_location_ms"]?.toLongOrNull() ?: 60_000L      // 1 min
            val baseBatteryMs =
                data["base_battery_ms"]?.toLongOrNull() ?: 1_800_000L     // 30 min
            val boostBatteryMs =
                data["boost_battery_ms"]?.toLongOrNull() ?: 300_000L      // 5 min

            val cfg = TrackingConfig(
                baseLocationMs = baseLocationMs,
                boostLocationMs = boostLocationMs,
                baseBatteryMs = baseBatteryMs,
                boostBatteryMs = boostBatteryMs
            )

            TrackingConfigStorage.save(this, cfg)
            Log.d("KidcanFCM", "TrackingConfig updated via FCM: $cfg")

            // Iškart perstartinam trackingą su naujais base intervalais
            KidcanTrackingService.startBase(this)

        } catch (e: Exception) {
            Log.e("KidcanFCM", "Failed to handle UPDATE_TRACKING_CONFIG", e)
        }
    }

    // ------------------------------------------------------
    // Sirenos logika
    // ------------------------------------------------------

    private fun handleRemoteSiren() {
        Log.d("KidcanFCM", "Playing remote siren")

        val audioManager = getSystemService(Context.AUDIO_SERVICE) as AudioManager

        // išsisaugom buvusį ALARM garsį
        val originalVolume =
            audioManager.getStreamVolume(AudioManager.STREAM_ALARM)
        val maxVolume =
            audioManager.getStreamMaxVolume(AudioManager.STREAM_ALARM)

        // užkeliame ALARM garsą iki max
        audioManager.setStreamVolume(
            AudioManager.STREAM_ALARM,
            maxVolume,
            0
        )

        val uri =
            Uri.parse("android.resource://$packageName/${R.raw.police_siren_kidcan}")

        val player = MediaPlayer().apply {
            setAudioAttributes(
                AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_ALARM)
                    .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                    .build()
            )
            setDataSource(this@KidcanMessagingService, uri)
            isLooping = false
            prepare()
            start()
        }

        player.setOnCompletionListener {
            // grąžinam buvusį garsį ir atlaisvinam media player
            audioManager.setStreamVolume(
                AudioManager.STREAM_ALARM,
                originalVolume,
                0
            )
            it.release()
        }
    }
}
