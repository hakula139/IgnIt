# ==================================================================================================
# IgnIt Theme Development Flake
# ==================================================================================================

{
  description = "IgnIt theme development environment";

  # ------------------------------------------------------------------------------------------------
  # Inputs
  # ------------------------------------------------------------------------------------------------
  inputs = {
    # Following kiln's nixpkgs keeps the kiln package identical to its Cachix build.
    nixpkgs.follows = "kiln/nixpkgs";

    kiln = {
      url = "github:hakula139/kiln/v0.5.2";
      inputs = {
        git-hooks-nix.follows = "devkit/git-hooks-nix";
        kiln-tailwindcss.inputs.git-hooks-nix.follows = "devkit/git-hooks-nix";
      };
    };

    devkit = {
      url = "github:hakula139/devkit/v3";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  # ------------------------------------------------------------------------------------------------
  # Outputs
  # ------------------------------------------------------------------------------------------------
  outputs =
    {
      nixpkgs,
      kiln,
      devkit,
      ...
    }:
    devkit.lib.eachSystem (builtins.attrNames kiln.packages) (
      system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
        dk = devkit.lib.mkLib pkgs;

        # ------------------------------------------------------------------------------------------
        # Pre-commit Hooks
        # ------------------------------------------------------------------------------------------
        preCommit = dk.preCommit {
          src = ./.;
          hooks = {
            actionlint.enable = true;
            check-yaml.enable = true;
            cspell.enable = true;
            deadnix.enable = true;
            dprint.enable = true;
            eslint.enable = true;
            markdownlint-cli2.enable = true;
            nixfmt.enable = true;
            prettier = {
              enable = true;
              package = dk.nodeTool "prettier";
              files = "\\.(css|js|mjs|json|jsonc|ya?ml)$";
            };
            shellcheck.enable = true;
            shfmt.enable = true;
            sort-file-contents.enable = true;
            statix.enable = true;
            taplo.enable = true;
          };
        };
      in
      {
        # ------------------------------------------------------------------------------------------
        # Dev Shell
        # ------------------------------------------------------------------------------------------
        devShells.default = pkgs.mkShell {
          name = "ignit-dev";

          inputsFrom = [ preCommit ];

          packages = [
            kiln.packages.${system}.kiln
          ]
          ++ builtins.attrValues dk.nodeToolchain;
        };

        # ------------------------------------------------------------------------------------------
        # Formatter
        # ------------------------------------------------------------------------------------------
        formatter = pkgs.nixfmt-tree;
      }
    );
}
