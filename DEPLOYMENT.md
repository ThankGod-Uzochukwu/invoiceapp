# Deployment Guide

This guide provides instructions for deploying the Appwrite Finance Backend API to production.

## Pre-Deployment Checklist

- [ ] All tests passing (`npm test`)
- [ ] Linter checks passing (`npm run lint`)
- [ ] Environment variables configured
- [ ] Appwrite database and collections set up
- [ ] Email function deployed and tested
- [ ] API documentation updated
- [ ] Security review completed

## Deployment Options

### Option 1: Traditional VPS (Recommended for Production)

#### Requirements
- Ubuntu 20.04+ or similar Linux distribution
- Node.js 14+ installed
- nginx or Apache for reverse proxy
- SSL certificate (Let's Encrypt recommended)
- PM2 for process management

#### Steps

1. **Server Setup**

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install nginx
sudo apt install -y nginx
```

2. **Deploy Application**

```bash
# Clone repository
git clone https://github.com/ThankGod-Uzochukwu/invoiceapp.git
cd invoiceapp

# Install dependencies
npm ci --production

# Set up environment variables
cp .env.example .env
nano .env  # Edit with production values
```

3. **Configure PM2**

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'finance-api',
    script: './src/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 4000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
```

Start the application:

```bash
# Create logs directory
mkdir logs

# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Set up PM2 to start on boot
pm2 startup
```

4. **Configure nginx**

Create `/etc/nginx/sites-available/finance-api`:

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Logging
    access_log /var/log/nginx/finance-api-access.log;
    error_log /var/log/nginx/finance-api-error.log;
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/finance-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

5. **Set up SSL with Let's Encrypt**

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d api.yourdomain.com

# Auto-renewal is set up automatically
```

### Option 2: Docker Deployment

#### Create Dockerfile

```dockerfile
# Dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --production

# Copy application files
COPY . .

# Expose port
EXPOSE 4000

# Set environment
ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["node", "src/index.js"]
```

#### Create docker-compose.yml

```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "4000:4000"
    environment:
      - NODE_ENV=production
      - PORT=4000
    env_file:
      - .env
    restart: unless-stopped
    volumes:
      - ./logs:/app/logs
    networks:
      - finance-network

networks:
  finance-network:
    driver: bridge
```

#### Deploy with Docker

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

### Option 3: Platform as a Service (PaaS)

#### Heroku

1. Install Heroku CLI
2. Create Heroku app:
   ```bash
   heroku create finance-api
   ```
3. Set environment variables:
   ```bash
   heroku config:set APPWRITE_PROJECT=your_project_id
   heroku config:set APPWRITE_API_KEY=your_api_key
   # ... set all other variables
   ```
4. Deploy:
   ```bash
   git push heroku main
   ```

#### Railway

1. Connect your GitHub repository
2. Configure environment variables in Railway dashboard
3. Deploy automatically on git push

#### Render

1. Connect GitHub repository
2. Set build command: `npm ci`
3. Set start command: `npm start`
4. Configure environment variables
5. Deploy

### Option 4: Serverless (AWS Lambda)

This requires some modifications to work with serverless architecture. Consider using the Serverless Framework or AWS SAM.

## Environment Configuration

### Production Environment Variables

```env
NODE_ENV=production
PORT=4000

# Appwrite (Production)
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT=prod_project_id
APPWRITE_API_KEY=prod_api_key

APPWRITE_DATABASE_ID=prod_database_id
APPWRITE_COLLECTION_INVOICES_ID=prod_invoices_id
APPWRITE_COLLECTION_VAT_ID=prod_vat_id
APPWRITE_FUNCTION_SEND_EMAIL_ID=prod_function_id

DEFAULT_VAT_RATE=0.075
```

## Security Hardening

### 1. Environment Variables

- Never commit `.env` files
- Use secrets management (AWS Secrets Manager, HashiCorp Vault)
- Rotate API keys regularly

### 2. Rate Limiting

Install express-rate-limit:

```bash
npm install express-rate-limit
```

Add to `src/app.js`:

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});

app.use('/invoices', limiter);
```

### 3. Helmet for Security Headers

```bash
npm install helmet
```

```javascript
const helmet = require('helmet');
app.use(helmet());
```

### 4. CORS Configuration

Configure CORS for specific origins only:

```javascript
const cors = require('cors');

app.use(cors({
  origin: ['https://yourdomain.com', 'https://www.yourdomain.com'],
  credentials: true
}));
```

### 5. Input Validation

Already implemented with Zod schemas. Ensure all endpoints use validation.

## Monitoring and Logging

### 1. Application Monitoring

Recommended tools:
- **New Relic**: Full-stack monitoring
- **DataDog**: Infrastructure and application monitoring
- **Sentry**: Error tracking
- **LogRocket**: Frontend and backend monitoring

### 2. Logging

Use Winston or Pino for structured logging:

```bash
npm install winston
```

```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}
```

### 3. Health Checks

Already implemented at `/health`. Monitor this endpoint with:
- UptimeRobot
- Pingdom
- StatusCake

## Backup Strategy

### 1. Appwrite Backups

- Use Appwrite's built-in backup features
- Schedule regular exports of database collections
- Store backups in separate cloud storage (S3, GCS)

### 2. Code Backups

- Use Git for version control
- Maintain production branch separate from development
- Tag releases for easy rollback

## CI/CD Pipeline

### GitHub Actions (Already Configured)

The project includes a CI workflow at `.github/workflows/ci.yml`.

### Deployment Pipeline

Add to `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to VPS
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /path/to/app
            git pull origin main
            npm ci --production
            pm2 restart finance-api
```

## Rollback Procedure

If issues occur after deployment:

```bash
# Using PM2
pm2 restart finance-api --update-env

# Using Docker
docker-compose down
docker-compose up -d

# Manual rollback
git checkout previous-stable-tag
npm ci --production
pm2 restart finance-api
```

## Performance Optimization

### 1. Enable Compression

```bash
npm install compression
```

```javascript
const compression = require('compression');
app.use(compression());
```

### 2. Caching

Consider Redis for caching:
- VAT rates
- User sessions
- Frequently accessed data

### 3. Database Optimization

- Create proper indexes in Appwrite
- Use query limits and pagination
- Monitor slow queries

### 4. Load Balancing

For high traffic, use:
- nginx load balancer
- AWS Application Load Balancer
- Kubernetes with horizontal pod autoscaling

## Troubleshooting

### Issue: Application won't start

Check:
- Environment variables are set correctly
- Port is not already in use
- Appwrite credentials are valid
- Node.js version is compatible

### Issue: 502 Bad Gateway

Check:
- Application is running (`pm2 status`)
- Port configuration in nginx matches app
- Firewall allows traffic on required ports

### Issue: High memory usage

Check:
- Memory leaks in application
- Too many PM2 instances
- Logging too verbose

## Support and Maintenance

### Regular Tasks

- [ ] Monitor error logs daily
- [ ] Review security updates weekly
- [ ] Update dependencies monthly
- [ ] Backup database weekly
- [ ] Review performance metrics weekly
- [ ] Rotate API keys quarterly

### Emergency Contacts

- DevOps Team: devops@example.com
- Backend Team: backend@example.com
- On-call: +1-XXX-XXX-XXXX

## Additional Resources

- [Appwrite Documentation](https://appwrite.io/docs)
- [Node.js Production Best Practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)
- [nginx Documentation](https://nginx.org/en/docs/)
- [PM2 Documentation](https://pm2.keymetrics.io/)

---

**Need help with deployment? Contact the team or open an issue on GitHub.**
