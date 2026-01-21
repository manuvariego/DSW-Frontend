# Deployment Guide for variego.me

## Overview
This guide explains how to deploy the DSW Frontend (Angular SSR) alongside your existing API on your Google Cloud VM.

## Prerequisites
- Google Cloud VM with your existing API + database in docker-compose
- Domain: variego.me
- SSH access to your VM

---

## Step 1: Configure DNS in Google Cloud

1. Go to [Google Cloud Console > Cloud DNS](https://console.cloud.google.com/networking/dns)
2. Create a new DNS zone:
   - Zone name: `variego-me-zone`
   - DNS name: `variego.me`
3. Add an A record:
   - Name: `@` (or leave blank for root)
   - Type: `A`
   - IPv4 address: `<your-vm-external-ip>`
4. Also add for www:
   - Name: `www`
   - Type: `A`
   - IPv4 address: `<your-vm-external-ip>`
5. Get the **NS records** from the zone and update your domain registrar's nameservers

---

## Step 2: Prepare Files on Your VM

SSH into your VM and create the project structure:

```bash
# SSH into your VM
gcloud compute ssh <your-instance-name> --zone=<your-zone>

# Create project directory
mkdir -p ~/dsw-frontend
cd ~/dsw-frontend

# Create subdirectories
mkdir -p frontend certbot-conf
```

---

## Step 3: Upload Frontend Code to VM

From your local machine:

```bash
# Copy the frontend folder to the VM
gcloud compute scp --recurse DSW-Frontend/ <your-instance-name>:~/dsw-frontend/frontend
```

Or using rsync/scp directly:
```bash
scp -r DSW-Frontend/* user@<vm-ip>:~/dsw-frontend/frontend/
```

---

## Step 4: Update Your docker-compose.yml

Copy the `docker-compose.prod.yml` content to your existing docker-compose.yml on the VM, or merge the services:

Your existing API service should be on the `app-network` network.

Key changes to make:
1. Ensure your API service uses the `app-network` network
2. Add the `frontend`, `nginx`, and `certbot` services

Example merge with your existing setup:

```yaml
services:
  # Your existing API (adjust as needed)
  api:
    # ... your existing configuration ...
    networks:
      - app-network

  # Add frontend
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: frontend
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - PORT=4000
    networks:
      - app-network

  # Add nginx
  nginx:
    image: nginx:alpine
    container_name: nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./certbot-conf:/var/www/certbot:ro
      - ./letsencrypt:/etc/letsencrypt:ro
    networks:
      - app-network
    depends_on:
      - frontend
      - api

networks:
  app-network:
    driver: bridge
    # If your existing network has a different name, use that instead
```

---

## Step 5: Copy nginx.conf

Copy the `nginx.conf` from this project to your VM's `~/dsw-frontend/` directory.

**Important:** First, comment out the HTTPS (443) server block and the redirect in nginx.conf. We'll enable this after SSL is obtained.

---

## Step 6: Initial Deploy (HTTP only)

```bash
cd ~/dsw-frontend

# Build and start all services
docker compose up -d --build

# Check logs
docker compose logs -f frontend
```

At this point, your site should be accessible at `http://variego.me`

---

## Step 7: Obtain SSL Certificate with Let's Encrypt

```bash
# Run certbot to obtain certificate
docker compose run --rm certbot certonly --webroot --webroot-path /var/www/certbot \
  -d variego.me -d www.variego.me --email <your-email> --agree-tos --no-eff-email

# You should see a "Successfully received certificate" message
```

---

## Step 8: Enable HTTPS

1. Uncomment the HTTPS server block in `nginx.conf` (lines 53-90)
2. Uncomment the HTTP to HTTPS redirect in the first server block

```bash
# Edit nginx.conf
nano nginx.conf

# Restart nginx
docker compose restart nginx
```

---

## Step 9: Set Up SSL Auto-Renewal

Create a cron job to renew certificates automatically:

```bash
# Edit crontab
crontab -e

# Add this line to check for renewal daily at 3 AM
0 3 * * * cd ~/dsw-frontend && docker compose run --rm certbot renew && docker compose restart nginx
```

---

## Troubleshooting

### Check if services are running
```bash
docker compose ps
```

### View logs
```bash
docker compose logs frontend
docker compose logs nginx
docker compose logs api
```

### Restart services
```bash
docker compose restart
```

### Rebuild frontend after code changes
```bash
docker compose up -d --build frontend
```

### Check nginx configuration
```bash
docker compose exec nginx nginx -t
```

---

## Directory Structure on VM

```
~/dsw-frontend/
├── docker-compose.yml        # Main compose file
├── nginx.conf                 # Nginx configuration
├── frontend/                  # Angular app
│   ├── Dockerfile
│   ├── package.json
│   ├── src/
│   └── ... (other app files)
├── certbot-conf/             # Created by certbot
└── letsencrypt/              # SSL certificates (created by certbot)
```

---

## What Changed in the Frontend Code

1. **Environment files created**: `src/environments/environment.ts` and `environment.prod.ts`
2. **All services updated**: Now use `${environment.apiUrl}` instead of hardcoded URLs
3. **API URL**: Set to `/api` which works with nginx reverse proxy
