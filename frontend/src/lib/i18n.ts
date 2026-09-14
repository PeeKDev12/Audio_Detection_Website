export type Language = "en" | "th"

export const translations = {
  en: {
    // Header
    brandTitle: "NECTEC AASIST",
    brandSubtitle: "Audio Deepfake Detection",
    navHome: "Overview",
    navDetection: "Detection Lab",
    navHistory: "History",
    navModels: "Model Architectures",
    statusOnline: "API Online",
    statusOffline: "API Offline",
    serverOfflineTitle: "Server Currently Offline",
    serverOfflineDesc: "The detection server is currently unreachable. Please try again later or contact the system administrator / developer for assistance.",
    serverOfflineRetry: "Retry Connection",
    serverOfflineDismiss: "Dismiss",

    // Hero
    heroTag: "Audio Anti-Spoofing & Deepfake Detection",
    heroTitleLine1: "",
    heroTitleLine2: "Audio",
    heroTitleLine3: "Deepfake Detection",
    heroDescription:
      "A high-precision forensic framework designed for automatic speaker verification (ASV). Utilizing integrated spectro-temporal graph attention networks (AASIST) and ResNet-34 residual backbones to counteract synthetic speech, voice conversion, and replay attacks.",
    heroCta: "Start Detection",
    heroMetric1Label: "Native Sampling Rate",
    heroMetric1Val: "16,000 Hz Raw",
    heroMetric2Label: "Min-tDCF Benchmark",
    heroMetric2Val: "0.0782 (EER 0.83%)",
    heroMetric3Label: "Graph Topology",
    heroMetric3Val: "Spectro-Temporal GAT",

    // Detection Section
    sectionDetectionTitle: "Acoustic Inference Lab",
    sectionDetectionSubtitle:
      "Upload audio files for raw waveform decoding, feature extraction, and neural deepfake classification.",
    dropzoneTitle: "Drag and drop audio recordings here",
    dropzoneBrowse: "or browse files from your device",
    dropzoneFormats: "Supported formats: .wav, .mp3, .flac, .m4a, .ogg (16 kHz recommended)",
    queueTitle: "Uploaded Audio Queue",
    clearQueue: "Clear All",
    waveformTitle: "Interactive Waveform Visualizer",
    noFileSelected: "Select or drop an audio recording above to inspect waveform dynamics",
    runButton: "Run Analysis",
    runningButton: "Analyzing audio...",

    // Model Selector
    modelSectionTitle: "Detection Model Registry",
    modelSectionSubtitle:
      "Select your preferred neural models or enable multi-model evaluation.",
    selectAllModels: "Select All Models",
    colModel: "Model Name",
    colExtractor: "Feature Extractor",
    colArch: "Architecture",
    colEer: "EER",
    colF1: "F1-Score",
    colAcc: "Accuracy",

    // First-run Interception Modal
    modalTitle: "Model Configuration Notice",
    modalNoticeHeader: "Default Model Selection",
    modalNoticeText:
      "You are currently using the default LFCC-VAJA+Genuine model. Feel free to explore and select other models (such as AASIST or ResNet-34), or proceed with the default setup now.",
    modalExplore: "Explore Models",
    modalConfirm: "Confirm & Run",

    // Faux Progress Bar
    progressLabel: "Asynchronous Neural Inference",
    phase1: "Reading audio stream and resampling to 16,000 Hz...",
    phase2: "Extracting acoustic filterbanks and spectral features...",
    phase3: "Forwarding spectro-temporal tensors through neural layers...",
    phase4: "Evaluating anti-spoofing probability distribution...",
    phase5: "Generating classification results...",

    // Results
    resultsTitle: "Inference Analysis Results",
    summaryTotal: "Evaluated Files",
    summaryReal: "Authentic (Real)",
    summaryFake: "Synthetic (Fake)",
    summaryAvgConf: "Average Confidence",
    exportCsv: "Export CSV",
    exportJson: "Export JSON",
    verdictReal: "Authentic / Real",
    verdictFake: "Synthetic / Deepfake",
    confidenceLabel: "Confidence Score",

    // History
    historyTitle: "Detection Audit History",
    historySubtitle:
      "Historical records of analyzed audio files stored in the database (sorted newest first).",
    refreshLogs: "Refresh Records",
    searchPlaceholder: "Search records by filename...",
    filterAll: "All",
    filterReal: "Real",
    filterFake: "Fake",
    tableId: "ID",
    tableFilename: "Audio Filename",
    tableVerdict: "Verdict",
    tableConfidence: "Confidence",
    tableTimestamp: "Recorded Date",
    tableAction: "Action",
    emptyHistory: "No prediction history found matching your query.",
    seeMore: "See More",
    noMoreHistory: "All records loaded",
    seeMoreLoading: "Loading more...",

    // Architectures Guide
    guideTitle: "Model Architectures & Technical Guide",
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
    footerCol1Title: "National Electronics and Computer Technology Center (NECTEC)",
    footerCol1Desc:
      "Acoustic AI & Biometric Verification Research, National Science and Technology Development Agency (NSTDA), Thailand.",
    footerCol2Title: "Project Credits",
    footerCredits: "Developed by Suppawish Sinthaworn / NECTEC Internship 2026",
    footerCol3Title: "Contacts",
    footerSpecs: "FastAPI Backend • PyTorch AASIST • React / Vite Frontend",
  },
  th: {
    // Header
    brandTitle: "NECTEC AASIST",
    brandSubtitle: "ระบบตรวจจับเสียงสังเคราะห์ Deepfake",
    navHome: "ภาพรวม",
    navDetection: "วิเคราะห์สัญญาณเสียง",
    navHistory: "ประวัติการตรวจ",
    navModels: "สถาปัตยกรรมโมเดล",
    statusOnline: "ระบบออนไลน์",
    statusOffline: "ระบบออฟไลน์",
    serverOfflineTitle: "ระบบเซิร์ฟเวอร์ออฟไลน์",
    serverOfflineDesc: "ไม่สามารถเชื่อมต่อระบบประมวลผลได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง หรือติดต่อผู้ดูแลระบบ / นักพัฒนาเพื่อขอรับการตรวจสอบ",
    serverOfflineRetry: "ลองเชื่อมต่อใหม่",
    serverOfflineDismiss: "ปิดหน้าต่าง",

    // Hero
    heroTag: "ระบบตรวจจับเสียงสังเคราะห์และป้องกันการปลอมแปลงเสียง",
    heroTitleLine1: "ระบบตรวจจับ",
    heroTitleLine2: "เสียงสังเคราะห์",
    heroTitleLine3: "",
    heroDescription:
      "ระบบตรวจจับเสียงปลอมสำหรับการยืนยันตัวตนด้วยเสียง (ASV) ที่ใช้ AASIST และ ResNet-34 เพื่อวิเคราะห์ความผิดปกติของเสียงและตรวจจับเสียงสังเคราะห์ (TTS), เสียงที่ผ่านการแปลง (Voice Conversion) รวมถึงการโจมตีด้วยการเปิดเสียงบันทึกซ้ำ (Replay Attack)",
    heroCta: "เริ่มการตรวจสอบ",
    heroMetric1Label: "ความถี่การสุ่มสัญญาณ",
    heroMetric1Val: "16,000 Hz Raw",
    heroMetric2Label: "เกณฑ์มาตรฐาน Min-tDCF",
    heroMetric2Val: "0.0782 (EER 0.83%)",
    heroMetric3Label: "โครงสร้างกราฟโมเดล",
    heroMetric3Val: "Spectro-Temporal GAT",

    // Detection Section
    sectionDetectionTitle: "วิเคราะห์สัญญาณเสียง",
    sectionDetectionSubtitle:
      "อัปโหลดไฟล์เสียงเพื่อถอดรหัสรูปคลื่น แปลงคุณลักษณะเชิงความถี่ และประมวลผลด้วยโมเดลโครงข่ายประสาทเทียม",
    dropzoneTitle: "ลากและวางไฟล์เสียงบันทึกที่นี่",
    dropzoneBrowse: "หรือคลิกเพื่อเลือกไฟล์จากอุปกรณ์",
    dropzoneFormats: "รองรับ: .wav, .mp3, .flac, .m4a, .ogg (แนะนำ 16 kHz)",
    queueTitle: "รายการไฟล์เสียงที่เลือก",
    clearQueue: "ล้างรายการ",
    waveformTitle: "คลื่นเสียง (Waveform)",
    noFileSelected: "กรุณาเลือกหรือวางไฟล์เสียงด้านบนเพื่อแสดงผลรูปคลื่นเสียง",
    runButton: "เริ่มการวิเคราะห์",
    runningButton: "กำลังประมวลผล...",

    // Model Selector
    modelSectionTitle: "รายการโมเดลตรวจจับ",
    modelSectionSubtitle:
      "เลือกโมเดลที่ต้องการใช้งาน หรือเปิดใช้งานการประเมินหลายโมเดลพร้อมกัน",
    selectAllModels: "เลือกทุกโมเดล",
    colModel: "ชื่อโมเดล",
    colExtractor: "การสกัดคุณลักษณะ",
    colArch: "สถาปัตยกรรม",
    colEer: "EER",
    colF1: "F1-Score",
    colAcc: "ความแม่นยำ",

    // First-run Interception Modal
    modalTitle: "การแจ้งเตือนการกำหนดค่าโมเดล",
    modalNoticeHeader: "คุณกำลังใช้งานโมเดลมาตรฐานเริ่มต้น",
    modalNoticeText:
      "ระบบถูกตั้งค่าเริ่มต้นให้ใช้โมเดล LFCC-VAJA+Genuine คุณสามารถเลือกสำรวจโมเดลอื่น ๆ (เช่น AASIST หรือ ResNet-34) หรือเริ่มประมวลผลด้วยค่าเริ่มต้นได้ทันที",
    modalExplore: "สำรวจโมเดลก่อน",
    modalConfirm: "ยืนยันและเริ่มการตรวจ",

    // Faux Progress Bar
    progressLabel: "กำลังประมวลผลโมเดลโครงข่ายประสาทเทียม",
    phase1: "กำลังอ่านสัญญาณเสียงและปรับอัตราสุ่มเป็น 16,000 Hz...",
    phase2: "กำลังคำนวณ Filterbanks และสกัดคุณลักษณะทางเสียง...",
    phase3: "กำลังส่งข้อมูลเข้าสู่ชั้นโครงข่าย Graph Attention...",
    phase4: "กำลังประเมินความน่าจะเป็นของการปลอมแปลง...",
    phase5: "กำลังสร้างรายงานผลการจำแนกประเภท...",

    // Results
    resultsTitle: "ผลการวิเคราะห์และจำแนกประเภทเสียง",
    summaryTotal: "จำนวนไฟล์ทั้งหมด",
    summaryReal: "เสียงจริง (Real)",
    summaryFake: "เสียงสังเคราะห์ (Fake)",
    summaryAvgConf: "ความมั่นใจเฉลี่ย",
    exportCsv: "ส่งออก CSV",
    exportJson: "ส่งออก JSON",
    verdictReal: "เสียงจริง / Real",
    verdictFake: "เสียงสังเคราะห์ / Deepfake",
    confidenceLabel: "คะแนนความมั่นใจ",

    // History
    historyTitle: "ประวัติการตรวจสอบย้อนหลัง",
    historySubtitle:
      "บันทึกประวัติการตรวจสอบย้อนหลังที่จัดเก็บในฐานข้อมูล (เรียงจากล่าสุดไปเก่าสุด)",
    refreshLogs: "รีเฟรชข้อมูล",
    searchPlaceholder: "ค้นหาตามชื่อไฟล์...",
    filterAll: "ทั้งหมด",
    filterReal: "เสียงจริง",
    filterFake: "เสียงสังเคราะห์",
    tableId: "ลำดับ",
    tableFilename: "ชื่อไฟล์",
    tableVerdict: "ผลการตรวจ",
    tableConfidence: "ความมั่นใจ",
    tableTimestamp: "วันเวลาที่บันทึก",
    tableAction: "การดำเนินการ",
    emptyHistory: "ไม่พบประวัติการตรวจสอบในระบบ",
    seeMore: "ดูเพิ่มเติม",
    noMoreHistory: "แสดงข้อมูลทั้งหมดแล้ว",
    seeMoreLoading: "กำลังโหลดข้อมูล...",

    // Architectures Guide
    guideTitle: "ข้อมูลทางเทคนิคและสถาปัตยกรรมโมเดล",
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
    footerCredits: "พัฒนาโดย ศุภวิชญ์ สินถาวร / NECTEC Internship 2026",
    footerCol3Title: "สถาปัตยกรรมระบบ",
    footerSpecs: "FastAPI Backend • PyTorch AASIST • React / Vite Frontend",
  },
}
