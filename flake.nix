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
      url = "github:hakula139/kiln/v0.5.0-alpha.4";
      inputs = {
        flake-utils.follows = "flake-utils";
        git-hooks-nix.follows = "git-hooks-nix";
        kiln-tailwindcss.inputs.git-hooks-nix.follows = "git-hooks-nix";
      };
    };

    git-hooks-nix = {
      url = "github:cachix/git-hooks.nix";
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
      git-hooks-nix,
      ...
    }:
    flake-utils.lib.eachSystem [ "aarch64-darwin" "x86_64-linux" ] (
      system:
      let
        pkgs = nixpkgs.legacyPackages.${system};

        # ------------------------------------------------------------------------------------------
        # Pre-commit Hooks
        # ------------------------------------------------------------------------------------------
        hooks = {
          check-added-large-files.enable = true;
          check-yaml.enable = true;
          end-of-file-fixer.enable = true;
          # Preserve Markdown's two-trailing-space hard-break syntax.
          trim-trailing-whitespace = {
            enable = true;
            args = [ "--markdown-linebreak-ext=md" ];
          };

          nixfmt.enable = true;
          statix.enable = true;
          deadnix.enable = true;
        };

        # These hooks run the tools pinned in node_modules, which the Nix sandbox lacks. The flake
        # check leaves them to CI's pnpm checks.
        nodeHook =
          name: cmd:
          pkgs.lib.getExe (
            pkgs.writeShellApplication {
              inherit name;
              runtimeInputs = with pkgs; [
                nodejs_24
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
          dprint-write = {
            enable = true;
            name = "dprint";
            entry = nodeHook "dprint-write" "dprint fmt";
            files = "\\.md$";
          };
          prettier-write = {
            enable = true;
            name = "prettier";
            entry = nodeHook "prettier-write" "prettier --write --ignore-unknown";
            files = "\\.(css|js|json|jsonc|mjs|ya?ml)$";
          };
          taplo-write = {
            enable = true;
            name = "taplo";
            entry = nodeHook "taplo-write" "taplo format";
            files = "\\.toml$";
          };

          cspell = {
            enable = true;
            entry = nodeHook "cspell" "cspell --no-must-find-files --no-progress";
            types = [ "text" ];
          };
          eslint = {
            enable = true;
            entry = nodeHook "eslint" "eslint --fix";
            files = "\\.(js|mjs)$";
          };
          markdownlint = {
            enable = true;
            name = "markdownlint-cli2";
            entry = nodeHook "markdownlint" "markdownlint-cli2 --fix";
            files = "\\.md$";
          };
        };

        preCommit = git-hooks-nix.lib.${system}.run {
          src = ./.;
          hooks = hooks // nodeHooks;
        };

        preCommitCheck = git-hooks-nix.lib.${system}.run {
          inherit hooks;
          src = ./.;
        };

        git = pkgs.lib.getExe pkgs.git;
      in
      {
        # ------------------------------------------------------------------------------------------
        # Dev Shell
        # ------------------------------------------------------------------------------------------
        devShells.default = pkgs.mkShell {
          name = "ignit-dev";

          packages =
            preCommit.enabledPackages
            ++ [ kiln.packages.${system}.kiln ]
            ++ (with pkgs; [
              nodejs_24
              pnpm
            ]);

          # git-hooks.nix stores a hooks path relative to the main checkout, which linked worktrees
          # can't resolve (cachix/git-hooks.nix#688), so commits there would skip the hooks.
          shellHook = ''
            ${preCommit.shellHook}
            if common=$(${git} rev-parse --path-format=absolute --git-common-dir 2>/dev/null); then
              ${git} config --local core.hooksPath "$common/hooks"
            fi
          '';
        };

        # ------------------------------------------------------------------------------------------
        # Checks
        # ------------------------------------------------------------------------------------------
        checks.pre-commit = preCommitCheck;

        # ------------------------------------------------------------------------------------------
        # Formatter
        # ------------------------------------------------------------------------------------------
        formatter = pkgs.nixfmt-tree;
      }
    );
}
