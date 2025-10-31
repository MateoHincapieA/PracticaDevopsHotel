#!/usr/bin/env bash
set -euxo pipefail

export DEBIAN_FRONTEND=noninteractive

retry() {
  local n=0
  local try=$1
  local cmd="${@:2}"
  until [ $n -ge $try ]
  do
    bash -lc "$cmd" && break
    n=$((n+1))
    echo "Intento $n/$try falló. Reintentando en 5s..."
    sleep 5
  done
}

# Evita reinstalar si ya está psql
if command -v psql >/dev/null 2>&1; then
  echo "psql ya está instalado. Saliendo."
  exit 0
fi

# Actualiza e instala herramientas
retry 5 "apt-get update -y"
retry 5 "apt-get install -y postgresql-client netcat-traditional curl jq htop"

# (Opcional) Instalar cliente oficial de PostgreSQL (versiones recientes)
# echo "deb http://apt.postgresql.org/pub/repos/apt $(. /etc/os-release && echo $VERSION_CODENAME)-pgdg main" | tee /etc/apt/sources.list.d/pgdg.list
# curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc | gpg --dearmor -o /etc/apt/trusted.gpg.d/apt.postgresql.org.gpg
# retry 5 "apt-get update -y"
# retry 5 "apt-get install -y postgresql-client-16"

# Prueba rápida
psql --version || true
nc -h >/dev/null 2>&1 || true

echo "Bastion listo con psql instalado: $(date)" | tee -a /var/log/bastion-ready.log

# Habilita logging explícito para startup-script
systemctl enable google-startup-scripts.service || true
systemctl restart google-startup-scripts.service || true
