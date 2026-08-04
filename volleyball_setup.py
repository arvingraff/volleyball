"""Volleyball team setup generator.

Generates a recommended team formation and player roles based on skill level:
  - Beginner
  - Intermediate
  - Advanced
"""

SETUPS = {
    "beginner": {
        "formation": "4-2",
        "description": "4 hitters and 2 setters rotate opposite each other.",
        "positions": [
            {"position": "Setter", "count": 2, "tips": "Focus on hand placement and consistent sets."},
            {"position": "Outside Hitter", "count": 2, "tips": "Practice forearm passing and basic attacks."},
            {"position": "Middle Blocker", "count": 1, "tips": "Work on moving quickly to the net."},
            {"position": "Libero / Back-Row Defensive Specialist", "count": 1, "tips": "Stay low, watch the ball, master the pass."},
        ],
        "focus": [
            "Serve receive (passing)",
            "Consistent underhand or overhand serve",
            "Basic 3-hit pattern: pass → set → hit",
        ],
    },
    "intermediate": {
        "formation": "5-1",
        "description": "1 dedicated setter always sets, supported by 5 hitters.",
        "positions": [
            {"position": "Setter", "count": 1, "tips": "Lead the offense; vary your sets to keep blockers guessing."},
            {"position": "Outside Hitter", "count": 2, "tips": "Be the primary attackers; handle back-row serve receive."},
            {"position": "Middle Blocker", "count": 2, "tips": "Run quick middle sets and close blocks on the pin."},
            {"position": "Opposite / Right-Side Hitter", "count": 1, "tips": "Attack from the right side; block the opponent's outside."},
            {"position": "Libero", "count": 1, "tips": "Own the back row; direct the serve-receive pattern."},
        ],
        "focus": [
            "Transition offense (dig → set → attack)",
            "Float and topspin jump serve",
            "2-blocker systems and reading the setter",
        ],
    },
    "advanced": {
        "formation": "6-2",
        "description": "2 setters play back row when setting, giving 6 attackers in the front row.",
        "positions": [
            {"position": "Setter / Back-Row Attacker", "count": 2, "tips": "Set from zone 2/3; attack with back-row B or pipe."},
            {"position": "Outside Hitter", "count": 2, "tips": "Execute high-ball, slide, and back-row attacks at speed."},
            {"position": "Middle Blocker", "count": 2, "tips": "Run slide, quick-1, and 31 combinations; lead the block."},
            {"position": "Opposite / Right-Side Hitter", "count": 2, "tips": "Dominate the right side in serve, attack, and block."},
            {"position": "Libero", "count": 1, "tips": "Elite defensive backbone; call the defensive system."},
        ],
        "focus": [
            "Complex offensive play combinations and audibles",
            "Serve-receive patterns in multiple formations",
            "Aggressive serving strategy and tactical serving zones",
            "Full team defensive systems (perimeter, rotational)",
        ],
    },
}


def get_setup(level: str) -> dict:
    """Return the setup dict for a given skill level.

    Args:
        level: One of 'beginner', 'intermediate', or 'advanced' (case-insensitive).

    Returns:
        Setup dictionary.

    Raises:
        ValueError: If the level is not recognized.
    """
    key = level.strip().lower()
    if key not in SETUPS:
        raise ValueError(
            f"Unknown level '{level}'. Choose from: Beginner, Intermediate, Advanced."
        )
    return SETUPS[key]


def format_setup(level: str) -> str:
    """Return a formatted string describing the team setup for the given level."""
    setup = get_setup(level)
    lines = [
        f"=== Volleyball Setup: {level.strip().title()} ===",
        f"Formation : {setup['formation']}",
        f"Overview  : {setup['description']}",
        "",
        "Positions:",
    ]
    for p in setup["positions"]:
        lines.append(f"  {p['position']} (x{p['count']})")
        lines.append(f"    Tip: {p['tips']}")
    lines.append("")
    lines.append("Key Focus Areas:")
    for focus in setup["focus"]:
        lines.append(f"  - {focus}")
    return "\n".join(lines)


def main():
    print("Welcome to the Volleyball Setup Generator!")
    print("Choose a skill level: Beginner, Intermediate, Advanced")
    print("Type 'quit' to exit.\n")

    while True:
        level = input("Enter skill level: ").strip()
        if level.lower() == "quit":
            print("Goodbye!")
            break
        try:
            print()
            print(format_setup(level))
            print()
        except ValueError as exc:
            print(f"Error: {exc}\n")


if __name__ == "__main__":
    main()
