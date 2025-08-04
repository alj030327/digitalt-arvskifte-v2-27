# Deployment & Load Balancing Guide

## Overview

This guide covers CI/CD setup and load balancing implementation for the Digital Arvsskifte application. The infrastructure is designed to be scalable, secure, and production-ready.

## 🚀 CI/CD Pipeline

### GitHub Actions Workflow

The CI/CD pipeline automatically:
- ✅ Runs tests and linting on every push/PR
- 🔒 Performs security scans
- 🐳 Builds and pushes Docker images
- 🚀 Deploys to staging/production environments

#### Setup Requirements

1. **GitHub Repository Setup**
   ```bash
   # Enable GitHub Container Registry
   # Go to Settings > Developer settings > Personal access tokens
   # Create token with packages:write permission
   ```

2. **Secrets Configuration**
   Add these secrets to your GitHub repository:
   ```
   GITHUB_TOKEN (automatically provided)
   KUBECONFIG (for Kubernetes deployment)
   DOCKER_USERNAME (if using custom registry)
   DOCKER_PASSWORD (if using custom registry)
   ```

### Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint
```

## 🐳 Docker Containerization

### Multi-stage Build

The Dockerfile uses a multi-stage build process:
1. **Builder stage**: Installs dependencies and builds the app
2. **Production stage**: Serves the app with optimized Nginx

### Building and Running

```bash
# Build the image
docker build -t digital-arvsskifte .

# Run single container
docker run -p 8080:8080 digital-arvsskifte

# Run with Docker Compose (includes load balancing)
docker-compose up -d
```

## ⚖️ Load Balancing

### Docker Compose Setup

The `docker-compose.yml` file provides:
- 3 application instances (app, app-2, app-3)
- Nginx load balancer with SSL termination
- Health checks and automatic failover
- Rate limiting and security headers

### Load Balancing Features

- **Algorithm**: Least connections
- **Health Checks**: Automatic detection of unhealthy instances
- **SSL Termination**: Centralized SSL handling
- **Rate Limiting**: Protection against abuse
- **Session Persistence**: Sticky sessions if needed

### Configuration

```nginx
upstream app_backend {
    least_conn;
    server app:8080 max_fails=3 fail_timeout=30s;
    server app-2:8080 max_fails=3 fail_timeout=30s;
    server app-3:8080 max_fails=3 fail_timeout=30s;
}
```

## ☸️ Kubernetes Deployment

### Prerequisites

- Kubernetes cluster (v1.20+)
- kubectl configured
- NGINX Ingress Controller
- cert-manager for SSL certificates

### Deployment Steps

1. **Create namespace**
   ```bash
   kubectl apply -f k8s/namespace.yaml
   ```

2. **Deploy application**
   ```bash
   kubectl apply -f k8s/deployment.yaml
   kubectl apply -f k8s/service.yaml
   ```

3. **Configure ingress and SSL**
   ```bash
   # Update domain in ingress.yaml
   kubectl apply -f k8s/ingress.yaml
   ```

4. **Enable auto-scaling**
   ```bash
   kubectl apply -f k8s/hpa.yaml
   ```

### Kubernetes Features

- **Auto-scaling**: HPA scales pods based on CPU/memory usage
- **Rolling updates**: Zero-downtime deployments
- **Health checks**: Liveness and readiness probes
- **Resource limits**: Prevents resource exhaustion
- **Security**: Non-root user, dropped capabilities

### Monitoring

```bash
# Check deployment status
kubectl get pods -n digital-arvsskifte

# Check auto-scaling
kubectl get hpa -n digital-arvsskifte

# View logs
kubectl logs -f deployment/digital-arvsskifte-app -n digital-arvsskifte

# Check ingress
kubectl get ingress -n digital-arvsskifte
```

## 🛠️ For Potential Buyers

### Quick Setup for Load Balancing

1. **Docker Compose (Recommended for small-medium scale)**
   ```bash
   # Clone repository
   git clone <repository-url>
   cd digital-arvsskifte
   
   # Update SSL certificates in load-balancer/ssl/
   # Update domain in load-balancer/nginx.conf
   
   # Start with load balancing
   docker-compose up -d
   ```

2. **Kubernetes (Recommended for enterprise scale)**
   ```bash
   # Update domain in k8s/ingress.yaml
   # Configure your cluster
   kubectl apply -f k8s/
   ```

### Scaling Options

- **Horizontal**: Add more container instances
- **Vertical**: Increase container resources
- **Geographic**: Deploy in multiple regions
- **CDN**: Add CloudFlare, AWS CloudFront, etc.

### Cloud Provider Integration

#### AWS
- Use ECS/EKS for container orchestration
- ALB for load balancing
- Route 53 for DNS
- CloudFront for CDN

#### Google Cloud
- Use GKE for Kubernetes
- Cloud Load Balancing
- Cloud CDN
- Cloud DNS

#### Azure
- Use AKS for Kubernetes
- Application Gateway
- Azure CDN
- Azure DNS

### Cost Optimization

- Use spot instances for non-critical workloads
- Implement proper auto-scaling policies
- Use CDN for static asset delivery
- Optimize Docker image sizes

## 🔒 Security Considerations

### Application Security
- HTTPS enforcement
- Security headers (HSTS, CSP, XSS protection)
- Rate limiting
- Input validation

### Infrastructure Security
- Non-root containers
- Resource limits
- Network policies
- Secret management

### Monitoring & Alerts
- Health check endpoints
- Application metrics
- Log aggregation
- Error tracking

## 📊 Performance Optimization

### Frontend Optimizations
- Bundle splitting
- Lazy loading
- Image optimization
- Compression (gzip/brotli)

### Infrastructure Optimizations
- CDN integration
- Caching strategies
- Database connection pooling
- Load balancer tuning

## 🆘 Troubleshooting

### Common Issues

1. **Container fails to start**
   ```bash
   docker logs <container-id>
   ```

2. **Load balancer not distributing traffic**
   ```bash
   # Check upstream servers
   curl http://localhost/lb-health
   ```

3. **Kubernetes pods not ready**
   ```bash
   kubectl describe pod <pod-name> -n digital-arvsskifte
   ```

### Health Endpoints

- Application: `http://localhost:8080/health`
- Load balancer: `http://localhost/lb-health`

## 📞 Support

For deployment support and customization:
- Create GitHub issues for bugs
- Contact development team for custom implementations
- Review logs and monitoring dashboards first

## 🗺️ Roadmap

- [ ] Terraform/CloudFormation templates
- [ ] Prometheus/Grafana monitoring
- [ ] ELK stack for logging
- [ ] Multi-region deployment guide
- [ ] Database clustering guide
- [ ] Advanced security hardening