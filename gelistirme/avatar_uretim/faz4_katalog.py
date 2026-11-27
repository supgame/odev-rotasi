"""Read Phase 4 shop metadata from the existing species catalog."""

import re
from pathlib import Path


CATALOG = Path(__file__).resolve().parents[2] / "src" / "avatar" / "catalog.ts"
ENTRY = re.compile(r"\s*S\('([a-z0-9_]+)', '([^']+)', (\d+), '[^']*', '[^']*'\),")


def species() -> list[tuple[str, str, int]]:
    source = CATALOG.read_text(encoding="utf-8")
    block = source.split("export const SPECIES: Species[] = [", 1)[1].split("\n]", 1)[0]
    pets = []
    for line in block.splitlines():
        if not line.strip():
            continue
        match = ENTRY.fullmatch(line)
        if not match:
            raise ValueError(f"Unrecognized SPECIES entry: {line}")
        stem, name, price = match.groups()
        pets.append((stem, name, int(price)))
    if not pets or len({stem for stem, _, _ in pets}) != len(pets):
        raise ValueError("SPECIES must contain distinct pet IDs")
    return pets
