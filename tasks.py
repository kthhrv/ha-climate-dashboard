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
    import time

    print("Stopping existing Home Assistant instances...")
    # Kill any existing hass process running with our config
    c.run("pkill -f 'hass -c config'", warn=True)

    # Wait for process to die
    print("Waiting for shutdown...", end="", flush=True)
    for _ in range(20):  # Wait up to 10 seconds
        # Check if process exists
        result = c.run("pgrep -f 'hass -c config'", warn=True, hide=True)
        if result.failed:
            print(" Done.")
            break
        print(".", end="", flush=True)
        time.sleep(0.5)
    else:
        print("\nWarning: Home Assistant did not stop in time. Starting anyway...")

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


@task
def check_mqtt(c: Context) -> None:
    """Ensure MQTT broker is running."""
    print("Checking MQTT Broker...")

    # Check if container exists
    result = c.run("docker ps -a --filter 'name=mqtt-broker' --format '{{.Status}}'", hide=True, warn=True)
    status = result.stdout.strip()

    if not status:
        print("MQTT Broker not found. Starting new container...")
        c.run(
            "docker run -d -p 1883:1883 --name mqtt-broker "
            "-v /home/keith/ws/ha-climate-dashboard/tools/mosquitto.conf:/mosquitto/config/mosquitto.conf "
            "eclipse-mosquitto"
        )
    elif "Up" not in status:
        print("MQTT Broker is stopped. Starting...")
        c.run("docker start mqtt-broker")
    else:
        print("MQTT Broker is running.")


@task(pre=[check_mqtt, build_frontend])
def dev(c: Context) -> None:
    """Build frontend and run Home Assistant."""
    run(c)


@task
def setup_demo(c: Context) -> None:
    """Re-initialize the demo registries (Areas, Entities, Helpers)."""
    print("Setting up Demo Registries...")
    c.run("python3 tools/setup_demo_registries.py")
