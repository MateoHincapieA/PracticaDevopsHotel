resource "google_service_account" "sa" {
  account_id   = "${var.name}-sa"
  display_name = "Service Account for ${var.name}"
}

resource "google_compute_instance" "db" {
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

  # SIN IP pública; solo IP interna
  network_interface {
    subnetwork = var.subnet_self_link
    # sin access_config => no external IP
  }

  service_account {
    email  = google_service_account.sa.email
    scopes = ["https://www.googleapis.com/auth/cloud-platform"]
  }

  metadata = merge(
    {
      "startup-script" = replace(
        templatefile("${path.module}/startup/db_init.sh.tmpl", {
          db_name      = var.db_name
          db_user      = var.db_user
          db_password  = var.db_password
          bastion_cidr = "10.10.0.0/24"
        }),
        "\r\n", "\n"
      )
    },
    length(var.ssh_users) > 0 ? {
      "ssh-keys" = join("\n", [for u in var.ssh_users : "${u.username}:${u.ssh_key}"])
    } : {}
  )


  scheduling {
    automatic_restart   = true
    on_host_maintenance = "MIGRATE"
  }

  shielded_instance_config {
    enable_secure_boot          = true
    enable_vtpm                 = true
    enable_integrity_monitoring = true
  }
}
