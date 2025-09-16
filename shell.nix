with (import <nixpkgs> {  });
let 
    projname = baseNameOf (toString ./.);
    tmpdir = "/tmp/${projname}";
    extensionsPath = "${tmpdir}/share/vscode/extensions";

    vscodeMutable = (pkgs.callPackage ./vscode.nix {
            extensionsPath = extensionsPath;
            vscodeExtensions = with vscode-extensions; [
                continue.continue
                tal7aouy.icons
                jnoortheen.nix-ide
                wmaurer.change-case
                dbaeumer.vscode-eslint
                vue.volar
                esbenp.prettier-vscode
                editorconfig.editorconfig
                gruntfuggly.todo-tree
            ] ++ vscode-utils.extensionsFromVscodeMarketplace [
                {
                    name = "tcv-typescript-constructor-generator";
                    publisher = "toanchivu";
                    version = "1.0.0";
                    hash = "sha256-dT/vi4b8r13iNtCwkLTfwB7Xeof7kDz8kie5pzpaJPI=";
                }
            ];
        });
in
mkShell {
    packages = [
        nodejs_24
        bun
        nodemon
        vscodeMutable
    ];
    shellHook = ''
    TMPDIR="${tmpdir}"

    sudo rm -rf "${extensionsPath}"
    mkdir -p "${extensionsPath}"
    for item in "${vscodeMutable.extensionsOutDir}"/*; do
        if [ -d "$item" ]; then
            sudo cp -r "$item/." "${extensionsPath}/$(basename $item)"
        else
            sudo cp "$item" "${extensionsPath}/"
        fi
    done

    sudo chown -R $USER "${extensionsPath}"
    sudo chmod 777 -R "${extensionsPath}"

    mkdir -p "$TMPDIR/ext-test-workspace"
    [[ -d $TMPDIR/ext-test-workspace/example ]] || ln -s "${toString ./exampleFiles}" "$TMPDIR/ext-test-workspace/example"
    '';
}
