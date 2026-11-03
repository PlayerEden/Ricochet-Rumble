package com.playereden.ricochetrumble;

import android.app.Activity;
import android.os.Bundle;
import android.content.Context;
import android.content.Intent;
import android.content.ActivityNotFoundException;
import android.graphics.Color;
import android.view.View;
import android.view.WindowManager;
import android.net.ConnectivityManager;
import android.net.Network;
import android.net.NetworkCapabilities;
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
    private static final int MAX_PACKET = 32768;
    private WebView web;
    private NsdManager nsd;
    private NsdManager.RegistrationListener registration;
    private NsdManager.DiscoveryListener discovery;
    private volatile ServerSocket server;
    private volatile Socket connection;
    private volatile BufferedWriter out;
    private volatile boolean isHosting = false;
    private volatile boolean stopped = false;
    private volatile boolean hostEndedInBackground = false;
    private final AtomicInteger generation = new AtomicInteger(0);
    private final Object outputLock = new Object();
    private final Object peerLock = new Object();
    private final LanPeerAdmission admission = new LanPeerAdmission();

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
        web.getSettings().setDomStorageEnabled(true);
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
            String fallback = null;
            while (nets != null && nets.hasMoreElements()) {
                NetworkInterface n = nets.nextElement();
                if (!n.isUp() || n.isLoopback()) continue;
                Enumeration<InetAddress> ips = n.getInetAddresses();
                while (ips.hasMoreElements()) {
                    InetAddress a = ips.nextElement();
                    if (a instanceof Inet4Address && a.isSiteLocalAddress()) {
                        if (n.getName().startsWith("wlan") || n.getName().startsWith("ap")) return a.getHostAddress();
                        if (fallback == null) fallback = a.getHostAddress();
                    }
                }
            }
            if (fallback != null) return fallback;
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
        final Socket oldPeer;
        final ServerSocket oldServer;
        synchronized (peerLock) {
            oldPeer = connection;
            oldServer = server;
            admission.clear();
            connection = null;
            server = null;
            synchronized (outputLock) { out = null; }
        }
        try { if (oldPeer != null) oldPeer.close(); } catch (IOException ignored) { }
        try { if (oldServer != null) oldServer.close(); } catch (IOException ignored) { }
    }
    private void registerHost(int port) {
        NsdServiceInfo info = new NsdServiceInfo();
        info.setServiceName("Sector Rebound");
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
    // Extra visitors cannot evict an active player/spectator or take seat 1.
    private void rejectBusy(Socket extra) {
        try {
            extra.setTcpNoDelay(true);
            JSONObject busy = new JSONObject();
            busy.put("type", "busy");
            busy.put("reason", "room-full");
            BufferedWriter writer = new BufferedWriter(
                new OutputStreamWriter(extra.getOutputStream(), StandardCharsets.UTF_8));
            writer.write(busy.toString());
            writer.write('\n');
            writer.flush();
        } catch (Exception ignored) { }
        finally { try { extra.close(); } catch (IOException ignored) { } }
    }
    private void startHost() {
        closeNetwork();
        stopped = false;
        isHosting = true;
        hostEndedInBackground = false;
        final int myGen = generation.get();
        new Thread(() -> {
            try {
                ServerSocket ss = new ServerSocket(0, 8);
                synchronized (peerLock) {
                    if (myGen != generation.get() || stopped) { ss.close(); return; }
                    server = ss;
                }
                registerHost(ss.getLocalPort());
                if (myGen != generation.get()) return;
                JSONObject payload = new JSONObject();
                payload.put("type", "hosting");
                payload.put("address", ipv4());
                payload.put("port", ss.getLocalPort());
                signal(payload);
                // Native host keeps accepting while game runs, even after a guest leaves.
                while (myGen == generation.get() && !stopped) {
                    final Socket peer = ss.accept();
                    boolean accepted = false;
                    synchronized (peerLock) {
                        if (myGen == generation.get() && !stopped && isHosting
                            && admission.claim(peer)) {
                            connection = peer;
                            accepted = true;
                        }
                    }
                    if (accepted) {
                        new Thread(() -> attachPeer(peer, myGen, true),
                            "RR-Host-Peer").start();
                    } else if (myGen == generation.get() && !stopped) {
                        rejectBusy(peer);
                    } else {
                        try { peer.close(); } catch (IOException ignored) { }
                    }
                }
            } catch (IOException ex) {
                // Closing the listener on Stop / leave is intentional.
                if (myGen == generation.get() && !stopped) error("Host listener stopped unexpectedly.");
            } catch (Exception ex) {
                if (myGen == generation.get() && !stopped) error("Could not host: " + ex.getClass().getSimpleName());
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
    private Network connectedWifi() {
        try {
            ConnectivityManager cm = (ConnectivityManager) getSystemService(Context.CONNECTIVITY_SERVICE);
            if (cm != null) for (Network network : cm.getAllNetworks()) {
                NetworkCapabilities caps = cm.getNetworkCapabilities(network);
                if (caps != null && caps.hasTransport(NetworkCapabilities.TRANSPORT_WIFI)) return network;
            }
        } catch (Exception ignored) { }
        return null;
    }
    private void join(String ip, int port) {
        if (ip == null || ip.isEmpty() || ip.length() > 64 || port < 1 || port > 65535) { error("Invalid connection address"); return; }
        closeNetwork();
        stopped = false;
        isHosting = false;
        int myGen = generation.get();
        new Thread(() -> {
            try {
                // LAN game traffic must use Wi-Fi even if cellular is Android's default network.
                Network wifi = connectedWifi();
                Socket sock = wifi != null ? wifi.getSocketFactory().createSocket() : new Socket();
                sock.connect(new InetSocketAddress(ip, port), 3500);
                boolean accepted;
                synchronized (peerLock) {
                    accepted = myGen == generation.get() && !stopped && admission.claim(sock);
                    if (accepted) connection = sock;
                }
                if (!accepted) { sock.close(); return; }
                attachPeer(sock, myGen, false);
            } catch (Exception ex) { if (myGen == generation.get()) error("Could not connect. Confirm both phones share Wi-Fi."); }
        }, "RR-Join").start();
    }
    private void attachPeer(Socket sock, int myGen, boolean host) {
        try {
            synchronized (peerLock) {
                if (myGen != generation.get() || !admission.isActive(sock)) return;
            }
            sock.setTcpNoDelay(true);
            sock.setKeepAlive(true);
            synchronized (peerLock) {
                if (myGen != generation.get() || !admission.isActive(sock)) return;
                synchronized (outputLock) {
                    out = new BufferedWriter(new OutputStreamWriter(sock.getOutputStream(), StandardCharsets.UTF_8));
                }
            }
            signalType("connected");
            BufferedReader reader = new BufferedReader(new InputStreamReader(sock.getInputStream(), StandardCharsets.UTF_8));
            String line;
            while (myGen == generation.get() && (line = BoundedLanReader.readPacket(reader, MAX_PACKET)) != null) {
                try {
                    JSONObject packet = new JSONObject(line);
                    String kind = packet.optString("type", "");
                    if ((host && ("input".equals(kind) || "interact".equals(kind) || "ready".equals(kind) || "join-next".equals(kind))) || (!host && ("state".equals(kind) || "lobby".equals(kind) || "start".equals(kind) || "spectate".equals(kind) || "join-next-status".equals(kind) || "join-next-promote".equals(kind) || "busy".equals(kind)))) signal(packet);
                } catch (Exception ignored) { }
            }
        } catch (IOException ignored) { }
        finally {
            try { sock.close(); } catch (Exception ignored) { }
            synchronized (peerLock) {
                // Never allow a stale reader to clear a newer peer's writer/seat.
                if (myGen == generation.get() && admission.release(sock)) {
                    connection = null;
                    synchronized (outputLock) { out = null; }
                    signalType("disconnected");
                }
            }
        }
    }
    private void send(String packet) {
        if (packet == null || packet.length() > MAX_PACKET) return;
        try {
            JSONObject json = new JSONObject(packet);
            String kind = json.optString("type");
            if (isHosting && !("state".equals(kind) || "lobby".equals(kind) || "start".equals(kind) || "spectate".equals(kind) || "join-next-status".equals(kind) || "join-next-promote".equals(kind))) return;
            if (!isHosting && !("input".equals(kind) || "interact".equals(kind) || "ready".equals(kind) || "join-next".equals(kind))) return;
            synchronized (outputLock) {
                if (out != null) { out.write(json.toString()); out.write('\n'); out.flush(); }
            }
        } catch (Exception ignored) { }
    }
    // Only the game's bundled, explicitly exported offline snapshot may enter
    // Android's share chooser. No automatic network upload or background send.
    private void shareOfflineBackup(String text) {
        if (text == null || text.length() < 20 || text.length() > 60000) {
            Toast.makeText(this, "Generate a valid backup first", Toast.LENGTH_SHORT).show();
            return;
        }
        try {
            JSONObject data = new JSONObject(text);
            if (!"sector-rebound-local-v1".equals(data.optString("format"))
                    || data.optInt("version", -1) != 1
                    || data.optJSONObject("entries") == null
                    || data.getJSONObject("entries").length() < 1
                    || data.getJSONObject("entries").length() > 6) {
                Toast.makeText(this, "Backup format is not supported", Toast.LENGTH_SHORT).show();
                return;
            }
            Intent send = new Intent(Intent.ACTION_SEND);
            send.setType("text/plain");
            send.putExtra(Intent.EXTRA_SUBJECT, "Sector Rebound offline backup");
            send.putExtra(Intent.EXTRA_TEXT, text);
            startActivity(Intent.createChooser(send, "Save or share backup"));
        } catch (ActivityNotFoundException ex) {
            Toast.makeText(this, "No share destination available; use Copy", Toast.LENGTH_LONG).show();
        } catch (Exception ex) {
            Toast.makeText(this, "Could not open backup sharing; use Copy", Toast.LENGTH_LONG).show();
        }
    }
    private final class GameBridge {
        @JavascriptInterface public void shareBackup(String text) {
            runOnUiThread(() -> shareOfflineBackup(text));
        }
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
    @Override protected void onResume() {
        super.onResume();
        enterImmersiveMode();
        if (web != null) web.onResume();
        if (hostEndedInBackground) {
            hostEndedInBackground = false;
            signalType("host-offline");
        }
    }
    @Override protected void onStop() {
        boolean wasHosting = isHosting;
        boolean wasConnected = connection != null;
        hostEndedInBackground = wasHosting;
        closeNetwork();
        // A host cannot claim its server remains discoverable after Android Stop.
        // Defer the honest host-offline message until WebView resumes.
        if (wasConnected && !wasHosting) signalType("disconnected");
        super.onStop();
    }
    @Override protected void onDestroy() { closeNetwork(); if (web != null) { web.removeJavascriptInterface("AndroidBridge"); web.destroy(); web = null; } super.onDestroy(); }
    @Override public void onBackPressed() {
        if (web != null) web.evaluateJavascript("window.RR && window.RR.openMenu && window.RR.openMenu()", null);
        else super.onBackPressed();
    }
}