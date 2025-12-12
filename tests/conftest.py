"""Global fixtures for Climate Dashboard integration."""

from collections.abc import Generator
from typing import Any

import pytest


# This fixture enables loading custom integrations in all tests.
# It is required for pytest-homeassistant-custom-component to work with custom_components
@pytest.fixture(autouse=True)
def auto_enable_custom_integrations(enable_custom_integrations: Any) -> Generator:
    """Enable custom integrations defined in the test dir."""
    yield
