---
title: Choose a host for your agent
sidebar_label: Choose a host
sidebar_position: 4
description: The criteria that keep an agent running in production, and the hosting options.
---

# Choose a host for your agent

**Supervaize does not host your agent**: it runs on your side, on the account of the host you choose, which bills you for hosting. Studio drives it remotely through its public address. This page helps you choose where to host it.

## The criteria that matter

| Criterion | Why |
|---|---|
| **Always on** | An agent that goes to sleep stops answering: Studio shows it as offline. |
| **Work continues after the response** | A long job runs in the background, after the agent has answered Studio. Some platforms cut the CPU between requests, and the job freezes. |
| **A single instance**, if the agent keeps job state in memory | With several copies of the agent, `job.sync` may hit a copy that does not know the job. |
| **A persistent disk**, if the agent keeps files | On many platforms, written files are erased at every redeploy or restart. |
| **A fixed public HTTPS address** | This is what you set in `SUPERVAIZER_PUBLIC_URL`. |
| **The region** | If your customers are in Europe, a European region makes GDPR simpler. |

## The options

### To start: Render

Render deploys a GitHub repository in a few clicks, and it is the method described in step 8 of the [express guide](./express-guide): a Python **Web Service**, the start command `SUPERVAIZER_PORT=$PORT python supervaizer_control.py`, your variables under **Environment**, plus `SUPERVAIZER_PUBLIC_URL` with the `.onrender.com` address.

- Choose a paid plan: free web services spin down after 15 minutes without traffic and take about a minute to wake up, and they have no persistent disk. Paid instances do not spin down and accept a persistent disk. See [Deploy for Free](https://render.com/docs/free).
- Choose the Frankfurt region if your customers are in Europe.

### Other simple platforms

**Railway** works the same way: set the same variables and the same start command. Its "Serverless" mode puts the service to sleep; keep it off for an agent. [Volumes](https://docs.railway.com/volumes) provide a persistent disk.

### The major clouds

Google Cloud Run, AWS App Runner or DigitalOcean App Platform also work, deploying the agent as a Python or Docker app. Supervaizer offers a `supervaizer deploy` command that automates this deployment; it is being finalized (see [Cloud Deployment](/docs/supervaizer-controller/deploy)).

:::caution[Google Cloud Run and background work]
By default, Cloud Run only allocates CPU while it processes a request: work started after the response freezes. For an agent that runs long jobs, switch the service to instance-based billing and keep at least one instance running:

```bash
gcloud run services update SERVICE-NAME --no-cpu-throttling --min-instances=1
```

You then pay for the instance continuously. See Google's documentation on [Cloud Run billing settings](https://docs.cloud.google.com/run/docs/configuring/cpu-allocation).
:::

For AWS App Runner and DigitalOcean, check in their documentation that the service stays on and keeps CPU between requests.

### A rented server

A virtual private server (VPS) from a European host such as Scaleway, OVH or Hetzner gives you full control, and your data stays in Europe. In exchange, you handle system updates, the HTTPS certificate (with a web server in front) and restarting the agent automatically (with Docker or a system service).

## Tips

- **Test the chosen setup with a real long job** before opening it to customers: that is where sleeping and CPU throttling show up.
- **Set `SUPERVAIZER_SERVER_ID`** in the host's variables, so you get the same agent back after each redeploy.
- **Point the agent's working folder to the persistent disk** (for example with a `DATA_DIR` variable).
- **Point an alert at `/.well-known/health`**: most hosts and monitoring tools can do it.
- **Start small**: an agent that orchestrates AI calls rarely needs much memory or CPU.

*Checked in November 2026: hosting offers change, check their current terms.*
