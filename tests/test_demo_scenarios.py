"""Isolated Integration tests for Demo Scenarios."""

from unittest.mock import patch

import pytest
from homeassistant.components.climate import ATTR_TEMPERATURE, ClimateEntityFeature, HVACAction, HVACMode
from homeassistant.const import ATTR_ENTITY_ID
from homeassistant.core import HomeAssistant
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.climate_dashboard.const import DOMAIN
from custom_components.climate_dashboard.storage import (
    ClimateDashboardData,
    ClimateZoneConfig,
    OverrideType,
)

# Kitchen (Heater Only)
KITCHEN_ZONE_ID = "climate.zone_kitchen"
KITCHEN_SENSOR = "input_number.kitchen_temp"
KITCHEN_TRV = "climate.kitchen"

# Office (Dual)
OFFICE_DUAL_ZONE_ID = "climate.zone_office_dual"
OFFICE_SENSOR = "input_number.office_temp"
OFFICE_HEATER = "switch.office_heater"
OFFICE_AC = "climate.office_ac"

# Guest Room (Dial)
GUEST_ZONE_ID = "climate.zone_guest_room"
GUEST_DIAL = "climate.guest_room_dial"
GUEST_TRV = "climate.guest_room_trv"
GUEST_AC = "climate.guest_room_ac"


async def setup_scenario(hass: HomeAssistant, zones: list[ClimateZoneConfig]) -> None:
    """Setup a specific scenario with isolated storage."""

    data = ClimateDashboardData(
        settings={
            "default_override_type": OverrideType.DURATION,
            "default_timer_minutes": 60,
            "window_open_delay_seconds": 0,
            "home_away_entity_id": None,
            "away_delay_minutes": 10,
            "away_temperature": 16.0,
            "away_temperature_cool": 30.0,
            "is_away_mode_on": False,
        },
        circuits=[],
        zones=zones,
    )

    with patch(
        "custom_components.climate_dashboard.storage.ClimateDashboardStorage._async_load_data", return_value=data
    ):
        entry = MockConfigEntry(domain=DOMAIN)
        entry.add_to_hass(hass)
        await hass.config_entries.async_setup(entry.entry_id)
        await hass.async_block_till_done()


@pytest.mark.asyncio
async def test_kitchen_heater(hass: HomeAssistant) -> None:
    """Scenario: Single Mode Heater Only (Kitchen)."""

    # 1. Setup Devices
    hass.states.async_set("sensor.kitchen_temp", "19.0")
    hass.states.async_set(
        "climate.kitchen_trv",
        HVACMode.OFF,
        {
            "hvac_modes": [HVACMode.OFF, HVACMode.HEAT, HVACMode.AUTO],
            "supported_features": ClimateEntityFeature.TARGET_TEMPERATURE,
            "min_temp": 7,
            "max_temp": 30,
        },
    )

    # 2. Setup Config
    kitchen_config = {
        "unique_id": "zone_kitchen",
        "name": "Kitchen",
        "temperature_sensor": "sensor.kitchen_temp",
        "heaters": ["climate.kitchen_trv"],
        "thermostats": [],
        "coolers": [],
        "window_sensors": [],
        "schedule": [
            {
                "name": "Day",
                "days": ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
                "start_time": "00:00",
                "temp_heat": 21.0,
                "temp_cool": 25.0,
            }
        ],
    }

    # 3. Launch
    await setup_scenario(hass, [kitchen_config])  # type: ignore

    # 4. Verify
    zone = hass.states.get("climate.zone_kitchen")
    assert zone is not None
    assert zone.state == HVACMode.AUTO
    assert zone.attributes["current_temperature"] == 19.0
    assert zone.attributes["temperature"] == 21.0
    assert zone.attributes["hvac_action"] == HVACAction.HEATING


@pytest.mark.asyncio
async def test_office_dual(hass: HomeAssistant) -> None:
    """Scenario: Dual Mode (Heater + AC) (Office)."""

    # 1. Setup Devices
    hass.states.async_set("sensor.office_temp", "22.0")  # Deadband
    hass.states.async_set("switch.office_heater", "off")
    hass.states.async_set(
        "climate.office_ac",
        HVACMode.OFF,
        {"hvac_modes": [HVACMode.OFF, HVACMode.COOL], "supported_features": ClimateEntityFeature.TARGET_TEMPERATURE},
    )

    # 2. Setup Config
    office_config = {
        "unique_id": "zone_office",
        "name": "Office",
        "temperature_sensor": "sensor.office_temp",
        "heaters": ["switch.office_heater"],
        "thermostats": [],
        "coolers": ["climate.office_ac"],
        "window_sensors": [],
        "schedule": [
            {
                "name": "Day",
                "days": ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
                "start_time": "00:00",
                "temp_heat": 20.0,
                "temp_cool": 24.0,
            }
        ],
    }

    # 3. Launch & Capture Calls
    with patch("homeassistant.core.ServiceRegistry.async_call") as call_mock:
        await setup_scenario(hass, [office_config])  # type: ignore

        # Initial: Idle
        zone = hass.states.get("climate.zone_office")
        assert zone.state == HVACMode.AUTO
        assert zone.attributes["hvac_action"] == HVACAction.IDLE
        assert zone.attributes.get("temperature") is None  # Range
        assert zone.attributes["target_temp_low"] == 20.0
        assert zone.attributes["target_temp_high"] == 24.0

        # Heat Up -> Cool
        hass.states.async_set("sensor.office_temp", "25.0")
        await hass.async_block_till_done()

        zone = hass.states.get("climate.zone_office")
        assert zone.attributes["hvac_action"] == HVACAction.COOLING

        # Check AC ON
        ac_calls = [
            c
            for c in call_mock.call_args_list
            if c.args[0] == "climate" and c.args[2][ATTR_ENTITY_ID] == "climate.office_ac"
        ]
        assert len(ac_calls) > 0


@pytest.mark.asyncio
async def test_guest_dial_sync(hass: HomeAssistant) -> None:
    """Scenario: Dial acts as Sensor and Thermostat (Guest)."""

    # 1. Setup Devices
    hass.states.async_set(
        "climate.guest_dial",
        HVACMode.HEAT,
        {
            ATTR_TEMPERATURE: 20.0,
            "current_temperature": 19.0,
            "hvac_modes": [HVACMode.OFF, HVACMode.HEAT, HVACMode.COOL],
            "supported_features": ClimateEntityFeature.TARGET_TEMPERATURE,
        },
    )
    hass.states.async_set("climate.guest_trv", HVACMode.OFF, {"hvac_modes": [HVACMode.OFF, HVACMode.HEAT]})

    # 2. Setup Config
    guest_config = {
        "unique_id": "zone_guest",
        "name": "Guest",
        "temperature_sensor": "climate.guest_dial",
        "heaters": ["climate.guest_trv"],
        "thermostats": ["climate.guest_dial"],
        "coolers": [],
        "window_sensors": [],
        "schedule": [
            {
                "name": "Day",
                "days": ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
                "start_time": "00:00",
                "temp_heat": 21.0,
                "temp_cool": 25.0,
            }
        ],
    }

    # 3. Launch
    with patch("homeassistant.core.ServiceRegistry.async_call") as call_mock:
        await setup_scenario(hass, [guest_config])  # type: ignore

        # Verify Zone State
        # Dial (19) < Sched (21) -> Heating
        zone = hass.states.get("climate.zone_guest")
        assert zone.attributes["hvac_action"] == HVACAction.HEATING
        assert zone.attributes["temperature"] == 21.0

        # Verify Sync: Zone should force Dial to 21.0
        dial_calls = [
            c
            for c in call_mock.call_args_list
            if c.args[0] == "climate" and c.args[2][ATTR_ENTITY_ID] == "climate.guest_dial"
        ]
        assert len(dial_calls) > 0
        assert dial_calls[-1].args[2][ATTR_TEMPERATURE] == 21.0


@pytest.mark.asyncio
async def test_guest_room_actuation(hass: HomeAssistant) -> None:
    """Scenario: Guest Room TRV and AC triggering based on Dial temp."""
    # 1. Setup Devices
    # Dial starts at 22.0 (Deadband 21-25)
    hass.states.async_set(
        GUEST_DIAL,
        HVACMode.HEAT,
        {
            ATTR_TEMPERATURE: 21.0,
            "current_temperature": 22.0,
            "hvac_modes": [HVACMode.OFF, HVACMode.HEAT, HVACMode.COOL],
            "supported_features": ClimateEntityFeature.TARGET_TEMPERATURE,
        },
    )
    hass.states.async_set(GUEST_TRV, HVACMode.OFF, {"hvac_modes": [HVACMode.OFF, HVACMode.HEAT, HVACMode.AUTO]})
    hass.states.async_set(GUEST_AC, HVACMode.OFF, {"hvac_modes": [HVACMode.OFF, HVACMode.COOL, HVACMode.AUTO]})

    # 2. Setup Config
    guest_config = {
        "unique_id": "zone_guest_act",
        "name": "Guest Act",
        "temperature_sensor": GUEST_DIAL,
        "heaters": [GUEST_TRV],
        "thermostats": [GUEST_DIAL],
        "coolers": [GUEST_AC],
        "window_sensors": [],
        "schedule": [
            {
                "name": "Day",
                "days": ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
                "start_time": "00:00",
                "temp_heat": 21.0,
                "temp_cool": 25.0,
            }
        ],
    }

    # 3. Launch
    with patch("homeassistant.core.ServiceRegistry.async_call") as call_mock:
        await setup_scenario(hass, [guest_config])  # type: ignore

        ENTITY_ID = "climate.zone_guest_act"

        # --- HEATING ---
        # Drop temp to 19.0
        hass.states.async_set(
            GUEST_DIAL,
            HVACMode.HEAT,
            {
                ATTR_TEMPERATURE: 21.0,
                "current_temperature": 19.0,
                "hvac_modes": [HVACMode.OFF, HVACMode.HEAT, HVACMode.COOL],
                "supported_features": ClimateEntityFeature.TARGET_TEMPERATURE,
            },
        )
        await hass.async_block_till_done()

        zone = hass.states.get(ENTITY_ID)
        assert zone.attributes["hvac_action"] == HVACAction.HEATING

        # Verify TRV ON (Heat mode 30C)
        trv_heat_calls = [
            c
            for c in call_mock.call_args_list
            if c.args[0] == "climate"
            and c.args[2][ATTR_ENTITY_ID] == GUEST_TRV
            and c.args[1] in ("set_hvac_mode", "set_temperature")
        ]
        assert len(trv_heat_calls) > 0

        # Simulate TRV responding and turning ON
        hass.states.async_set(GUEST_TRV, HVACMode.HEAT, {"hvac_modes": [HVACMode.OFF, HVACMode.HEAT]})

        # --- COOLING ---
        # Raise temp to 27.0
        call_mock.reset_mock()
        hass.states.async_set(
            GUEST_DIAL,
            HVACMode.COOL,
            {
                ATTR_TEMPERATURE: 25.0,
                "current_temperature": 27.0,
                "hvac_modes": [HVACMode.OFF, HVACMode.HEAT, HVACMode.COOL],
                "supported_features": ClimateEntityFeature.TARGET_TEMPERATURE,
            },
        )
        await hass.async_block_till_done()

        zone = hass.states.get(ENTITY_ID)
        assert zone.attributes["hvac_action"] == HVACAction.COOLING

        # Verify AC ON (Cool mode 16C)
        ac_cool_calls = [
            c
            for c in call_mock.call_args_list
            if c.args[0] == "climate"
            and c.args[2][ATTR_ENTITY_ID] == GUEST_AC
            and c.args[1] in ("set_hvac_mode", "set_temperature")
        ]
        assert len(ac_cool_calls) > 0

        # Simulate AC responding
        hass.states.async_set(GUEST_AC, HVACMode.COOL, {"hvac_modes": [HVACMode.OFF, HVACMode.COOL]})

        # Verify TRV OFF
        trv_off_calls = [
            c
            for c in call_mock.call_args_list
            if c.args[0] == "climate"
            and c.args[2][ATTR_ENTITY_ID] == GUEST_TRV
            and c.args[1] == "set_hvac_mode"
            and c.args[2]["hvac_mode"] == HVACMode.OFF
        ]
        assert len(trv_off_calls) > 0


@pytest.mark.asyncio
async def test_window_safety(hass: HomeAssistant) -> None:
    """Scenario: Window Sensor forces Zone OFF."""
    WINDOW_SENSOR = "binary_sensor.window"

    # 1. Setup Devices
    hass.states.async_set(KITCHEN_SENSOR, "10.0")  # Cold
    hass.states.async_set(KITCHEN_TRV, HVACMode.OFF, {"hvac_modes": [HVACMode.OFF, HVACMode.HEAT]})
    hass.states.async_set(WINDOW_SENSOR, "off")

    # 2. Setup Config
    config = {
        "unique_id": "zone_window",
        "name": "Window Zone",
        "temperature_sensor": KITCHEN_SENSOR,
        "heaters": [KITCHEN_TRV],
        "thermostats": [],
        "coolers": [],
        "window_sensors": [WINDOW_SENSOR],
        "schedule": [],  # Default OFF/Idle if no schedule? No, default is empty list.
        # But we need a schedule or manual intent to trigger heating.
        # Let's set manual intent via API later.
    }

    with patch("homeassistant.core.ServiceRegistry.async_call") as call_mock:
        await setup_scenario(hass, [config])  # type: ignore
        # Get Entity Instance
        component = hass.data["entity_components"]["climate"]
        ENTITY_ID = "climate.zone_window_zone"
        zone_entity = component.get_entity(ENTITY_ID)
        assert zone_entity is not None

        # Turn ON Heating (Direct Call)
        await zone_entity.async_set_hvac_mode(HVACMode.HEAT)
        await zone_entity.async_set_temperature(temperature=20.0)
        await hass.async_block_till_done()

        zone = hass.states.get(ENTITY_ID)
        assert zone.state == HVACMode.HEAT
        assert zone.attributes["hvac_action"] == HVACAction.HEATING

        # Simulate TRV responding to HEAT command
        hass.states.async_set(KITCHEN_TRV, HVACMode.HEAT, {"hvac_modes": [HVACMode.OFF, HVACMode.HEAT]})

        # OPEN WINDOW
        hass.states.async_set(WINDOW_SENSOR, "on")
        await hass.async_block_till_done()

        # Verify Zone OFF
        zone = hass.states.get(ENTITY_ID)
        assert zone.state == HVACMode.OFF
        assert zone.attributes["hvac_action"] == HVACAction.OFF

        # Verify TRV OFF Command
        trv_calls = [
            c
            for c in call_mock.call_args_list
            if c.args[0] == "climate"
            and c.args[2][ATTR_ENTITY_ID] == KITCHEN_TRV
            and c.args[1] == "set_hvac_mode"
            and c.args[2]["hvac_mode"] == HVACMode.OFF
        ]
        # Or set_temp(7) if OFF not supported?
        # We mocked TRV to support OFF.
        assert len(trv_calls) > 0


@pytest.mark.asyncio
async def test_trv_revert_correction(hass: HomeAssistant) -> None:
    """Scenario: TRV manually changed by user is reverted by Zone."""

    # 1. Setup Devices (Heating active)
    hass.states.async_set(KITCHEN_SENSOR, "19.0")
    hass.states.async_set(
        KITCHEN_TRV,
        HVACMode.HEAT,
        {
            "hvac_modes": [HVACMode.OFF, HVACMode.HEAT],
            ATTR_TEMPERATURE: 30.0,  # Already forced open
        },
    )

    # 2. Setup Config
    config = {
        "unique_id": "zone_kitchen",
        "name": "Kitchen",
        "temperature_sensor": KITCHEN_SENSOR,
        "heaters": [KITCHEN_TRV],
        "thermostats": [],
        "coolers": [],
        "window_sensors": [],
        "schedule": [
            {
                "name": "Day",
                "days": ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
                "start_time": "00:00",
                "temp_heat": 21.0,
                "temp_cool": 25.0,
            }
        ],
    }

    with patch("homeassistant.core.ServiceRegistry.async_call") as call_mock:
        await setup_scenario(hass, [config])  # type: ignore

        # Initial check - Zone should be Heating
        zone = hass.states.get("climate.zone_kitchen")
        assert zone.attributes["hvac_action"] == HVACAction.HEATING

        # 3. Simulate TRV changing to 21.0 (User/Internal Schedule interference)
        # We trigger the state change event on the TRV
        hass.states.async_set(
            KITCHEN_TRV, HVACMode.HEAT, {"hvac_modes": [HVACMode.OFF, HVACMode.HEAT], ATTR_TEMPERATURE: 21.0}
        )

        # Wait for listener to catch it and reconciler to run
        await hass.async_block_till_done()

        # 4. Verify Reconciler sent correction command (set to 30.0)
        correction_calls = [
            c
            for c in call_mock.call_args_list
            if c.args[0] == "climate"
            and c.args[1] == "set_temperature"
            and c.args[2][ATTR_ENTITY_ID] == KITCHEN_TRV
            and c.args[2][ATTR_TEMPERATURE] == 30.0
        ]
        assert len(correction_calls) > 0, "Reconciler failed to revert TRV change"


@pytest.mark.asyncio
async def test_override_expiration(hass: HomeAssistant) -> None:
    """Scenario: Manual override expires and reverts to schedule."""
    # 1. Setup Device
    hass.states.async_set(KITCHEN_SENSOR, "20.0")

    # 2. Setup Config (Override = 60 mins)
    config = {
        "unique_id": "zone_expire",
        "name": "Expire Zone",
        "temperature_sensor": KITCHEN_SENSOR,
        "heaters": [KITCHEN_TRV],
        "thermostats": [],
        "coolers": [],
        "window_sensors": [],
        "schedule": [{"name": "Day", "days": ["mon"], "start_time": "00:00", "temp_heat": 18.0, "temp_cool": 25.0}],
    }

    from datetime import datetime, timedelta

    import homeassistant.util.dt as dt_util

    start_time = datetime(2023, 1, 2, 10, 0, 0, tzinfo=dt_util.UTC)  # Monday

    with (
        patch("custom_components.climate_dashboard.climate_zone.dt_util.now", return_value=start_time),
        patch("homeassistant.core.ServiceRegistry.async_call"),
    ):
        await setup_scenario(hass, [config])  # type: ignore
        ENTITY_ID = "climate.zone_expire_zone"
        zone_entity = hass.data["entity_components"]["climate"].get_entity(ENTITY_ID)

        # Initial: 18.0 (Schedule)
        assert zone_entity.target_temperature == 18.0

        # Set Manual Override (22.0)
        await zone_entity.async_set_temperature(temperature=22.0)
        await hass.async_block_till_done()
        assert zone_entity.target_temperature == 22.0

        # Advance Time by 30 mins (Still active)
        mid_time = start_time + timedelta(minutes=30)
        with patch("custom_components.climate_dashboard.climate_zone.dt_util.now", return_value=mid_time):
            # Trigger reconciliation (simulating heartbeat or sensor update)
            await zone_entity._async_reconcile()
            assert zone_entity.target_temperature == 22.0

        # Advance Time by 61 mins (Expired)
        end_time = start_time + timedelta(minutes=61)
        with patch("custom_components.climate_dashboard.climate_zone.dt_util.now", return_value=end_time):
            await zone_entity._async_reconcile()
            # Should revert to 18.0
            assert zone_entity.target_temperature == 18.0


@pytest.mark.asyncio
async def test_heating_circuit_logic(hass: HomeAssistant) -> None:
    """Scenario: Heating Circuit (Boiler) responds to aggregated demand."""
    BOILER_ID = "switch.boiler"

    # 1. Setup Devices
    hass.states.async_set("sensor.z1_temp", "19.0")
    hass.states.async_set("sensor.z2_temp", "19.0")
    hass.states.async_set(BOILER_ID, "off")

    # 2. Setup Config (2 Zones + 1 Circuit)
    z1_config = {
        "unique_id": "z1",
        "name": "Zone 1",
        "temperature_sensor": "sensor.z1_temp",
        "heaters": [],
        "thermostats": [],
        "coolers": [],
        "window_sensors": [],
        "schedule": [],
    }
    z2_config = {
        "unique_id": "z2",
        "name": "Zone 2",
        "temperature_sensor": "sensor.z2_temp",
        "heaters": [],
        "thermostats": [],
        "coolers": [],
        "window_sensors": [],
        "schedule": [],
    }
    circuit_config = {
        "id": "c1",
        "name": "Boiler Circuit",
        "heaters": [BOILER_ID],
        "member_zones": ["z1", "z2"],
    }

    data = ClimateDashboardData(
        settings={
            "default_override_type": OverrideType.PERMANENT,
            "default_timer_minutes": 60,
            "window_open_delay_seconds": 0,
            "home_away_entity_id": None,
            "away_delay_minutes": 10,
            "away_temperature": 16.0,
            "away_temperature_cool": 30.0,
            "is_away_mode_on": False,
        },
        circuits=[circuit_config],  # type: ignore
        zones=[z1_config, z2_config],  # type: ignore
    )

    with (
        patch(
            "custom_components.climate_dashboard.storage.ClimateDashboardStorage._async_load_data",
            return_value=data,
        ),
        patch("homeassistant.core.ServiceRegistry.async_call") as call_mock,
    ):
        entry = MockConfigEntry(domain=DOMAIN)
        entry.add_to_hass(hass)
        await hass.config_entries.async_setup(entry.entry_id)
        await hass.async_block_till_done()

        z1 = hass.data["entity_components"]["climate"].get_entity("climate.zone_zone_1")
        z2 = hass.data["entity_components"]["climate"].get_entity("climate.zone_zone_2")

        # --- STEP 1: No Demand ---
        assert hass.states.get(BOILER_ID).state == "off"

        # --- STEP 2: Zone 1 Calls for Heat ---
        await z1.async_set_hvac_mode(HVACMode.HEAT)
        await z1.async_set_temperature(temperature=21.0)
        await hass.async_block_till_done()

        assert z1.hvac_action == HVACAction.HEATING
        # Boiler should turn ON
        boiler_on_calls = [
            c
            for c in call_mock.call_args_list
            if c.args[0] == "homeassistant" and c.args[1] == "turn_on" and c.args[2][ATTR_ENTITY_ID] == BOILER_ID
        ]
        assert len(boiler_on_calls) > 0
        # Update mock state to reflect success
        hass.states.async_set(BOILER_ID, "on")

        # --- STEP 3: Zone 2 Calls for Heat ---
        call_mock.reset_mock()
        await z2.async_set_hvac_mode(HVACMode.HEAT)
        await z2.async_set_temperature(temperature=21.0)
        await hass.async_block_till_done()

        assert z2.hvac_action == HVACAction.HEATING
        # Boiler already ON, should not be called again (if using demand state)
        boiler_on_calls = [c for c in call_mock.call_args_list if c.args[1] == "turn_on"]
        assert len(boiler_on_calls) == 0

        # --- STEP 4: Zone 1 Stops Demand ---
        await z1.async_set_hvac_mode(HVACMode.OFF)
        await hass.async_block_till_done()

        assert z1.hvac_action == HVACAction.OFF
        # Boiler should stay ON (Z2 still heating)
        boiler_off_calls = [c for c in call_mock.call_args_list if c.args[1] == "turn_off"]
        assert len(boiler_off_calls) == 0

        # --- STEP 5: Zone 2 Stops Demand ---
        await z2.async_set_hvac_mode(HVACMode.OFF)
        await hass.async_block_till_done()

        assert z2.hvac_action == HVACAction.OFF
        # Boiler should turn OFF
        boiler_off_calls = [
            c
            for c in call_mock.call_args_list
            if c.args[0] == "homeassistant" and c.args[1] == "turn_off" and c.args[2][ATTR_ENTITY_ID] == BOILER_ID
        ]
        assert len(boiler_off_calls) > 0


@pytest.mark.asyncio
async def test_override_disabled(hass: HomeAssistant) -> None:
    """Scenario: Manual overrides are ignored when disabled."""
    # 1. Setup Devices
    hass.states.async_set(KITCHEN_SENSOR, "20.0")

    # 2. Setup Config (Override = DISABLED)
    data = ClimateDashboardData(
        settings={
            "default_override_type": OverrideType.DISABLED,
            "default_timer_minutes": 60,
            "window_open_delay_seconds": 0,
            "home_away_entity_id": None,
            "away_delay_minutes": 10,
            "away_temperature": 16.0,
            "away_temperature_cool": 30.0,
            "is_away_mode_on": False,
        },
        circuits=[],
        zones=[
            {
                "unique_id": "zone_locked",
                "name": "Locked Zone",
                "temperature_sensor": KITCHEN_SENSOR,
                "heaters": [KITCHEN_TRV],
                "thermostats": [],
                "coolers": [],
                "window_sensors": [],
                "schedule": [
                    {"name": "Day", "days": ["mon"], "start_time": "00:00", "temp_heat": 18.0, "temp_cool": 25.0}
                ],
            }
        ],
    )

    from datetime import datetime

    import homeassistant.util.dt as dt_util

    start_time = datetime(2023, 1, 2, 10, 0, 0, tzinfo=dt_util.UTC)  # Monday

    with (
        patch(
            "custom_components.climate_dashboard.storage.ClimateDashboardStorage._async_load_data", return_value=data
        ),
        patch("custom_components.climate_dashboard.climate_zone.dt_util.now", return_value=start_time),
        patch("homeassistant.core.ServiceRegistry.async_call"),
    ):
        entry = MockConfigEntry(domain=DOMAIN)
        entry.add_to_hass(hass)
        await hass.config_entries.async_setup(entry.entry_id)
        await hass.async_block_till_done()

        zone_entity = hass.data["entity_components"]["climate"].get_entity("climate.zone_locked_zone")

        # Initial: 18.0 (Schedule)
        assert zone_entity.target_temperature == 18.0

        # Attempt Manual Override (22.0)
        await zone_entity.async_set_temperature(temperature=22.0)
        await hass.async_block_till_done()

        # Verify it was IGNORED (Still 18.0)
        assert zone_entity.target_temperature == 18.0, "Manual override should be ignored when disabled"
