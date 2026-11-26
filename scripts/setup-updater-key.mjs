import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const keyDir = path.resolve('.tauri-keys');
const keyPath = path.join(keyDir, 'myapp.key');
const pubKeyPath = `${keyPath}.pub`;
const tauriConfPath = path.resolve('backend/src-tauri/tauri.conf.json');

// 1. Buat folder sementara & generate key tanpa password (-p "")
fs.mkdirSync(keyDir, { recursive: true });
console.log('Generating Tauri signing keys...');
execSync(`cargo tauri signer generate -w "${keyPath}" -p ""`, {
  stdio: 'inherit',
});

// 2. Baca hasil private & public key
const privateKey = fs.readFileSync(keyPath, 'utf-8').trim();
const publicKey = fs.readFileSync(pubKeyPath, 'utf-8').trim();

// 3. Parse & suntikkan public key ke tauri.conf.json
const tauriConf = JSON.parse(fs.readFileSync(tauriConfPath, 'utf-8'));

tauriConf.plugins = tauriConf.plugins || {};
tauriConf.plugins.updater = tauriConf.plugins.updater || {};
tauriConf.plugins.updater.pubkey = publicKey;

fs.writeFileSync(tauriConfPath, JSON.stringify(tauriConf, null, 2) + '\n');
console.log(`Updated pubkey in ${tauriConfPath}`);

// 4. Print Private Key ke log (hapus folder key biar nggak ikut ke-commit)
console.log('\n================ COPY PRIVATE KEY DI BAWAH INI ================');
console.log(privateKey);
console.log('=================================================================\n');

fs.rmSync(keyDir, { recursive: true, force: true });
