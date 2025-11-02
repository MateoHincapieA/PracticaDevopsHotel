output "name" {
  value       = google_compute_instance.db.name
  description = "Nombre de la VM de base de datos"
}

output "internal_ip" {
  value       = google_compute_instance.db.network_interface[0].network_ip
  description = "IP interna de la DB"
}
