# ==============================================================================
# IgnIt Theme Development Flake
# ==============================================================================
#
# Provides Tailwind toolchain and pre-commit hooks for theme work. The theme is
# typically consumed as a git submodule of a kiln site, but ships its own dev
# shell so contributors can iterate on templates and CSS in isolation.
#
#   nix develop        # interactive shell (auto-installs hooks)
#   nix flake check    # Nix-side hooks (Node-side run in CI)

{
  description = "IgnIt — kiln theme (dev environment)";

  # ----------------------------------------------------------------------------
  # Inputs
  # ----------------------------------------------------------------------------
  inputs = {
    # Nixpkgs - NixOS 25.11 stable release
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-25.11";

    # Per-system flake outputs
    flake-utils.url = "github:numtide/flake-utils";

    # Pre-commit hooks
    git-hooks-nix.url = "github:cachix/git-hooks.nix";
  };

  # ----------------------------------------------------------------------------
  # Outputs
  # ----------------------------------------------------------------------------
  outputs =
    {
      nixpkgs,
      flake-utils,
      git-hooks-nix,
      ...
    }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = import nixpkgs { inherit system; };

        # ----------------------------------------------------------------------
        # Node Hook Wrapper
        # ----------------------------------------------------------------------
        # `pnpm exec` needs node + pnpm on PATH and the project's
        # `node_modules` materialised. The Nix sandbox lacks the latter, so
        # `nix flake check` skips these hooks; the equivalent checks run in
        # CI via direct `pnpm` scripts.
        nodeHook =
          name: cmd:
          let
            wrapper = pkgs.writeShellApplication {
              inherit name;
              runtimeInputs = [
                pkgs.nodejs_24
                pkgs.pnpm
              ];
              text = ''
                if [ ! -d node_modules ]; then
                  exit 0
                fi
                pnpm exec ${cmd} "$@"
              '';
            };
          in
          "${wrapper}/bin/${name}";

        # ----------------------------------------------------------------------
        # Pre-commit Hooks
        # ----------------------------------------------------------------------
        # Single source of truth for commit-time checks. Node-side tools run
        # via `pnpm exec` so prettier picks up `prettier-plugin-tailwindcss`
        # and cspell finds the project's `node_modules/@cspell/dict-*`.
        preCommitCheck = git-hooks-nix.lib.${system}.run {
          src = ./.;
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

            prettier-write = {
              enable = true;
              name = "prettier";
              entry = nodeHook "prettier-write" "prettier --write --ignore-unknown";
              files = "\\.(css|js|json)$";
              pass_filenames = true;
            };

            markdownlint = {
              enable = true;
              name = "markdownlint-cli2";
              entry = nodeHook "markdownlint" "markdownlint-cli2";
              files = "\\.md$";
              pass_filenames = true;
            };

            cspell = {
              enable = true;
              entry = nodeHook "cspell" "cspell --no-must-find-files --no-progress";
              types = [ "text" ];
              pass_filenames = true;
            };
          };
        };
      in
      {
        # ----------------------------------------------------------------------
        # Dev Shell
        # ----------------------------------------------------------------------
        devShells.default = pkgs.mkShell {
          name = "ignit-dev";

          packages =
            preCommitCheck.enabledPackages
            ++ (with pkgs; [
              nodejs_24
              pnpm
            ]);

          # `pre-commit install` writes `.git/hooks/pre-commit` so direnv
          # users get the hook automatically.
          inherit (preCommitCheck) shellHook;
        };

        # ----------------------------------------------------------------------
        # Checks (`nix flake check`)
        # ----------------------------------------------------------------------
        checks = {
          pre-commit = preCommitCheck;
        };

        # ----------------------------------------------------------------------
        # Formatter (`nix fmt`)
        # ----------------------------------------------------------------------
        formatter = pkgs.nixfmt;
      }
    );
}
