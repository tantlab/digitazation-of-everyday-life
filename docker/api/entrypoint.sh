#!/bin/bash
cd /api

if [ "$MODE" = "dev" ]; then
  echo "/!\\ Mode is set to DEV /!\\"
else
  echo "/!\\ Mode is set to PRODUCTION /!\\"
fi
echo "(i) Python version is $(python --version)"

echo
echo " ~"
echo " ~ Install dependencies"
echo " ~"
echo
pip install -r requirements.txt

if [ "$MODE" = "dev" ]; then
  echo
  echo " ~"
  echo " ~ Start flask server"
  echo " ~"
  echo
  export FLASK_APP=api.py
  export FLASK_ENV=development
  python -m flask run --host 0.0.0.0
else
  echo
  echo " ~"
  echo " ~ TODO"
  echo " ~"
  echo
fi
