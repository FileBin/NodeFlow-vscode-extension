#!/usr/bin/env bash
export NIXPKGS_ALLOW_UNFREE=1
nix-shell --run 'code .'
