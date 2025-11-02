output "bastion_external_ip" {
  description = "IP pública del bastion"
  value       = module.bastion.external_ip
}

output "bastion_internal_ip" {
  description = "IP interna del bastion"
  value       = module.bastion.internal_ip
}

output "bastion_name" {
  description = "Nombre de la VM bastion"
  value       = module.bastion.name
}

output "db_internal_ip" {
  value       = module.db.internal_ip
  description = "IP interna de la base de datos"
}
