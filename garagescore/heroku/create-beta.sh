# Create your apps on Heroku, should be run once for each app
# you must create `app` first, wait a few minutes (so redis and rabbitmq are created)
# and then you can create `apollo` and `survey` or `www` if you need them
# Usage example: bash heroku/created-beta.sh 5835 app 
die () {
    echo >&2 "$@"
    exit 1
}
[ "$#" -eq 2 ] || die "2 arguments (PR and NODE_APP_INSTANCE) required, $# provided"

PR=$1
NODE_APP_INSTANCE=$2

if [ $NODE_APP_INSTANCE != "app" ]; then
    read -p "Are Redis and CloudAMQP already provisioned on https://dashboard.heroku.com/apps/beta-app-pr-$PR ? " -n 1 -r
    echo    # (optional) move to a new line
    if [[ $REPLY =~ ^[Nn]$ ]]
    then
       exit 1
    fi
fi


HEROKU_API_KEY=$(heroku auth:token)
PIPELINE=beta-$NODE_APP_INSTANCE
HEROKU_APP_NAME=$PIPELINE-pr-$PR
HEROKU_PR_NUMBER=$PR

heroku apps:create $HEROKU_APP_NAME --buildpack heroku/nodejs --region eu
heroku access:add -a $HEROKU_APP_NAME betahackers@garagescore.com
heroku access:add -a $HEROKU_APP_NAME hackers@garagescore.com
heroku pipelines:add $PIPELINE -a $HEROKU_APP_NAME -s review

. bootstrap-review.sh

if [ $NODE_APP_INSTANCE = "app" ]; then
    echo "Please wait up to 10 minutes before creating apollo or survey "
fi
