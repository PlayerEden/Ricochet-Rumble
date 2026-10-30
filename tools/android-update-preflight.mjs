// Sector Rebound: READ-ONLY Android APK upgrade preflight, no dependencies.
// Compares candidate APK against a previous APK or the app installed on a USB device.
// Never installs, uninstalls, clears data, requests private keystores or signs files.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export const PACKAGE_ID = 'com.playereden.ricochetrumble';
export function parseBadging(output) {
  const line = String(output).split(/\r?\n/).find(x => /^package:\s/.test(x));
  const name = line?.match(/\bname='([^']+)'/)?.[1];
  const code = line?.match(/\bversionCode='(\d+)'/)?.[1];
  const versionName = line?.match(/\bversionName='([^']*)'/)?.[1] ?? '';
  if (!name || !code || !Number.isSafeInteger(Number(code)) || Number(code) < 1)
    throw Error('INVALID_APK_PACKAGE_METADATA');
  return { packageId: name, versionCode: Number(code), versionName };
}
export function parseSigner(output) {
  const values = [...String(output).matchAll(/Signer #\d+ certificate SHA-256 digest:\s*([0-9a-fA-F:]+)/g)]
    .map(m => m[1].replace(/:/g, '').toLowerCase());
  if (values.length !== 1 || !/^[a-f0-9]{64}$/.test(values[0]))
    throw Error('SIGNER_CERTIFICATE_UNAVAILABLE_OR_MULTIPLE');
  return values[0];
}
export function parseInstalledPaths(output) {
  if (!String(output).trim()) return [];
  const lines = String(output).trim().split(/\r?\n/).map(x => x.trim());
  if (lines.some(line => !/^package:\/.+\.apk$/.test(line)))
    throw Error('UNRECOGNIZED_ANDROID_PACKAGE_PATH_RESPONSE');
  return lines.map(line => line.slice('package:'.length));
}
export function assessUpdate(candidate, previous, { allowFresh = false } = {}) {
  if (candidate.packageId !== PACKAGE_ID)
    return { ok: false, reason: 'CANDIDATE_PACKAGE_ID_MISMATCH' };
  if (!previous)
    return allowFresh
      ? { ok: true, reason: 'FRESH_INSTALL_ONLY_NO_EXISTING_PACKAGE' }
      : { ok: false, reason: 'NO_PREVIOUS_APK_VERIFIED' };
  if (previous.packageId !== PACKAGE_ID)
    return { ok: false, reason: 'PREVIOUS_PACKAGE_ID_MISMATCH' };
  if (!candidate.signer || !previous.signer)
    return { ok: false, reason: 'SIGNER_CERTIFICATE_UNKNOWN' };
  if (candidate.signer !== previous.signer)
    return { ok: false, reason: 'SIGNING_CERTIFICATE_MISMATCH_DO_NOT_UNINSTALL' };
  if (candidate.versionCode <= previous.versionCode)
    return { ok: false, reason: 'CANDIDATE_VERSION_CODE_NOT_HIGHER' };
  return { ok: true, reason: 'STRICT_CERT_AND_VERSION_MATCH' };
}
export function parseArguments(argv) {
  const options = {};
  for (let i = 0; i < argv.length; i++) {
    const key = argv[i];
    if (key === '--help') return { help: true };
    if (key === '--fresh-install') {
      if (options.freshInstall) throw Error('DUPLICATE_FLAG_' + key);
      options.freshInstall = true;
    } else if (['--candidate', '--previous', '--serial'].includes(key)) {
      if (options[key]) throw Error('DUPLICATE_FLAG_' + key);
      const value = argv[++i];
      if (!value || value.startsWith('--')) throw Error('MISSING_VALUE_' + key);
      options[key] = value;
    } else throw Error('UNKNOWN_FLAG_' + key);
  }
  if (!options['--candidate']) throw Error('REQUIRED_FLAG_--candidate');
  if (options.freshInstall && options['--previous']) throw Error('CONFLICT_FRESH_AND_PREVIOUS');
  if (options['--previous'] && options['--serial']) throw Error('SERIAL_NOT_USED_WITH_PREVIOUS_APK');
  return options;
}
const run = (command, args) => execFileSync(command, args, {
  encoding: 'utf8', timeout: 30000, maxBuffer: 2 * 1024 * 1024, windowsHide: true,
  stdio: ['ignore', 'pipe', 'pipe']
});
function sdkTool(name) {
  const sdk = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT;
  const suffix = process.platform === 'win32' ? '.exe' : '';
  if (sdk) {
    const root = path.join(sdk, 'build-tools');
    if (fs.existsSync(root)) {
      const versions = fs.readdirSync(root).sort((a, b) =>
        b.localeCompare(a, undefined, { numeric: true }));
      for (const version of versions) {
        const executable = path.join(root, version, name + suffix);
        if (fs.existsSync(executable)) return executable;
      }
    }
  }
  return name;
}
function readApk(apkPath) {
  if (!fs.statSync(apkPath).isFile()) throw Error('APK_PATH_NOT_A_FILE');
  const badging = run(sdkTool('aapt'), ['dump', 'badging', apkPath]);
  const signerInfo = run(sdkTool('apksigner'),
    ['verify', '--min-sdk-version', '26', '--print-certs', apkPath]);
  return { ...parseBadging(badging), signer: parseSigner(signerInfo) };
}
function installedApk(serial) {
  const adb = process.env.ADB_PATH || 'adb';
  const prefix = serial ? ['-s', serial] : [];
  const paths = parseInstalledPaths(run(adb, [...prefix, 'shell', 'pm', 'path', PACKAGE_ID]));
  if (!paths.length) return null;
  const base = paths.find(p => /\/base\.apk$/.test(p)) || paths[0];
  const folder = fs.mkdtempSync(path.join(os.tmpdir(), 'sr-preflight-'));
  const destination = path.join(folder, 'installed-base.apk');
  try {
    // adb pull reads the existing APK but never touches the installed package/data.
    run(adb, [...prefix, 'pull', base, destination]);
    return readApk(destination);
  } finally {
    fs.rmSync(folder, { recursive: true, force: true });
  }
}
export function printInstructions() {
  return [
    'Sector Rebound READ-ONLY Android update preflight:',
    ' node tools/android-update-preflight.mjs --candidate /path/to/new.apk',
    ' node tools/android-update-preflight.mjs --candidate new.apk --serial DEVICE_ID',
    ' node tools/android-update-preflight.mjs --candidate new.apk --previous old.apk',
    ' node tools/android-update-preflight.mjs --candidate new.apk --fresh-install',
    'Default: inspect connected device with adb and compare APK certificate and version.',
    'Use --previous for two archived APKs without a phone; --fresh-install only for',
    'a verified device that does NOT have this app installed. This tool never installs.',
    'Passing does not guarantee local saves survive an update; perform a real',
    'on-device backup and upgrade test separately.'
  ].join('\n');
}
export function main(argv) {
  let opts;
  try { opts = parseArguments(argv); }
  catch (e) { console.error('PREFLIGHT_NO_GO ' + e.message); return 2; }
  if (opts.help) { console.log(printInstructions()); return 0; }
  try {
    const candidate = readApk(path.resolve(opts['--candidate']));
    const previous = opts['--previous']
      ? readApk(path.resolve(opts['--previous']))
      : installedApk(opts['--serial']);
    const verdict = assessUpdate(candidate, previous, { allowFresh: opts.freshInstall });
    console.log(JSON.stringify({
      status: verdict.ok ? 'PREFLIGHT_PASS' : 'PREFLIGHT_NO_GO',
      reason: verdict.reason, candidate: {
        packageId: candidate.packageId, versionCode: candidate.versionCode,
        versionName: candidate.versionName, publicCertificateSha256: candidate.signer
      },
      previous: previous ? {
        packageId: previous.packageId, versionCode: previous.versionCode,
        versionName: previous.versionName, publicCertificateSha256: previous.signer
      } : null,
      readOnly: true, installedDataPreservationVerified: false
    }, null, 2));
    return verdict.ok ? 0 : 2;
  } catch (e) {
    // Unavailable tools/device, failed APK signature verification, and inaccessible
    // device APKs are always a NO-GO, never permission to force reinstall.
    console.error('PREFLIGHT_NO_GO: could not prove APK compatibility; no installation performed.');
    console.error(String(e.message || e).slice(0, 400));
    return 2;
  }
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url))
  process.exitCode = main(process.argv.slice(2));
