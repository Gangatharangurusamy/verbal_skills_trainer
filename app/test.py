import librosa
import soundfile as sf

# ✅ Fix file path (Use raw string `r""` or forward slashes `/`)
audio_path = r"E:\project 1\verbal_skills_trainer\old1.wav"  # Correct way (raw string)
# OR
# audio_path = "E:/project 1/verbal_skills_trainer/old1.wav"  # Using `/` instead of `\`

# ✅ Load and resample audio to 16kHz, mono
audio, sr = librosa.load(audio_path, sr=16000, mono=True)

# ✅ Save as a clean WAV file
sf.write("clean_audio.wav", audio, 16000)

print("✅ Cleaned audio saved as 'clean_audio.wav'")
