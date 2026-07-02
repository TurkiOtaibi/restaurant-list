def collapse_whitespace(value: str) -> str:
    return " ".join(value.split())


def strip_if_string(value: object) -> object:
    if isinstance(value, str):
        return value.strip()
    return value
