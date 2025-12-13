from invoke import Context, task


@task
def build_frontend(c: Context) -> None:
    """Build the frontend assets."""
    print("Building Frontend...")
    with c.cd("frontend"):
        c.run("npm run build")


@task
def run(c: Context) -> None:
    """Run Home Assistant."""
    print("Starting Home Assistant...")
    c.run("uv run hass -c config")


@task(pre=[build_frontend])
def dev(c: Context) -> None:
    """Build frontend and run Home Assistant."""
    run(c)
