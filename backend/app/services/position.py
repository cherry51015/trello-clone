REBALANCE_THRESHOLD = 0.001


def between(prev: float | None, next_: float | None) -> float:
    if prev is None and next_ is None:
        return 1.0

    if prev is None:
        return next_ / 2

    if next_ is None:
        return prev + 1.0

    return (prev + next_) / 2


def needs_rebalance(positions: list[float]) -> bool:
    sorted_positions = sorted(positions)

    for i in range(len(sorted_positions) - 1):
        gap = sorted_positions[i + 1] - sorted_positions[i]

        if gap < REBALANCE_THRESHOLD:
            return True

    return False


def rebalance(count: int) -> list[float]:
    return [float(i + 1) for i in range(count)]