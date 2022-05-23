# -*- coding: utf-8 -*-
# args for the api: --key --secret
# args for the yellow pages ftp: --ftp-host --ftp-user --ftp-pass
# args for the time windows --min-day-number --max-day-number
# Fetch from the garagescore api all the reviews created-and-shared or moderated
# between min-day-number (included) and max-day-number (included)
# send them to the yellow pages ftp (put various files: one for each garage (containing the reviews) and one with the list of every garages)

import sys
import json
from log import log

sys.path.append("..")
import signature
sys.path.append("./lib")
import yp_manager
import pysftp
import datetime
import paramiko
import os
import time
devMode = False

def processDay(date, ypManager,API_KEY, API_SECRET, ftp_host,ftp_user,ftp_pass,devMode ) :

  callNumber = 0

  date = date - datetime.timedelta(days=5)
  daynumber = date_to_daynumber(date)
  reviewsAt = str(date.day) + '/' + str(date.month) + '/' + str(date.year)

  log("##########################################")
  log("##########################################")
  log("script work on date " + reviewsAt)
  log("daynumber " + str(daynumber))

  log("1/ send garages who enabled sharing and send them to partners")
  garages = ypManager.sendGarages()

  if len(garages) > 0:
    params = {"dateField": "updatedAt", "pagination": "true"}
    reviews = []
    next = True
    baseUrl = "garage/reviews/" + reviewsAt
    nextUrl = baseUrl
    nbReviews = 0

    while next == True:
      results = signature.request(API_KEY, API_SECRET, "GET", nextUrl, params)
      time.sleep(1)
      results = json.loads(results)

      if "reviews" in results:
        reviews = reviews + results["reviews"]

      if "next" in results:
        nextUrl = results["next"].split('?').pop(0)
      else:
        next = False
      callNumber = callNumber + 1
      nbReviews = len(reviews)

    if nbReviews > 0:
      log("second step send review from " + reviewsAt)
      log("REVIEWS NUMBER : " + str(nbReviews) + " AT DATE " + reviewsAt)
      ypManager.sendReviews(reviews, garages)
  else:
    closeFileName = "syndication-contribution-rapprochement-EG01.csv"
    decFileName = "syndication-contribution-rapprochement-EG01.dec"

    ypManager.createFile(closeFileName)
    ypManager.sendFile(closeFileName, ["pub", "rapprochement", "a_traiter"])
    ypManager.deleteFile(closeFileName)
    ypManager.createFile(decFileName)
    ypManager.sendFile(decFileName, ["pub", "rapprochement", "a_traiter"])
    ypManager.deleteFile(decFileName)

    log("No garages.")

    log("##########################################")
  log("2/ delete reviews moderated")

  ypManager.deleteModeratedReviews(garages,daynumber)

  log("##########################################")
  log("3/ get garages who disabled sharing and delete all comments sent to partners")
  garages = signature.request(API_KEY, API_SECRET, "GET", "share-reviews/garages2delete", {
    "minDayNumber" : daynumber,
    "maxDayNumber" : daynumber + 1,
    "localeCode" : "fr_FR"
  })
  garages = json.loads(garages)
  for garage in garages:
    ypManager.deleteGarageReview(garage)

def datetime_range(start, end, delta):
  current = start
  if not isinstance(delta, datetime.timedelta):
    delta = datetime.timedelta(**delta)
  while current < end:
    yield current
    current += delta

def day_number_to_date(daynumber):
  date = datetime.datetime.fromtimestamp(daynumber * 86400)
  date = date.replace(hour=0, minute=0, second=0)
  return date

def date_to_daynumber(date):
  epoch = datetime.datetime(1970, 1, 1)
  delta_time = int(((date - epoch).total_seconds())/86400)

  return delta_time

def usage():
  print("usage: yellow_pages.py")
  print("\t[--min-day-number ]")
  print("\t[--max-day-number ]")
  print("\t[--key ]")
  print("\t[--secret ]")
  print("\t[--ftp-host ]")
  print("\t[--ftp-user ]")
  print("\t[--ftp-pass ]")

def get_params():
  args = sys.argv
  i = 0
  today = datetime.datetime.now()
  today = today.replace(hour=0, minute=0,second=0)
  tomorrow = today + datetime.timedelta(days=1)

  minDate = today
  maxDate = tomorrow

  key = ""
  secret = ""
  ftp_host = ""
  ftp_user = ""
  ftp_pass = ""
  help = False

  for arg in args :
    if arg == "--min-day-number":
      minDate = day_number_to_date(int(args[i +1]))
    if arg == "--max-day-number":
      maxDate = day_number_to_date(int(args[i + 1]))
    if arg == "--key":
      key = (args[i + 1])
    if arg == "--secret":
      secret = args[i + 1]
    if arg == "--ftp-host":
      ftp_host = args[i + 1]
    if arg == "--ftp-user":
      ftp_user = args[i + 1]
    if arg == "--ftp-pass":
      ftp_pass = args[i + 1]
    if arg == "--help":
      help = True
    i = i+1

  if help:
    usage()
    sys.exit()
  if i < 7:
    print("No enough params, for help use --help")
    sys.exit()

  return {
    "minDate" : minDate,
    "maxDate" : maxDate,
    "key" : key,
    "secret" : secret,
    "ftp_host" : ftp_host,
    "ftp_user" : ftp_user,
    "ftp_pass" : ftp_pass
  }

if __name__ == '__main__':
  params = get_params()
  start = params["minDate"]
  end = params["maxDate"]
  API_KEY = params["key"]
  API_SECRET = params["secret"]
  ftp_host = params["ftp_host"]
  ftp_user = params["ftp_user"]
  ftp_pass = params["ftp_pass"]

  params_api = {"key": API_KEY, "secret": API_SECRET}

  ypManager = yp_manager.YellowPagesManager(ftp_host, ftp_user, ftp_pass,params_api ,devMode)


  for date in datetime_range(start, end, {'days': 1, 'hours': 0}):
    today = str(date.day) + '/' + str(date.month) + '/' + str(date.year)
    processDay(date, ypManager, API_KEY, API_SECRET, ftp_host, ftp_user, ftp_pass, devMode)

  log("SCRIPT FINISHED...")

