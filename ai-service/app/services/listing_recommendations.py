def recommend_listing_actions(quantity: float, unit: str, surplus: bool) -> list[str]:
    actions = ["keep listing inventory current"]

    if surplus:
        actions.append("notify verified organisations")

    if quantity >= 25 and unit.lower() in {"kg", "box", "boxes"}:
        actions.append("flag as bulk supply")

    return actions
