# check if there is on ftp account to create in the queue and run createFTPuser.sh
import json
import logging
import os
import random
import signature
import subprocess
import socket
import string
import sys

SCRIPT = 'sudo /home/ec2-user/cronjobs/python/create-ftp-user.sh'

API_KEY = sys.argv[1]
API_SECRET = sys.argv[2]
logging.basicConfig(level=logging.WARN)

next = signature.request(API_KEY, API_SECRET, 'GET', 'ftp/nextcreate', {})
next = json.loads(next)
if ('username' in next):
    username = next['username']
    pwd = ''.join(random.SystemRandom().choice(string.ascii_uppercase + string.ascii_lowercase + string.digits) for
_ in range(12))
    cmd = SCRIPT + ' ' + username + ' ' + pwd
    logging.info(cmd)
    try:
      returncode = 0
      if socket.gethostname() != 'lenovo':
        process = subprocess.Popen(cmd.split(), stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        output, error = process.communicate()
        returncode = process.returncode
      if (returncode == 0):
        signature.request(API_KEY, API_SECRET, 'GET', 'ftp/accountcreated', { 'username': username, 'pwd': pwd})
    except Exception as e:
      print ('Can\'t run createFTPuser.sh')
      print e
      # exc_type, exc_obj, exc_tb = sys.exc_info()
      # fname = os.path.split(exc_tb.tb_frame.f_code.co_filename)[1]
      # print(exc_type, fname, exc_tb.tb_lineno)
else:
    logging.info('Nothing to do')
# '/public-api/ftp/'