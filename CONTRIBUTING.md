# 🤝 Contributing Guide — CampusTrack

This guide explains how the team should work with this repository to keep everything organized and avoid conflicts.

---

## 🌿 Branching Strategy

We use a simple branch structure:

```
main          ← stable, reviewed code only
dev           ← active development branch (merge here first)
feature/xxx   ← individual feature branches
docs/xxx      ← documentation updates
fix/xxx       ← bug fixes
```

### Rules:
- **Never push directly to `main`**
- Always create a branch from `dev` for your work
- Open a Pull Request (PR) to merge back into `dev`
- `dev` is merged into `main` only when a phase is complete

---

## 🔀 How to Work on a Feature

```bash
# 1. Make sure you're on dev and it's up to date
git checkout dev
git pull origin dev

# 2. Create your feature branch
git checkout -b feature/your-feature-name

# 3. Work on your changes, then stage and commit
git add .
git commit -m "feat: add lost item report form"

# 4. Push your branch to GitHub
git push origin feature/your-feature-name

# 5. Open a Pull Request on GitHub → base: dev
```

---

## 💬 Commit Message Format

Use clear, consistent commit messages:

```
feat: add user registration page
fix: correct search filter bug
docs: update SRS section 3
style: format CSS for mobile view
test: add unit tests for login API
db: update ER diagram schema
```

---

## 📁 Where to Put Your Work

| What you're working on | Where to put it |
|------------------------|-----------------|
| SRS document | `docs/requirements/` |
| ER diagram / architecture | `docs/diagrams/` |
| UI wireframes | `docs/wireframes/` |
| Meeting notes | `docs/meeting-notes/` |
| Frontend pages | `src/frontend/pages/` |
| CSS styles | `src/frontend/css/` |
| JavaScript | `src/frontend/js/` |
| Backend API routes | `src/backend/api/` |
| Database models | `src/backend/models/` |
| Business logic | `src/backend/controllers/` |
| DB config | `src/backend/config/` |
| SQL scripts / schema | `src/database/` |
| Test cases & reports | `tests/` |

---

## ✅ Pull Request Checklist

Before opening a PR, make sure:
- [ ] Your code/document works as expected
- [ ] Files are in the correct folder
- [ ] Commit messages are clear
- [ ] No sensitive data (.env, passwords) committed
- [ ] PR description explains what you did

---

## 👥 Team Contacts

| Name | Role | Responsibility |
|------|------|---------------|
| Abdusalam Oumer | Project Manager | Repo admin, final approvals |
| Aymen Abdurezak | Backend Lead | Backend & integration PRs |
| Eftiom Aseffa | Database | Database folder |
| Abel Dereje | Frontend | Frontend folder |
| Biruk Semaw | Architect & QA | Architecture docs, tests |
| Dagim Bezabih | Documentation | docs/ folder |
