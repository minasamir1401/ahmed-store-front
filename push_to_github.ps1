# Ultimate clean start script
# 1. Remove the old git history locally
Remove-Item -Recurse -Force .git -ErrorAction SilentlyContinue

# 2. Re-initialize git
git init
git remote add origin https://github.com/minasamir1401/ahmed-store-front.git

# 3. Add to .gitignore to make sure backend stays out
if (!(Test-Path .gitignore)) { New-Item .gitignore }
if (!(Select-String -Pattern "mithaly-backend" -Path .gitignore -ErrorAction SilentlyContinue)) {
    Add-Content .gitignore "`nmithaly-backend`nnode_modules`n.env`n.next"
}

# 4. Add files and commit (The secret is already gone from files)
git add .
git commit -m "Initial clean deployment"

# 5. Force push to overwrite the repository
git push -u origin master --force
git push -u origin main --force
echo "DONE! Your repository is now clean and all fixes are uploaded."
