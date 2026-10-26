package com.playereden.ricochetrumble;

import android.app.Activity;
import android.os.Bundle;
import android.content.Context;
import android.graphics.Color;
import android.view.View;
import android.view.WindowManager;
import android.net.nsd.NsdManager;
import android.net.nsd.NsdServiceInfo;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebSettings;
import android.widget.Toast;

import org.json.JSONObject;
import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.io.IOException;
import java.net.Inet4Address;
import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.net.NetworkInterface;
import java.net.ServerSocket;
import java.net.Socket;
import java.nio.charset.StandardCharsets;
import java.util.Enumeration;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Small single-activity Android host for the HTML5 game. Game rules and graphics
 * are bundled in the APK under assets/. Multiplayer is a foreground, two-phone,
 * same-Wi-Fi TCP session advertised with Android NSD; no cloud dependency.
 */
public final class MainActivity extends Activity {
    private static final String SERVICE_TYPE = "_rrtank._tcp.";
    private static final int MAX_PACKET = 9000;
    private WebView web;
    private NsdManager nsd;
    private NsdManager.RegistrationListener registration;
    private NsdManager.DiscoveryListener discovery;
    private volatile ServerSocket server;
    private volatile Socket connection;
    private volatile BufferedWriter out;
    private volatile boolean isHosting = false;
    private volatile boolean stopped = false;
    private final AtomicInteger generation = new AtomicInteger(0);
    private final Object outputLock = new Object();

    @Override public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        enterImmersiveMode();
        nsd = (NsdManager) getSystemService(Context.NSD_SERVICE);
        web = new WebView(this);
        web.setBackgroundColor(Color.rgb(7, 20, 28));
        web.setVerticalScrollBarEnabled(false);
        web.setHorizontalScrollBarEnabled(false);
        web.setOverScrollMode(View.OVER_SCROLL_NEVER);
        web.getSettings().setJavaScriptEnabled(true);
        web.getSettings().setDomStorageEnabled(false);
        web.getSettings().setBlockNetworkLoads(true);
        web.getSettings().setAllowFileAccess(true);
        web.getSettings().setAllowFileAccessFromFileURLs(false);
        web.getSettings().setAllowUniversalAccessFromFileURLs(false);
        web.getSettings().setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        web.setWebViewClient(new WebViewClient() {
            @Override public boolean shouldOverrideUrlLoading(WebView view, String url) { return true; }
        });
        // JavaScript bridge is safe only because this WebView loads app-bundled assets.
        web.addJavascriptInterface(new GameBridge(), "AndroidBridge");
        setContentView(web);
        web.loadUrl("file:///android_asset/index.html");
    }

    private void enterImmersiveMode() {
        getWindow().getDecorView().setSystemUiVisibility(
            View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
            | View.SYSTEM_UI_FLAG_FULLSCREEN
            | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
            | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
            | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
            | View.SYSTEM_UI_FLAG_LAYOUT_STABLE);
    }
    @Override public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) enterImmersiveMode();
    }

    private void signal(JSONObject data) {
        final String dataLiteral = JSONObject.quote(data.toString());
        runOnUiThread(() -> {
            if (web != null) web.evaluateJavascript("window.RR && window.RR.nativeMessage(" + dataLiteral + ")", null);
        });
    }
    private void signalType(String type) {
        JSONObject obj = new JSONObject();
        try { obj.put("type", type); } catch (Exception ignored) { }
        signal(obj);
    }
    private void error(String message) {
        JSONObject obj = new JSONObject();
        try { obj.put("type", "error"); obj.put("message", message); } catch (Exception ignored) { }
        signal(obj);
    }
    private String ipv4() {
        try {
            Enumeration<NetworkInterface> nets = NetworkInterface.getNetworkInterfaces();
            while (nets != null && nets.hasMoreElements()) {
                NetworkInterface n = nets.nextElement();
                if (!n.isUp() || n.isLoopback()) continue;
                Enumeration<InetAddress> ips = n.getInetAddresses();
                while (ips.hasMoreElements()) {
                    InetAddress a = ips.nextElement();
                    if (a instanceof Inet4Address && a.isSiteLocalAddress()) return a.getHostAddress();
                }
            }
        } catch (Exception ignored) { }
        return "Check your Wi-Fi IP";
    }
    private void stopDiscovery() {
        if (discovery != null) {
            try { nsd.stopServiceDiscovery(discovery); } catch (Exception ignored) { }
            discovery = null;
        }
    }
    private void unregister() {
        if (registration != null) {
            try { nsd.unregisterService(registration); } catch (Exception ignored) { }
            registration = null;
        }
    }
    private void closeNetwork() {
        generation.incrementAndGet();
        stopped = true;
        isHosting = false;
        stopDiscovery();
        unregister();
        try { if (connection != null) connection.close(); } catch (IOException ignored) { }
        try { if (server != null) server.close(); } catch (IOException ignored) { }
        connection = null;
        server = null;
        out = null;
    }
    private void registerHost(int port) {
        NsdServiceInfo info = new NsdServiceInfo();
        info.setServiceName("Ricochet Rumble");
        info.setServiceType(SERVICE_TYPE);
        info.setPort(port);
        NsdManager.RegistrationListener listener = new NsdManager.RegistrationListener() {
            public void onServiceRegistered(NsdServiceInfo serviceInfo) { }
            public void onRegistrationFailed(NsdServiceInfo serviceInfo, int code) { error("Nearby advertisement failed; try the host IP instead."); }
            public void onServiceUnregistered(NsdServiceInfo serviceInfo) { }
            public void onUnregistrationFailed(NsdServiceInfo serviceInfo, int code) { }
        };
        registration = listener;
        try { nsd.registerService(info, NsdManager.PROTOCOL_DNS_SD, listener); }
        catch (Exception ex) { error("Nearby broadcast unavailable. You can join by local IP."); }
    }
    private void startHost() {
        closeNetwork();
        stopped = false;
        isHosting = true;
        final int myGen = generation.get();
        new Thread(() -> {
            try {
                ServerSocket ss = new ServerSocket(0, 1);
                if (myGen != generation.get()) { ss.close(); return; }
                server = ss;
                registerHost(ss.getLocalPort());
                JSONObject payload = new JSONObject();
                payload.put("type", "hosting");
                payload.put("address", ipv4());
                payload.put("port", ss.getLocalPort());
                signal(payload);
                Socket peer = ss.accept();
                if (myGen != generation.get()) { peer.close(); return; }
                attachPeer(peer, myGen, true);
            } catch (Exception ex) {
                if (myGen == generation.get()) error("Could not host: " + ex.getClass().getSimpleName());
            }
        }, "RR-Host").start();
    }
    private void startDiscovery() {
        closeNetwork();
        stopped = false;
        final int myGen = generation.get();
        NsdManager.DiscoveryListener listener = new NsdManager.DiscoveryListener() {
            @Override public void onDiscoveryStarted(String serviceType) { }
            @Override public void onDiscoveryStopped(String serviceType) { }
            @Override public void onStartDiscoveryFailed(String serviceType, int errorCode) { error("Discovery unavailable; use Join by IP."); }
            @Override public void onStopDiscoveryFailed(String serviceType, int errorCode) { }
            @Override public void onServiceLost(NsdServiceInfo serviceInfo) { }
            @Override public void onServiceFound(NsdServiceInfo service) {
                if (!SERVICE_TYPE.equals(service.getServiceType()) || myGen != generation.get()) return;
                nsd.resolveService(service, new NsdManager.ResolveListener() {
                    @Override public void onResolveFailed(NsdServiceInfo serviceInfo, int errorCode) { }
                    @Override public void onServiceResolved(NsdServiceInfo resolved) {
                        if (myGen != generation.get() || resolved.getHost() == null) return;
                        try {
                            JSONObject payload = new JSONObject();
                            payload.put("type", "found");
                            payload.put("name", resolved.getServiceName());
                            payload.put("host", resolved.getHost().getHostAddress());
                            payload.put("port", resolved.getPort());
                            signal(payload);
                        } catch (Exception ignored) { }
                    }
                });
            }
        };
        discovery = listener;
        try { nsd.discoverServices(SERVICE_TYPE, NsdManager.PROTOCOL_DNS_SD, listener); }
        catch (Exception ex) { error("Discovery unavailable; use Join by IP."); }
    }
    private void join(String ip, int port) {
        if (ip == null || ip.isEmpty() || ip.length() > 64 || port < 1 || port > 65535) { error("Invalid connection address"); return; }
        closeNetwork();
        stopped = false;
        isHosting = false;
        int myGen = generation.get();
        new Thread(() -> {
            try {
                Socket sock = new Socket();
                sock.connect(new InetSocketAddress(ip, port), 3500);
                if (myGen != generation.get()) { sock.close(); return; }
                attachPeer(sock, myGen, false);
            } catch (Exception ex) { if (myGen == generation.get()) error("Could not connect. Confirm both phones share Wi-Fi."); }
        }, "RR-Join").start();
    }
    private void attachPeer(Socket sock, int myGen, boolean host) {
        try {
            connection = sock;
            sock.setTcpNoDelay(true);
            sock.setKeepAlive(true);
            synchronized (outputLock) { out = new BufferedWriter(new OutputStreamWriter(sock.getOutputStream(), StandardCharsets.UTF_8)); }
            signalType("connected");
            BufferedReader reader = new BufferedReader(new InputStreamReader(sock.getInputStream(), StandardCharsets.UTF_8));
            String line;
            while (myGen == generation.get() && (line = reader.readLine()) != null) {
                if (line.length() > MAX_PACKET) break;
                try {
                    JSONObject packet = new JSONObject(line);
                    String kind = packet.optString("type", "");
                    if ((host && "input".equals(kind)) || (!host && "state".equals(kind))) signal(packet);
                } catch (Exception ignored) { }
            }
        } catch (IOException ignored) { }
        finally {
            try { sock.close(); } catch (Exception ignored) { }
            if (myGen == generation.get()) {
                connection = null;
                out = null;
                signalType("disconnected");
            }
        }
    }
    private void send(String packet) {
        if (packet == null || packet.length() > MAX_PACKET) return;
        try {
            JSONObject json = new JSONObject(packet);
            if (isHosting && !"state".equals(json.optString("type"))) return;
            if (!isHosting && !"input".equals(json.optString("type"))) return;
            synchronized (outputLock) {
                if (out != null) { out.write(json.toString()); out.write('\n'); out.flush(); }
            }
        } catch (Exception ignored) { }
    }
    private final class GameBridge {
        @JavascriptInterface public void hostGame() { runOnUiThread(() -> startHost()); }
        @JavascriptInterface public void findGames() { runOnUiThread(() -> startDiscovery()); }
        @JavascriptInterface public void joinGame(String ip, int port) { runOnUiThread(() -> join(ip, port)); }
        @JavascriptInterface public void stopNetwork() { runOnUiThread(() -> closeNetwork()); }
        @JavascriptInterface public void sendPacket(String packet) { send(packet); }
    }
    @Override protected void onPause() {
        if (web != null) web.evaluateJavascript("window.RR && window.RR.appPause && window.RR.appPause()", null);
        super.onPause();
        if (web != null) web.onPause();
    }
    @Override protected void onResume() { super.onResume(); enterImmersiveMode(); if (web != null) web.onResume(); }
    @Override protected void onStop() {
        boolean wasConnected = connection != null;
        closeNetwork();
        if (wasConnected) signalType("disconnected");
        super.onStop();
    }
    @Override protected void onDestroy() { closeNetwork(); if (web != null) { web.removeJavascriptInterface("AndroidBridge"); web.destroy(); web = null; } super.onDestroy(); }
    @Override public void onBackPressed() {
        if (web != null) web.evaluateJavascript("window.RR && window.RR.openMenu && window.RR.openMenu()", null);
        else super.onBackPressed();
    }
}