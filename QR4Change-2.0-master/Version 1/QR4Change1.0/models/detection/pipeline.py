from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.files.storage import default_storage
from ultralytics import YOLO
import os

# Load YOLO model once (global)
model = YOLO("./weights/best.pt")

@csrf_exempt
def classify_image(request):
    if request.method == "POST" and request.FILES.get("image"):
        # Save uploaded image
        img_file = request.FILES["image"]
        img_path = default_storage.save("tmp/" + img_file.name, img_file)

        # Run YOLO classification
        results = model(img_path)
        r = results[0]
        cls_name = r.names[int(r.probs.top1)]
        conf = float(r.probs.top1conf)

        # Cleanup temp file
        os.remove(img_path)

        return JsonResponse({
            "prediction": cls_name,
            "confidence": conf
        })
    return JsonResponse({"error": "POST an image file"}, status=400)
