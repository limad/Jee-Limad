#!/usr/bin/env bash

set -e

apt_install() {
  sudo DEBIAN_FRONTEND=noninteractive apt-get -o Dpkg::Options::="--force-confdef" -y install "$@"
}

get_debian_major_version() {
  if command -v lsb_release >/dev/null 2>&1; then
    lsb_release -rs | cut -d. -f1
  elif [ -r /etc/debian_version ]; then
    cut -d. -f1 /etc/debian_version
  else
    echo 0
  fi
}

echo "Begin installation of Python"
sudo apt-get update

debianVersion=$(get_debian_major_version)
if [ "$debianVersion" -gt 0 ] && [ "$debianVersion" -lt 11 ]; then
  apt_install python python-pip python-dev
else
  echo "Skip Python 2 packages on Debian ${debianVersion}"
fi

apt_install python3 python3-pip python3-venv

echo "End installation of Python"
