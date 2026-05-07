# Deployment

Live URL: https://baditaflorin.github.io/ethnomusicology-workbench/

Repository: https://github.com/baditaflorin/ethnomusicology-workbench

## Mode

Mode A: Pure GitHub Pages.

Pages source is `main` branch, `/docs` directory.

## Publish

```bash
make build
git add docs
git commit -m "chore: publish pages build"
git push
```

GitHub Pages republishes automatically after the push.

## Preview

```bash
make pages-preview
```

## Rollback

Revert the publishing commit and push:

```bash
git revert <commit>
git push
```

## Custom Domain

No custom domain is configured. If one is added later, create `docs/CNAME`, configure DNS with the provider, and verify HTTPS in the GitHub Pages settings.

GitHub Pages docs: https://docs.github.com/en/pages
