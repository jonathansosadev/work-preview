# -*- coding: utf-8 -*-
# args for the api: --key --secret
# args for the yellow pages ftp: --ftp-host --ftp-user --ftp-pass
# args for garageId: --garageId
# fetch all reviews from the garagescore api for a garageId
# request a add on all them on yellow pages sending them a file to their ftp server

from log import log
import sys
import json
sys.path.append("..")
import signature
sys.path.append("./lib")
import yp_manager
import pysftp
import datetime
import paramiko
import os

devMode = False

def date_to_daynumber(date):
  epoch = datetime.datetime(1970, 1, 1)
  delta_time = int(((date - epoch).total_seconds())/86400)

  return delta_time

def usage():
  print("usage: yellow_pages_delete.py")
  print("\t[--key ]")
  print("\t[--secret ]")
  print("\t[--ftp-host ]")
  print("\t[--ftp-user ]")
  print("\t[--ftp-pass ]")
  print("\t[--garageId ]")

def get_params():
  args = sys.argv
  i = 0
  minDate = date_to_daynumber(datetime.datetime(2015, 6, 14,00, 00))
  maxDate = date_to_daynumber(datetime.datetime.now())
  key = ""
  secret = ""
  ftp_host = ""
  ftp_user = ""
  ftp_pass = ""
  garage_ids = []
  help = False

  for arg in args :
    if arg == "--key":
      key = args[i + 1]
    if arg == "--secret":
      secret = args[i + 1]
    if arg == "--ftp-host":
      ftp_host = args[i + 1]
    if arg == "--ftp-user":
      ftp_user = args[i + 1]
    if arg == "--ftp-pass":
      ftp_pass = args[i + 1]
    if arg == "--garageId":
      garage_ids = args[i + 1].split(',')
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
    "ftp_pass" : ftp_pass,
    "garage_ids" : garage_ids
  }
params = get_params()

API_KEY = params["key"]
API_SECRET = params["secret"]
ftp_host = params["ftp_host"]
ftp_user = params["ftp_user"]
ftp_pass = params["ftp_pass"]
garage_ids = params["garage_ids"]

params_api = {"key": API_KEY, "secret": API_SECRET}

ypManager = yp_manager.YellowPagesManager(ftp_host, ftp_user, ftp_pass,params_api ,devMode)
reviewsCount = 0

for garage_id in garage_ids:
  if len(garage_id) == 24:
    garage = signature.request(API_KEY, API_SECRET, "GET", "garage/" + garage_id + "/data", {})
    garage = json.loads(garage)

    if "id" in garage and "businessId" in garage:
      reviews = ypManager.loadReviews(garage_id, True)
      ypManager.sendReviews(reviews, [garage])
  else:
    log("invalid garage_id " + garage_id)

ypManager.sendGarages()
log("SCRIPT FINISHED...")
