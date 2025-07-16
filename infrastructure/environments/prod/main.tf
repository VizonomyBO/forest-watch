terraform {
  backend "s3" {
    bucket = "forest-watcher-web.terraform"
    key    = "prod/terraform.tfstate"
    region = "us-east-1"
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "5.82.2"
    }
  }
}

locals {
  client       = "wri"
  project_name = "${local.client}-forest-watcher"
  environment  = "prod"
  name         = "${local.project_name}-${local.environment}"
  domains = ["forestwatcher.globalforestwatch.org", "fw.globalforestwatch.org", "watcher.globalforestwatch.org"]
  tags = {
    client      = local.client
    product     = local.project_name
    Environment = local.environment
  }
}

provider "aws" {
  region = "us-east-1"

  default_tags {
    tags = local.tags
  }
}

module "web" {
  source = "../../modules/web"

  project_name            = local.project_name
  environment             = local.environment
  app_urls                = local.domains
  repo_name               = "forest-watcher/forest-watcher-desktop"
  aws_acm_certificate_arn = "arn:aws:acm:us-east-1:434648646880:certificate/aa62ffe8-30c3-47d4-9aa5-53079c1ee75a"
}


data "aws_route53_zone" "domain_fw" {
  for_each = toset(local.domains)

  name = each.value
}

resource "aws_route53_record" "main" {
  for_each = toset(local.domains)

  zone_id = data.aws_route53_zone.domain_fw[each.key].zone_id
  name    = each.value
  type    = "A"

  alias {
    name                   = module.web.cloudfront_distribution_domain_name
    zone_id                = module.web.cloudfront_distribution_hosted_zone_id
    evaluate_target_health = false
  }
}
