# Check for data in the app api, store them in the ftp then start transfer_to_s3 to transfer these collected data
# API_URL for the app review and localhost looks like localhost:3000/public-api/ and garagescore-pr-x/public-api/
# Actual url for the review api : 'garagescore-pr-506.herokuapp.com/public-api/'
# Actual folder for the s3 export : '/usr/local/dmsupload.tests'
import json
import logging
import os
import random
import signature
import subprocess
import socket
import string
import sys
import time
import transfer_to_s3

API_KEY = sys.argv[1]
API_SECRET = sys.argv[2]
if (len(sys.argv) > 4):
  API_URL = sys.argv[3]
  s3Folder = sys.argv[4]
else:
  API_URL = 'api.garagescore.com/'
  s3Folder = '/usr/local/dmsupload'

logging.basicConfig(level=logging.WARN)

def check():
  logging.info('Check')
  signature.setApiUrl(API_URL)
  transfer_to_s3.setFolder(s3Folder)
  next = signature.request(API_KEY, API_SECRET, 'GET', 'ftp/ftp2s3/poptransfer')
  next = json.loads(next)
  if ('garageId' in next):
    garageId = next['garageId']
    taskId = next['taskId']
    logging.info(garageId)
    transfer_to_s3.run(API_KEY, API_SECRET, garageId, 0)
    signature.request(API_KEY, API_SECRET, 'POST', 'ftp/ftp2s3/log', { 'taskId': taskId }, { 'taskLog': transfer_to_s3.getLog() })
  else:
    logging.info('Nothing to do')

# run check 4 times in one minute
check()
time.sleep(15)
check()
time.sleep(15)
check()
time.sleep(15)
check()
