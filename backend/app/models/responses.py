from pydantic import BaseModel

class HealthResponse(BaseModel):
    status: str

class FontResponse(BaseModel):
    font_url: str
    font_name: str