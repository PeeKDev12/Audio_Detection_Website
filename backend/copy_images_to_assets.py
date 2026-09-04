import os
import shutil

# 🔧 ปรับพาธต้นทางที่มีรูปภาพ
source_dir = r"D:\NECTEC\ASV"
# 🔧 ปรับพาธปลายทางใน Angular โปรเจกต์
destination_dir = r"D:\NECTEC\ASV\asv-deepfake-detector\src\assets\images"

# ✅ รองรับเฉพาะไฟล์ภาพที่ต้องการ
image_extensions = (".jpg", ".jpeg", ".png", ".gif", ".webp")

# ✔️ สร้างปลายทางถ้ายังไม่มี
os.makedirs(destination_dir, exist_ok=True)

# 🔁 วนลูปค้นหารูปภาพทั้งหมด
for filename in os.listdir(source_dir):
    if filename.lower().endswith(image_extensions):
        src_path = os.path.join(source_dir, filename)
        dst_path = os.path.join(destination_dir, filename)

        try:
            shutil.copy2(src_path, dst_path)
            print(f"✅ คัดลอก {filename} ไปที่ assets/images เรียบร้อยแล้ว")
        except Exception as e:
            print(f"❌ คัดลอก {filename} ล้มเหลว: {e}")
