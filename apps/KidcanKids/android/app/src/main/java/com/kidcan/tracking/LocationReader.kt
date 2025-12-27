package com.kidcan.tracking

import android.annotation.SuppressLint
import android.content.Context
import android.location.Location
import android.location.LocationManager
import android.util.Log
import com.google.android.gms.location.LocationServices
import com.google.android.gms.location.Priority
import com.google.android.gms.tasks.CancellationTokenSource
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlin.coroutines.resume

object LocationReader {

    @SuppressLint("MissingPermission")
    suspend fun readCurrentLocation(context: Context): Location? =
        suspendCancellableCoroutine { cont ->
            val fused = LocationServices.getFusedLocationProviderClient(context)
            val cts = CancellationTokenSource()

            fun useLastLocationFallback() {
                fused.lastLocation
                    .addOnSuccessListener { last ->
                        Log.d("Kidcan", "fallback fused.lastLocation = $last")
                        if (!cont.isCompleted) {
                            if (last != null) {
                                cont.resume(last)
                            } else {
                                // paskutinis šansas – LocationManager
                                val lm =
                                    context.getSystemService(Context.LOCATION_SERVICE) as LocationManager
                                val providers = listOf(
                                    LocationManager.GPS_PROVIDER,
                                    LocationManager.NETWORK_PROVIDER,
                                    LocationManager.PASSIVE_PROVIDER
                                )

                                var lmLoc: Location? = null
                                for (p in providers) {
                                    val candidate = lm.getLastKnownLocation(p)
                                    Log.d("Kidcan", "LocationManager provider=$p loc=$candidate")
                                    if (candidate != null) {
                                        lmLoc = candidate
                                        break
                                    }
                                }

                                Log.d("Kidcan", "fallback LocationManager result = $lmLoc")
                                cont.resume(lmLoc)
                            }
                        }
                    }
                    .addOnFailureListener { e2 ->
                        Log.e("Kidcan", "fallback fused.lastLocation error", e2)
                        if (!cont.isCompleted) cont.resume(null)
                    }
            }

            // 1) bandome aktyvią lokaciją
            fused.getCurrentLocation(
                Priority.PRIORITY_BALANCED_POWER_ACCURACY,
                cts.token
            )
                .addOnSuccessListener { loc ->
                    Log.d("Kidcan", "getCurrentLocation = $loc")
                    if (!cont.isCompleted) {
                        if (loc != null) {
                            cont.resume(loc)
                        } else {
                            useLastLocationFallback()
                        }
                    }
                }
                .addOnFailureListener { e ->
                    Log.e("Kidcan", "getCurrentLocation error", e)
                    if (!cont.isCompleted) {
                        // jei Play Services numiršta (ApiException 20) – einam į fallback
                        useLastLocationFallback()
                    }
                }

            cont.invokeOnCancellation { cts.cancel() }
        }
}
