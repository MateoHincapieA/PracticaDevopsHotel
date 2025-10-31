terraform {
  backend "gcs" {
    bucket = "terraform-state-omega-mh-2025"
    prefix = "env/dev"
  }
}