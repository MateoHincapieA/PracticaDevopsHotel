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
