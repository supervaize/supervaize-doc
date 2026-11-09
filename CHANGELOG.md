# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

# TODO

- document public supervaize API

## [Unreleased]

### Added

- Agent-first entry points: the quickstart opens with the Supervaizer integration skill, each controller guide has a skill tip with a ready prompt, and `/llms.txt` indexes the guides for coding agents.
- Controller guides for Supervaizer v2: parameters, human in the loop, shared resources, cost reporting, guardrail controls, Job Configurator, job and mission analytics.
- Controller guide sections: agent introduction and full description, scheduled start, guided setup, mission context, billable consumption receipts, Studio-stored artifacts.
- Reference pages from the SDK in the sidebar: v2 contract, workspace agent grants, guided setup contract, scheduled start, billable consumption, parameter validation, changelog.
- Studio pages: rule applicability and optional rules, testing and production mode of a job, agent pause, job token usage, tags, schedules.

### Changed

- Cloud deployment guide: rewritten from the current `supervaizer deploy` code.
- Studio pages rewritten from the current interface: agents, cases, context, ratings, notifications and Slack, platform overview.
- The `ref/` pages keep the SDK file names (`2025_08_CLI`, `2025_08_REST_API`, `2026_05_PROTOCOLS`, `2025_08_PERSISTENCE`, `2025_08_ADMIN_README`). The old addresses without the date prefix no longer exist.
- The public address of a controller is `SUPERVAIZER_PUBLIC_URL`. The admin interface is at `/manage`.
- GitHub links point to the `supervaize` organization for the SDK, Hello World and this repository.

### Removed

- v1 pages: application flow control, dynamic choices, API reference.
- The Claude Code skill page of the Skills Cookbook section. The Supervaizer Integration page replaces it.
- Stale copies in `ref/`: `DATA_RESOURCES`, `LOCAL_TESTING`, `PARAMETER_VALIDATION_IMPLEMENTATION`, and the copies without a date prefix.

## [0.4.2]

### Changed

- Sidebar configuration and integrations documentation with detailed usage and improved clarity.
- Skills documentation with installation instructions and improved descriptions.
- New categories and skills in sidebars configuration.

[Unreleased]: https://github.com/supervaize/supervaize-doc/compare/main...HEAD
[0.4.2]: https://github.com/supervaize/supervaize-doc/compare/v0.4.1...v0.4.2
