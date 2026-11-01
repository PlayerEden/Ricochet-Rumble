package com.playereden.ricochetrumble;

import java.io.BufferedReader;
import java.io.IOException;

/** Strict newline-delimited peer packet framing, with a cap DURING reading.
 * BufferedReader.readLine() first allocates the entire untrusted line,
 * making a subsequent length check ineffective against peer memory exhaustion.
 * This reader accepts the same regular LF/CRLF packet format and EOF behavior.
 */
final class BoundedLanReader {
    private BoundedLanReader() { }
    static String readPacket(BufferedReader reader, int maxChars) throws IOException {
        if (reader == null || maxChars < 1) throw new IllegalArgumentException("Invalid packet reader bounds");
        StringBuilder line = new StringBuilder(Math.min(maxChars, 512));
        int value;
        while ((value = reader.read()) != -1) {
            if (value == '\n') return line.toString();
            if (value == '\r') continue; // Android sender writes LF, permit CRLF peers.
            if (line.length() >= maxChars) throw new IOException("LAN packet exceeds maximum length");
            line.append((char) value);
        }
        return line.length() == 0 ? null : line.toString();
    }
}
