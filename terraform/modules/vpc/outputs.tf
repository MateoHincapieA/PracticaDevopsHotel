output "network_self_link" {
  description = "Self link de la VPC"
  value       = google_compute_network.vpc.self_link
}

output "network_name" {
  description = "Nombre de la VPC"
  value       = google_compute_network.vpc.name
}

output "subnets_self_links" {
  description = "Self links de las subredes"
  value       = { for k, v in google_compute_subnetwork.subnets : k => v.self_link }
}

output "subnets_ips" {
  description = "CIDRs de las subredes"
  value       = { for k, v in google_compute_subnetwork.subnets : k => v.ip_cidr_range }
}
