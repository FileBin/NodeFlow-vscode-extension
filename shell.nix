with (import <nixpkgs> {  });
mkShell {
    packages = [
        nodejs_24
        bun
        nodemon
        # vscode-fhs
        # (vscode-with-extensions.override {
        #     vscodeExtensions = with vscode-extensions; [
        #         tal7aouy.icons
        #         jnoortheen.nix-ide
        #         wmaurer.change-case
        #         dbaeumer.vscode-eslint
        #         vue.volar
        #         esbenp.prettier-vscode
        #         editorconfig.editorconfig
        #     ] ++ vscode-utils.extensionsFromVscodeMarketplace [
        #         {
        #             name = "tcv-typescript-constructor-generator";
        #             publisher = "toanchivu";
        #             version = "1.0.0";
        #             hash = "sha256-dT/vi4b8r13iNtCwkLTfwB7Xeof7kDz8kie5pzpaJPI=";
        #         }
        #     ];
        # })
    ];
    shellHook = ''
    projname=`basename ${toString ./.}`
    TMPDIR="/tmp/$projname"
    mkdir -p "$TMPDIR"
    mkdir -p "$TMPDIR/ext-test-workspace"
    [[ -d $TMPDIR/ext-test-workspace/example ]] || ln -s "${toString ./exampleFiles}" "$TMPDIR/ext-test-workspace/example"
    '';
}
