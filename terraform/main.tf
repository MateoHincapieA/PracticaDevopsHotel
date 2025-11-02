module "vpc" {
  source                  = "./modules/vpc"
  network_name            = "vpc-omega"
  auto_create_subnetworks = false
  region                  = var.region

  subnets = [
    {
      name           = "subnet-public-us-central1"
      ip_cidr_range  = "10.10.0.0/24"
      region         = var.region
      private_access = true
    },
    {
      name           = "subnet-private-us-central1"
      ip_cidr_range  = "10.20.0.0/24"
      region         = var.region
      private_access = true
    }
  ]

  ssh_source_ranges = ["0.0.0.0/0"]

  db_port          = 5432
  db_source_ranges = ["10.10.0.0/24"]

  enable_nat = true
}

module "bastion" {
  source           = "./modules/vm_bastion"
  name             = "bastion-omega"
  zone             = var.zone
  subnet_self_link = module.vpc.subnets_self_links["subnet-public-us-central1"]
  machine_type     = "e2-micro"      # puedes subir a e2-medium si vas a usarlo mucho
  tags             = ["ssh-allowed"] # debe coincidir con el firewall del módulo VPC

  # Opción A: OS Login (recomendado) -> habilita y gestiona acceso con IAM
  enable_os_login = false

  # Opción B: claves SSH directas
  ssh_users = [
    {
      username = "mateo"
      ssh_key  = "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQDrUl+pXlK6MEScScJ7gthus4Zfd7WYuoaxdItL+u6+CJHqz2DTvMdTqL9veJH2IepvWdSPjjRueR0usDQncUcWW9s+FRWOloThwTSQyoHxTmqHyZPIIxKYif4ud7egRyVUwmhykQ66+RbbGRcNnx3g9Ov+qtgu1onVLyRoZ9j2cW5hHQ3HBHQYjxYJlUQ3dvr78zuI4YcvBK+Tg0XWXLrI1JWKdiOcDQvuOgAbLOI602T/Otm2s9yrR77VRaXOtO/92puJi2jqIkm7HFBl0sVUXxw2RK7ZIPIGEQH2i/sV/+lBncF+xHUBPDOFxie54G6yoFHZyGaom3Yiw5dUpx/+ebO0nB3gT1plW2PUD/67ktIe0pHX4jNpzZsl7dVT3g9PaAD5ORgZy7huz8rwjma/JSK2SUsqmg0acDbO1/9nl16E4ZlPQhCCNg2/c4QaxJbFNNZH59khPcvwJcaH0IWSjc8jMZf80jjqz9zTOkslRjYKEuW3nATN9TIjTje02KEzQE4rT2v0O5v+8N6ki5bZAcA3vn9SDdIx8Luyp8omCW1/db2gQiV+9s7VmulJSH+PPW4dZ95mEVQUjsPyABlSPopplYwciidawn9V0nj+swMhc41MhOhRetSJF+7pR3shDnHLhghxeHbt1mawhXnNiwoIQu948aQHC1yPyPKlSw== terraform-ssh-key"
    }
  ]

  # Carga el archivo del script
  startup_script = file("${path.module}/modules/vm_bastion/startup/startup_bastion.sh")
}

module "db" {
  source           = "./modules/vm_db_postgres"
  name             = "db-omega"
  zone             = var.zone
  subnet_self_link = module.vpc.subnets_self_links["subnet-private-us-central1"]
  machine_type     = "e2-small"
  tags             = ["db-allowed"]

  db_name     = "appdb"
  db_user     = "appuser"
  db_password = var.db_password

  ssh_users = [
    {
      username = "mateo"
      ssh_key  = "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQDrUl+pXlK6MEScScJ7gthus4Zfd7WYuoaxdItL+u6+CJHqz2DTvMdTqL9veJH2IepvWdSPjjRueR0usDQncUcWW9s+FRWOloThwTSQyoHxTmqHyZPIIxKYif4ud7egRyVUwmhykQ66+RbbGRcNnx3g9Ov+qtgu1onVLyRoZ9j2cW5hHQ3HBHQYjxYJlUQ3dvr78zuI4YcvBK+Tg0XWXLrI1JWKdiOcDQvuOgAbLOI602T/Otm2s9yrR77VRaXOtO/92puJi2jqIkm7HFBl0sVUXxw2RK7ZIPIGEQH2i/sV/+lBncF+xHUBPDOFxie54G6yoFHZyGaom3Yiw5dUpx/+ebO0nB3gT1plW2PUD/67ktIe0pHX4jNpzZsl7dVT3g9PaAD5ORgZy7huz8rwjma/JSK2SUsqmg0acDbO1/9nl16E4ZlPQhCCNg2/c4QaxJbFNNZH59khPcvwJcaH0IWSjc8jMZf80jjqz9zTOkslRjYKEuW3nATN9TIjTje02KEzQE4rT2v0O5v+8N6ki5bZAcA3vn9SDdIx8Luyp8omCW1/db2gQiV+9s7VmulJSH+PPW4dZ95mEVQUjsPyABlSPopplYwciidawn9V0nj+swMhc41MhOhRetSJF+7pR3shDnHLhghxeHbt1mawhXnNiwoIQu948aQHC1yPyPKlSw== terraform-ssh-key"
    }
  ]
}

resource "null_resource" "upload_sql" {
  triggers = {
    bastion_ip = module.bastion.external_ip
    db_ip      = module.db.internal_ip
    create_md5 = filesha256("../${path.root}/db_scripts/01_create.sql")
    seed_md5   = filesha256("../${path.root}/db_scripts/02_seed.sql")
    drop_md5   = filesha256("../${path.root}/db_scripts/03_drop.sql")
  }

  provisioner "file" {
    source      = "../${path.root}/db_scripts/01_create.sql"
    destination = "/home/mateo/01_create.sql"
    connection {
      type        = "ssh"
      host        = module.bastion.external_ip
      user        = "mateo"
      private_key = file(var.ssh_private_key_path)
      agent       = false
    }
  }

  provisioner "file" {
    source      = "../${path.root}/db_scripts/02_seed.sql"
    destination = "/home/mateo/02_seed.sql"
    connection {
      type        = "ssh"
      host        = module.bastion.external_ip
      user        = "mateo"
      private_key = file(var.ssh_private_key_path)
      agent       = false
    }
  }

  provisioner "file" {
    source      = "../${path.root}/db_scripts/03_drop.sql"
    destination = "/home/mateo/03_drop.sql"
    connection {
      type        = "ssh"
      host        = module.bastion.external_ip
      user        = "mateo"
      private_key = file(var.ssh_private_key_path)
      agent       = false
    }
  }
}

/* resource "null_resource" "run_sql" {
  depends_on = [null_resource.upload_sql]

  triggers = {
    bastion_ip = module.bastion.external_ip
    db_ip      = module.db.internal_ip
  }

  provisioner "remote-exec" {
    inline = [
      "export PGPASSWORD='${var.db_password}'",
      "psql 'host=${module.db.internal_ip} port=5432 user=${var.db_user} dbname=${var.db_name}' -f /home/mateo/01_create.sql",
    ]
    connection {
      type        = "ssh"
      host        = module.bastion.external_ip
      user        = "mateo"
      private_key = file(var.ssh_private_key_path)
      agent       = false
    }
  }
} */

/* resource "null_resource" "drop_db" {
  triggers = {
    bastion_ip = module.bastion.external_ip
    db_ip      = module.db.internal_ip
  }

  provisioner "remote-exec" {
    inline = [
      "export PGPASSWORD='${var.db_password}'",
      "psql 'host=${module.db.internal_ip} port=5432 user=${var.db_user} dbname=${var.db_name}' -f /home/mateo/03_drop.sql"
    ]
    connection {
      type        = "ssh"
      host        = module.bastion.external_ip
      user        = "mateo"
      private_key = file(var.ssh_private_key_path)
      agent       = false
    }
  }
} */
