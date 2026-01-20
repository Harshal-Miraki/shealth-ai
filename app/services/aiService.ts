export interface AnalysisResponse {
  status: string;
  analysis: string;
  finding: string;
  confidence: number;
  timestamp: string;
  recommendation: string;
}

export const aiService = {
  /**
   * Converts a File object to a Base64 string.
   */
  convertToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  },

  /**
   * Sends the image and metadata to the backend API for analysis.
   */
  async analyzeScan(file: File, metadata: any): Promise<AnalysisResponse> {
    try {
      const base64Image = await this.convertToBase64(file);

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: base64Image, // The large payload
          metadata: metadata,
        }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("AI Analysis Failed:", error);
      throw error;
    }
  }
};
