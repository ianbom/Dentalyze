try:
    import cv2
except Exception:
    cv2 = None

FDI_LABELS = {
    0: "11",
    1: "12",
    2: "13",
    3: "14",
    4: "15",
    5: "16",
    6: "17",
    7: "18",
    8: "21",
    9: "22",
    10: "23",
    11: "24",
    12: "25",
    13: "26",
    14: "27",
    15: "28",
    16: "31",
    17: "32",
    18: "33",
    19: "34",
    20: "35",
    21: "36",
    22: "37",
    23: "38",
    24: "41",
    25: "42",
    26: "43",
    27: "44",
    28: "45",
    29: "46",
    30: "47",
    31: "48",
}

CONDITION_LABELS = ["Impaksi", "Karies", "LesiPeriapikal", "Normal", "Resorpsi"]

CONDITION_COLORS_BGR = {
    "LesiPeriapikal": (170, 0, 255),
    "Karies": (0, 23, 255),
    "Impaksi": (0, 109, 255),
    "Resorpsi": (205, 188, 0),
    "Normal": (60, 200, 60),
}

FONT_BOLD = cv2.FONT_HERSHEY_DUPLEX if cv2 is not None else 0
