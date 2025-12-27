package com.kidcan.tracking

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Context
import android.content.Intent
import android.os.BatteryManager
import android.os.Build
import android.os.IBinder
import android.util.Log
import androidx.core.app.NotificationCompat
import com.kidcan.config.TrackingConfigStorage
import com.kidcan.core.ChildContextStorage
import kotlinx.coroutines.*

class KidcanTrackingService : Service() {

    companion object {
        private const val TAG = "Kidcan main"
        private const val CHANNEL_ID = "kidcan_tracking_channel"
        private const val NOTIF_ID = 1010

        private const val ACTION_START_BASE = "com.kidcan.action.START_TRACKING_BASE"
        private const val ACTION_START_BOOST = "com.kidcan.action.START_TRACKING_BOOST"
        private const val ACTION_STOP = "com.kidcan.action.STOP_TRACKING"

        /**
         * Paleidžia servisą su baziniais intervalais
         * (naudoti, kai vaiko telefonas įjungtas ir viskas tvarkoj fone).
         */
        fun startBase(context: Context) {
            val intent = Intent(context, KidcanTrackingService::class.java).apply {
                action = ACTION_START_BASE
            }
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(intent)
            } else {
                context.startService(intent)
            }
        }

        /**
         * Paleidžia / perjungia į „boost“ režimą
         * (naudoti, kai tėtis/mama atsidarę Dashboard – norim dažnesnių atnaujinimų).
         */
        fun startBoost(context: Context) {
            val intent = Intent(context, KidcanTrackingService::class.java).apply {
                action = ACTION_START_BOOST
            }
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(intent)
            } else {
                context.startService(intent)
            }
        }

        /**
         * Sustabdo servisą (jei kada reikėtų).
         */
        fun stop(context: Context) {
            val intent = Intent(context, KidcanTrackingService::class.java).apply {
                action = ACTION_STOP
            }
            context.startService(intent)
        }
    }

    private var serviceScope = CoroutineScope(SupervisorJob() + Dispatchers.IO)

    private var locationJob: Job? = null
    private var batteryJob: Job? = null

    // šitie intervalai jau NE konstanta – jie nustatomi iš TrackingConfig
    private var locationIntervalMs: Long = 300_000L  // fallback 5 min
    private var batteryIntervalMs: Long = 1_800_000L // fallback 30 min

    private var lastSentBattery: Int? = null

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        Log.d(TAG, "onCreate")
        createNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        Log.d(TAG, "onStartCommand action=${intent?.action}")

        // visada startForeground, kad servisas būtų „šarvuotas“
        val notif = buildNotification()
        startForeground(NOTIF_ID, notif)

        // pasiimam naujausią configą iš SharedPreferences
        val cfg = TrackingConfigStorage.get(this)

        when (intent?.action) {
            ACTION_START_BASE -> {
                // BASE režimas – naudojam base intervalus
                locationIntervalMs = cfg.baseLocationMs
                batteryIntervalMs = cfg.baseBatteryMs
                startTrackingLoops()
            }

            ACTION_START_BOOST -> {
                // BOOST režimas – naudojam boost intervalus
                locationIntervalMs = cfg.boostLocationMs
                batteryIntervalMs = cfg.boostBatteryMs
                startTrackingLoops()
            }

            ACTION_STOP -> {
                stopTrackingLoops()
                stopForeground(STOP_FOREGROUND_REMOVE)
                stopSelf()
            }

            else -> {
                // jei tiesiog paleistas be action – laikom base
                locationIntervalMs = cfg.baseLocationMs
                batteryIntervalMs = cfg.baseBatteryMs
                startTrackingLoops()
            }
        }

        // norim, kad Android bandytų atkurti servisą, jei nužudys
        return START_STICKY
    }

    override fun onDestroy() {
        super.onDestroy()
        Log.d(TAG, "onDestroy")
        stopTrackingLoops()
        serviceScope.cancel()
    }

    // ---------------- Notification ----------------

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val nm = getSystemService(NotificationManager::class.java)
            val existing = nm.getNotificationChannel(CHANNEL_ID)
            if (existing == null) {
                val channel = NotificationChannel(
                    CHANNEL_ID,
                    "Kidcan tracking",
                    NotificationManager.IMPORTANCE_LOW
                ).apply {
                    description = "Location and battery tracking for Kidcan"
                }
                nm.createNotificationChannel(channel)
            }
        }
    }

    private fun buildNotification(): Notification {
        val builder = NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(android.R.drawable.ic_lock_idle_lock) // TODO: pakeisti į savo ikoną
            .setContentTitle("Kidcan veikia")
            .setContentText("Stebime vaiko vietą ir bateriją")
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)

        return builder.build()
    }

    // ---------------- Tracking loops ----------------

    private fun startTrackingLoops() {
        Log.d(TAG, "startTrackingLoops loc=$locationIntervalMs ms, bat=$batteryIntervalMs ms")

        val ctxPair = ChildContextStorage.getChildContext(this)
        if (ctxPair == null) {
            Log.d(TAG, "No child context, cannot start tracking")
            return
        }
        val (childId, deviceId) = ctxPair

        // Lokacija
        locationJob?.cancel()
        locationJob = serviceScope.launch {
            Log.d(TAG, "Location loop START child=$childId dev=$deviceId")
            while (isActive) {
                try {
                    val loc = LocationReader.readCurrentLocation(this@KidcanTrackingService)
                    Log.d(TAG, "Location TICK loc=$loc")
                    if (loc != null) {
                        LocationSync.sendLocation(
                            context = this@KidcanTrackingService,
                            childId = childId,
                            deviceId = deviceId,
                            lat = loc.latitude,
                            lng = loc.longitude
                        )
                    }
                } catch (e: Exception) {
                    Log.e(TAG, "Location loop error", e)
                }
                delay(locationIntervalMs)
            }
            Log.d(TAG, "Location loop STOP")
        }

        // Baterija
        batteryJob?.cancel()
        batteryJob = serviceScope.launch {
            Log.d(TAG, "Battery loop START child=$childId dev=$deviceId")
            while (isActive) {
                try {
                    val percent = readBatteryLevel(this@KidcanTrackingService)
                    val last = lastSentBattery
                    val threshold = if (percent > 30) 7 else 3

                    if (last != null && kotlin.math.abs(percent - last) < threshold) {
                        Log.d(TAG, "Battery: $percent% (Δ < $threshold%), skip")
                    } else {
                        Log.d(TAG, "Battery: sending child=$childId dev=$deviceId $percent%")
                        BatterySync.sendBatteryStatus(
                            context = this@KidcanTrackingService,
                            childId = childId,
                            deviceId = deviceId,
                            batteryPercent = percent
                        )
                        lastSentBattery = percent
                    }
                } catch (e: Exception) {
                    Log.e(TAG, "Battery loop error", e)
                }
                delay(batteryIntervalMs)
            }
            Log.d(TAG, "Battery loop STOP")
        }
    }

    private fun stopTrackingLoops() {
        locationJob?.cancel()
        locationJob = null
        batteryJob?.cancel()
        batteryJob = null
        Log.d(TAG, "Tracking loops stopped")
    }

    private fun readBatteryLevel(context: Context): Int {
        val bm = context.getSystemService(BATTERY_SERVICE) as BatteryManager
        val level = bm.getIntProperty(BatteryManager.BATTERY_PROPERTY_CAPACITY)
        return level.coerceIn(0, 100)
    }
}
