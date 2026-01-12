---
title: '015: Traefik IngressRoute for Service Routing'
---

[[_TOC_]]

## Status

Proposed

## Context

Our microservices architecture (see [ADR 003](home/ADRs/003-Adoption-of-Microservice-Architecture)) requires a robust ingress solution to route external traffic to internal services. As defined in [ADR 009](home/ADRs/009-API-Gateway-for-External-Traffic-Only), all external traffic must pass through an API Gateway. We need a concrete implementation mechanism for this routing layer.

K3s, our Kubernetes distribution, ships with Traefik as the default ingress controller. Traefik provides a Kubernetes-native solution for HTTP/HTTPS routing, middleware application, and traffic management. However, we must decide:
1. Whether to use the k3s-bundled Traefik or deploy a separate ingress controller
2. How to configure routing rules (Kubernetes Ingress resources vs. Traefik IngressRoute CRDs)
3. Who is responsible for defining and maintaining routing rules
4. How authentication and authorization middleware should be applied

The Traefik IngressRoute CRD (`traefik.io/v1alpha1`) offers more advanced features than standard Kubernetes Ingress resources, including fine-grained middleware control, TCP/UDP routing, and direct integration with Traefik-specific features.

## Decision

We will use the k3s native Traefik ingress controller and configure all HTTP routing through Traefik IngressRoute resources (`traefik.io/v1alpha1`).

- **Use k3s native Traefik**: We will use the Traefik instance that comes pre-installed with k3s rather than deploying a separate ingress controller
- **IngressRoute CRDs for routing**: All services must define their external routes using Traefik IngressRoute custom resources, not standard Kubernetes Ingress resources
- **Decentralized route management**: Each service is responsible for defining and maintaining its own IngressRoute resources, including path rules and host-based routing
- **Hybrid middleware approach**:
  - **Global baseline middlewares**: Critical security middlewares (rate limiting, security headers, basic validation) will be configured at the Traefik entryPoint level and automatically applied to all routes
  - **Service-specific middlewares**: Each service must still explicitly apply authentication and authorization middleware in their IngressRoute definitions for service-specific security requirements
- **Middleware reusability**: Common middleware (authentication, authorization, rate limiting) can be defined as shared Traefik Middleware resources, but services must explicitly reference and apply them
- **Path conflict resolution**: Services must coordinate to avoid path conflicts. When conflicts arise, they must be resolved through team communication and documentation updates

Example IngressRoute structure:
```yaml
apiVersion: traefik.io/v1alpha1
kind: IngressRoute
metadata:
  name: <your service name>
spec:
  entryPoints:
    - websecure  # Global middlewares automatically applied here
  routes:
    - match: PathPrefix(`<your service prefix>`)
      kind: Rule
      middlewares:
        - name: <auth-chain/jwt-auth/(or remove middleware completely)>  # Service-specific authentication
      services:
        - name: <name of your k8s service>
          port: <port of that service>
  tls:
    secretName: studyfai-de-tls
```

Example global middleware configuration (in Traefik static configuration):
```yaml
# HelmChartConfig for k3s Traefik or Traefik values.yaml
entryPoints:
  websecure:
    address: ":443"
    http:
      middlewares:
        - rate-limit-global@kubernetescrd
        - security-headers@kubernetescrd
```

## Consequences

### Positive
- **Native integration**: Using k3s-bundled Traefik eliminates additional installation and management overhead
- **Advanced routing features**: IngressRoute CRDs provide more flexibility than standard Ingress resources (TCP/UDP routing, middleware chains, traffic mirroring)
- **Service autonomy**: Teams can independently manage routing rules without waiting for centralized configuration changes
- **Layered security approach**: Global middlewares provide a baseline security safety net, while service-specific middlewares handle authentication/authorization
- **Protection against misconfiguration**: Global middlewares ensure critical security policies (rate limiting, headers) are always applied, even if a service forgets
- **Middleware reusability**: Shared Middleware resources can be defined once and referenced by multiple services
- **GitOps-friendly**: IngressRoute definitions can be version-controlled alongside service deployments

### Negative
- **Decentralized authentication responsibility**: Each service must correctly configure authentication and authorization middleware; global middlewares only cover baseline security
- **Limited flexibility for public endpoints**: Services needing truly public endpoints (without global middlewares) require explicit bypass mechanisms or separate entryPoints
- **Path conflict management**: No automatic detection of conflicting path rules; teams must manually coordinate to avoid routing conflicts
- **Learning curve**: Developers must learn Traefik-specific CRDs rather than standard Kubernetes Ingress resources
- **Traefik coupling**: Using Traefik-specific CRDs creates vendor lock-in; migrating to a different ingress controller would require rewriting all routing definitions
- **Two-level middleware management**: Global middlewares configured in Traefik static config, service-specific middlewares in IngressRoutes; requires understanding both configuration layers
- **Debugging complexity**: Troubleshooting routing issues requires understanding both Kubernetes service networking and Traefik IngressRoute semantics, plus the interaction between global and service-specific middlewares

### Related ADRs
- **[ADR 009](home/ADRs/009-API-Gateway-for-External-Traffic-Only)**: This ADR implements the routing layer for external traffic described in ADR 009
- **[ADR 010](home/ADRs/010-Pseudo-ID-Injection-via-Custom-Header)**: Authentication middleware configured in IngressRoutes must inject the `X-User-Pseudo-ID` header
- **[ADR 003](home/ADRs/003-Adoption-of-Microservice-Architecture)**: Provides the architectural context for independent service routing

### Mitigation Strategies
To address the negative consequences, we recommend:
1. **Configure global baseline middlewares** at the Traefik entryPoint level for rate limiting, security headers, and other universal security policies
2. **Create separate entryPoints** for truly public endpoints that need to bypass global middlewares (e.g., health checks, public APIs)
3. **Create shared middleware templates** for common authentication/authorization patterns that services can reference
4. **Establish a routing registry** documenting all service paths to detect conflicts early
5. **Include IngressRoute validation** in CI/CD pipelines to catch missing middleware or path conflicts
6. **Provide service templates** with pre-configured IngressRoute examples including required middleware
7. **Document the middleware layering** clearly so developers understand which security policies are global vs service-specific
8. **Regular security audits** of both global Traefik configuration and IngressRoute configurations to ensure proper middleware application