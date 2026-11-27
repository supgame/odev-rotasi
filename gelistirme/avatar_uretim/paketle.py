#!/usr/bin/env python3
"""Package the avatar layers from aligned PNG masters."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import numpy as np
from PIL import Image


ROOT = Path(__file__).resolve().parent
SOURCE = ROOT / "kaynak"
PUBLIC = ROOT.parent.parent / "public" / "av"
CANVAS = (512, 512)

SKINS = [
    ("skin_light", "Açık", "f6d4b4"),
    ("skin_wheat", "Buğday", "ddb18a"),
    ("skin_brown", "Esmer", "b77c56"),
    ("skin_tan", "Bronz", "8d563b"),
    ("skin_dark", "Koyu", "59372c"),
]

HAIR_COLORS = [
    ("black", "Siyah", "2c1b18", 0),
    ("dark_brown", "Koyu kahve", "493027", 0),
    ("brown", "Kahve", "74472e", 0),
    ("auburn", "Kızıl kahve", "8e402b", 0),
    ("blonde", "Sarı", "d6ad56", 0),
    ("golden_blonde", "Altın sarısı", "edc66c", 0),
    ("red", "Kızıl", "bd4537", 10),
    ("platinum", "Platin", "e8dfc5", 10),
    ("silver", "Gümüş", "a9adb4", 15),
    ("pink", "Pembe", "e783aa", 20),
    ("blue", "Mavi", "478acb", 20),
    ("purple", "Mor", "885bc0", 20),
    ("green", "Yeşil", "53a978", 25),
    ("crimson", "Kırmızı", "d83a4f", 25),
    ("turquoise", "Turkuaz", "40b9b5", 25),
]

HAIRSTYLES = [
    ("short", "Kısa düz"),
    ("ponytail", "At kuyruğu"),
    ("curly", "Kısa kıvırcık"),
    ("afro", "Afro"),
    ("straight_long", "Uzun düz"),
    ("bob", "Omuz boyu küt"),
    ("bun", "Tepede topuz"),
    ("braids", "İki örgü"),
    ("space_buns", "İki yan topuz"),
    ("wavy_long", "Uzun dalgalı"),
    ("bangs_long", "Kahküllü uzun"),
    ("spiky", "Dikenli kirpi saç"),
    ("side_part", "Yandan ayrık düzgün"),
    ("headscarf", "Başörtüsü"),
]


def _rgba_at_512(path: Path) -> Image.Image:
    with Image.open(path) as image:
        return image.convert("RGBA").resize(CANVAS, Image.Resampling.LANCZOS)


def _mask_at_512(path: Path) -> Image.Image:
    with Image.open(path) as image:
        return image.convert("L").resize(CANVAS, Image.Resampling.LANCZOS)


def _gray_in_mask(layer: Image.Image, mask: Image.Image) -> Image.Image:
    """Grayscale dyeable pixels while preserving untouched artwork and alpha."""
    rgba = np.asarray(layer.convert("RGBA"), dtype=np.uint8).copy()
    mask_array = np.asarray(mask.convert("L"), dtype=np.uint8)
    rgb = rgba[..., :3].astype(np.float32)
    lum = np.rint(rgb[..., 0] * 0.2126 + rgb[..., 1] * 0.7152 + rgb[..., 2] * 0.0722)
    gray = np.repeat(lum[..., None], 3, axis=2).astype(np.uint8)
    rgba[..., :3] = np.where(mask_array[..., None] > 0, gray, rgba[..., :3])
    return Image.fromarray(rgba, "RGBA")


def _ref(layer: Image.Image, mask: Image.Image) -> float:
    rgba = np.asarray(layer.convert("RGBA"), dtype=np.float64)
    weights = np.asarray(mask.convert("L"), dtype=np.float64)
    lum = (rgba[..., 0] * 0.2126 + rgba[..., 1] * 0.7152 + rgba[..., 2] * 0.0722)
    total = float(weights.sum())
    if total <= 0:
        raise ValueError("Tint mask has no covered pixels")
    return round(float((lum * weights).sum() / total), 4)


def tint(layer: Image.Image, mask: Image.Image, ref: float, color: str) -> Image.Image:
    """Apply the documented canvas dye formula to an RGBA layer."""
    rgba = np.asarray(layer.convert("RGBA"), dtype=np.float32)
    coverage = np.asarray(mask.convert("L"), dtype=np.float32) / 255.0
    rgb = rgba[..., :3]
    lum = rgb[..., 0] * 0.2126 + rgb[..., 1] * 0.7152 + rgb[..., 2] * 0.0722
    target = np.array([int(color[index:index + 2], 16) for index in (0, 2, 4)], dtype=np.float32)
    dyed = np.clip(target * lum[..., None] / max(float(ref), 1e-6), 0, 255)
    rgba[..., :3] = rgb * (1 - coverage[..., None]) + dyed * coverage[..., None]
    return Image.fromarray(np.rint(np.clip(rgba, 0, 255)).astype(np.uint8), "RGBA")


def _save_layer(relative: str, layer: Image.Image, mask: Image.Image | None = None) -> tuple[str, str | None, float | None]:
    path = PUBLIC / relative
    path.parent.mkdir(parents=True, exist_ok=True)
    layer.save(path, "WEBP", quality=90, method=6)
    mask_path = None
    layer_ref = None
    if mask is not None:
        mask_relative = relative.removesuffix(".webp") + "_mask.webp"
        mask_path = PUBLIC / mask_relative
        mask_path.parent.mkdir(parents=True, exist_ok=True)
        mask.save(mask_path, "WEBP", lossless=True, method=6)
        # Reference is based on the actual published lossy image, so it matches
        # what the browser will use for the recoloring calculation.
        with Image.open(path) as published:
            layer_ref = _ref(published.convert("RGBA"), mask)
        return relative, mask_relative, layer_ref
    return relative, mask_path, layer_ref


def _palette_entry(name: str, hex_color: str) -> dict[str, str]:
    return {"name": name, "hex": hex_color}


def package_phase1(manifest: dict) -> None:
    required = [SOURCE / "base" / f"{name}.png" for name in ("base", "base_skinmask")]
    required.extend(
        SOURCE / "hair" / f"{stem}_{kind}.png"
        for stem, _ in HAIRSTYLES
        for kind in ("front", "front_mask", "front_hat", "front_hat_mask")
    )
    for path in required:
        if not path.is_file():
            raise FileNotFoundError(path)

    base_source = _rgba_at_512(SOURCE / "base" / "base.png")
    skin_mask = _mask_at_512(SOURCE / "base" / "base_skinmask.png")
    base = _gray_in_mask(base_source, skin_mask)
    base_path, skin_mask_path, skin_ref = _save_layer("base/base.webp", base, skin_mask)

    palette: dict[str, dict[str, str]] = {}
    skin_items = []
    for item_id, name, color in SKINS:
        skin_items.append({"id": item_id, "name": name, "price": 0, "color": color})
        palette[item_id] = _palette_entry(name, color)

    hair_items = []
    for stem, name in HAIRSTYLES:
        layers: dict[str, str | None] = {}
        masks: dict[str, str] = {}
        refs: dict[str, float] = {}
        for source_kind, manifest_kind in (
            ("back", "back"),
            ("front", "front"),
            ("back_hat", "backUnderHat"),
            ("front_hat", "frontUnderHat"),
        ):
            source_path = SOURCE / "hair" / f"{stem}_{source_kind}.png"
            if not source_path.is_file():
                continue
            mask_source = SOURCE / "hair" / f"{stem}_{source_kind}_mask.png"
            if not mask_source.is_file():
                raise FileNotFoundError(f"Missing tint mask for {source_path}")
            mask = _mask_at_512(mask_source)
            layer = _gray_in_mask(_rgba_at_512(source_path), mask)
            relative = f"hair/{stem}_{source_kind}.webp"
            saved_layer, saved_mask, ref = _save_layer(relative, layer, mask)
            layers[manifest_kind] = saved_layer
            masks[manifest_kind] = saved_mask or ""
            refs[manifest_kind] = float(ref)

        for key in ("back", "front", "backUnderHat", "frontUnderHat"):
            layers.setdefault(key, None)
        hair_items.append({
            "id": f"hair_{stem}",
            "name": name,
            "price": 0 if stem in ("short", "ponytail") else 10,
            "layers": layers,
            "mask": masks,
            "ref": refs,
        })

    hcolor_items = []
    for color_id, name, color, price in HAIR_COLORS:
        item = {"id": f"hcolor_{color_id}", "name": name, "price": price, "color": color}
        hcolor_items.append(item)
        palette[item["id"]] = _palette_entry(name, color)

    manifest["version"] = 2
    manifest["canvas"] = 512
    manifest.setdefault("palette", {}).update(palette)
    manifest.setdefault("slots", {}).update({
        "skin": {"items": skin_items},
        "hair": {"items": hair_items},
        "hcolor": {"items": hcolor_items},
    })
    manifest["base"] = {"layer": base_path, "skinMask": skin_mask_path, "skinRef": skin_ref}
    manifest.setdefault("order", ["hairBack", "base", "face", "clothes", "hairFront", "hat", "glasses"])
    phase_note = (
        "Faz 1 saç katmanları: şapka takıldığında frontUnderHat ve varsa backUnderHat kullanılır. "
        "Tüm şapkalar ortak şapka bölgesinde hizalanır. Başörtüsü kumaş katmanıdır ve şapkanın altında kalır. "
        "Ten ve saç katmanlarında gri ton ile maske kullanılır; ref değerleri yayımlanan katmanlardan hesaplanır."
    )
    notes = manifest.get("notes", "")
    if phase_note not in notes:
        manifest["notes"] = "\n".join(part for part in (notes, phase_note) if part)


def package_phase2(manifest: dict) -> None:
    from faz2_katalog import ACCESSORIES, COLORS

    for slot, accessories in ACCESSORIES.items():
        for stem, _, _, variants in accessories:
            suffixes = ("", "_mask") if variants else ("",)
            for suffix in suffixes:
                path = SOURCE / slot / f"{stem}{suffix}.png"
                if not path.is_file():
                    raise FileNotFoundError(path)

    slots = {}
    for slot, accessories in ACCESSORIES.items():
        items = []
        for stem, name, price, variants in accessories:
            source = SOURCE / slot
            layer = _rgba_at_512(source / f"{stem}.png")
            mask = None
            if variants:
                mask = _mask_at_512(source / f"{stem}_mask.png")
                layer = _gray_in_mask(layer, mask)
            path, mask_path, ref = _save_layer(f"{slot}/{stem}.webp", layer, mask)
            item = {"id": f"{slot}_{stem}", "name": name, "price": price, "layer": path}
            if slot == "hat":
                item["back"] = None
            if not variants:
                items.append(item)
                continue
            for color_id in variants:
                color_name, hex_color = COLORS[color_id]
                items.append({**item, "id": f"{item['id']}_{color_id}",
                              "name": f"{color_name} {name}", "mask": mask_path,
                              "ref": ref, "color": hex_color})
        slots[slot] = {"items": items}
    manifest.setdefault("slots", {}).update(slots)


def package_phase3(manifest: dict) -> None:
    from faz3_katalog import CLOTHES, COLORS, FACES

    def package(slot, stem, mask_suffix=None):
        path = SOURCE / slot / f"{stem}.png"
        layer = _rgba_at_512(path)
        mask = None
        if mask_suffix:
            mask = _mask_at_512(path.with_stem(f"{stem}_{mask_suffix}"))
            layer = _gray_in_mask(layer, mask)
        relative, mask_path, ref = _save_layer(f"{slot}/{stem}.webp", layer, mask)
        result = {"layer": relative}
        if mask_path:
            result.update(mask=mask_path, ref=ref)
        return result

    items = {
        "clothes": [
            {"id": f"clothes_{stem}", "name": name, "price": price, "tintable": tintable,
             **package("clothes", stem, "mask" if tintable else None)}
            for stem, name, price, tintable in CLOTHES
        ],
        "face": [
            {"id": f"face_{stem}", "name": name, "price": price,
             **(package("face", stem, "skinmask") if raw else {"layer": None})}
            for stem, name, price, raw in FACES
        ],
        "ccolor": [
            {"id": f"ccolor_{stem}", "name": name, "price": price, "color": color}
            for stem, name, color, price in COLORS
        ],
    }
    manifest.setdefault("slots", {}).update(
        {slot: {"items": entries} for slot, entries in items.items()}
    )
    manifest.setdefault("palette", {}).update(
        {item["id"]: _palette_entry(item["name"], item["color"]) for item in items["ccolor"]}
    )


def package_phase4(manifest: dict) -> None:
    from faz4_katalog import species

    items = []
    for stem, name, price in species():
        replacement = SOURCE / "pet_poz" / f"{stem}.png"
        path = replacement if replacement.is_file() else SOURCE / "pet" / f"{stem}.png"
        with Image.open(path) as master:
            if master.size != (512, 512) or master.mode != "RGBA":
                raise ValueError(f"Expected a 512×512 RGBA master: {path}")
            if master.getchannel("A").getextrema() != (0, 255):
                raise ValueError(f"Missing transparency or opaque artwork: {path}")
            layer = master.resize((256, 256), Image.Resampling.LANCZOS)
        relative, _, _ = _save_layer(f"pet/{stem}.webp", layer)
        items.append({"id": f"pet_{stem}", "name": name, "price": price, "image": relative})
    manifest.setdefault("slots", {}).setdefault("pet", {})["items"] = items

    grip = SOURCE / "pet_poz" / "parrot_grip.png"
    layer, mask, ref = _save_layer(
        "pose/parrot-grip.webp",
        _rgba_at_512(grip),
        _mask_at_512(grip.with_name("parrot_grip_mask.png")),
    )
    manifest.setdefault("variants", {})["parrotGrip"] = {"layer": layer, "mask": mask, "ref": ref}


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--phase", type=int, choices=(1, 2, 3, 4))
    phase = parser.parse_args().phase
    manifest_path = PUBLIC / "manifest.json"
    manifest_path.parent.mkdir(parents=True, exist_ok=True)
    if manifest_path.exists():
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    else:
        manifest = {"version": 2, "canvas": 512, "palette": {}, "slots": {}}
    if phase in (None, 1):
        package_phase1(manifest)
    if phase == 2 or (phase is None and (SOURCE / "hat").is_dir()):
        package_phase2(manifest)
    if phase == 3 or (phase is None and (SOURCE / "clothes").is_dir()):
        package_phase3(manifest)
    if phase == 4 or (phase is None and (SOURCE / "pet").is_dir()):
        package_phase4(manifest)
    staging = manifest_path.with_suffix(".json.tmp")
    staging.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    staging.replace(manifest_path)


if __name__ == "__main__":
    main()
