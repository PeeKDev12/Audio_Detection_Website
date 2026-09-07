export type Language = "en" | "th"

export const translations = {
  en: {
    // Header
    brandTitle: "NECTEC // AASIST",
    brandSubtitle: "Audio Deepfake Detection Monograph",
    navHome: "01 // OVERVIEW",
    navDetection: "02 // LAB",
    navHistory: "03 // LEDGER",
    navModels: "04 // ARCHITECTURES",
    statusOnline: "API ONLINE",
    statusOffline: "API OFFLINE",

    // Hero
    heroTag: "SPECIFICATION NO. 2026-ASV // AUDIO ANTI-SPOOFING",
    heroTitleLine1: "STATE-OF-THE-ART",
    heroTitleLine2: "DEEPFAKE AUDIO",
    heroTitleLine3: "DETECTION.",
    heroDescription:
      "A high-precision forensic framework designed for automatic speaker verification (ASV). Utilizing integrated spectro-temporal graph attention networks (AASIST) and ResNet-34 residual backbones to counteract synthetic speech, voice conversion, and replay attacks.",
    heroCta: "START DETECTION",
    heroMetric1Label: "NATIVE SAMPLING",
    heroMetric1Val: "16,000 HZ RAW",
    heroMetric2Label: "MIN-TDCF BENCHMARK",
    heroMetric2Val: "0.0782 // EER 0.83%",
    heroMetric3Label: "GRAPH TOPOLOGY",
    heroMetric3Val: "SPECTRO-TEMPORAL GAT",

    // Detection Section
    sectionDetectionTitle: "02 // ACOUSTIC INFERENCE LAB",
    sectionDetectionSubtitle:
      "Upload audio streams for raw waveform decoding, filterbank decomposition, and deep tensor classification.",
    dropzoneTitle: "DRAG & DROP RAW AUDIO RECORDING",
    dropzoneBrowse: "OR BROWSE LOCAL FILESYSTEM",
    dropzoneFormats: "ACCEPT: .WAV, .MP3, .FLAC, .M4A, .OGG (16 KHZ MONO RECOMMENDED)",
    queueTitle: "INGESTION QUEUE",
    clearQueue: "CLEAR_QUEUE",
    waveformTitle: "SPECTRO-TEMPORAL WAVEFORM MONITOR",
    noFileSelected: "NO AUDIO INGESTED // DROP A FILE TO RENDER WAVEFORM DYNAMICS",
    runButton: "RUN ASYNCHRONOUS INFERENCE",
    runningButton: "PROCESSING INFERENCE...",

    // Model Selector
    modelSectionTitle: "NEURAL MODEL REGISTRY",
    modelSectionSubtitle:
      "Engineering logbook of deployed classification graphs. Select target model or enable multi-model verification.",
    selectAllModels: "SELECT ALL MODELS",
    colModel: "MODEL DESIGNATION",
    colExtractor: "FEATURE EXTRACTOR",
    colArch: "ARCHITECTURE",
    colEer: "EER",
    colF1: "F1-SCORE",
    colAcc: "ACCURACY",
    colStatus: "STATE",

    // First-run Interception Modal
    modalTitle: "SYSTEM DISPATCH // MODEL CONFIGURATION NOTICE",
    modalNoticeHeader: "DEFAULT BENCHMARK SELECTION",
    modalNoticeText:
      "The engine is currently set to the baseline LFCC-VAJA+Genuine model. You may explore alternative architectures (such as AASIST raw graph attention or ResNet-34 PA/LA) or execute immediate inference.",
    modalExplore: "EXPLORE REGISTRY",
    modalConfirm: "CONFIRM & RUN",

    // Faux Progress Bar
    progressLabel: "ASYNCHRONOUS THREADPOOL INFERENCE",
    phase1: "[SYS_DECODE] Reading audio stream & resampling to 16,000 Hz...",
    phase2: "[DSP_EXTRACT] Computing Linear/Mel filterbanks & cepstral deltas...",
    phase3: "[TENSOR_FORWARD] Forwarding spectro-temporal tensor through graph layers...",
    phase4: "[DECISION_BOUNDARY] Evaluating spoofing probability distribution...",
    phase5: "[REPORT_GEN] Finalizing classification ledger...",

    // Results
    resultsTitle: "02.B // INFERENCE VERDICT LEDGER",
    summaryTotal: "EVALUATED SAMPLES",
    summaryReal: "BONAFIDE (REAL)",
    summaryFake: "SPOOF (DEEPFAKE)",
    summaryAvgConf: "MEAN CONFIDENCE",
    exportCsv: "EXPORT .CSV",
    exportJson: "EXPORT .JSON",
    verdictReal: "BONAFIDE // REAL",
    verdictFake: "SPOOF // DEEPFAKE",
    confidenceLabel: "CONFIDENCE SCORE",

    // History
    historyTitle: "03 // HISTORICAL AUDIT LEDGER",
    historySubtitle:
      "Immutable log of past inference events persisted in local SQLite storage (sorted newest first).",
    refreshLogs: "REFRESH_LEDGER",
    searchPlaceholder: "Search ledger by filename...",
    filterAll: "ALL ENTRIES",
    filterReal: "BONAFIDE",
    filterFake: "SPOOF",
    tableId: "INDEX",
    tableFilename: "FILENAME",
    tableVerdict: "VERDICT",
    tableConfidence: "CONFIDENCE",
    tableTimestamp: "TIMESTAMP (UTC)",
    tableAction: "ACTION",
    emptyHistory: "No audit records found in database.",

    // Architectures Guide
    guideTitle: "04 // ARCHITECTURAL MONOGRAPHS",
    guideSubtitle: "Comprehensive technical specifications of countermeasure neural models.",
    resnetTitle: "ResNet-34 Residual Classifiers (PA & LA)",
    resnetDesc:
      "34-layer deep residual network utilizing identity shortcut mappings to prevent gradient degradation across dense spectral frames.",
    aasistTitle: "AASIST: Integrated Spectro-Temporal Graph Attention",
    aasistDesc:
      "Operates directly on 1D raw waveforms (16 kHz). Employs heterogeneous graph attention to model joint spectral-temporal artifact correlations.",
    lfccTitle: "LFCC (Linear Frequency Cepstral Coefficients)",
    lfccDesc:
      "Linearly spaced filterbanks capture high-frequency spectral phase anomalies generated by neural vocoders and synthesis filters.",
    mfccTitle: "MFCC (Mel-Frequency Cepstral Coefficients)",
    mfccDesc:
      "Logarithmic filterbanks with boundary head/tail margin concatenation to highlight onset/offset discontinuities.",

    // Footer
    footerCol1Title: "NATIONAL ELECTRONICS AND COMPUTER TECHNOLOGY CENTER",
    footerCol1Desc:
      "Acoustic AI & Biometric Verification Research Group, National Science and Technology Development Agency (NSTDA), Thailand.",
    footerCol2Title: "TECHNICAL CREDITS",
    footerCredits: "Developed by [Your Name] // NECTEC Internship 2026",
    footerCol3Title: "SYSTEM ARCHITECTURE",
    footerSpecs: "FastAPI Async Engine // PyTorch AASIST // React 19 Editorial",
  },
  th: {
    // Header
    brandTitle: "NECTEC // AASIST",
    brandSubtitle: "เอกสารทางวิชาการและการตรวจสอบเสียงสังเคราะห์ (Deepfake)",
    navHome: "01 // ภาพรวม",
    navDetection: "02 // ระบบตรวจจับ",
    navHistory: "03 // ประวัติการตรวจ",
    navModels: "04 // สถาปัตยกรรมโมเดล",
    statusOnline: "ระบบออนไลน์",
    statusOffline: "ระบบออฟไลน์",

    // Hero
    heroTag: "ข้อกำหนดทางเทคนิคฉบับที่ 2026-ASV // การป้องกันเสียงปลอมแปลง",
    heroTitleLine1: "ระบบตรวจจับเสียงสังเคราะห์",
    heroTitleLine2: "DEEPFAKE AUDIO",
    heroTitleLine3: "ความแม่นยำสูง.",
    heroDescription:
      "กรอบงานการตรวจพิสูจน์เสียงขั้นสูงสำหรับระบบยืนยันตัวตนด้วยเสียงพูด (ASV) ขับเคลื่อนด้วยโครงข่ายกราฟความสนใจเชิงสเปกโทร-เทมพอรัล (AASIST) และสถาปัตยกรรม ResNet-34 เพื่อตรวจจับเสียงสังเคราะห์ (TTS), การแปลงเสียง (Voice Conversion) และการเปิดเสียงซ้ำ (Replay Attack)",
    heroCta: "เริ่มการตรวจสอบ",
    heroMetric1Label: "ความถี่การสุ่มสัญญาณ",
    heroMetric1Val: "16,000 HZ RAW",
    heroMetric2Label: "มาตรฐาน MIN-TDCF",
    heroMetric2Val: "0.0782 // EER 0.83%",
    heroMetric3Label: "โครงสร้างกราฟโมเดล",
    heroMetric3Val: "SPECTRO-TEMPORAL GAT",

    // Detection Section
    sectionDetectionTitle: "02 // ห้องปฏิบัติการวิเคราะห์สัญญาณเสียง",
    sectionDetectionSubtitle:
      "อัปโหลดไฟล์เสียงเพื่อถอดรหัสรูปคลื่น แปลงคุณลักษณะเชิงความถี่ และประมวลผลด้วยโมเดลโครงข่ายประสาทเทียม",
    dropzoneTitle: "ลากและวางไฟล์เสียงบันทึกที่นี่",
    dropzoneBrowse: "หรือเลือกไฟล์จากอุปกรณ์ของคุณ",
    dropzoneFormats: "รองรับ: .WAV, .MP3, .FLAC, .M4A, .OGG (แนะนำ 16 KHZ MONO)",
    queueTitle: "รายการไฟล์เสียงที่รอตรวจสอบ",
    clearQueue: "ล้างรายการ",
    waveformTitle: "หน้าจอมอนิเตอร์รูปคลื่นเสียง (SPECTRO-TEMPORAL WAVEFORM)",
    noFileSelected: "ยังไม่มีไฟล์เสียง // กรุณาวางไฟล์เพื่อแสดงผลรูปคลื่นเสียง",
    runButton: "ประมวลผลการวิเคราะห์แบบอะซิงโครนัส",
    runningButton: "กำลังประมวลผลโมเดล...",

    // Model Selector
    modelSectionTitle: "ทะเบียนโมเดลปัญญาประดิษฐ์ (MODEL REGISTRY)",
    modelSectionSubtitle:
      "รายการโมเดลตรวจจับที่พร้อมใช้งาน เลือกโมเดลที่ต้องการหรือเปิดใช้งานการเปรียบเทียบหลายโมเดลพร้อมกัน",
    selectAllModels: "เลือกทุกโมเดล",
    colModel: "ชื่อโมเดล",
    colExtractor: "การสกัดคุณลักษณะ",
    colArch: "สถาปัตยกรรม",
    colEer: "EER",
    colF1: "F1-SCORE",
    colAcc: "ความแม่นยำ",
    colStatus: "สถานะ",

    // First-run Interception Modal
    modalTitle: "ระบบแจ้งเตือน // การกำหนดค่าโมเดลเริ่มต้น",
    modalNoticeHeader: "คุณกำลังใช้งานโมเดลมาตรฐานเริ่มต้น",
    modalNoticeText:
      "ระบบถูกตั้งค่าเริ่มต้นให้ใช้โมเดล LFCC-VAJA+Genuine คุณสามารถเลือกสำรวจโมเดลอื่น ๆ (เช่น AASIST หรือ ResNet-34 PA/LA) หรือเริ่มประมวลผลด้วยค่าเริ่มต้นได้ทันที",
    modalExplore: "สำรวจโมเดลก่อน",
    modalConfirm: "ยืนยันและเริ่มการตรวจ",

    // Faux Progress Bar
    progressLabel: "กำลังประมวลผลใน THREADPOOL แบบอะซิงโครนัส",
    phase1: "[SYS_DECODE] กำลังอ่านสัญญาณเสียงและปรับอัตราสุ่มเป็น 16,000 Hz...",
    phase2: "[DSP_EXTRACT] กำลังคำนวณ Linear/Mel Filterbanks และ Cepstral Deltas...",
    phase3: "[TENSOR_FORWARD] กำลังส่งเทนเซอร์เข้าสู่ชั้นโครงข่าย Graph Attention...",
    phase4: "[DECISION_BOUNDARY] กำลังประเมินการแจกแจงความน่าจะเป็นของการปลอมแปลง...",
    phase5: "[REPORT_GEN] กำลังสร้างรายงานผลการจำแนกประเภท...",

    // Results
    resultsTitle: "02.B // บันทึกผลการวิเคราะห์เสียง (INFERENCE VERDICT)",
    summaryTotal: "จำนวนไฟล์ทั้งหมด",
    summaryReal: "เสียงจริง (BONAFIDE)",
    summaryFake: "เสียงสังเคราะห์ (SPOOF)",
    summaryAvgConf: "ความมั่นใจเฉลี่ย",
    exportCsv: "ส่งออก .CSV",
    exportJson: "ส่งออก .JSON",
    verdictReal: "เสียงจริง // BONAFIDE",
    verdictFake: "เสียงสังเคราะห์ // SPOOF",
    confidenceLabel: "คะแนนความมั่นใจ",

    // History
    historyTitle: "03 // ประวัติการตรวจสอบย้อนหลัง (AUDIT LEDGER)",
    historySubtitle:
      "บันทึกประวัติการตรวจสอบย้อนหลังที่จัดเก็บในฐานข้อมูล SQLite ในเครื่อง (เรียงจากล่าสุดไปเก่าสุด)",
    refreshLogs: "รีเฟรชข้อมูล",
    searchPlaceholder: "ค้นหาตามชื่อไฟล์...",
    filterAll: "ทั้งหมด",
    filterReal: "เสียงจริง",
    filterFake: "เสียงสังเคราะห์",
    tableId: "ลำดับ",
    tableFilename: "ชื่อไฟล์",
    tableVerdict: "ผลการตรวจ",
    tableConfidence: "ความมั่นใจ",
    tableTimestamp: "วันเวลาที่บันทึก (UTC)",
    tableAction: "การดำเนินการ",
    emptyHistory: "ไม่พบประวัติการตรวจสอบในระบบ",

    // Architectures Guide
    guideTitle: "04 // ข้อมูลทางเทคนิคและสถาปัตยกรรมโมเดล",
    guideSubtitle: "คำอธิบายเชิงลึกเกี่ยวกับโมเดลและขั้นตอนการสกัดคุณลักษณะเสียง",
    resnetTitle: "ResNet-34 Residual Classifiers (PA & LA)",
    resnetDesc:
      "โครงข่ายประสาทเทียมตกค้าง 34 ชั้น ใช้ Identity Shortcut ป้องกันการสูญเสียเกรเดียนต์เพื่อเรียนรู้สเปกตรัมที่ซับซ้อน",
    aasistTitle: "AASIST: Integrated Spectro-Temporal Graph Attention",
    aasistDesc:
      "ประมวลผลบนสัญญาณรูปคลื่น 16 kHz โดยตรง ใช้โครงข่าย Graph Attention เชื่อมโยงความผิดปกติเชิงเวลาและความถี่พร้อมกัน",
    lfccTitle: "LFCC (Linear Frequency Cepstral Coefficients)",
    lfccDesc:
      "ฟิลเตอร์ความถี่เชิงเส้น รักษาความผิดปกติของเฟสและสัญญาณความถี่สูงที่เกิดจาก Neural Vocoder",
    mfccTitle: "MFCC (Mel-Frequency Cepstral Coefficients)",
    mfccDesc:
      "ฟิลเตอร์สเกลเมลตามการได้ยินของมนุษย์ ผสานเทคนิคต่อหัวท้าย 20% เพื่อตรวจจับรอยต่อของการสังเคราะห์เสียง",

    // Footer
    footerCol1Title: "ศูนย์เทคโนโลยีอิเล็กทรอนิกส์และคอมพิวเตอร์แห่งชาติ (NECTEC)",
    footerCol1Desc:
      "กลุ่มวิจัยปัญญาประดิษฐ์และการรู้จำเสียงพูด สำนักงานพัฒนาวิทยาศาสตร์และเทคโนโลยีแห่งชาติ (สวทช.) ประเทศไทย",
    footerCol2Title: "เครดิตผู้พัฒนา",
    footerCredits: "พัฒนาโดย [Your Name] // NECTEC Internship 2026",
    footerCol3Title: "สถาปัตยกรรมระบบ",
    footerSpecs: "FastAPI Async Engine // PyTorch AASIST // React 19 Swiss Minimalist",
  },
}
