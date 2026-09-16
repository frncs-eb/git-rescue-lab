# WORKFLOW.md

## 1. Bisect finding (Task 1)

`git bisect` identified commit `c99fb42` (message "asdf", later reworded to
`0c8926a` "Fix bulk discount threshold check") as the first bad commit. It
changed the BULK20 discount condition from `items.length > 5` to a broken
state, causing orders of exactly 5 items to be denied the 20% discount when
they should have qualified (the off-by-one meant only 6+ items triggered it).

## 2. Branching strategy for a team of 4

I'd recommend **GitHub Flow**. Trunk-based development with very short-lived
branches works best for larger teams with strong CI/CD and feature-flag
discipline, which a 4-person team may not have fully set up yet. Git Flow's
separate develop/release/hotfix branches add process overhead that isn't
justified at this scale. GitHub Flow strikes the right balance: a single
long-lived `main` branch, short feature branches (like `feature/holiday-sale`
here), pull requests for review, and merge-to-main-and-deploy — simple enough
for a small team to follow consistently, while still enforcing review before
code reaches production.

## 3. Fully removing the secret

`git rm --cached` and `.gitignore` only stop the file from being tracked
*going forward* — the old commit that added `.env` (and the blob containing
the fake API key and DB password) still exists in the repository's history
and reflogs. Anyone with clone access can run `git log --all --full-history --
.env` or check out that old commit directly and see the plaintext secret.

To fully remove it, I'd need to rewrite history to strip the file from every
commit that ever contained it, using either `git filter-repo` (the modern,
recommended tool) or the older `git filter-branch` / BFG Repo-Cleaner, then
force-push the rewritten history to all remotes and have every collaborator
re-clone (since their local histories would now diverge irreconcilably from
the rewritten one). I'd also need to expire the reflog and run garbage
collection (`git reflog expire --expire=now --all && git gc --prune=now`) to
ensure the old blob is actually deleted from the repo, not just unreferenced.

This assignment didn't require that step because the credentials are fake/
placeholder values, not real secrets with a live blast radius — and because
rewriting *all* history (versus just one recent commit) is destructive to any
other clones of the repo in a way that's disproportionate for a solo lab
exercise. In a real incident, the credential itself should also be rotated/
revoked immediately, since scrubbing history alone doesn't undo already-cloned
copies of the repo.

## 4. Why rewriting Task 2's commit was fine, but wouldn't be otherwise

The `asdf` commit had only ever existed on my local machine — it hadn't been
pushed, pulled, or seen by anyone else, so rewording it via interactive rebase
changed nothing anyone else depended on. Rewriting a commit that teammates
have already pulled is a different situation: their local branches still
point at the old commit hash, so after I force-push a rewritten version,
their history and mine diverge. Their next `git pull` would either create a
tangled merge of two "different" histories that are actually the same logical
work, or silently duplicate commits, depending on their settings. The rule of
thumb is: never rewrite history that has left your machine and could be relied
upon elsewhere. Local-only cleanup (rebasing before your first push) is safe;
rewriting shared history requires coordinating with the whole team, and even
then should be a last resort with everyone notified to re-clone or hard-reset.