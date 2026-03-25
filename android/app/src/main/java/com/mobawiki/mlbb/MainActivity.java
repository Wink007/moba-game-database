package com.mobawiki.mlbb;

import android.os.Bundle;
import android.view.ViewGroup;
import android.webkit.WebView;
import androidx.core.view.WindowCompat;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Enable edge-to-edge (required for targetSdkVersion 35 / Android 15)
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);

        // Wrap the REAL Capacitor WebView (created by Bridge, not from XML)
        WebView webView = getBridge().getWebView();
        if (webView == null) return;

        ViewGroup parent = (ViewGroup) webView.getParent();
        if (parent == null) return;

        int index = parent.indexOfChild(webView);
        parent.removeView(webView);

        SwipeRefreshLayout swipeRefresh = new SwipeRefreshLayout(this);
        swipeRefresh.setLayoutParams(new ViewGroup.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.MATCH_PARENT
        ));

        swipeRefresh.addView(webView, new ViewGroup.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.MATCH_PARENT
        ));

        parent.addView(swipeRefresh, index);

        // Push spinner below the top AdMob banner (~56dp)
        int density = (int) getResources().getDisplayMetrics().density;
        int bannerOffset = 56 * density;
        swipeRefresh.setProgressViewOffset(false, bannerOffset, bannerOffset + 64 * density);

        // Style
        swipeRefresh.setColorSchemeResources(
            android.R.color.holo_blue_bright,
            android.R.color.holo_green_light,
            android.R.color.holo_orange_light
        );
        swipeRefresh.setProgressBackgroundColorSchemeColor(0xFF1e293b);

        // Pull-to-refresh: call JS function to clear cache + remount page
        swipeRefresh.setOnRefreshListener(() -> {
            webView.evaluateJavascript(
                "if(window.__onPullToRefresh){window.__onPullToRefresh();'ok'}else{'miss'}",
                result -> {
                    // If JS function not available, fallback to full reload
                    if (result == null || result.contains("miss")) {
                        webView.reload();
                    }
                }
            );
            swipeRefresh.postDelayed(() -> swipeRefresh.setRefreshing(false), 1500);
        });
    }
}
