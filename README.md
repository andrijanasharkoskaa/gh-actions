# Blue-Green Deployment Demo

This repository contains a minimal Blue-Green deployment setup with:
- static blue and green application pages
- an Nginx reverse proxy that switches traffic between the two environments
- a Docker Compose stack for the blue/green app containers and the proxy

## Switching between Blue and Green

The traffic target is controlled directly in [devops-infra/nginx/nginx.conf](devops-infra/nginx/nginx.conf).

- To route traffic to Blue, keep the blue upstream line active and leave the green line commented.
- To route traffic to Green, comment the blue line and uncomment the green line.

Example:

```nginx
upstream app {
    server blue-app:80;
    # server green-app:80;
}
```

To switch to Green, change it to:

```nginx
upstream app {
    # server blue-app:80;
    server green-app:80;
}
```
