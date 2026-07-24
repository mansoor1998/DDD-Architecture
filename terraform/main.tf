terraform {
  required_providers {
    linode = {
      source  = "linode/linode"
      version = "~> 2.16" # Always good to pin a minimum version
    }
  }
}

# Configure the Linode Provider
provider "linode" {
  token = ""
}

# Create the Dedicated 4GB instance
resource "linode_instance" "fastapi_backend" {
  label     = "fastapi-prod-server"
  region    = "eu-central"
  type      = "g6-dedicated-2"
  image     = "linode/ubuntu24.04"
  
  # Set the root password so you can log in
  root_pass = ""
}

# Output the IP address so you know how to connect to it
output "server_ip_address" {
  value = linode_instance.fastapi_backend.ip_address
}