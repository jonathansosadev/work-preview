import datetime

def log(msg):
  now = datetime.datetime.now()
  at = str(now.day) + "/" + str(now.month) + "/" + str(now.year)
  at += " " + str(now.hour) + ":" +  str(now.minute) + " " + str(now.second) + " "
  print(at + "  " + msg)
