"""Test Heating Circuit Lifecycle (Dynamic Creation)."""

import asyncio
from typing import Any
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from homeassistant.core import HomeAssistant

from custom_components.climate_dashboard import DOMAIN
from custom_components.climate_dashboard.storage import CircuitConfig


@pytest.fixture
def mock_storage() -> MagicMock:
    """Mock storage."""
    storage = MagicMock()
    storage.circuits = []
    storage.zones = []
    # Mock settings
    storage.settings = {}
    return storage


async def test_circuit_dynamic_creation(hass: HomeAssistant) -> None:
    """Test that adding a circuit to storage dynamically creates the HeatingCircuit instance."""

    # 1. Setup Integration via Config Entry
    with patch("custom_components.climate_dashboard.ClimateDashboardStorage") as MockStorageClass:
        mock_storage_instance = MockStorageClass.return_value
        mock_storage_instance.async_load = AsyncMock()
        mock_storage_instance.circuits = []  # Initially empty
        mock_storage_instance.zones = []
        mock_storage_instance.settings = {}

        # Capture the listener callback
        listeners = []

        def add_listener(callback: Any) -> None:
            listeners.append(callback)

        mock_storage_instance.async_add_listener.side_effect = add_listener

        from pytest_homeassistant_custom_component.common import MockConfigEntry

        entry = MockConfigEntry(domain=DOMAIN, data={})
        entry.add_to_hass(hass)

        # Initial Setup
        assert await hass.config_entries.async_setup(entry.entry_id)
        await hass.async_block_till_done()

        # Verify initial state: No circuits
        assert len(hass.data[DOMAIN]["circuits"]) == 0

        # 2. Simulate Dynamic Addition
        new_circuit: CircuitConfig = {
            "id": "circuit_new",
            "name": "New Circuit",
            "heaters": ["switch.boiler"],
            "member_zones": [],
        }

        # Update storage mock
        mock_storage_instance.circuits = [new_circuit]

        # Fire listeners (simulating storage update)
        for listener in listeners:
            # The real storage implementation awaits async callbacks or runs them in loop.
            # In our implementation, we passed an async function `_reconcile_circuits`.
            if asyncio.iscoroutinefunction(listener):
                await listener()
            else:
                listener()

        await hass.async_block_till_done()

        # 3. Verify Circuit Created
        # CURRENTLY: Fails because __init__.py does not have the listener logic
        # After fix: Should be 1
        assert len(hass.data[DOMAIN]["circuits"]) == 1
        assert hass.data[DOMAIN]["circuits"][0].id == "circuit_new"
