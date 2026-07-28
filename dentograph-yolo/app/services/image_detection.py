from pathlib import Path
from typing import Any

import cv2
import numpy as np
import torch
from fastapi import HTTPException
from PIL import Image

from app.core.config import device, settings
from app.models.dental import CONDITION_COLORS_BGR, CONDITION_LABELS, FDI_LABELS, FONT_BOLD
from app.schemas.prediction import PredictRequest
from app.services.model_registry import model_registry, vit_transform


class ImageDetectionService:
    def predict(self, payload: PredictRequest) -> dict[str, Any]:
        image_path = Path(payload.image_path)
        radiograph_id = payload.radiograph_id or image_path.stem
        result_dir = Path(payload.result_dir)
        crop_dir = Path(payload.crop_dir)
        crop_prefix = payload.crop_prefix or f"radiographs/crops/{radiograph_id}"

        result_dir.mkdir(parents=True, exist_ok=True)
        crop_dir.mkdir(parents=True, exist_ok=True)

        image_bgr = cv2.imread(str(image_path))
        if image_bgr is None:
            raise HTTPException(status_code=422, detail=f"Image not found: {image_path}")

        img_pil = Image.fromarray(cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB))
        teeth = self._dedupe_teeth_by_fdi(self._run_yolo_inference(image_bgr))
        classifications = self._classify_teeth_batch(img_pil, teeth)
        results = self._build_results(image_bgr, teeth, classifications, crop_dir, crop_prefix, radiograph_id)

        result_name = f"{radiograph_id}_result.jpg"
        self._draw_result(image_bgr, results, result_dir / result_name)

        return {
            "results": results,
            "result_image": f"{payload.result_prefix}/{result_name}",
        }

    def _run_yolo_inference(self, image_bgr: np.ndarray) -> list[dict[str, Any]]:
        img_rgb = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB)
        results = model_registry.yolo_model(img_rgb, verbose=False)[0]
        raw_detections = []

        for box in results.boxes:
            x1, y1, x2, y2 = [int(value) for value in box.xyxy[0].tolist()]
            cls_id = int(box.cls[0].item())
            conf = float(box.conf[0].item())
            raw_detections.append(
                {
                    "bbox": [x1, y1, x2, y2],
                    "cls": cls_id,
                    "conf": conf,
                    "cx": (x1 + x2) / 2,
                    "cy": (y1 + y2) / 2,
                }
            )

        cleaned = self._clean_double_detections(raw_detections)
        if cleaned:
            median_y = np.median([item["cy"] for item in cleaned])
            upper = sorted([item for item in cleaned if item["cy"] < median_y], key=lambda item: item["cx"])
            lower = sorted([item for item in cleaned if item["cy"] >= median_y], key=lambda item: item["cx"])
            cleaned = upper + lower

        return [{**item, "tooth_number": FDI_LABELS.get(item["cls"], str(item["cls"]))} for item in cleaned]

    def _clean_double_detections(self, detections: list[dict[str, Any]]) -> list[dict[str, Any]]:
        if not detections:
            return []

        detections = sorted(detections, key=lambda item: item["conf"], reverse=True)
        keep = []

        while detections:
            best = detections.pop(0)
            keep.append(best)
            detections = [item for item in detections if self._iou(best["bbox"], item["bbox"]) < settings.nms_iou_threshold]

        return keep

    def _iou(self, first_box: list[int], second_box: list[int]) -> float:
        x_a = max(first_box[0], second_box[0])
        y_a = max(first_box[1], second_box[1])
        x_b = min(first_box[2], second_box[2])
        y_b = min(first_box[3], second_box[3])
        intersection = max(0, x_b - x_a) * max(0, y_b - y_a)
        first_area = (first_box[2] - first_box[0]) * (first_box[3] - first_box[1])
        second_area = (second_box[2] - second_box[0]) * (second_box[3] - second_box[1])

        return intersection / float(first_area + second_area - intersection + 1e-6)

    def _dedupe_teeth_by_fdi(self, teeth: list[dict[str, Any]]) -> list[dict[str, Any]]:
        best_by_fdi = {}

        for tooth in teeth:
            fdi = tooth["tooth_number"]
            if fdi not in best_by_fdi or tooth["conf"] > best_by_fdi[fdi]["conf"]:
                best_by_fdi[fdi] = tooth

        fdi_order = {label: index for index, label in FDI_LABELS.items()}

        return sorted(best_by_fdi.values(), key=lambda tooth: fdi_order.get(tooth["tooth_number"], 999))

    def _classify_teeth_batch(self, img_pil: Image.Image, teeth: list[dict[str, Any]]) -> list[tuple[str, float]]:
        if not teeth:
            return []

        tensors = [vit_transform(img_pil.crop(tuple(tooth["bbox"]))) for tooth in teeth]
        batch = torch.stack(tensors).to(device)

        with torch.no_grad():
            logits = model_registry.vit_model(batch).logits
            probs = torch.softmax(logits, dim=1)
            scores, indexes = torch.max(probs, dim=1)

        return [(CONDITION_LABELS[index.item()], float(score.item())) for index, score in zip(indexes, scores)]

    def _build_results(
        self,
        image_bgr: np.ndarray,
        teeth: list[dict[str, Any]],
        classifications: list[tuple[str, float]],
        crop_dir: Path,
        crop_prefix: str,
        radiograph_id: str,
    ) -> list[dict[str, Any]]:
        results = []

        for tooth, (condition, score) in zip(teeth, classifications):
            x1, y1, x2, y2 = tooth["bbox"]
            crop_name = f"{radiograph_id}_{tooth['tooth_number']}.jpg"
            cv2.imwrite(str(crop_dir / crop_name), image_bgr[y1:y2, x1:x2])
            results.append(
                {
                    "no_fdi": tooth["tooth_number"],
                    "abnormality": condition,
                "analysis": None,
                    "bbox": tooth["bbox"],
                    "confidence": score,
                    "crop_image": f"{crop_prefix}/{crop_name}",
                    "source": "ai",
                }
            )

        return results

    def _draw_result(self, image_bgr: np.ndarray, teeth_results: list[dict[str, Any]], save_path: Path) -> None:
        img = image_bgr.copy()

        for tooth in teeth_results:
            x1, y1, x2, y2 = tooth["bbox"]
            condition = tooth["abnormality"]
            color = CONDITION_COLORS_BGR.get(condition, (180, 180, 180))
            label = f"{tooth['no_fdi']} {condition} {tooth['confidence']:.2f}"
            cv2.rectangle(img, (x1, y1), (x2, y2), color, 2)
            cv2.putText(img, label, (x1, max(18, y1 - 6)), FONT_BOLD, 0.45, color, 1, cv2.LINE_AA)

        cv2.imwrite(str(save_path), img)


image_detection_service = ImageDetectionService()
