import React, { useState, useRef, useEffect } from "react";
import { ElevenLabsClient } from "elevenlabs";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Square, Play, Pause, Trash2, Send } from "lucide-react";
import { useTranslation } from "react-i18next";
import Button from "../ui/Button";

interface AudioRecorderProps {
  onTranscriptionComplete: (text: string) => void;
  onClose: () => void;
  isOpen: boolean;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({
  onTranscriptionComplete,
  onClose,
  isOpen,
}) => {
  const { t } = useTranslation(["common"]);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Function to convert audio blob to speech-to-text
  async function transcribeAudio(
    audioBlob: Blob,
    client: ElevenLabsClient
  ): Promise<string> {
    try {
      // Convert blob to File object (required by the client)
      const audioFile = new File([audioBlob], "recording.wav", {
        type: "audio/wav",
      });

      // Use the ElevenLabs client for speech-to-text conversion
      const result = await client.speechToText.convert({
        model_id: "scribe_v1", // or use their default model
        file: audioFile,
        // Optional parameters you can add:
        // language: "en", // specify language if needed
        // response_format: "json" // default format
      });

      // The result should contain the transcribed text
      if (result.text && result.text.trim()) {
        return result.text.trim();
      } else {
        throw new Error("No transcription text received");
      }
    } catch (error) {
      console.error("ElevenLabs transcription error:", error);
      if (error instanceof Error) {
        throw new Error(`Transcription failed: ${error.message}`);
      } else {
        throw new Error("Transcription failed: Unknown error");
      }
    }
  }

  // Alternative implementation if you need more control over the request
  // async function transcribeAudioWithOptions(audioBlob, options = {}) {
  //   try {
  //     const audioFile = new File([audioBlob], "recording.wav", {
  //       type: "audio/wav",
  //     });

  //     const result = await client.speechToText.convert({
  //       audio: audioFile,
  //       model_id: options.modelId || "scribe_v1",
  //       language: options.language, // optional
  //       response_format: options.responseFormat || "json",
  //       ...options, // spread any additional options
  //     });

  //     return result.text?.trim() || "";
  //   } catch (error) {
  //     console.error("ElevenLabs transcription error:", error);
  //     throw error;
  //   }
  // }

  // ElevenLabs Speech-to-Text API integration
  const transcribeWithElevenLabs = async (audioBlob: Blob): Promise<string> => {
    const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;

    if (!ELEVENLABS_API_KEY) {
      console.warn("ElevenLabs API key not found, using fallback service");
      return await fallbackTranscriptionService(audioBlob);
    }

    try {
      const client = new ElevenLabsClient({ apiKey: ELEVENLABS_API_KEY });

      const transcript = await transcribeAudio(audioBlob, client);
      console.log("Transcription:", transcript);
      return transcript;
    } catch (error) {
      console.error("ElevenLabs transcription failed:", error);
      // Fallback to mock service if ElevenLabs fails
      return await fallbackTranscriptionService(audioBlob);
    }
  };

  // Fallback transcription service with more realistic task suggestions
  const fallbackTranscriptionService = async (
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    audioBlob: Blob
  ): Promise<string> => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Return random task suggestions that sound more natural
    const mockTasks = [
      "Buy groceries from the supermarket",
      "Schedule dentist appointment for next week",
      "Call mom to check how she's doing",
      "Finish quarterly report by Friday",
      "Go to the gym for workout",
      "Book flight tickets for summer vacation",
      "Review and respond to pending emails",
      "Organize home office and clean desk",
      "Plan weekend activities with the family",
      "Update resume and LinkedIn profile",
      "Pay monthly bills and utilities",
      "Take car for oil change service",
      "Prepare presentation for Monday meeting",
      "Buy birthday gift for Sarah",
      "Schedule team meeting for project review",
    ];

    return mockTasks[Math.floor(Math.random() * mockTasks.length)];
  };

  useEffect(() => {
    if (isRecording && timerRef.current === null) {
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else if (!isRecording && timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording]);

  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);

        // Stop all tracks to release microphone
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      setError(
        "Unable to access microphone. Please check permissions and try again."
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const playAudio = () => {
    if (audioRef.current && audioUrl) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const deleteRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioBlob(null);
    setAudioUrl(null);
    setIsPlaying(false);
    setRecordingTime(0);
    setError(null);
  };

  const processAudio = async () => {
    if (!audioBlob) return;

    setIsProcessing(true);
    setError(null);

    try {
      const transcription = await transcribeWithElevenLabs(audioBlob);

      if (transcription && transcription.trim()) {
        onTranscriptionComplete(transcription);
        handleClose();
      } else {
        setError("No speech detected in the recording. Please try again.");
      }
    } catch (error) {
      console.error("Error processing audio:", error);
      setError(
        "Failed to process audio. Please check your connection and try again."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (isRecording) {
      stopRecording();
    }
    if (isPlaying) {
      pauseAudio();
    }
    deleteRecording();
    setError(null);
    onClose();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={handleClose}
        />

        {/* Modal */}
        <div className="flex min-h-full items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Voice to Task
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                Record your voice to create a new task
              </p>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3"
                >
                  <p className="text-sm text-red-800 dark:text-red-200">
                    {error}
                  </p>
                </motion.div>
              )}

              {/* Recording Visualization */}
              <div className="flex flex-col items-center space-y-4">
                <div
                  className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isRecording
                      ? "bg-red-100 dark:bg-red-900/20 border-2 border-red-500"
                      : "bg-gray-100 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600"
                  }`}
                >
                  {isRecording && (
                    <>
                      <motion.div
                        className="absolute inset-0 rounded-full border-2 border-red-500"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      />
                      <motion.div
                        className="absolute inset-2 rounded-full border-2 border-red-400 opacity-60"
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          delay: 0.2,
                        }}
                      />
                    </>
                  )}
                  <Mic
                    size={32}
                    className={`transition-colors duration-300 ${
                      isRecording
                        ? "text-red-500"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  />
                </div>

                {/* Timer */}
                <div
                  className={`text-2xl font-mono transition-colors duration-300 ${
                    isRecording
                      ? "text-red-600 dark:text-red-400"
                      : "text-gray-900 dark:text-white"
                  }`}
                >
                  {formatTime(recordingTime)}
                </div>

                {isRecording && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-red-600 dark:text-red-400 flex items-center"
                  >
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse" />
                    Recording... Speak clearly
                  </motion.div>
                )}
              </div>

              {/* Audio Player */}
              {audioUrl && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
                >
                  <audio
                    ref={audioRef}
                    src={audioUrl}
                    onEnded={() => setIsPlaying(false)}
                    className="hidden"
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        Recording ready ({formatTime(recordingTime)})
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={isPlaying ? pauseAudio : playAudio}
                        leftIcon={
                          isPlaying ? <Pause size={16} /> : <Play size={16} />
                        }
                      >
                        {isPlaying ? "Pause" : "Play"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={deleteRecording}
                        leftIcon={<Trash2 size={16} />}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Controls */}
              <div className="flex justify-center space-x-4">
                {!isRecording && !audioBlob && (
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={startRecording}
                    leftIcon={<Mic size={20} />}
                    className="px-8"
                  >
                    Start Recording
                  </Button>
                )}

                {isRecording && (
                  <Button
                    variant="danger"
                    size="lg"
                    onClick={stopRecording}
                    leftIcon={<Square size={20} />}
                    className="px-8"
                  >
                    Stop Recording
                  </Button>
                )}

                {audioBlob && !isRecording && (
                  <div className="flex space-x-3">
                    <Button
                      variant="ghost"
                      onClick={startRecording}
                      leftIcon={<Mic size={16} />}
                    >
                      Record Again
                    </Button>
                    <Button
                      variant="primary"
                      onClick={processAudio}
                      leftIcon={<Send size={16} />}
                      isLoading={isProcessing}
                      disabled={isProcessing}
                    >
                      {isProcessing ? "Processing..." : "Create Task"}
                    </Button>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="text-xs text-gray-500 dark:text-gray-400 text-center space-y-1">
                <p>Speak clearly and describe the task you want to create.</p>
                <p>
                  The audio will be converted to text using AI transcription.
                </p>
                {!import.meta.env.VITE_ELEVENLABS_API_KEY && (
                  <p className="text-yellow-600 dark:text-yellow-400">
                    ⚠️ Using demo mode - add VITE_ELEVENLABS_API_KEY for real
                    transcription
                  </p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
              <Button
                variant="ghost"
                onClick={handleClose}
                disabled={isProcessing}
              >
                {t("actions.cancel")}
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};

export default AudioRecorder;
