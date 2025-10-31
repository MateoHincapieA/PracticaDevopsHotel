resource "google_compute_address" "static_ip" {
  name   = "${var.name}-ip"
  region = regex("(.+)-[a-z]$", var.zone)[0] # extrae región de la zona
}

resource "google_service_account" "sa" {
  account_id   = "${var.name}-sa"
  display_name = "Service Account for ${var.name}"
}

resource "google_compute_instance" "bastion" {
  name         = var.name
  machine_type = var.machine_type
  zone         = var.zone
  tags         = var.tags

  boot_disk {
    initialize_params {
      image = "projects/debian-cloud/global/images/family/debian-12"
      size  = var.boot_disk_size_gb
    }
  }

  network_interface {
    subnetwork = var.subnet_self_link
    access_config {
      nat_ip = google_compute_address.static_ip.address
    }
  }

  service_account {
    email  = google_service_account.sa.email
    scopes = ["https://www.googleapis.com/auth/cloud-platform"]
  }

  metadata = merge(
    (var.enable_os_login ? { "enable-oslogin" = "TRUE" } : {}),
    {
      "startup-script" = var.startup_script
    },
    length(var.ssh_users) > 0 ? {
      "ssh-keys" = join("\n", [
        for u in var.ssh_users : "${u.username}:${u.ssh_key}"
      ])
    } : {}
  )

  scheduling {
    automatic_restart   = true
    on_host_maintenance = "MIGRATE"
    provisioning_model  = "STANDARD"
  }

  shielded_instance_config {
    enable_secure_boot          = true
    enable_vtpm                 = true
    enable_integrity_monitoring = true
  }
}
