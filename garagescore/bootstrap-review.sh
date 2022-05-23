# run by Heroku on every app review just after the first build

APP_NAME=$HEROKU_APP_NAME
NODE_APP_INSTANCE=$NODE_APP_INSTANCE
echo "APP_NAME=$APP_NAME"
echo "NODE_APP_INSTANCE=$NODE_APP_INSTANCE"
echo "Updating PR variables"

# get review config from the main pipeline
JSONCONFIG=$(curl -n https://api.heroku.com/apps/garagescore-beta-config/config-vars   -H "Accept: application/vnd.heroku+json; version=3 "  -H "Authorization: Bearer $HEROKU_API_KEY")

# copy review config to our local app
curl -n -X PATCH https://api.heroku.com/apps/$APP_NAME/config-vars \
  -d "$JSONCONFIG" \
  -H "Content-Type: application/json" \
  -H "Accept: application/vnd.heroku+json; version=3" \
  -H "Authorization: Bearer $HEROKU_API_KEY"

# set dynamic vars
APP=https://beta-app-pr-$HEROKU_PR_NUMBER.herokuapp.com
APOLLO=https://beta-apollo-pr-$HEROKU_PR_NUMBER.herokuapp.com/graphqlapi
WWW=https://beta-www-pr-$HEROKU_PR_NUMBER.herokuapp.com
CONTACTS=https://beta-contacts-pr-$HEROKU_PR_NUMBER.herokuapp.com
SURVEY=https://beta-survey-pr-$HEROKU_PR_NUMBER.herokuapp.com
FFEUC=https://beta-app-pr-$HEROKU_PR_NUMBER.herokuapp.com
PUBLICAPI=https://beta-publicapi-pr-$HEROKU_PR_NUMBER.herokuapp.com/public-api

curl -n -X PATCH https://api.heroku.com/apps/$APP_NAME/config-vars \
  -d "{
    \"HEROKU_APP_NAME\": \"$APP_NAME\",
    \"HEROKU_PR_NUMBER\": \"$HEROKU_PR_NUMBER\",
    \"NODE_APP_INSTANCE\": \"$NODE_APP_INSTANCE\",
    \"API_URL\": \"$APOLLO\",
    \"APP_URL\": \"$APP\",
    \"SHORT_URL_BASE\": \"$APP/\",
    \"PUBLIC_API_URL\": \"$PUBLICAPI\",
    \"WWW_URL\": \"$WWW\",
    \"SURVEY_URL\": \"$SURVEY\",
    \"FFEUC_URL\": \"$FFEUC\",
    \"CLOUDAMQP_PREFIX\": \"$HEROKU_PR_NUMBER\",
    \"REDIS_PREFIX\": \"$HEROKU_PR_NUMBER\",
    \"PROFILER_NAMESPACE\": \"$HEROKU_PR_NUMBER\",
    \"MESSAGEQUEUE_MAILGUN_PREFIX\": \"$HEROKU_PR_NUMBER\"
    }" \
  -H "Content-Type: application/json" \
  -H "Accept: application/vnd.heroku+json; version=3" \
  -H "Authorization: Bearer $HEROKU_API_KEY"

# Remove API PORT if Apollo
if [ $NODE_APP_INSTANCE = "apollo" ]; then
  echo "Config Apollo port"
  curl -n -X PATCH https://api.heroku.com/apps/$APP_NAME/config-vars \
  -d "{
      \"API_PORT\": null
      }" \
  -H "Content-Type: application/json" \
  -H "Accept: application/vnd.heroku+json; version=3" \
  -H "Authorization: Bearer $HEROKU_API_KEY"
fi

# local redis an rabbitmq
MAIN_APP=beta-app-pr-$HEROKU_PR_NUMBER
echo "MAIN_APP=$MAIN_APP"
if [ $NODE_APP_INSTANCE = "app" ]; then
  echo "Creating Redis instance"
  curl -n -X POST https://api.heroku.com/apps/$MAIN_APP/addons \
  -d '{
    "plan": "heroku-redis:hobby-dev"
  }' \
  -H "Content-Type: application/json" \
  -H "Accept: application/vnd.heroku+json; version=3"\
  -H "Authorization: Bearer $HEROKU_API_KEY"

  echo "Creating RabbitMq instance"
    curl -n -X POST https://api.heroku.com/apps/$MAIN_APP/addons \
  -d '{
    "plan": "cloudamqp:lemur"
  }' \
  -H "Content-Type: application/json" \
  -H "Accept: application/vnd.heroku+json; version=3"\
  -H "Authorization: Bearer $HEROKU_API_KEY"
fi

REDIS_URL=$(curl -n https://api.heroku.com/apps/$MAIN_APP/config-vars   -H "Accept: application/vnd.heroku+json; version=3 "  -H "Authorization: Bearer $HEROKU_API_KEY" | grep REDIS_URL | tr -d ',')
if [[ "$REDIS_URL" != *"redis://"* ]]; then
  echo "REDIS_URL not configured yet, we wait"
  sleep 5m
  REDIS_URL=$(curl -n https://api.heroku.com/apps/$MAIN_APP/config-vars   -H "Accept: application/vnd.heroku+json; version=3 "  -H "Authorization: Bearer $HEROKU_API_KEY" | grep REDIS_URL | tr -d ',')
fi

echo "Setting Redis URL = $REDIS_URL"
curl -n -X PATCH https://api.heroku.com/apps/$APP_NAME/config-vars \
  -d "{
    $REDIS_URL
    }" \
  -H "Content-Type: application/json" \
  -H "Accept: application/vnd.heroku+json; version=3" \
  -H "Authorization: Bearer $HEROKU_API_KEY"
CLOUDAMQP_URL=$(curl -n https://api.heroku.com/apps/$MAIN_APP/config-vars   -H "Accept: application/vnd.heroku+json; version=3 "  -H "Authorization: Bearer $HEROKU_API_KEY" | grep CLOUDAMQP_URL | tr -d ',')
echo "Setting RabbitMq URL = $CLOUDAMQP_URL"
curl -n -X PATCH https://api.heroku.com/apps/$APP_NAME/config-vars \
  -d "{
    $CLOUDAMQP_URL
    }" \
  -H "Content-Type: application/json" \
  -H "Accept: application/vnd.heroku+json; version=3" \
  -H "Authorization: Bearer $HEROKU_API_KEY"
