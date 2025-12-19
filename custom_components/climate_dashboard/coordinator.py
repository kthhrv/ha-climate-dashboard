"""Coordinator for Climate Dashboard."""

import logging
from typing import Any

from homeassistant.const import STATE_HOME, STATE_ON
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.event import async_call_later, async_track_state_change_event

from .storage import ClimateDashboardStorage

_LOGGER = logging.getLogger(__name__)


class ClimateDashboardCoordinator:
    """Class to manage global logic."""

    def __init__(self, hass: HomeAssistant, storage: ClimateDashboardStorage) -> None:
        """Initialize."""
        self.hass = hass
        self._storage = storage
        self._remove_listener = None
        self._timer_remove = None

        # Listen to storage changes to re-hook entity listener if entity_id changes
        self._storage.async_add_listener(self._handle_storage_update)

        # Initial hook
        self._handle_storage_update()

    @callback
    def _handle_storage_update(self) -> None:
        """Handle storage updates."""
        settings = self._storage.settings
        entity_id = settings.get("home_away_entity_id")

        # If listener exists and entity changed (or removed), cleanup
        if self._remove_listener:
            self._remove_listener()
            self._remove_listener = None

        if entity_id:
            # Subscribe to state changes
            self._remove_listener = async_track_state_change_event(self.hass, [entity_id], self._handle_presence_change)

    @callback
    def _handle_presence_change(self, event: Any) -> None:
        """Handle presence entity state change."""
        new_state = event.data.get("new_state")
        if new_state is None:
            return

        settings = self._storage.settings
        is_away = settings.get("is_away_mode_on", False)
        delay_minutes = settings.get("away_delay_minutes", 10)

        # Determine "Home" vs "Away" based on state
        # Support device_tracker (home/not_home) and boolean/binary_sensor (on/off) or person (home/not_home)
        # Assuming: "home"/"on" = Home. "not_home"/"off" = Away.

        is_presence_home = new_state.state in [STATE_HOME, STATE_ON]

        if is_presence_home:
            # User Returned Home
            # 1. Cancel any pending away timer
            if self._timer_remove:
                self._timer_remove()
                self._timer_remove = None
                _LOGGER.debug("Presence detected: Away timer cancelled.")

            # 2. If currently Away, switch to Home immediately
            if is_away:
                _LOGGER.info("Presence detected: Disabling Away Mode.")
                # We need to run this as a task because storage is async
                self.hass.async_create_task(self._storage.async_update_settings({"is_away_mode_on": False}))

        else:
            # User Left (or is away)
            if not is_away and self._timer_remove is None:
                # Start Timer
                _LOGGER.info("Presence lost: Starting Away Mode timer for %d minutes.", delay_minutes)
                self._timer_remove = async_call_later(self.hass, delay_minutes * 60, self._handle_away_timer_expired)

    @callback
    def _handle_away_timer_expired(self, _now: Any) -> None:
        """Handle away timer expiration."""
        self._timer_remove = None
        _LOGGER.info("Away Mode timer expired: Enabling Away Mode.")
        self.hass.async_create_task(self._storage.async_update_settings({"is_away_mode_on": True}))
