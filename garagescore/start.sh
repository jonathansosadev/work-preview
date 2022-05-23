#!/bin/bash

# Get the type of process from the command line with MainApp as default argument
ProcessToStart=${1:-MainApp}

# Declare possible types of process
AcceptedProcesses=(MainApp Contacts Ceres Vesta Pallas Scheduler SurveyResponses)

# Declare heap sizes based upon dyno sizes, this could change in time if Heroku decide to change dyno features
Standard1XHeapSize=512
Standard2XHeapSize=1024
PerformanceMHeapSize=2560
PerformanceLHeapSize=14336

# Check that the process given in command line is allowed
function CheckProcessType() {
  if [[ ! " ${AcceptedProcesses[@]} " =~ " ${ProcessToStart} " ]]; then
      echo "[START.SH] ERROR :: UNKNOWN PROCESS TYPE ${ProcessToStart}"
      exit
  fi
}

# Start the given process with a specific heap size
function StartProcess() {
  if [ "$ProcessToStart" == 'MainApp' ]
  then
    echo "[START.SH] STARTING PROCESS MainApp"
    if [ "$ENABLE_DEBUG" == "true" ]
    then
      exec node --max_old_space_size=${1} --inspect ./main-app.js
    else
      exec node --max_old_space_size=${1} ./main-app.js
    fi
  elif [ "$ProcessToStart" == 'Contacts' ]
  then
    echo "[START.SH] STARTING PROCESS Contacts"
    exec node --max_old_space_size=${1} ./workers/contacts-sender.js
  elif [ "$ProcessToStart" == 'Scheduler' ]
  then
    echo "[START.SH] STARTING PROCESS Scheduler"
    exec node --max_old_space_size=${1} ./workers/job-scheduler.js
  elif [ "$ProcessToStart" == 'Ceres' ]
  then
    echo "[START.SH] STARTING PROCESS Ceres"
    exec node --max_old_space_size=${1} ./workers/job-runner.js CERES
  elif [ "$ProcessToStart" == 'Vesta' ]
  then
    echo "[START.SH] STARTING PROCESS Vesta"
    exec node --max_old_space_size=${1} ./workers/job-runner.js VESTA
  elif [ "$ProcessToStart" == 'Pallas' ]
  then
    echo "[START.SH] STARTING PROCESS Pallas"
    exec node --max_old_space_size=${1} ./workers/job-runner.js PALLAS
  elif [ "$ProcessToStart" == 'SurveyResponses' ]
  then
    echo "[START.SH] STARTING PROCESS SurveyResponses"
    exec node --max_old_space_size=${1} ./workers/survey-responses.js
  fi
}

# Determine the heap size and start the process
function Start() {
  MaxProcesses=`ulimit -u`

  if [ "$MaxProcesses" == 256 ]
  then
    echo "[START.SH] STANDARD-1X DYNO DETECTED"
    StartProcess $Standard1XHeapSize
  elif  [ "$MaxProcesses" == 512 ]
  then
    echo "[START.SH] STANDARD-2X DYNO DETECTED"
    StartProcess $Standard2XHeapSize
  elif [ "$MaxProcesses" -gt 512 ] && [ "$MaxProcesses" -le 16384 ]
  then
    echo "[START.SH] PERFORMANCE-M DYNO DETECTED"
    StartProcess $PerformanceMHeapSize
  elif [ "$MaxProcesses" -gt 16384 ]
  then
    echo "[START.SH] PERFORMANCE-L DYNO DETECTED"
    StartProcess $PerformanceLHeapSize
  else
    echo "[START.SH] WARNING :: UNABLE TO DETECT DYNO TYPE, WILL START PROCESS AS STANDARD-1X"
    StartProcess $Standard1XHeapSize
  fi
}

# Main function does what a main function does
function Main() {
  CheckProcessType
  Start
}

# Let's go!
Main
