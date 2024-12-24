"use client";

import { useCallback, useRef, useState } from "react";
import Webcam from "react-webcam";
import { api } from "~/trpc/react";

export function UploadButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploadMethod, setUploadMethod] = useState<"webcam" | "file" | null>(null);
  const webcamRef = useRef<Webcam | null>(null);

  const uploadMutation = api.s3.uploadFile.useMutation({
    onSuccess: () => {
      setTimeout(() => {
        closeModal();
      }, 1000);
    },
    onError: (error) => {
      console.error("Upload failed:", error);
    },
  });

  const openModal = () => setIsModalOpen(true);

  const closeModal = () => {
    setIsModalOpen(false);
    setImageSrc(null);
    setFile(null);
    setUploadMethod(null);
  };

  const capture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setImageSrc(imageSrc);
      }
    }
  }, [webcamRef]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    try {
      if (file) {
        const base64Data = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });

        await uploadMutation.mutateAsync({
          base64Data,
          filename: file.name,
          mimetype: file.type,
        });
      } else if (imageSrc) {
        await uploadMutation.mutateAsync({
          base64Data: imageSrc,
          filename: `captured-${Date.now()}.jpg`,
          mimetype: "image/jpeg",
        });
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  return (
    <div>
      <button
        onClick={openModal}
        className="rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20"
      >
        Upload
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-20">
          <div className="bg-black p-8 rounded-md w-[400px] max-w-full">
            <h3 className="text-2xl font-bold text-white mb-4">Upload Your Photo</h3>

            {!uploadMethod && (
              <div className="space-y-4">
                <button
                  onClick={() => setUploadMethod("webcam")}
                  className="w-full px-4 py-3 bg-purple-700 text-white rounded-md hover:bg-purple-800"
                >
                  Use Webcam
                </button>
                <button
                  onClick={() => setUploadMethod("file")}
                  className="w-full px-4 py-3 bg-purple-700 text-white rounded-md hover:bg-purple-800"
                >
                  Upload File
                </button>
              </div>
            )}

            {uploadMethod === "webcam" && (
              <div>
                <div className="mb-4">
                  {imageSrc ? (
                    <img src={imageSrc} alt="Captured" className="w-full rounded-md" />
                  ) : (
                    <Webcam
                      audio={false}
                      ref={webcamRef}
                      screenshotFormat="image/jpeg"
                      width="100%"
                      videoConstraints={{
                        facingMode: "user",
                      }}
                    />
                  )}
                </div>
                {!imageSrc && (
                  <button
                    onClick={capture}
                    className="w-full px-4 py-2 bg-purple-700 text-white rounded-md hover:bg-purple-800 mb-4"
                  >
                    Capture Photo
                  </button>
                )}
              </div>
            )}

            {uploadMethod === "file" && (
              <div className="mb-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="mt-2 p-2 w-full border border-gray-300 rounded-md bg-transparent text-white placeholder-white"
                />
              </div>
            )}

            <div className="flex justify-between mt-4">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                disabled={uploadMutation.status === "loading"}
              >
                Cancel
              </button>
              {(imageSrc || file) && (
                <button
                  onClick={handleUpload}
                  className="px-4 py-2 bg-purple-700 text-white rounded-md hover:bg-purple-800 disabled:bg-purple-500 disabled:cursor-not-allowed"
                  disabled={uploadMutation.status === "loading"}
                >
                  {uploadMutation.status === "loading" ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Uploading...
                    </span>
                  ) : (
                    "Upload"
                  )}
                </button>
              )}
            </div>

            {uploadMethod === "webcam" && imageSrc && (
              <button
                onClick={() => setImageSrc(null)}
                className="mt-4 w-full px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
              >
                Retake Photo
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
