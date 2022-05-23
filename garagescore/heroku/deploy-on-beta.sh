# Deploy a branch on beta
# Usage example: bash heroku/deploy-on-beta.sh 5835 master
die () {
    echo >&2 "$@"
    exit 1
}
[ "$#" -eq 3 ] || die "3 arguments (PR, NODE_APP_INSTANCE, BRANCH) required, $# provided"

PR=$1
NODE_APP_INSTANCE=$2
BRANCH=$3

REPO_URL=https://git.heroku.com/beta-$NODE_APP_INSTANCE-pr-$PR.git
REPO_NAME=beta-$NODE_APP_INSTANCE-pr-$PR

git remote add $REPO_NAME $REPO_URL

git push $REPO_NAME $BRANCH:main
