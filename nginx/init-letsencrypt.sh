#!/bin/bash
# One-time setup: issue the Let's Encrypt certificate for the domain.
# Run this on the VPS from the repo root (the same dir as docker-compose.yml).
#
# Before running, edit the two variables below:
#   - DOMAIN: your production domain
#   - EMAIL:  a real email for expiry/renewal notices

set -e

DOMAIN="aidocs.lumoslogic.com"
EMAIL=""                 # TODO: set a real email (or leave empty to skip)
STAGING=0                # set to 1 to test against Let's Encrypt staging

data_path="./certbot"
rsa_key_size=4096

if [ -d "$data_path/conf/live/$DOMAIN" ]; then
  echo "Certificate already exists for $DOMAIN. Skipping."
  exit 0
fi

echo "### Creating dummy certificate so nginx can start ..."
mkdir -p "$data_path/conf/live/$DOMAIN"
docker compose run --rm --entrypoint "\
  openssl req -x509 -nodes -newkey rsa:$rsa_key_size -days 1 \
    -keyout '/etc/letsencrypt/live/$DOMAIN/privkey.pem' \
    -out '/etc/letsencrypt/live/$DOMAIN/fullchain.pem' \
    -subj '/CN=localhost'" certbot
echo

echo "### Starting nginx ..."
docker compose up --force-recreate -d nginx
echo

echo "### Deleting dummy certificate ..."
docker compose run --rm --entrypoint "\
  rm -Rf /etc/letsencrypt/live/$DOMAIN && \
  rm -Rf /etc/letsencrypt/archive/$DOMAIN && \
  rm -Rf /etc/letsencrypt/renewal/$DOMAIN.conf" certbot
echo

echo "### Requesting Let's Encrypt certificate ..."
if [ -n "$EMAIL" ]; then
  email_arg="--email $EMAIL"
else
  email_arg="--register-unsafely-without-email"
fi
staging_arg=""
if [ "$STAGING" != "0" ]; then staging_arg="--staging"; fi

docker compose run --rm --entrypoint "\
  certbot certonly --webroot -w /var/www/certbot \
    $staging_arg $email_arg -d $DOMAIN \
    --rsa-key-size $rsa_key_size \
    --agree-tos --force-renewal" certbot
echo

echo "### Reloading nginx ..."
docker compose exec nginx nginx -s reload

echo "### Done. Verify with: curl -I https://$DOMAIN"
