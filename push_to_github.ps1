# Surgery script to remove backend from GitHub permanently
# 1. Kill the git index again
Remove-Item -Recurse -Force .git -ErrorAction SilentlyContinue

# 2. Re-create .gitignore with strict rules
$gitignoreContent = @"
mithaly-backend/
_ahmed-store-back/
node_modules/
.next/
.env
*.log
"@
Set-Content -Path .gitignore -Value $gitignoreContent

# 3. Start fresh
git init
git remote add origin https://github.com/minasamir1401/ahmed-store-front.git

# 4. Add files EXCEPT the backend (Git will respect .gitignore now)
git add .
git commit -m "Final clean push: Removed backend from repository"

# 5. Push to both branches just in case
git branch -M main
git push -u origin main --force
echo "DONE! Check GitHub now, the folder 'mithaly-backend' should be gone."
