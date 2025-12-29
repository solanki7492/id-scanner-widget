# Document Scanner B2B SaaS Platform

A production-ready Laravel-based document scanning and OCR extraction SaaS platform with complete multi-tenancy, GDPR compliance, and enterprise features.

## Quick Start

```bash
# 1. Install dependencies
composer install
npm install

# 2. Configure environment
cp .env.example .env
php artisan key:generate

# 3. Setup database
php artisan migrate

# 4. Build assets
npm run build

# 5. Start queue workers
php artisan horizon

# 6. Start development server
php artisan serve
```

## Features

### Core Functionality
- **REST API v1** - Document upload, retrieval, and management
- **OCR Processing** - Google Vision API integration
- **Multi-tenancy** - Complete data isolation per tenant
- **Encrypted Storage** - AES-256 encryption for all documents
- **Webhook System** - Real-time notifications with retry logic
- **Audit Logging** - Complete audit trail of all actions

### Client Portal
- Dashboard with statistics
- API key management
- Webhook configuration
- Document browsing and search
- Audit log viewer
- GDPR data export/deletion
- Settings management

### Security & Compliance
- API token authentication
- Rate limiting per tenant
- GDPR-compliant data retention
- Automated data purging
- Complete audit logging
- Encrypted storage (S3)
- Signed temporary URLs

### Technical Stack
- **Backend:** Laravel 11, PHP 8.2+
- **Database:** MySQL/PostgreSQL
- **Queue:** Redis + Horizon
- **Storage:** S3-compatible
- **OCR:** Google Cloud Vision API
- **Frontend:** Blade + Tailwind CSS

## Documentation

- **[Full System Documentation](README-SYSTEM-DOCS.md)** - Complete guide with API docs, deployment, troubleshooting
- **[Data Processing Agreement](DPA-TEMPLATE.md)** - GDPR-compliant DPA template

## Requirements

- PHP 8.2 or higher
- MySQL 8.0+ or PostgreSQL 13+
- Redis 6.0+
- Composer 2.x
- Node.js 18+ & NPM
- S3-compatible storage
- Google Cloud Vision API credentials

## Required Dependencies

Add these to your composer.json:

```json
{
    "require": {
        "google/cloud-vision": "^1.7",
        "intervention/image": "^3.0",
        "laravel/horizon": "^5.21"
    }
}
```

Then run: `composer require google/cloud-vision intervention/image laravel/horizon`

## Configuration

### Required Environment Variables

```env
# Database
DB_CONNECTION=mysql
DB_DATABASE=document_scanner
DB_USERNAME=your_username
DB_PASSWORD=your_password

# Redis  
REDIS_HOST=127.0.0.1
QUEUE_CONNECTION=redis

# S3 Storage
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_BUCKET=your_bucket_name

# Google Vision API
GOOGLE_VISION_CREDENTIALS_PATH=/path/to/credentials.json
```

## API Endpoints

### Authentication
All requests require `Authorization: Bearer {api_key}` header.

### Documents
- `POST /api/v1/documents` - Upload document
- `GET /api/v1/documents/{id}` - Get document details
- `GET /api/v1/documents` - List documents

### Webhooks
- `POST /api/v1/webhooks` - Register webhook
- `GET /api/v1/webhooks` - List webhooks
- `PUT /api/v1/webhooks/{id}` - Update webhook
- `DELETE /api/v1/webhooks/{id}` - Delete webhook

### Audit
- `GET /api/v1/audit` - Get audit logs
- `GET /api/v1/audit/{documentId}` - Get document audit trail

For complete API documentation, see [README-SYSTEM-DOCS.md](README-SYSTEM-DOCS.md)

## License

[Your License Here]

---

**Version:** 1.0.0  
**Last Updated:** December 27, 2025
