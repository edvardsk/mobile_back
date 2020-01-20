#!/bin/sh

until yarn up > /dev/null 2>&1
do
  echo "Waiting for postgres server."
  sleep 1
done


