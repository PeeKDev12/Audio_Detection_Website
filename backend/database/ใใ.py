# -*- coding: utf-8 -*-
import tensorflow as tf
from tensorflow.keras.models import load_model
import numpy as np
import pickle
from sklearn.metrics import accuracy_score, f1_score, confusion_matrix

# โหลดโมเดลที่ผ่านการฝึกแล้ว
model = load_model("ResNet34_FusionFeature.h5", compile=False)

# โหลดข้อมูลทดสอบ
with open("LFCC_test_F0_10.pkl", "rb") as f:
    X_test = pickle.load(f)
with open("Labels_F0_10.pkl", "rb") as f:
    y_true = pickle.load(f)

# ทำนายผล
y_pred = np.argmax(model.predict(np.array(X_test)), axis=1)

# คำนวณตัวชี้วัด
acc = accuracy_score(y_true, y_pred)
f1 = f1_score(y_true, y_pred)
cm = confusion_matrix(y_true, y_pred)

print("Accuracy:", acc)
print("F1 Score:", f1)
print("Confusion Matrix:\n", cm)
