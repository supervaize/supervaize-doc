# RFC-001: Cloud Deployment CLI

Specification for the Supervaizer Cloud Deployment CLI.

## Summary

The Cloud Deployment CLI automates deployment of Supervaizer agents to GCP Cloud Run, AWS App Runner, and DigitalOcean App Platform, with the commands plan, up, down, status, local, and clean. The `up` command builds the image, pushes it to the registry of the platform, and checks the health of the service.

## Documentation

See the [Cloud Deployment Guide](../deploy) for the full user-facing documentation and usage.

## References

- [CLI Reference](../ref/2025_08_CLI.md) – `supervaizer deploy` commands and options
- [Local Testing](../ref/2025_10_LOCAL_TESTING.md) – Docker-based pre-deployment testing
