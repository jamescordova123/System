# Production Deployment & Setup Guide

This guide details the steps required to deploy and configure **Laravel Reverb (WebSockets)**, **Laravel Scout (Database Driver)**, and the **React Vite** frontend assets securely in a production environment.

---

## 1. Environment Configuration (`.env`)

Configure your production environment variables. Replace placeholders with your actual domain credentials:

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://yourdomain.com

# ---------------------------------------------------------
# Laravel Scout Configuration (Database Driver)
# ---------------------------------------------------------
SCOUT_DRIVER=database
# Queue the indexing operations in production to avoid slowing down user requests
SCOUT_QUEUE=true
QUEUE_CONNECTION=redis # or database (ensure your queue worker is running)

# ---------------------------------------------------------
# Laravel Reverb Configuration
# ---------------------------------------------------------
BROADCAST_CONNECTION=reverb

REVERB_APP_ID=749916
REVERB_APP_KEY=gu2hggupyeihilhbvkbs
REVERB_APP_SECRET=o8kgnckyf4vmfu8nvti9

# The host and port where clients connect externally (WSS/HTTPS)
REVERB_HOST="yourdomain.com" # or ws.yourdomain.com
REVERB_PORT=443
REVERB_SCHEME=https

# The host and port Reverb binds to internally
REVERB_SERVER_HOST=127.0.0.1
REVERB_SERVER_PORT=8080

# Frontend variables (copied exactly to be readable by Vite build)
VITE_REVERB_APP_KEY="${REVERB_APP_KEY}"
VITE_REVERB_HOST="${REVERB_HOST}"
VITE_REVERB_PORT="${REVERB_PORT}"
VITE_REVERB_SCHEME="${REVERB_SCHEME}"
```

---

## 2. Nginx Reverse Proxy (SSL Termination)

In production, you should **never** expose port `8080` directly to the public internet. Instead, configure Nginx to listen on port `443` (HTTPS) and proxy requests to your internal Reverb server running on `127.0.0.1:8080`.

Below are the two recommended approaches.

### Option A: Dedicated Subdomain (Recommended)
Create a subdomain (e.g. `ws.yourdomain.com`) dedicated exclusively to WebSockets:

```nginx
server {
    listen 443 ssl;
    listen [::]:443 ssl;
    server_name ws.yourdomain.com;

    # SSL Certificates (Let's Encrypt / Certbot)
    ssl_certificate /etc/letsencrypt/live/ws.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ws.yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        
        # Enable WebSockets proxying
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        
        # Standard headers
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded-for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        proxy_read_timeout 60s;
        proxy_send_timeout 60s;
    }
}
```

### Option B: Path-based Routing (Single Domain)
If you want to run both the main app and websockets under a single domain (e.g. `yourdomain.com`), route `/app` paths (used by Pusher/Reverb) to port `8080`:

```nginx
server {
    listen 443 ssl;
    server_name yourdomain.com;

    # SSL configuration
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Root application config
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    # Proxy WebSocket connections for Laravel Reverb
    location /app {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded-for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 3. Daemonizing the Reverb Process (Supervisor)

To keep the Reverb server running continuously in the background, you must configure a process manager like **Supervisor** to automatically launch and restart `php artisan reverb:start`.

Create a new supervisor configuration file:

```bash
sudo nano /etc/supervisor/conf.d/laravel-reverb.conf
```

Add the following configuration:

```ini
[program:laravel-reverb]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/your-app/artisan reverb:start --host=127.0.0.1 --port=8080
autostart=true
autorestart=true
user=www-data
redirect_stderr=true
stdout_logfile=/var/www/your-app/storage/logs/reverb.log
stopasgroup=true
killasgroup=true
```

Update Supervisor to read and start the new process:

```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start laravel-reverb:*
```

---

## 4. Database Optimization for Scout

Because the native database driver uses `LIKE` queries, it does full table scans unless the columns are properly indexed. 

1. **Verify Database Indexes:** Ensure you have indexes on your searchable columns (e.g., `name` and `email` for the `users` table). If they are missing, create a migration:
   ```bash
   php artisan make:migration add_indexes_to_users_table
   ```
   Define the indexes in your migration:
   ```php
   public function up(): void
   {
       Schema::table('users', function (Blueprint $table) {
           $table->index('name');
           $table->index('email');
       });
   }
   ```
   Run the migration:
   ```bash
   php artisan migrate
   ```

2. **Configure Queue Worker:** Since `SCOUT_QUEUE=true` is enabled in production to ensure search indices sync asynchronously in the background, configure **Supervisor** to manage queue workers running `php artisan queue:work`.

---

## 5. Building Frontend Assets (Vite)

In production, **Vite is never run as a dev server (no `npm run dev` and no dev port `5173` is exposed)**. Instead, you build static files that Laravel serves securely.

1. **Build the Assets:** Run this command on your build or deploy server:
   ```bash
   npm run build
   ```
2. **Output:** The compilation bundles HTML, CSS, and JS into `public/build/`. It generates a `manifest.json` file.
3. **Serving:** Laravel’s `@vite` directive automatically reads the manifest and serves these secure static files. There are no WebSocket connection attempts to port `5173` in production.

---

## 6. Troubleshooting Checklist

* **Config Cache:** After updating `.env` files in production, always clear the configuration cache:
  ```bash
  php artisan config:clear
  ```
* **Firewall Rules:** Ensure your server firewall allows port `80` (HTTP) and `443` (HTTPS). Internal port `8080` (Reverb) should **remain blocked** from external connections.
* **WSS Protocol Handshake Failed:** If you see this in the browser console, ensure Nginx headers `Upgrade` and `Connection` are correctly defined in your server block.
