variable "name" {
  description = "Nombre de la VM bastion"
  type        = string
  default     = "bastion-omega"
}

variable "zone" {
  description = "Zona de GCE para la instancia"
  type        = string
}

variable "subnet_self_link" {
  description = "Self link de la subred donde se creará la VM (pública)"
  type        = string
}

variable "machine_type" {
  description = "Tipo de máquina"
  type        = string
  default     = "e2-micro"
}

variable "boot_disk_size_gb" {
  description = "Tamaño del disco de arranque"
  type        = number
  default     = 20
}

variable "ssh_users" {
  description = "Lista de usuarios y claves públicas para SSH (opcional si usas OS Login)"
  type = list(object({
    username = string
    ssh_key  = string
  }))
  default = []
}

variable "tags" {
  description = "Network tags; debe incluir 'ssh-allowed'"
  type        = list(string)
  default     = ["ssh-allowed"]
}

variable "enable_os_login" {
  description = "Habilitar OS Login (recomendado si usas IAM)"
  type        = bool
  default     = false
}

variable "startup_script" {
  description = "Script de arranque para instalar utilidades (psql/mysql, htop, etc.)"
  type        = string
  default     = ""
}
