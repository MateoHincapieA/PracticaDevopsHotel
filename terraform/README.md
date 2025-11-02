# Infraestructura con Terraform — Bastion y Base de Datos en GCP

## Descripción General

Este proyecto implementa **Infraestructura como Código (IaC)** utilizando **Terraform** sobre **Google Cloud Platform (GCP)**.

Se despliegan automáticamente:

- Una **VPC** privada con subred pública y privada.  
- Una **VM Bastion Host** (punto de acceso SSH seguro).  
- Una **VM para la Base de Datos PostgreSQL**, accesible **solo desde el bastion** (no expuesta a Internet).  
- Configuraciones de red, firewall, NAT y creación automatizada de la base de datos.  
- Ejecución automática de scripts SQL: `01_create.sql`, `02_seed.sql`, `03_drop.sql`.

La infraestructura se crea, configura y destruye **100% desde Terraform**.

---
## Infraestructura Desplegada

| Recurso        | Descripción                                     | IP / Red         | Acceso |
|----------------|--------------------------------------------------|------------------|--------|
| **VPC**        | Red privada con subred pública y privada         | `10.10.0.0/24`, `10.20.0.0/24` | — |
| **Bastion VM** | Acceso SSH público para conectarse a la red privada | `34.58.32.253`   | SSH habilitado |
| **DB VM**      | Servidor PostgreSQL accesible solo desde bastion | `10.20.0.2`      | Puerto 5432 |
| **PostgreSQL** | Servicio local dentro de la VM privada           | `localhost:5432` | Desde bastion |

---

## Conceptos Clave

- **Bastion Host:** máquina intermedia que permite acceso SSH a recursos internos (como la DB).  
- **Subred privada:** la base de datos solo se comunica dentro de la VPC.  
- **Seguridad:** la DB no tiene IP pública, y el puerto 5432 está restringido a `10.10.0.0/24`.  
- **Outputs de Terraform:** muestran las IPs generadas al final del `terraform apply`.

---

## Comandos Principales

### Inicialización y despliegue
```bash
terraform init
terraform fmt
terraform validate
terraform apply
```
### Al finalizar, Terraform mostrará los outputs con las IPs:

bastion_external_ip = 34.58.32.253
db_internal_ip      = 10.20.0.2

### Si recreas todo desde cero
terraform destroy
ssh-keygen -R 34.58.32.253
terraform apply

## Conexiones SSH

- **Entrar al bastion**
    ssh -A -i C:\Users\mateo\.ssh\gcp_terraform_key mateo@34.58.32.253

- **Comprobar conexión al puerto PostgreSQL (desde bastion)**
    nc -vz 10.20.0.2 5432

- **Entrar a la VM de la base de datos**
    ssh mateo@10.20.0.2

## Comprobaciones de Base de Datos

### Probar conexión con PostgreSQL desde el bastion
psql "postgresql://appuser:root123@10.20.0.2:5432/appdb" -c "\l"

### Ver tablas creadas
psql "host=10.20.0.2 port=5432 user=appuser dbname=appdb" -c \
"SELECT relname AS table, n_live_tup AS approx_rows
 FROM pg_stat_user_tables
 ORDER BY relname;"

## Ejecución manual de scripts SQL
- **Crear tablas**
    psql 'host=10.20.0.2 port=5432 user=appuser dbname=appdb' -f /home/mateo/01_create.sql

- **Insertar datos (seed)**
    psql 'host=10.20.0.2 port=5432 user=appuser dbname=appdb' -f /home/mateo/02_seed.sql

- **Verificar que los datos se insertaron**
    psql "host=10.20.0.2 port=5432 user=appuser dbname=appdb" -c "SELECT COUNT(*) AS rooms FROM public.rooms;"

## Eliminación y recreación de la base de datos
- **Eliminar base de datos manualmente**
    psql "host=10.20.0.2 port=5432 user=appuser dbname=postgres" -c "DROP DATABASE IF EXISTS appdb;"

- **Eliminar con Terraform (script drop)**
    terraform apply --target=null_resource.drop_db

- **Comprobar que se eliminó**
    psql "host=10.20.0.2 port=5432 user=appuser dbname=postgres" -c "\l"

- **Volver a crear la base de datos**
    terraform apply --replace=module.db.google_compute_instance.db

## Destruir toda la infraestructura
terraform destroy