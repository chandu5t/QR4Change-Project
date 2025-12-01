from django.http import JsonResponse
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.core.files.storage import default_storage
from ultralytics import YOLO
import os
import json
import torch
import numpy as np
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image

# =========================
# Load Models Once
# =========================

# 1. YOLO model (pothole detection)
yolo_model = YOLO("./weights/best.pt")

# 2. ELECTRA model (urgency classification)
ELECTRA_MODEL_PATH = "./electra_3k_mix_model"
tokenizer = AutoTokenizer.from_pretrained(ELECTRA_MODEL_PATH)
electra_model = AutoModelForSequenceClassification.from_pretrained(ELECTRA_MODEL_PATH)
electra_model.eval()

# 3. Garbage classification model (Inception)
GARBAGE_MODEL_PATH = "./weights/garbage_inception.h5"
garbage_model = load_model(GARBAGE_MODEL_PATH)
garbage_labels = ["No", "Yes"]  # Update with actual class labels
print("✅ All models loaded successfully!")


# =========================
# Utility Functions
# =========================

def predict_urgency(text):
    """Predict urgency level from text using ELECTRA"""
    inputs = tokenizer(
        text,
        return_tensors="pt",
        truncation=True,
        padding=True,
        max_length=128
    )
    with torch.no_grad():
        outputs = electra_model(**inputs)
        logits = outputs.logits
        predicted_class = torch.argmax(logits, dim=1).item()

    return "High" if predicted_class == 1 else "Low"


def predict_garbage(img_path):
    """Predict garbage presence using InceptionV3 model"""
    img = image.load_img(img_path, target_size=(224, 224))
    img_array = image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    img_array = img_array / 255.0

    preds = garbage_model.predict(img_array)
    predicted_class = (preds > 0.5).astype("int32")[0][0]

    return garbage_labels[predicted_class], float(preds[0][0])


# =========================
# Django Views
# =========================

@method_decorator(csrf_exempt, name='dispatch')
class PathHoleDetectionView(View):
    """YOLO-based pothole detection"""
    def post(self, request):
        if 'image' not in request.FILES:
            return JsonResponse({"error": "No image uploaded"}, status=400)

        image_file = request.FILES['image']
        file_path = default_storage.save("tmp_" + image_file.name, image_file)

        try:
            results = yolo_model(file_path)
            r = results[0]

            top_idx = r.probs.top1
            top_class = r.names[top_idx]
            top_conf = float(r.probs.top1conf)

            result = {
                "prediction": top_class,
                "confidence": round(top_conf, 2)
            }

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

        finally:
            if os.path.exists(file_path):
                os.remove(file_path)

        return JsonResponse(result)


@csrf_exempt
def urgency_view(request):
    """ELECTRA-based urgency classification"""
    if request.method == "POST":
        try:
            body = json.loads(request.body.decode("utf-8"))
            text = body.get("text", "")

            if not text:
                return JsonResponse({"error": "No text provided"}, status=400)

            prediction = predict_urgency(text)
            return JsonResponse({"text": text, "urgency": prediction})

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"message": "Send a POST request with 'text'"})


@csrf_exempt
def garbage_view(request):
    """Garbage classification using InceptionV3"""
    if request.method == "POST":
        if 'image' not in request.FILES:
            return JsonResponse({"error": "No image uploaded"}, status=400)

        image_file = request.FILES['image']
        file_path = default_storage.save("tmp_" + image_file.name, image_file)

        try:
            prediction, confidence = predict_garbage(file_path)
            result = {
                "prediction": prediction,
                "confidence":confidence
            }

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

        finally:
            if os.path.exists(file_path):
                os.remove(file_path)

        return JsonResponse(result)

    return JsonResponse({"message": "Send a POST request with 'image'"})
