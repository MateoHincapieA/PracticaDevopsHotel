variable "network_name" {
  description = "Nombre de la VPC"
  type        = string
}

variable "auto_create_subnetworks" {
  description = "Si true, GCP crea subredes automáticas (usa false para modo personalizado)"
  type        = bool
  default     = false
}

variable "region" {
  description = "Región por defecto para recursos regionales (router/NAT)"
  type        = string
}

variable "subnets" {
  description = <<EOT
Lista de subredes a crear. Cada item:
{
  name           = string
  ip_cidr_range  = string  # e.g. 10.10.0.0/24
  region         = string  # e.g. us-central1
  private_access = bool    # activar Private Google Access (para APIs sin IP pública)
}
EOT
  type = list(object({
    name           = string
    ip_cidr_range  = string
    region         = string
    private_access = bool
  }))
}

variable "ssh_source_ranges" {
  description = "Rangos CIDR que pueden acceder por SSH (22)"
  type        = list(string)
  default     = ["0.0.0.0/0"] # Cambiar por IP fija si es posible
}

variable "db_port" {
  description = "Puerto de la base de datos (5432 PostgreSQL, 3306 MySQL, etc.)"
  type        = number
  default     = 5432
}

variable "db_source_ranges" {
  description = "Rangos CIDR permitidos a la base de datos (idealmente solo la VM bastion)"
  type        = list(string)
  default     = []
}

variable "internal_ranges" {
  description = "Rangos internos permitidos para tráfico interno (TCP/UDP/ICMP)"
  type        = list(string)
  default     = ["10.0.0.0/8", "172.16.0.0/12", "192.168.0.0/16"]
}

variable "enable_nat" {
  description = "Si true, crea Cloud NAT para salida a internet sin IP pública en VMs"
  type        = bool
  default     = true
}
