from app.core.config import device, settings
from app.models.dental import CONDITION_LABELS

_vit_transform = None


def vit_transform(image):
    global _vit_transform

    if _vit_transform is None:
        import torchvision.transforms as transforms

        _vit_transform = transforms.Compose(
            [
                transforms.Resize((224, 224)),
                transforms.ToTensor(),
                transforms.Normalize(mean=[0.5, 0.5, 0.5], std=[0.5, 0.5, 0.5]),
            ]
        )

    return _vit_transform(image)


def normalize_vit_state_dict_keys(state_dict):
    normalized = {}

    for raw_key, value in state_dict.items():
        key = raw_key.replace("module.", "")
        key = key.replace("vit.encoder.layer.", "vit.layers.")
        key = key.replace(".attention.attention.query.", ".attention.q_proj.")
        key = key.replace(".attention.attention.key.", ".attention.k_proj.")
        key = key.replace(".attention.attention.value.", ".attention.v_proj.")
        key = key.replace(".attention.output.dense.", ".attention.o_proj.")
        key = key.replace(".intermediate.dense.", ".mlp.fc1.")
        key = key.replace(".output.dense.", ".mlp.fc2.")
        normalized[key] = value

    return normalized


class ModelRegistry:
    def __init__(self) -> None:
        self._yolo_model = None
        self._vit_model = None

    @property
    def yolo_model(self):
        if self._yolo_model is None:
            from ultralytics import YOLO

            model = YOLO(settings.yolo_model_path)
            model.overrides["conf"] = settings.confidence_yolo
            model.overrides["iou"] = settings.nms_iou_threshold
            self._yolo_model = model

        return self._yolo_model

    @property
    def vit_model(self):
        if self._vit_model is None:
            import torch
            from transformers import ViTConfig, ViTForImageClassification

            config = ViTConfig.from_pretrained("google/vit-large-patch16-224")
            config.num_labels = len(CONDITION_LABELS)
            model = ViTForImageClassification(config)
            checkpoint = torch.load(settings.vit_model_path, map_location=device)
            state_dict = checkpoint.get("model_state_dict", checkpoint)
            state_dict = normalize_vit_state_dict_keys(state_dict)
            model.load_state_dict(state_dict)
            model.to(device)
            model.eval()
            self._vit_model = model

        return self._vit_model


model_registry = ModelRegistry()
