package com.playereden.ricochetrumble;

import java.util.concurrent.CountDownLatch;
import java.util.concurrent.atomic.AtomicInteger;

public final class LanPeerAdmissionTest {
    private static void check(boolean value, String message) {
        if (!value) throw new AssertionError(message);
    }
    public static void main(String[] args) throws InterruptedException {
        LanPeerAdmission gate = new LanPeerAdmission();
        Object first = new Object(), extra = new Object(), later = new Object();
        check(!gate.claim(null), "null cannot reserve a seat");
        check(gate.claim(first) && gate.isActive(first), "first guest admitted");
        check(!gate.claim(first) && !gate.claim(extra), "active room rejects other claims");
        check(!gate.release(extra), "busy guest cannot evict the player");
        check(gate.release(first) && !gate.release(first), "leave is idempotent");
        check(gate.claim(later), "new guest admitted without host restart");
        check(!gate.release(first) && gate.isActive(later), "old reader cannot evict next guest");
        gate.clear();
        check(!gate.isActive(later), "host stop clears reservation");
        for (int i=0; i<1000; i++) {
            Object guest = new Object();
            check(gate.claim(guest) && gate.release(guest), "rejoin cycle "+i);
        }
        for (int i=0; i<100; i++) {
            gate.clear();
            CountDownLatch start = new CountDownLatch(1);
            AtomicInteger admitted = new AtomicInteger();
            Thread a = new Thread(() -> claim(gate,start,admitted));
            Thread b = new Thread(() -> claim(gate,start,admitted));
            a.start(); b.start(); start.countDown(); a.join(); b.join();
            check(admitted.get()==1, "simultaneous visitors reserve only one seat");
        }
        System.out.println("D3_C1_JVM_GATE_PASS: busy, stale readers, 1000 rejoins and 100 races");
    }
    private static void claim(LanPeerAdmission gate, CountDownLatch start, AtomicInteger count) {
        try {
            start.await();
            if (gate.claim(new Object())) count.incrementAndGet();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException(e);
        }
    }
}
