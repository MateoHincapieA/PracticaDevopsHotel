variable "name" { 
    type = string  
    default = "db-omega" 
}

variable "zone" { 
    type = string 
}

variable "subnet_self_link"{ 
    type = string 
} # subred privada

variable "machine_type" { 
    type = string  
    default = "e2-small" 
}

variable "boot_disk_size_gb"{ 
    type = number 
    default = 20 
}

variable "tags" { # debe incluir "db-allowed" para que aplique el firewall de 5432
  type    = list(string)
  default = ["db-allowed"]
}

variable "db_name" { 
    type = string 
}

variable "db_user" { 
    type = string 
}

variable "db_password" { 
    type = string  
    sensitive = true 
}

variable "ssh_users" {
  description = "Usuarios + claves públicas autorizadas para SSH en la DB VM"
  type = list(object({
    username = string
    ssh_key  = string
  }))
  default = []
}
