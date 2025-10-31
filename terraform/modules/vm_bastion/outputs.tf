output "name" {
  value       = google_compute_instance.bastion.name
  description = "Nombre de la VM bastion"
}

output "external_ip" {
  value       = google_compute_address.static_ip.address
  description = "IP pública del bastion"
}

output "internal_ip" {
  value       = google_compute_instance.bastion.network_interface[0].network_ip
  description = "IP interna del bastion"
}

output "service_account_email" {
  value       = google_service_account.sa.email
  description = "Service account usada por la VM"
}
