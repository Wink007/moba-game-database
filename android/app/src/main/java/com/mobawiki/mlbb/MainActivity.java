package com.mobawiki.mlbb;

import android.os.Bundle;
import android.webkit.WebView;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        SwipeRefreshLayout swipeRefresh = findViewById(R.id.swipeRefresh);
        if (swipeRefresh != null) {
            // Material-style colors
            swipeRefresh.setColorSchemeResources(
                android.R.color.holo_blue_bright,
                android.R.color.holo_green_light,
                android.R.color.holo_orange_light
            );
            swipeRefresh.setProgressBackgroundColorSchemeColor(0xFF1e293b);

            swipeRefresh.setOnRefreshListener(() -> {
                WebView webView = getBridge().getWebView();
                if (webView != null) {
                    webView.reload();
                }
                // Hide spinner after a short delay
                swipeRefresh.postDelayed(() -> swipeRefresh.setRefreshing(false), 1000);
            });
        }
    }
}
