"""Tests for volleyball_setup.py"""

import pytest
from volleyball_setup import get_setup, format_setup, SETUPS


class TestGetSetup:
    def test_beginner_returned(self):
        setup = get_setup("beginner")
        assert setup is SETUPS["beginner"]

    def test_intermediate_returned(self):
        setup = get_setup("intermediate")
        assert setup is SETUPS["intermediate"]

    def test_advanced_returned(self):
        setup = get_setup("advanced")
        assert setup is SETUPS["advanced"]

    def test_case_insensitive(self):
        assert get_setup("Beginner") is get_setup("beginner")
        assert get_setup("INTERMEDIATE") is get_setup("intermediate")
        assert get_setup("Advanced") is get_setup("advanced")

    def test_whitespace_stripped(self):
        assert get_setup("  beginner  ") is get_setup("beginner")

    def test_unknown_level_raises(self):
        with pytest.raises(ValueError, match="Unknown level"):
            get_setup("expert")

    def test_empty_string_raises(self):
        with pytest.raises(ValueError):
            get_setup("")


class TestSetupContent:
    """Verify each setup has the required keys and non-empty values."""

    @pytest.mark.parametrize("level", ["beginner", "intermediate", "advanced"])
    def test_required_keys(self, level):
        setup = get_setup(level)
        for key in ("formation", "description", "positions", "focus"):
            assert key in setup

    @pytest.mark.parametrize("level", ["beginner", "intermediate", "advanced"])
    def test_positions_non_empty(self, level):
        setup = get_setup(level)
        assert len(setup["positions"]) > 0

    @pytest.mark.parametrize("level", ["beginner", "intermediate", "advanced"])
    def test_focus_non_empty(self, level):
        setup = get_setup(level)
        assert len(setup["focus"]) > 0

    @pytest.mark.parametrize("level", ["beginner", "intermediate", "advanced"])
    def test_position_entries_have_required_fields(self, level):
        setup = get_setup(level)
        for pos in setup["positions"]:
            assert "position" in pos
            assert "count" in pos
            assert "tips" in pos
            assert pos["count"] >= 1


class TestFormatSetup:
    def test_output_contains_level_title(self):
        output = format_setup("beginner")
        assert "Beginner" in output

    def test_output_contains_formation(self):
        output = format_setup("beginner")
        assert "4-2" in output

    def test_output_contains_positions_header(self):
        output = format_setup("intermediate")
        assert "Positions:" in output

    def test_output_contains_focus_header(self):
        output = format_setup("advanced")
        assert "Key Focus Areas:" in output

    def test_format_raises_for_unknown(self):
        with pytest.raises(ValueError):
            format_setup("rookie")

    @pytest.mark.parametrize("level", ["Beginner", "Intermediate", "Advanced"])
    def test_all_levels_produce_output(self, level):
        output = format_setup(level)
        assert len(output) > 0
