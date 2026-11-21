# Symen updater releases

Symen checks the static Tauri updater manifest at:

`https://pub-2d96730c227e4b95b37c19eac13b91e0.r2.dev/version.json`

Publish the following shape for each release. The signature is the **text
contents** of the generated installer `.sig` file, not a URL to that file.

```json
{
  "version": "2.0.1",
  "notes": "Release highlights, one item per line.",
  "pub_date": "2026-11-21T12:00:00Z",
  "platforms": {
    "windows-x86_64": {
      "signature": "<contents of symen_2.0.1_x64-setup.exe.sig>",
      "url": "https://pub-2d96730c227e4b95b37c19eac13b91e0.r2.dev/symen_2.0.1_x64-setup.exe"
    }
  }
}
```

For the NSIS target, Tauri v2 produces the `*-setup.exe` and its `*.sig` file.
If publishing an updater archive instead, set `url` to the exact `.nsis.zip`
artifact and set `signature` to the contents of that archive's matching `.sig`.
Never sign one file and point the manifest at another.

The `pubkey` in `tauri.conf.json` must be the public key matching the private
signing key. Generate a keypair once and keep the private key secure:

```powershell
cargo tauri signer generate -w "$env:USERPROFILE\.tauri\symen.key"
```

Paste the generated **public** key into `plugins.updater.pubkey`. Do not commit
the private key. Set the private key only in the build shell; do not put it in
an `.env` file:

```powershell
$env:TAURI_SIGNING_PRIVATE_KEY = "$env:USERPROFILE\.tauri\symen.key"
$env:TAURI_SIGNING_PRIVATE_KEY_PASSWORD = ""
```

## Release checklist

1. Bump `version` in `tauri.conf.json` to a new SemVer version.
2. Set the signing environment variables above in the build shell.
3. From `backend/src-tauri`, run `cargo tauri build --bundles nsis`.
4. Upload the generated NSIS setup executable and its `.sig` file to the
   Cloudflare R2 public bucket.
5. Publish `version.json` with the new version, RFC 3339 publication date,
   release notes, executable URL, and the exact `.sig` contents.
6. Confirm the manifest and installer URLs are publicly reachable over HTTPS,
   then test the update from an older installed build.
