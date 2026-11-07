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

    flake-utils.url = "github:numtide/flake-utils";

    kiln = {
      url = "github:hakula139/kiln/v0.5.2";
      inputs = {
        flake-utils.follows = "flake-utils";
        git-hooks-nix.follows = "devkit/git-hooks-nix";
        kiln-tailwindcss.inputs.git-hooks-nix.follows = "devkit/git-hooks-nix";
      };
    };

    devkit = {
      url = "github:hakula139/devkit/v1.0.0-rc.3";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  # ------------------------------------------------------------------------------------------------
  # Outputs
  # ------------------------------------------------------------------------------------------------
  outputs =
    {
      nixpkgs,
      flake-utils,
      kiln,
      devkit,
      ...
    }:
    flake-utils.lib.eachSystem [ "aarch64-darwin" "x86_64-linux" ] (
      system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
        dk = devkit.lib.mkLib pkgs;

        # ------------------------------------------------------------------------------------------
        # Pre-commit Hooks
        # ------------------------------------------------------------------------------------------
        # These hooks run the tools pinned in node_modules, which the Nix sandbox lacks. The flake
        # check leaves them to CI's pnpm checks.
        nodeHook =
          name: cmd:
          pkgs.lib.getExe (
            pkgs.writeShellApplication {
              inherit name;
              runtimeInputs = with pkgs; [
                nodejs_26
                pnpm
              ];
              text = ''
                if [ ! -d node_modules ]; then
                  echo "node_modules is missing. Run pnpm install, then commit again." >&2
                  exit 1
                fi
                pnpm exec ${cmd} "$@"
              '';
            }
          );

        nodeHooks = {
          prettier = {
            enable = true;
            package = null;
            entry = nodeHook "prettier" "prettier --write --ignore-unknown";
            files = "\\.(css|js|mjs|json|jsonc|ya?ml)$";
            types = [ "text" ];
          };
          eslint = {
            enable = true;
            package = null;
            entry = nodeHook "eslint" "eslint --fix";
            files = "\\.(js|mjs)$";
          };
        };

        preCommit = dk.preCommit {
          src = ./.;
          devHooks = nodeHooks;
        };

      in
      {
        # ------------------------------------------------------------------------------------------
        # Dev Shell
        # ------------------------------------------------------------------------------------------
        devShells.default = pkgs.mkShell {
          name = "ignit-dev";

          inputsFrom = [ preCommit.shell ];

          packages = [
            kiln.packages.${system}.kiln
          ]
          ++ (with pkgs; [
            nodejs_26
            pnpm
          ]);
        };

        # ------------------------------------------------------------------------------------------
        # Checks
        # ------------------------------------------------------------------------------------------
        checks.pre-commit = preCommit.check;

        # ------------------------------------------------------------------------------------------
        # Formatter
        # ------------------------------------------------------------------------------------------
        formatter = pkgs.nixfmt-tree;
      }
    );
}
