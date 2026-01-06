import dcmjs from "dcmjs";

export interface DicomMetadata {
  patientName: string;
  patientId: string;
  studyDate: string;
  modality: string;
  manufacturer: string;
  studyDescription: string;
  seriesDescription: string;
  instanceNumber: string;
}

export const dicomService = {
  async parseDicom(file: File): Promise<{ metadata: DicomMetadata; dataset: any }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          const dicomData = dcmjs.data.DicomMessage.readFile(arrayBuffer);
          const dataset = dcmjs.data.DicomMetaDictionary.naturalizeDataset(dicomData.dict);

          const metadata: DicomMetadata = {
            patientName: dataset.PatientName ? dataset.PatientName.Alphabetic || dataset.PatientName : "Anonymized",
            patientId: dataset.PatientID || "Unknown",
            studyDate: dataset.StudyDate ? formatDicomDate(dataset.StudyDate) : "Unknown",
            modality: dataset.Modality || "Unknown",
            manufacturer: dataset.Manufacturer || "Unknown",
            studyDescription: dataset.StudyDescription || "Medical Scan",
            seriesDescription: dataset.SeriesDescription || "",
            instanceNumber: dataset.InstanceNumber || "1"
          };
          
          resolve({ metadata, dataset });
        } catch (error) {
          reject(new Error("Failed to parse DICOM file. Ensure it is a valid .dcm file."));
        }
      };

      reader.onerror = () => reject(new Error("Error reading file."));
      reader.readAsArrayBuffer(file);
    });
  }
};

function formatDicomDate(dateStr: string): string {
  if (!dateStr || dateStr.length !== 8) return dateStr;
  const year = dateStr.substring(0, 4);
  const month = dateStr.substring(4, 6);
  const day = dateStr.substring(6, 8);
  return `${year}-${month}-${day}`;
}
