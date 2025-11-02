variable "project_id" {
  type        = string
  description = "ID del proyecto de GCP"
}

variable "region" {
  type        = string
  default     = "us-central1"
  description = "Región donde se crean los recursos"
}

variable "zone" {
  type        = string
  default     = "us-central1-a"
  description = "Zona donde se crean los recursos"
}

variable "db_password" {
  description = "Password del usuario de la DB"
  type        = string
  sensitive   = true
}

variable "db_name" {
  description = "Nombre de la base de datos"
  type        = string
  sensitive   = true
}

variable "db_user" {
  description = "Nombre de usuario de la base de datos"
  type        = string
  sensitive   = true
}

variable "ssh_private_key_path" {
  description = "Ruta a clave privada para conectar al bastion"
  type        = string
  sensitive   = true
}
