# transfer (and transform) files from ftp to s3
# must be run on the ftp server
# -*- coding: utf-8 -*-
import datetime
import glob
import io
import json
import logging
import os
import platform
import signature
import socket
import sys
import time

logging.basicConfig(level=logging.WARN)

s3Dir = '/usr/local/dmsupload'
ftpDir = '/home'
confDir = '/home/ec2-user/cronjobs/python/conf'

for arg in sys.argv:
  if (arg == '--dev'):
    s3Dir = '/usr/local/dmsupload.tests'

if socket.gethostname() == 'lenovo':
  s3Dir = '../../labs/branchements-python/s3'
  ftpDir = '../../labs/branchements-python/ftp'
  confDir = '../../labs/branchements-python/conf'

def setFolder(folder):
  global s3Dir
  s3Dir = folder

def creation_date(path_to_file):
    """
    Try to get the date that a file was created, falling back to when it was
    last modified if that isn't possible.
    See http://stackoverflow.com/a/39501288/1709587 for explanation.
    """
    if platform.system() == 'Windows':
        return os.path.getctime(path_to_file)
    else:
        stat = os.stat(path_to_file)
        try:
            return stat.st_birthtime
        except AttributeError:
            # We're probably on Linux. No easy way to get creation dates here,
            # so we'll settle for when its content was last modified.
            return stat.st_mtime
def mkdir(file):
  if not os.path.exists(os.path.dirname(file)):
    try:
        os.makedirs(os.path.dirname(file))
    except OSError as exc: # Guard against race condition
        if exc.errno != errno.EEXIST:
            raise

# store logs in variable
_logs = ''
def resetLog():
  global _logs
  _logs = ''
def log(msg):
  global _logs
  print msg
  _logs += msg + '\n'
def getLog():
  global _logs
  return _logs

# find the corresponding file when we have * in the spacename
def findFile(ftpDir, fileName, timedelta):
  if '*' not in fileName:
    return ftpDir + '/' + fileName
  dir = ftpDir + '/' + fileName
  dir, tail = os.path.split(dir)
  today =   (datetime.datetime.today() - datetime.timedelta(timedelta))
  yesterday = (datetime.datetime.today() - datetime.timedelta(1 + timedelta))
  DD = today.strftime('%d')
  MM = today.strftime('%m')
  YYYY = today.strftime('%Y')
  yesterday_DD = yesterday.strftime('%d')
  yesterday_MM = yesterday.strftime('%m')
  yesterday_YYYY = yesterday.strftime('%Y')
  tail = tail.replace('$dd', yesterday_DD)
  tail = tail.replace('$mm', yesterday_MM)
  tail = tail.replace('$yyyy', yesterday_YYYY)
  tail = tail.replace('$DD', DD)
  tail = tail.replace('$MM', MM)
  tail = tail.replace('$YYYY', YYYY)
  matchedFiles = []
  for f in os.listdir(dir):
    if os.path.isfile(os.path.join(dir, f)) and len(f) == len(tail):
      match = True
      for i, c in enumerate(f):
        if tail[i] != '*' and c != tail[i]:
          match = False
          break
      if match:
        matchedFiles.append(dir + '/' + f)
        # return dir + '/' + f

  if matchedFiles:
    nameMostRecentFile = None
    dateMostRecentModifiedFile = None
    for f in matchedFiles[:]:
      fileDate = datetime.datetime.fromtimestamp(os.path.getmtime(f))
      if (not dateMostRecentModifiedFile and not nameMostRecentFile) or fileDate > dateMostRecentModifiedFile:
        nameMostRecentFile = f
        dateMostRecentModifiedFile = fileDate
    return nameMostRecentFile
    
  return ftpDir + '/' + fileName

def process(conf, timedelta):
  today =   (datetime.datetime.today() - datetime.timedelta(timedelta))
  yesterday = (datetime.datetime.today() - datetime.timedelta(1 + timedelta))
  today_minus_2 = (datetime.datetime.today() - datetime.timedelta(2 + timedelta))
  DD = today.strftime('%d')
  MM = today.strftime('%m')
  YYYY = today.strftime('%Y')
  yesterday_DD = yesterday.strftime('%d')
  yesterday_MM = yesterday.strftime('%m')
  yesterday_YYYY = yesterday.strftime('%Y')
  today_minus_2_DD = today_minus_2.strftime('%d')
  today_minus_2_MM = today_minus_2.strftime('%m')
  today_minus_2_YYYY = today_minus_2.strftime('%Y')
  idGarage = conf['id']
  slug = conf['slug'].encode('ascii', 'ignore').decode('ascii')
  log(u'Processing %s ' % (idGarage))
  log(slug)
  for dataFile in conf['imports']:
    if dataFile['method'] == 'FTP':
      finalContent = ''
      for ftpfile in dataFile['params']['files']:
        fileName = ftpfile['path']
        fileName = fileName.replace('$DD-2$', today_minus_2_DD)
        fileName = fileName.replace('$MM-2$', today_minus_2_MM)
        fileName = fileName.replace('$YYYY-2$', today_minus_2_YYYY)
        fileName = fileName.replace('$DD-1$', yesterday_DD)
        fileName = fileName.replace('$MM-1$', yesterday_MM)
        fileName = fileName.replace('$YYYY-1$', yesterday_YYYY)
        fileName = fileName.replace('$dd', yesterday_DD)
        fileName = fileName.replace('$mm', yesterday_MM)
        fileName = fileName.replace('$yyyy', yesterday_YYYY)
        fileName = fileName.replace('$DD', DD)
        fileName = fileName.replace('$MM', MM)
        fileName = fileName.replace('$YYYY', YYYY)
        ftpFilePath = ''
        if '*' in fileName:
          ftpFilePath = findFile(ftpDir, fileName, timedelta)
        else:
          ftpFilePath = ftpDir + '/' + fileName
        try:
          # Check file date
          if 'enableLastModifiedCheck' in ftpfile and ftpfile['enableLastModifiedCheck'] :
            timeLimit = time.time() - 60 * 60 * 24
            if creation_date(ftpFilePath) < timeLimit :
              log(u'%s too old (ignoring it)' % (ftpFilePath))
              continue
            if timedelta > 0:
              log(u'%s too old for timedelta (ignoring it)' % (ftpFilePath))
              continue
          fileContent = ''
          # get file content
          if dataFile['params']['charset'] == 'binary':
             fileContent = io.open(ftpFilePath, mode='rb') .read()
          else:
            fileContent = io.open(ftpFilePath, encoding=ftpfile['charset'], mode='r') .read()

          # filter rows
          if 'columnFilter' in ftpfile and ftpfile['columnFilter'] and dataFile['params']['charset'] != 'binary':
            filtered = []
            if 'columnFilterSeparator' in ftpfile and 'columnFilterColumnValue' in ftpfile and 'columnFilterColumnNumber' in ftpfile:
              lines = fileContent.split('\n')
              columnNumber = int(ftpfile['columnFilterColumnNumber'])
              sep = ftpfile['columnFilterSeparator']
              columnValue = ftpfile['columnFilterColumnValue']
              columnValue = columnValue.replace('$DD-2$', today_minus_2_DD)
              columnValue = columnValue.replace('$MM-2$', today_minus_2_MM)
              columnValue = columnValue.replace('$YYYY-2$', today_minus_2_YYYY)
              columnValue = columnValue.replace('$DD-1$', yesterday_DD)
              columnValue = columnValue.replace('$MM-1$', yesterday_MM)
              columnValue = columnValue.replace('$YYYY-1$', yesterday_YYYY)
              columnValue = columnValue.replace('$dd', yesterday_DD)
              columnValue = columnValue.replace('$mm', yesterday_MM)
              columnValue = columnValue.replace('$yyyy', yesterday_YYYY)
              columnValue = columnValue.replace('$DD', DD)
              columnValue = columnValue.replace('$MM', MM)
              columnValue = columnValue.replace('$YYYY', YYYY)
              if sep == 'tab':
                sep = '\t'
              if sep == 'pipe':
                sep = '|'
              for line in lines:
                # clean some character controls (iCarSystems imports)
                line = line.replace(chr(0), ' ')
                cols = line.split(sep)
                if len(cols) > columnNumber and columnValue in cols[columnNumber]:
                  filtered.append(line)
            fileContent = u'\n'.join(filtered)

          if finalContent != '':
            lines = fileContent.split('\n')
            lines.pop(0)
            for line in lines:
              finalContent += '\n' + line
            finalContent = finalContent.replace('\n\n', '\n')
          else:
            finalContent = fileContent

        except Exception as e:
          log('Can\'t parse %s' % (ftpFilePath))
          exc_type, exc_obj, exc_tb = sys.exc_info()
          fname = os.path.split(exc_tb.tb_frame.f_code.co_filename)[1]
          print e
          print(exc_type, fname, exc_tb.tb_lineno)
      # save content
      if finalContent != '':
        try:
          s3Path = "%s/%s/%s/%s/%s/%s_%s_%s-%s-%s.%s" % (s3Dir, YYYY, MM, DD, idGarage, YYYY, MM, DD, idGarage, dataFile['type'], dataFile['params']['suffix'])
          mkdir(s3Path)
          # s3OldPath = "%s/%s/gid-%s/%s/%s/%s_%s_%s-%s-%s.%s" % (s3Dir, conf['dms'], idGarage, YYYY, MM, DD, MM, YYYY, dataFile['type'], slug, dataFile['params']['suffix'])
          # mkdir(s3OldPath)

          if dataFile['params']['charset'] == 'binary':
            io.open(s3Path, mode='wb').write(finalContent)
            # io.open(s3OldPath, mode='wb') .write(finalContent)
          else:
            io.open(s3Path, encoding=dataFile['params']['charset'], mode='w').write(finalContent)
            # io.open(s3OldPath, encoding=dataFile['params']['charset'], mode='w') .write(finalContent)
          log(s3Path)
          # log(s3OldPath)
        except Exception as e:
          log('Error copy to s3')
          exc_type, exc_obj, exc_tb = sys.exc_info()
          fname = os.path.split(exc_tb.tb_frame.f_code.co_filename)[1]
          print e
          print(exc_type, fname, exc_tb.tb_lineno)
      else:
        log(">>>> Warning: %s empty or every row filtered" % (ftpFilePath))
  print '------------------------------------------------------------'

def run(API_KEY, API_SECRET, garageId, timedeltaMax):
  resetLog()
  try:
    conf = signature.request(API_KEY, API_SECRET, 'GET', 'ftp/ftp2s3/conf', { 'garageId': garageId })
    conf = json.loads(conf)
    for timedelta in range(0, timedeltaMax + 1): # we process all days from today to (today - timedeltaMax)
      process(conf, timedelta)
  except Exception as e:
    log('Error copy to s3')
    exc_type, exc_obj, exc_tb = sys.exc_info()
    fname = os.path.split(exc_tb.tb_frame.f_code.co_filename)[1]
    log(str(e))
    print(exc_type, fname, exc_tb.tb_lineno)




if __name__ == '__main__':
  API_KEY = sys.argv[1]
  API_SECRET = sys.argv[2]
  PAGE = sys.argv[3]
  if len(sys.argv) > 4:
      timedeltaMax = int (sys.argv[4]) # can re-process previous days => dangerous (files are overwritten)
  else:
    timedeltaMax = 0
  if len(sys.argv) > 5:
    garage = sys.argv[5]
    garages = [garage]
  else:
    garages = signature.request(API_KEY, API_SECRET, 'GET', 'ftp/ftp2s3/garages', { 'page': PAGE })
    garages = json.loads(garages)
  for garage in garages:
    try:
      run(API_KEY, API_SECRET, garage, timedeltaMax)
      time.sleep(0.5) # ez with the api
    except Exception as e:
      print 'Error copy to s3'
      exc_type, exc_obj, exc_tb = sys.exc_info()
      fname = os.path.split(exc_tb.tb_frame.f_code.co_filename)[1]
      print e
      print(exc_type, fname, exc_tb.tb_lineno)
