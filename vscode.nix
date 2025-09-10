{
  lib,
  stdenv,
  runCommand,
  buildEnv,
  vscode,
  vscode-utils,
  makeWrapper,
  writeTextFile,
  vscodeExtensions ? [ ],
  extensionsPath,
}:

let
  inherit (vscode) executableName longName;
  wrappedPkgVersion = lib.getVersion vscode;
  wrappedPkgName = lib.removeSuffix "-${wrappedPkgVersion}" vscode.name;

  extensionJsonFile = writeTextFile {
    name = "vscode-extensions-json";
    destination = "/share/vscode/extensions/extensions.json";
    text = vscode-utils.toExtensionJson vscodeExtensions;
  };

  combinedExtensionsDrv = buildEnv {
    name = "vscode-extensions";
    paths = vscodeExtensions ++ [ extensionJsonFile ];
  };

  extensionsFlag = ''
    --add-flags "--extensions-dir ${extensionsPath}"
  '';
in

runCommand "${wrappedPkgName}-with-extensions-${wrappedPkgVersion}"
  {
    nativeBuildInputs = [ makeWrapper ];
    buildInputs = [ vscode ];
    dontPatchELF = true;
    dontStrip = true;
    meta = vscode.meta;
    extensionsOutDir = "${combinedExtensionsDrv}/share/vscode/extensions";
  }
  (
    if stdenv.hostPlatform.isDarwin then
      ''
	      mkdir -p $out/bin/
        mkdir -p "$out/Applications/${longName}.app/Contents/MacOS"

        for path in PkgInfo Frameworks Resources _CodeSignature Info.plist; do
          ln -s "${vscode}/Applications/${longName}.app/Contents/$path" "$out/Applications/${longName}.app/Contents/"
        done

        makeWrapper "${vscode}/bin/${executableName}" "$out/bin/${executableName}" ${extensionsFlag}
        makeWrapper "${vscode}/Applications/${longName}.app/Contents/MacOS/Electron" "$out/Applications/${longName}.app/Contents/MacOS/Electron" ${extensionsFlag}
      ''
    else
      ''
        mkdir -p "$out/bin"
        mkdir -p "$out/share/applications"
        mkdir -p "$out/share/pixmaps"

        ln -sT "${vscode}/share/pixmaps/vs${executableName}.png" "$out/share/pixmaps/vs${executableName}.png"
        ln -sT "${vscode}/share/applications/${executableName}.desktop" "$out/share/applications/${executableName}.desktop"
        ln -sT "${vscode}/share/applications/${executableName}-url-handler.desktop" "$out/share/applications/${executableName}-url-handler.desktop"
        makeWrapper "${vscode}/bin/${executableName}" "$out/bin/${executableName}" ${extensionsFlag}
      ''
  )