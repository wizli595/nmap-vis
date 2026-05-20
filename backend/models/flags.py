from pydantic import BaseModel


class NmapFlag(BaseModel):
    flag: str
    name: str
    description: str
    category: str
    has_value: bool = False
    value_hint: str = ""
