from pathlib import Path

from app.style_model import train_style_model


def test_train_style_model_shape() -> None:
    payload = train_style_model(Path("."), Path("."), sample_count=64)
    assert payload["version"] == "style-regression-v1"
    assert payload["sample_count"] == 64
    assert "coefficients" in payload
    assert "x_scale" in payload["coefficients"]

