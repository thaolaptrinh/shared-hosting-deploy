# Shared Hosting Deploy

Git-based CD deployment action for shared hosting environments.

## ⚠️ Important

- **Shared hosting ONLY** (cPanel, Plesk, Namecheap, GoDaddy, etc.)
- **NOT for VPS, Docker, or Kubernetes**
- **CD-only** - no builds, no tests, no CI
- Repository must already be cloned on the server

## What This Action Does

1. SSH into your shared hosting server
2. Navigate to existing git repository
3. Run `git fetch --all --prune`
4. Run `git reset --hard origin/<branch>`

Does NOT: upload files, run builds, auto-detect runtime, auto-restart apps

---

## Usage

### Basic (all stacks)

```yaml
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: your-username/shared-hosting-deploy@v1
        with:
          host: ${{ secrets.SSH_HOST }}
          user: ${{ secrets.SSH_USER }}
          ssh_key: ${{ secrets.SSH_KEY }}
          repo_path: /home/username/public_html
          branch: main
```

---

### Static Frontend (HTML, CSS, JS)

```yaml
- uses: your-username/shared-hosting-deploy@v1
  with:
    host: ${{ secrets.SSH_HOST }}
    user: ${{ secrets.SSH_USER }}
    ssh_key: ${{ secrets.SSH_KEY }}
    repo_path: /home/username/public_html
    branch: main
```

No post_deploy needed - static files are served immediately.

---

### PHP / Laravel / PHP Frameworks

```yaml
- uses: your-username/shared-hosting-deploy@v1
  with:
    host: ${{ secrets.SSH_HOST }}
    user: ${{ secrets.SSH_USER }}
    ssh_key: ${{ secrets.SSH_KEY }}
    repo_path: /home/username/public_html
    branch: main
    post_deploy: |
      php artisan cache:clear
      php artisan config:clear
      php artisan route:clear
      php artisan view:clear
```

**Other PHP frameworks:**

```yaml
# Symfony
post_deploy: |
  php bin/console cache:clear
  php bin/console cache:warmup

# CodeIgniter
post_deploy: |
  php artisan clear:all  # if using spark CLI

# Plain PHP - clear opcache (provider-specific)
post_deploy: |
  # Contact your host for opcache clearing command
```

---

### Node.js on Shared Hosting

```yaml
- uses: your-username/shared-hosting-deploy@v1
  with:
    host: ${{ secrets.SSH_HOST }}
    user: ${{ secrets.SSH_USER }}
    ssh_key: ${{ secrets.SSH_KEY }}
    repo_path: /home/username/nodeapp
    branch: main
    post_deploy: |
      # Restart command depends on your hosting provider
      # Contact your provider for the correct command
```

**Common provider restart commands (check with your host):**

| Provider | Example Command |
|----------|-----------------|
| A2 Hosting | `~/bin/restart_app` |
| SiteGround | `supervisorctl restart node` |
| InMotion | Contact support |
| Hostinger | Contact support |

---

## Inputs

| Input | Required | Default | Description |
|-------|----------|---------|-------------|
| `host` | Yes | - | SSH host |
| `user` | Yes | - | SSH user |
| `ssh_key` | Yes | - | Private SSH key |
| `repo_path` | Yes | - | Absolute path to git repo on server |
| `branch` | No | `main` | Git branch to deploy |
| `post_deploy` | No | - | Shell commands after deployment |

---

## ⚠️ Warning: Git Reset Behavior

This action uses `git reset --hard`, which **will overwrite ALL changes** made directly on the server.

- Manual edits on server → **LOST**
- Uploaded files not in Git → **LOST**
- Database changes → **NOT affected** (database is separate)

Only deploy code that is committed to Git.

---

## Security

- SSH key stored with 600 permissions
- Secrets masked in logs
- Private key never printed

---

## License

MIT - see [LICENSE](LICENSE)
