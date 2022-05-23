#!/bin/bash
echo "Scaling down next web workers and contacts..."
date "+%Y/%m/%d %H:%M"
heroku ps:scale web=0 -a next-garagescore
heroku ps:scale ceres=0 -a next-garagescore
heroku ps:scale vesta=0 -a next-garagescore
heroku ps:scale web=0 -a next-garagescore-apollo
heroku ps:scale ceres=0 -a next-garagescore-apollo
heroku ps:scale vesta=0 -a next-garagescore-apollo
