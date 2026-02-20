/**
 * Cartivo Story Intelligence™ — Video Analysis Page
 *
 * Lets users upload a video file and runs the full Story Intelligence pipeline:
 *   1. Frame sampling
 *   2. Scene segmentation
 *   3. Character tracking
 *   4. Key moment detection
 *
 * All processing happens in-browser — no video data leaves the device.
 */

import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Film,
  Upload,
  Loader2,
  Play,
  ShieldCheck,
  AlertTriangle,
  Users,
  Layers,
  Zap,
} from 'lucide-react'

import {
  validateVideoFile,
  loadVideoMetadata,
  collectFrames,
  SUPPORTED_VIDEO_TYPES,
  MAX_VIDEO_SIZE_MB,
} from '../../services/storyIntelligence/videoFrameSampler'
import { detectScenes } from '../../services/storyIntelligence/sceneSegmentation'
import { trackCharacters } from '../../services/storyIntelligence/characterTracking'
import { detectKeyMoments } from '../../services/storyIntelligence/keyMomentDetection'
import type {
  StoryIntelligenceResult,
  PipelineProgress,
  PipelineStep,
} from '../../services/storyIntelligence/types'

// ── Pipeline helpers ─────────────────────────────────────────────────────────

const STEPS: PipelineStep[] = [
  'sampling-frames',
  'segmenting-scenes',
  'tracking-characters',
  'detecting-moments',
  'done',
]

const STEP_LABELS: Record<PipelineStep, string> = {
  idle: 'Ready',
  'sampling-frames': 'Sampling frames…',
  'segmenting-scenes': 'Segmenting scenes…',
  'tracking-characters': 'Tracking characters…',
  'detecting-moments': 'Detecting key moments…',
  'extracting-outfits': 'Extracting outfits…',
  'mapping-bundles': 'Mapping bundles…',
  'scoring-confidence': 'Scoring confidence…',
  done: 'Analysis complete',
  error: 'Error',
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ProgressBar({ progress }: { progress: PipelineProgress }) {
  const overall = Math.floor(
    (progress.stepIndex / progress.totalSteps) * 100 +
    progress.stepProgress / progress.totalSteps
  )

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm font-medium text-slate-700">
        <span>{STEP_LABELS[progress.step]}</span>
        <span>{overall}%</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-indigo-500"
          animate={{ width: `${overall}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
      <p className="text-xs text-slate-400">{progress.message}</p>
    </div>
  )
}

function SceneGrid({ result }: { result: StoryIntelligenceResult }) {
  return (
    <div className="space-y-4">
      <h3 className="font-bold text-slate-800 flex items-center gap-2">
        <Layers className="w-4 h-4 text-indigo-500" />
        {result.scenes.length} Scene{result.scenes.length !== 1 ? 's' : ''} Detected
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {result.scenes.slice(0, 6).map((scene) => (
          <div
            key={scene.sceneId}
            className="rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm"
          >
            <img
              src={scene.thumbnailDataUrl}
              alt={`Scene ${scene.sceneId}`}
              className="w-full aspect-video object-cover"
            />
            <div className="p-2 space-y-0.5">
              <p className="text-xs font-bold text-slate-700">{scene.sceneId}</p>
              <p className="text-[10px] text-slate-400">
                {scene.startTime.toFixed(1)}s – {scene.endTime.toFixed(1)}s
              </p>
              <div className="flex items-center gap-1">
                <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-400 rounded-full"
                    style={{ width: `${scene.motionIntensity}%` }}
                  />
                </div>
                <span className="text-[9px] text-slate-400">{scene.motionIntensity}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function CharacterList({ result }: { result: StoryIntelligenceResult }) {
  return (
    <div className="space-y-4">
      <h3 className="font-bold text-slate-800 flex items-center gap-2">
        <Users className="w-4 h-4 text-indigo-500" />
        {result.characters.length} Character{result.characters.length !== 1 ? 's' : ''} Tracked
      </h3>
      <div className="space-y-3">
        {result.characters.map((char) => (
          <div
            key={char.characterId}
            className="flex items-center gap-3 bg-white rounded-2xl border border-slate-200 p-3 shadow-sm"
          >
            <img
              src={char.thumbnailDataUrl}
              alt={char.label}
              className="w-12 h-12 rounded-xl object-cover border border-slate-100 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-800 text-sm">{char.label}</p>
              <p className="text-xs text-slate-500">
                {char.firstSeen.toFixed(1)}s – {char.lastSeen.toFixed(1)}s ·{' '}
                {char.sceneAppearances.length} scene{char.sceneAppearances.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="text-right shrink-0">
              <div className="text-sm font-extrabold text-indigo-600">{char.trackingConfidence}%</div>
              <div className="text-[10px] text-slate-400">confidence</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function MomentList({ result }: { result: StoryIntelligenceResult }) {
  return (
    <div className="space-y-4">
      <h3 className="font-bold text-slate-800 flex items-center gap-2">
        <Zap className="w-4 h-4 text-indigo-500" />
        {result.keyMoments.length} Key Moment{result.keyMoments.length !== 1 ? 's' : ''}
      </h3>
      <div className="space-y-2">
        {result.keyMoments.slice(0, 8).map((moment) => (
          <div
            key={moment.momentId}
            className="flex items-center gap-3 bg-white rounded-xl border border-slate-200 p-3 shadow-sm"
          >
            <img
              src={moment.thumbnailDataUrl}
              alt={moment.type}
              className="w-10 h-10 rounded-lg object-cover border border-slate-100 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                  {moment.type}
                </span>
                <span className="text-[10px] text-slate-400">{moment.timeCode.toFixed(1)}s</span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5 line-clamp-1">{moment.description}</p>
            </div>
            <div className="text-right shrink-0">
              <div className="text-sm font-extrabold text-slate-700">{moment.importanceScore}</div>
              <div className="text-[10px] text-slate-400">score</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Main page ────────────────────────────────────────────────────────────────

export function StoryIntelligence() {
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [progress, setProgress] = useState<PipelineProgress | null>(null)
  const [result, setResult] = useState<StoryIntelligenceResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'scenes' | 'characters' | 'moments'>('scenes')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = useCallback((file: File) => {
    try {
      validateVideoFile(file)
      setVideoFile(file)
      setResult(null)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid file.')
    }
  }, [])

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) handleFileChange(f)
    e.target.value = ''
  }

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const f = e.dataTransfer.files?.[0]
      if (f) handleFileChange(f)
    },
    [handleFileChange]
  )

  const runPipeline = async () => {
    if (!videoFile) return
    setError(null)
    setResult(null)
    const startTime = Date.now()
    const totalSteps = STEPS.length - 1 // exclude 'done'

    const updateProgress = (step: PipelineStep, stepIndex: number, stepProgress: number, message: string) => {
      setProgress({ step, stepIndex, totalSteps, stepProgress, message })
    }

    try {
      // Step 1: Load metadata + sample frames
      updateProgress('sampling-frames', 0, 0, 'Loading video metadata…')
      const { video, metadata } = await loadVideoMetadata(videoFile)

      const frames = await collectFrames(video, metadata, 1, (pct) => {
        updateProgress('sampling-frames', 0, pct, `Extracted ${Math.round((pct / 100) * metadata.totalFrames)} frames…`)
      })
      URL.revokeObjectURL(video.src)

      // Step 2: Scene segmentation
      updateProgress('segmenting-scenes', 1, 50, 'Detecting scene boundaries…')
      const scenes = detectScenes(frames)

      // Step 3: Character tracking
      updateProgress('tracking-characters', 2, 50, 'Identifying characters across scenes…')
      const characters = trackCharacters(frames, scenes)

      // Step 4: Key moment detection
      updateProgress('detecting-moments', 3, 50, 'Scoring narrative moments…')
      const keyMoments = detectKeyMoments(frames, scenes, characters)

      setResult({
        videoMetadata: metadata,
        scenes,
        characters,
        keyMoments,
        sceneAnalyses: [],
        bundles: [],
        processingDurationMs: Date.now() - startTime,
      })
      setProgress({ step: 'done', stepIndex: totalSteps, totalSteps, stepProgress: 100, message: 'Analysis complete!' })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Pipeline error.'
      setError(msg)
      setProgress({ step: 'error', stepIndex: 0, totalSteps, stepProgress: 0, message: msg })
    }
  }

  const isRunning = progress !== null && progress.step !== 'done' && progress.step !== 'error'

  return (
    <div className="p-6 md:p-12 max-w-4xl mx-auto space-y-10">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-indigo-100 rounded-2xl flex items-center justify-center">
            <Film className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Story Intelligence™</h1>
            <p className="text-slate-500 text-sm">AI-powered video scene & character analysis</p>
          </div>
        </div>
        <div className="flex items-start gap-2 bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
          <span>
            Video is processed <strong>entirely in your browser</strong> — no data is uploaded or stored.
            Accepted: MP4, MOV, AVI, WebM · Max {MAX_VIDEO_SIZE_MB} MB
          </span>
        </div>
      </div>

      {/* Upload zone */}
      <div
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
          videoFile ? 'border-indigo-400 bg-indigo-50/30' : 'border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/20'
        }`}
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={SUPPORTED_VIDEO_TYPES.join(',')}
          className="hidden"
          onChange={onInputChange}
        />
        {videoFile ? (
          <div className="space-y-2">
            <Film className="w-10 h-10 text-indigo-500 mx-auto" />
            <p className="font-bold text-slate-800">{videoFile.name}</p>
            <p className="text-xs text-slate-400">
              {(videoFile.size / 1024 / 1024).toFixed(1)} MB · Tap to change
            </p>
          </div>
        ) : (
          <div className="space-y-3 text-slate-400">
            <Upload className="w-10 h-10 mx-auto" />
            <p className="font-medium text-slate-600">Drop a video here, or click to browse</p>
            <p className="text-xs">MP4 · MOV · AVI · WebM · max {MAX_VIDEO_SIZE_MB} MB</p>
          </div>
        )}
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-start gap-3 bg-rose-50 border border-rose-200 rounded-xl p-3 text-sm text-rose-700"
          >
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress */}
      {progress && progress.step !== 'idle' && (
        <ProgressBar progress={progress} />
      )}

      {/* Run button */}
      {!isRunning && !result && (
        <button
          onClick={runPipeline}
          disabled={!videoFile}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all"
        >
          <Play className="w-5 h-5" />
          Analyse Video
        </button>
      )}

      {isRunning && (
        <button disabled className="w-full bg-indigo-600 opacity-70 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          Analysing…
        </button>
      )}

      {/* Results */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Summary bar */}
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { icon: <Layers className="w-5 h-5" />, label: 'Scenes', value: result.scenes.length },
              { icon: <Users className="w-5 h-5" />, label: 'Characters', value: result.characters.length },
              { icon: <Zap className="w-5 h-5" />, label: 'Key Moments', value: result.keyMoments.length },
            ].map(({ icon, label, value }) => (
              <div key={label} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                <div className="flex justify-center text-indigo-500 mb-1">{icon}</div>
                <div className="text-2xl font-extrabold text-slate-900">{value}</div>
                <div className="text-xs text-slate-400 font-semibold">{label}</div>
              </div>
            ))}
          </div>

          <div className="text-xs text-slate-400 text-center">
            Processed in {(result.processingDurationMs / 1000).toFixed(1)}s ·{' '}
            {result.videoMetadata.fileName} ·{' '}
            {result.videoMetadata.durationSeconds.toFixed(1)}s ·{' '}
            {result.videoMetadata.width}×{result.videoMetadata.height}
          </div>

          {/* Tab nav */}
          <div className="flex border-b border-slate-100">
            {(['scenes', 'characters', 'moments'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 font-bold text-sm capitalize transition-all relative ${
                  activeTab === tab ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div
                    layoutId="story-tab-underline"
                    className="absolute bottom-0 left-0 right-0 h-[3px] bg-indigo-600 rounded-full"
                  />
                )}
              </button>
            ))}
          </div>

          {activeTab === 'scenes' && <SceneGrid result={result} />}
          {activeTab === 'characters' && <CharacterList result={result} />}
          {activeTab === 'moments' && <MomentList result={result} />}

          <button
            onClick={() => { setResult(null); setProgress(null); setVideoFile(null); setError(null); }}
            className="w-full border border-slate-200 rounded-xl py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all"
          >
            Analyse another video
          </button>
        </motion.div>
      )}
    </div>
  )
}

export default StoryIntelligence
