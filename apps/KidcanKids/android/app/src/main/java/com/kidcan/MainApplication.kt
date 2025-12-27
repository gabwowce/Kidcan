package com.kidcan

import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.soloader.SoLoader
import com.kidcan.core.KidcanCore
import com.kidcan.bridge.KidcanPackage
import com.kidcan.BuildConfig
import com.facebook.react.soloader.OpenSourceMergedSoMapping

class MainApplication : Application(), ReactApplication {

    override val reactNativeHost: ReactNativeHost =
        object : ReactNativeHost(this) {

            override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG

            override fun getPackages(): List<ReactPackage> =
                PackageList(this).packages + KidcanPackage()

            override fun getJSMainModuleName(): String = "index"
        }

    override fun onCreate() {
        super.onCreate()
        // naujas 0.76 init
        SoLoader.init(this, OpenSourceMergedSoMapping)
        // JOKIO DefaultNewArchitectureEntryPoint čia nereikia
    }
}
