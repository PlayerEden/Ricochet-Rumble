package com.playereden.ricochetrumble;

import java.io.BufferedReader;
import java.io.StringReader;
import java.io.IOException;

/** JDK-only framing regression; runs on Ubuntu CI without an emulator. */
public final class BoundedLanReaderTest {
    private static void check(boolean v, String message) { if (!v) throw new AssertionError(message); }
    private static BufferedReader reader(String s) { return new BufferedReader(new StringReader(s)); }
    public static void main(String[] args) throws Exception {
        BufferedReader multi = reader("{\"type\":\"ready\"}\n{\"type\":\"input\"}\r\n");
        check("{\"type\":\"ready\"}".equals(BoundedLanReader.readPacket(multi, 32768)), "first message");
        check("{\"type\":\"input\"}".equals(BoundedLanReader.readPacket(multi, 32768)), "second CRLF message");
        check(BoundedLanReader.readPacket(multi, 32768) == null, "EOF clean");
        check("half".equals(BoundedLanReader.readPacket(reader("half"), 32768)), "partial EOF same as readLine");
        check(BoundedLanReader.readPacket(reader(""), 32768) == null, "empty EOF");
        check("A".repeat(32768).equals(BoundedLanReader.readPacket(reader("A".repeat(32768)+"\n"),32768)), "exact limit accepted");
        for (String oversized : new String[]{"A".repeat(32769)+"\n", "B".repeat(150000), "\\r".repeat(150000)}) {
            boolean rejected = false;
            try { BoundedLanReader.readPacket(reader(oversized),32768); }
            catch(IOException expected) { rejected = true; }
            check(rejected, "oversized peer frame rejected before full-line allocation");
        }
        check("".equals(BoundedLanReader.readPacket(reader("\n"),32768)), "blank line safe to ignore");
        System.out.println("BOUNDED_LAN_PACKET_READER_PASS: 32768 char cap, CRLF/LF, EOF, oversize rejection");
    }
}
