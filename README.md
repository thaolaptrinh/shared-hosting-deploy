# Shared Hosting Deploy

[![GitHub release](https://img.shields.io/github/v/release/thaolaptrinh/shared-hosting-deploy)](https://github.com/thaolaptrinh/shared-hosting-deploy/releases)
[![License](https://img.shields.io/github/license/thaolaptrinh/shared-hosting-deploy)](LICENSE)

Git-based CD deployment for shared hosting (cPanel, Plesk, etc.)

---

## ⚠️ Not for VPS, Docker, or Kubernetes. CD-only - no builds.

---

## Usage

```yaml
- uses: thaolaptrinh/shared-hosting-deploy@v1
  with:
    host: ${{ secrets.SSH_HOST }}
    user: ${{ secrets.SSH_USER }}
    ssh_key: ${{ secrets.SSH_KEY }}
    repo_path: /home/username/public_html
    branch: main
```

## With Post-Deploy

```yaml
- uses: thaolaptrinh/shared-hosting-deploy@v1
  with:
    host: ${{ secrets.SSH_HOST }}
    user: ${{ secrets.SSH_USER }}
    ssh_key: ${{ secrets.SSH_KEY }}
    repo_path: /home/username/public_html
    post_deploy: |
      php artisan cache:clear
```

---

## Inputs

| Input | Required | Default | Description |
|-------|----------|---------|-------------|
| `host` | ✅ | - | SSH host |
| `user` | ✅ | - | SSH user |
| `ssh_key` | ✅ | - | Private SSH key |
| `repo_path` | ✅ | - | Absolute path to git repo |
| `branch` | ❌ | `main` | Branch to deploy |
| `post_deploy` | ❌ | - | Commands after deploy |

---

## ⚠️ Warning

`git reset --hard` will **overwrite all server changes**. Only deploy committed code.

---

## License

MIT - see [LICENSE](LICENSE)
