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


@task
def test(c: Context) -> None:
    """Run tests."""
    print("Running Tests...")
    c.run("uv run pytest")


@task
def test_cov(c: Context) -> None:
    """Run tests with coverage."""
    print("Running Tests with Coverage...")
    c.run("uv run pytest --cov=custom_components.climate_dashboard --cov-report=term-missing")


@task(pre=[build_frontend])
def dev(c: Context) -> None:
    """Build frontend and run Home Assistant."""
    run(c)
