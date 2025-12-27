package com.kidcan.overlay

import android.content.Context
import android.content.Intent
import android.graphics.PixelFormat
import android.net.Uri
import android.view.Gravity
import android.view.View
import android.view.WindowManager
import android.widget.Button
import android.widget.FrameLayout
import android.widget.LinearLayout
import android.widget.TextView
import com.kidcan.accessibility.KidcanAccessibilityService

class OverlayController(private val ctx: Context) {

    private val wm = ctx.getSystemService(Context.WINDOW_SERVICE) as WindowManager
    private var view: View? = null

    fun showShield(reason: String) {
        if (view != null) return

        val params = WindowManager.LayoutParams(
            WindowManager.LayoutParams.MATCH_PARENT,
            WindowManager.LayoutParams.MATCH_PARENT,
            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY,
            WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN or
                    WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
                    WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL,
            PixelFormat.TRANSLUCENT
        ).apply {
            gravity = Gravity.TOP or Gravity.START
        }

        val root = FrameLayout(ctx).apply {
            setBackgroundColor(0x80000000.toInt()) // pusiau permatomas juodas
        }

        val card = LinearLayout(ctx).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(48, 48, 48, 48)
            setBackgroundColor(0xFFFFFFFF.toInt())

            val lp = FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.WRAP_CONTENT
            )
            lp.marginStart = 48
            lp.marginEnd = 48
            lp.gravity = Gravity.CENTER
            layoutParams = lp
        }

        val title = TextView(ctx).apply {
            text = reason
            textSize = 18f
        }

        val buttonsRow = LinearLayout(ctx).apply {
            orientation = LinearLayout.HORIZONTAL
            val lp = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            )
            lp.topMargin = 32
            layoutParams = lp
        }

        val btnCall = Button(ctx).apply {
            text = "Skambinti"
            layoutParams = LinearLayout.LayoutParams(
                0,
                LinearLayout.LayoutParams.WRAP_CONTENT,
                1f
            )
            setOnClickListener {
                KidcanAccessibilityService.snooze(3000)
                hideShield()
                val i = Intent(Intent.ACTION_DIAL).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                ctx.startActivity(i)
            }
        }

        val btnSms = Button(ctx).apply {
            text = "SMS"
            val lp = LinearLayout.LayoutParams(
                0,
                LinearLayout.LayoutParams.WRAP_CONTENT,
                1f
            )
            lp.marginStart = 16
            layoutParams = lp

            setOnClickListener {
                KidcanAccessibilityService.snooze(3000)
                hideShield()
                val i = Intent(
                    Intent.ACTION_SENDTO,
                    Uri.parse("smsto:")
                ).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                ctx.startActivity(i)
            }
        }

        val btnClose = Button(ctx).apply {
            text = "Uždaryti"
            val lp = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.WRAP_CONTENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            )
            lp.marginStart = 16
            layoutParams = lp

            setOnClickListener {
                KidcanAccessibilityService.snooze(10_000)
                hideShield()
            }
        }

        buttonsRow.addView(btnCall)
        buttonsRow.addView(btnSms)
        buttonsRow.addView(btnClose)

        card.addView(title)
        card.addView(buttonsRow)
        root.addView(card)

        wm.addView(root, params)
        view = root
    }

    fun hideShield() {
        view?.let { wm.removeView(it) }
        view = null
    }

    fun isShowing() = view != null
}
