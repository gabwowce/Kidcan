package com.kidcan.bridge

import com.kidcan.core.KidcanCore
import com.kidcan.accessibility.KidcanAccessibilityService

object KidcanBlocking {

    fun setBlockingEnabled(enabled: Boolean) {
        KidcanCore.setBlockingEnabled(enabled)
    }

    fun isBlockingEnabled(): Boolean =
        KidcanCore.isBlockingEnabled()

    fun setShieldMessage(message: String) {
        KidcanCore.setShieldMessage(message)
    }

    fun hideShieldNow() {
        KidcanAccessibilityService.hideShieldNow()
    }

    fun blockForMinutes(minutes: Int, message: String) {
        KidcanCore.setShieldMessage(message)
        KidcanCore.blockForDurationMinutes(minutes)
    }

    fun cancelBlock() {
        KidcanCore.cancelBlock()
    }
}
