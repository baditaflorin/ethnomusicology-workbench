# Security Policy

## Supported Versions

The current `main` branch and the latest semver release are supported.

## Reporting a Vulnerability

Please report suspected vulnerabilities by email to baditaflorin@gmail.com.

Do not open a public issue for secrets, data exposure, or exploit details.

## Security Baseline

- No runtime backend in v1.
- No frontend secrets.
- Local recordings stay in browser storage unless the user exports them.
- `.env*`, private keys, and generated secret material are ignored by git.
- Local hooks run `gitleaks` when the command is installed.
