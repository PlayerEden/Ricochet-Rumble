package com.playereden.ricochetrumble;

/** A single LAN guest/spectator reservation with identity-safe release.
 * JVM-testable without Android classes. Native host owns the lifetime.
 */
final class LanPeerAdmission {
    private Object active;

    synchronized boolean claim(Object peer) {
        if (peer == null || active != null) return false;
        active = peer;
        return true;
    }
    synchronized boolean isActive(Object peer) {
        return peer != null && active == peer;
    }
    synchronized boolean release(Object peer) {
        if (!isActive(peer)) return false;
        active = null;
        return true;
    }
    synchronized void clear() { active = null; }
}
