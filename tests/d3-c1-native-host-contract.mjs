import assert from 'node:assert/strict';
import fs from 'node:fs';

const java=fs.readFileSync('android/app/src/main/java/com/playereden/ricochetrumble/MainActivity.java','utf8');
const web=fs.readFileSync('web/game.js','utf8');
const android=fs.readFileSync('android/app/src/main/assets/game.js','utf8');
assert.equal(web,android,'WebView must mirror web game exactly');
assert.ok(java.includes('while (myGen == generation.get() && !stopped)'),'host must loop while current generation active');
assert.ok(java.includes('ss.accept()'),'native host still accepts TCP sockets');
assert.ok(java.includes('new Thread(() -> attachPeer(peer, myGen, true)'),'peer reader must not block listener');
assert.ok(java.includes('admission.claim(peer)')&&java.includes('admission.release(sock)'),'single peer identity gate required');
assert.ok(java.includes('rejectBusy(peer)')&&java.includes('busy.put("reason", "room-full")'),'extra peer must receive room-full notice');
assert.ok(java.includes('admission.clear()')&&java.includes('synchronized (peerLock)'),'Stop must invalidate session safely');
assert.ok(java.includes('"busy".equals(kind)'),'guest native packet filter must pass room-full');
assert.ok(java.includes('BoundedLanReader.readPacket(reader, MAX_PACKET)'),'peer input size cap must stay');
assert.ok(web.includes("case 'busy':")&&web.includes('roomWasFull'),'guest gets an honest full-room view');
assert.ok(web.includes("if(mode==='host'&&lanLobby)"),'host retains room after guest exits');
console.log('D3_C1_SOURCE_PASS: listener, busy, identity cleanup, JS and asset parity');
