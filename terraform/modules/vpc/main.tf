resource "google_compute_network" "vpc" {
  name                    = var.network_name
  auto_create_subnetworks = var.auto_create_subnetworks
  routing_mode            = "REGIONAL"
}

resource "google_compute_subnetwork" "subnets" {
  for_each                 = { for s in var.subnets : s.name => s }
  name                     = each.value.name
  ip_cidr_range            = each.value.ip_cidr_range
  region                   = each.value.region
  network                  = google_compute_network.vpc.self_link
  private_ip_google_access = each.value.private_access
}

# Firewall: SSH desde rangos permitidos
resource "google_compute_firewall" "allow_ssh" {
  name    = "${var.network_name}-allow-ssh"
  network = google_compute_network.vpc.name

  allow {
    protocol = "tcp"
    ports    = ["22"]
  }

  source_ranges = var.ssh_source_ranges
  direction     = "INGRESS"
  target_tags   = ["ssh-allowed"]
  priority      = 1000
}

# Firewall: DB desde rangos permitidos (puedes cambiar el puerto en var.db_port)
resource "google_compute_firewall" "allow_db" {
  count   = length(var.db_source_ranges) > 0 ? 1 : 0
  name    = "${var.network_name}-allow-db"
  network = google_compute_network.vpc.name

  allow {
    protocol = "tcp"
    ports    = [5432]
  }

  source_ranges = ["10.10.0.0/24"]
  direction     = "INGRESS"
  target_tags   = ["db-allowed"]
  priority      = 1000
}

# Firewall: tráfico interno (todas las subredes)
resource "google_compute_firewall" "allow_internal" {
  name    = "${var.network_name}-allow-internal"
  network = google_compute_network.vpc.name

  allow {
    protocol = "tcp"
    ports    = ["0-65535"]
  }
  allow {
    protocol = "udp"
    ports    = ["0-65535"]
  }
  allow {
    protocol = "icmp"
  }

  source_ranges = var.internal_ranges
  direction     = "INGRESS"
  priority      = 1000
}

resource "google_compute_firewall" "allow_ssh_internal" {
  name    = "${var.network_name}-allow-ssh-internal"
  network = google_compute_network.vpc.name

  allow { 
    protocol = "tcp"
    ports = ["22"] 
  }
  source_ranges = ["10.10.0.0/24"]
  direction     = "INGRESS"
  target_tags   = ["db-allowed"]
  priority      = 1000
}

# Router + NAT (opcional) para salida a internet sin IP pública
resource "google_compute_router" "router" {
  count   = var.enable_nat ? 1 : 0
  name    = "${var.network_name}-router"
  region  = var.region
  network = google_compute_network.vpc.self_link
}

resource "google_compute_router_nat" "nat" {
  count                               = var.enable_nat ? 1 : 0
  name                                = "${var.network_name}-nat"
  router                              = google_compute_router.router[0].name
  region                              = var.region
  nat_ip_allocate_option              = "AUTO_ONLY"
  source_subnetwork_ip_ranges_to_nat  = "ALL_SUBNETWORKS_ALL_IP_RANGES"
  enable_endpoint_independent_mapping = true

  log_config {
    enable = true
    filter = "ERRORS_ONLY"
  }
}
