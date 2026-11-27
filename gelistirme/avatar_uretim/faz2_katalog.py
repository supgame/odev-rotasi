"""Phase 2 styles, prices and shared tint colors."""

COLORS = {
    "red": ("Kırmızı", "d83a3a"),
    "blue": ("Mavi", "448acd"),
    "navy": ("Lacivert", "304779"),
    "turquoise": ("Turkuaz", "39b3a7"),
    "green": ("Yeşil", "579765"),
    "purple": ("Mor", "8655b0"),
    "pink": ("Pembe", "e27da4"),
    "cream": ("Krem", "d8c29d"),
    "brown": ("Kahverengi", "855538"),
    "black": ("Siyah", "352e39"),
    "gold": ("Altın rengi", "cc9951"),
    "plum": ("Mürdüm", "89465d"),
}

# Each tuple describes one drawing. Variants share its layer and mask.
ACCESSORIES = {
    "hat": (
        ("cap", "beyzbol şapkası", 15, ("red", "blue", "green", "black")),
        ("pom", "ponponlu bere", 15, ("red", "purple", "navy", "cream")),
        ("earflap", "kulaklıklı kış beresi", 20, ("blue", "green", "cream")),
        ("cat", "kedi kulaklı bere", 30, ("black", "pink", "purple")),
        ("bucket", "kova şapka", 20, ("turquoise", "cream", "pink", "navy")),
        ("cowboy", "kovboy şapkası", 35, ("brown", "cream", "black")),
        ("wizard", "yıldızlı sihirbaz şapkası", 40, ("purple", "navy", "green")),
        ("pirate", "Korsan şapkası", 40, ()),
        ("crown", "Altın taç", 60, ()),
        ("pilot", "Gözlüklü pilot başlığı", 50, ()),
        ("bear", "ayı kulaklı taç", 30, ("brown", "pink", "cream")),
    ),
    "glasses": (
        ("round", "yuvarlak gözlük", 10, ("plum", "black", "gold")),
        ("square", "kalın kare gözlük", 15, ("navy", "black", "turquoise")),
        ("aviator", "pilot gözlüğü", 25, ("gold", "black")),
        ("sunglasses", "güneş gözlüğü", 20, ("black", "turquoise", "red")),
        ("heart", "kalp gözlük", 25, ("pink", "red")),
        ("star", "yıldız gözlük", 35, ("gold", "purple")),
        ("eyepatch", "Korsan bandı", 25, ()),
    ),
}
