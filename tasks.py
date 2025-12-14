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
    print("Stopping existing Home Assistant instances...")
    # Kill any existing hass process running with our config
    # warn=True prevents failure if no process is found
    c.run("pkill -f 'hass -c config'", warn=True)

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


@task
def setup_demo(c: Context) -> None:
    """Re-initialize the demo registries (Areas, Entities, Helpers)."""
    print("Setting up Demo Registries...")
    c.run("python3 tools/setup_demo_registries.py")
