"""Heating Circuit logic for Climate Dashboard."""

from __future__ import annotations

import logging

from homeassistant.const import (
    ATTR_ENTITY_ID,
    SERVICE_TURN_OFF,
    SERVICE_TURN_ON,
)
from homeassistant.core import CALLBACK_TYPE, Event, HomeAssistant, callback
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.event import async_track_state_change_event

from .const import DOMAIN
from .storage import CircuitConfig, ClimateDashboardStorage

_LOGGER = logging.getLogger(__name__)


class HeatingCircuit:
    """Representation of a Heating Circuit (Actuator Group)."""

    def __init__(
        self,
        hass: HomeAssistant,
        storage: ClimateDashboardStorage,
        config: CircuitConfig,
    ) -> None:
        """Initialize the circuit."""
        self.hass = hass
        self._storage = storage
        self._config = config
        self._remove_listener: CALLBACK_TYPE | None = None
        self._is_active = False
        # Store local copies to detect changes since config dict is mutable/shared
        self._effective_member_zones = list(config.get("member_zones", []))
        self._effective_heaters = list(config.get("heaters", []))

    @property
    def name(self) -> str:
        """Return the name of the circuit."""
        return self._config["name"]

    @property
    def id(self) -> str:
        """Return the ID of the circuit."""
        return self._config["id"]

    @property
    def heaters(self) -> list[str]:
        """Return list of shared heater entity IDs."""
        return self._config["heaters"]

    @property
    def member_zones(self) -> list[str]:
        """Return list of member zone unique IDs."""
        return self._config["member_zones"]

    async def async_initialize(self) -> None:
        """Initialize by finding zone entities and starting listeners."""
        # Listen for storage changes to handle dynamic updates (e.g. adding zones)
        self._storage.async_add_listener(self._async_on_storage_update)

        await self._async_setup_listeners()
        # Initial check
        await self._async_check_demand()

    @callback
    def _async_on_storage_update(self) -> None:
        """Handle storage update."""
        my_config = next((c for c in self._storage.circuits if c["id"] == self.id), None)
        if not my_config:
            return

        # config dict might be modified in place, so self._config is already new data
        # Check against our local effective copies
        new_members = my_config.get("member_zones", [])
        new_heaters = my_config.get("heaters", [])

        if new_members != self._effective_member_zones or new_heaters != self._effective_heaters:
            self._config = my_config
            self._effective_member_zones = list(new_members)
            self._effective_heaters = list(new_heaters)

            self.hass.async_create_task(self._async_setup_listeners())
            self.hass.async_create_task(self._async_check_demand())

    async def async_update_config(self, config: CircuitConfig) -> None:
        """Update configuration dynamically."""
        self._config = config
        self._effective_member_zones = list(config.get("member_zones", []))
        self._effective_heaters = list(config.get("heaters", []))
        # Re-setup listeners in case member zones changed
        await self._async_setup_listeners()
        await self._async_check_demand()

    async def async_shutdown(self) -> None:
        """Shutdown the circuit."""
        if self._remove_listener:
            self._remove_listener()
            self._remove_listener = None

    async def _async_setup_listeners(self) -> None:
        """Setup state listeners for member zones."""
        if self._remove_listener:
            self._remove_listener()
            self._remove_listener = None

        if not self.member_zones:
            return

        er_instance = er.async_get(self.hass)
        entity_ids = []

        for unique_id in self.member_zones:
            # Resolve unique_id to entity_id via Registry
            # platform = DOMAIN (e.g. 'climate_dashboard')
            # domain = 'climate'

            # Try to find entity_id
            eid = er_instance.async_get_entity_id("climate", DOMAIN, unique_id)

            if eid:
                entity_ids.append(eid)
            else:
                # Fallback or Log warning?
                # If the entity isn't ready yet, we might miss it.
                # Use the name guess as fallback if registry fails?
                # For now log trace
                _LOGGER.debug("Circuit %s: Could not resolve entity_id for zone %s", self.name, unique_id)
                # Try to find the zone in storage to guess name?
                # Safe fallback:
                zone_conf = next((z for z in self._storage.zones if z["unique_id"] == unique_id), None)
                if zone_conf:
                    from homeassistant.util import slugify

                    eid_guess = f"climate.zone_{slugify(zone_conf['name'])}"
                    # Allow listening even if entity doesn't exist yet (Race Condition Fix)
                    entity_ids.append(eid_guess)

        if not entity_ids:
            return

        self._remove_listener = async_track_state_change_event(self.hass, entity_ids, self._async_on_state_change)
        # Also trigger immediate check
        # await self._async_check_demand()

    @callback
    async def _async_on_state_change(self, event: Event) -> None:
        """Handle state change of a member zone."""
        await self._async_check_demand()

    async def _async_check_demand(self) -> None:
        """Check if ANY member zone is heating."""
        any_heating = False
        er_instance = er.async_get(self.hass)

        for unique_id in self.member_zones:
            eid = er_instance.async_get_entity_id("climate", DOMAIN, unique_id)
            if not eid:
                # Fallback logic same as setup
                zone_conf = next((z for z in self._storage.zones if z["unique_id"] == unique_id), None)
                if zone_conf:
                    from homeassistant.util import slugify

                    eid = f"climate.zone_{slugify(zone_conf['name'])}"

            if eid:
                state = self.hass.states.get(eid)
                if state:
                    hvac_action = state.attributes.get("hvac_action")
                    if hvac_action == "heating":
                        any_heating = True
                        break

        # Control Actuators
        if any_heating:
            if not self._is_active:
                _LOGGER.info("Circuit %s: Demand detected. Turning ON heaters.", self.name)
                self._is_active = True
                await self._async_control_heaters(True)
        else:
            if self._is_active:
                _LOGGER.info("Circuit %s: No demand. Turning OFF heaters.", self.name)
                self._is_active = False
                await self._async_control_heaters(False)

    async def _async_control_heaters(self, turn_on: bool) -> None:
        """Turn heaters on/off."""
        for entity_id in self.heaters:
            # Basic domain check
            service = SERVICE_TURN_ON if turn_on else SERVICE_TURN_OFF

            await self.hass.services.async_call("homeassistant", service, {ATTR_ENTITY_ID: entity_id}, blocking=False)
