import { useMemo, useState } from "react";

type Screen = "landing" | "dashboard" | "upload" | "review" | "settings" | "history";
type UploadMode = "file" | "text" | "url";

type Job = {
  id: string;
  title: string;
  inputType: "image" | "audio" | "video" | "document" | "text";
  status: "queued" | "processing" | "completed" | "failed";
  outputs: string[];
  updatedAt: string;
};

const sampleJobs: Job[] = [
  { id: "JOB-001", title: "Lecture Slide Deck", inputType: "document", status: "processing", outputs: ["summary", "tts"], updatedAt: "2 min ago" },
  { id: "JOB-002", title: "Lab Demo Video", inputType: "video", status: "completed", outputs: ["captions", "transcript"], updatedAt: "1 hour ago" },
  { id: "JOB-003", title: "Campus Map", inputType: "image", status: "failed", outputs: ["alt text"], updatedAt: "today" }
];

const navItems: { key: Screen; label: string }[] = [
  { key: "dashboard", label: "Dashboard" },
  { key: "upload", label: "Upload" },
  { key: "review", label: "Output Preview" },
  { key: "settings", label: "Accessibility Settings" },
  { key: "history", label: "History" }
];

function App() {
  const [screen, setScreen] = useState<Screen>("landing");
  const [uploadMode, setUploadMode] = useState<UploadMode>("file");
  const [highContrast, setHighContrast] = useState(false);
  const [fontScale, setFontScale] = useState(100);
  const [liveMessage, setLiveMessage] = useState("Ready");

  const appClass = useMemo(() => {
    return highContrast ? "app app-high-contrast" : "app";
  }, [highContrast]);

  const goToApp = (target: Screen) => {
    setScreen(target);
    setLiveMessage(`${target} page loaded`);
  };

  if (screen === "landing") {
    return (
      <div className={appClass} style={{ fontSize: `${fontScale}%` }}>
        <div aria-live="polite" className="sr-only">{liveMessage}</div>
        <header className="landing-header">
          <strong>MAL</strong>
          <nav aria-label="Primary">
            <button className="link-button">How it works</button>
            <button className="link-button">Accessibility</button>
            <button className="link-button" onClick={() => goToApp("dashboard")}>Sign in</button>
            <button className="btn btn-primary" onClick={() => goToApp("dashboard")}>Get started</button>
          </nav>
        </header>
        <main id="main-content" className="landing-main">
          <section className="hero">
            <div>
              <h1>Convert multimodal content into accessible output</h1>
              <p>
                MAL accepts text, image, audio, video, and document inputs, then generates accessible formats like alt text,
                captions, summaries, and text-to-speech.
              </p>
              <div className="row">
                <button className="btn btn-primary" onClick={() => goToApp("upload")}>Upload Content</button>
                <button className="btn btn-secondary" onClick={() => goToApp("dashboard")}>View Demo Dashboard</button>
              </div>
            </div>
            <aside className="panel" aria-label="Supported outputs">
              <h2>Supported outputs</h2>
              <ul>
                <li>Screen-reader-friendly text</li>
                <li>Image alt text and long descriptions</li>
                <li>Captions and transcripts</li>
                <li>Simplified summaries</li>
                <li>Text-to-speech audio</li>
              </ul>
            </aside>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className={appClass} style={{ fontSize: `${fontScale}%` }}>
      <a className="skip-link-inline" href="#main-content">Skip to main content</a>
      <div aria-live="polite" className="sr-only">{liveMessage}</div>
      <div className="shell">
        <aside className="sidebar" aria-label="Main navigation">
          <h1>MAL</h1>
          <nav>
            {navItems.map((item) => (
              <button
                key={item.key}
                className={`nav-btn ${screen === item.key ? "active" : ""}`}
                onClick={() => goToApp(item.key)}
              >
                {item.label}
              </button>
            ))}
          </nav>
          <button className="btn btn-secondary" onClick={() => setScreen("landing")}>Sign out</button>
        </aside>
        <main id="main-content" className="content">
          {screen === "dashboard" && <Dashboard onStart={() => goToApp("upload")} />}
          {screen === "upload" && (
            <UploadScreen
              mode={uploadMode}
              onModeChange={setUploadMode}
              onSubmit={() => {
                setLiveMessage("Job submitted and queued");
                goToApp("review");
              }}
            />
          )}
          {screen === "review" && <ReviewScreen />}
          {screen === "settings" && (
            <SettingsScreen
              highContrast={highContrast}
              onContrastChange={setHighContrast}
              fontScale={fontScale}
              onFontScaleChange={setFontScale}
            />
          )}
          {screen === "history" && <HistoryScreen />}
        </main>
      </div>
    </div>
  );
}

function Dashboard({ onStart }: { onStart: () => void }) {
  return (
    <section>
      <div className="section-head">
        <h2>Dashboard</h2>
        <button className="btn btn-primary" onClick={onStart}>Start New Job</button>
      </div>
      <div className="grid-2">
        <article className="panel">
          <h3>Quick Start</h3>
          <p>Upload a file, paste text, or provide a URL to generate accessible outputs.</p>
          <button className="btn btn-primary" onClick={onStart}>Upload Content</button>
        </article>
        <article className="panel">
          <h3>Accessibility Alerts</h3>
          <p>All pages pass keyboard navigation and announce processing status via live regions.</p>
          <p className="status status-processing">1 model running in fallback mode</p>
        </article>
      </div>
      <article className="panel">
        <h3>Active Jobs</h3>
        <ul className="list">
          {sampleJobs.map((job) => (
            <li key={job.id} className="job-row">
              <div>
                <strong>{job.title}</strong>
                <p>{job.inputType} | {job.outputs.join(", ")} | updated {job.updatedAt}</p>
              </div>
              <span className={`status status-${job.status}`}>{job.status}</span>
            </li>
          ))}
        </ul>
      </article>
    </section>
  );
}

function UploadScreen({
  mode,
  onModeChange,
  onSubmit
}: {
  mode: UploadMode;
  onModeChange: (mode: UploadMode) => void;
  onSubmit: () => void;
}) {
  const [outputSelections, setOutputSelections] = useState({
    altText: true,
    captions: true,
    transcript: true,
    summary: false,
    tts: false
  });

  return (
    <section>
      <h2>Upload Interface</h2>
      <div className="tab-row" role="tablist" aria-label="Input modes">
        {(["file", "text", "url"] as UploadMode[]).map((tab) => (
          <button
            key={tab}
            role="tab"
            aria-selected={mode === tab}
            className={`tab ${mode === tab ? "tab-active" : ""}`}
            onClick={() => onModeChange(tab)}
          >
            {tab === "file" ? "File Upload" : tab === "text" ? "Paste Text" : "From URL"}
          </button>
        ))}
      </div>

      <div className="grid-2">
        <article className="panel">
          <h3>Input</h3>
          {mode === "file" && (
            <button className="dropzone" type="button">
              <span>Drop files here or press Enter to choose</span>
              <small>Supported: text, image, audio, video, PDF/DOCX</small>
            </button>
          )}
          {mode === "text" && <textarea rows={10} className="input" placeholder="Paste content here..." />}
          {mode === "url" && <input className="input" type="url" placeholder="https://example.edu/lesson" />}
        </article>

        <article className="panel">
          <h3>Requested Outputs</h3>
          {Object.entries(outputSelections).map(([key, checked]) => (
            <label key={key} className="check-row">
              <input
                type="checkbox"
                checked={checked}
                onChange={() => setOutputSelections((prev) => ({ ...prev, [key]: !prev[key as keyof typeof prev] }))}
              />
              <span>{key}</span>
            </label>
          ))}
          <h4>Advanced options</h4>
          <label className="check-row"><span>Reading level</span><select><option>Plain language</option><option>Academic</option></select></label>
          <label className="check-row"><span>Caption style</span><select><option>Two-line max</option><option>Single-line</option></select></label>
        </article>
      </div>

      <div className="row">
        <button className="btn btn-primary" onClick={onSubmit}>Start Processing</button>
        <p className="status status-queued">Estimated time: 1-3 minutes</p>
      </div>
    </section>
  );
}

function ReviewScreen() {
  const [activeTab, setActiveTab] = useState<"altText" | "transcript" | "captions" | "summary" | "tts">("altText");
  const [content, setContent] = useState("A campus entrance with tactile paving leading to an accessible ramp.");

  return (
    <section>
      <div className="section-head">
        <h2>Output Preview</h2>
        <button className="btn btn-primary">Export Selected</button>
      </div>
      <div className="split">
        <article className="panel">
          <h3>Source Preview</h3>
          <div className="placeholder" role="img" aria-label="Source content preview">
            Source media preview area
          </div>
        </article>
        <article className="panel">
          <h3>Generated Output</h3>
          <div className="tab-row" role="tablist" aria-label="Output tabs">
            {(["altText", "transcript", "captions", "summary", "tts"] as const).map((tab) => (
              <button
                key={tab}
                className={`tab ${activeTab === tab ? "tab-active" : ""}`}
                role="tab"
                aria-selected={activeTab === tab}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
          <label htmlFor="output-editor">Editable output text</label>
          <textarea
            id="output-editor"
            className="input"
            rows={10}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <div className="row">
            <button className="btn btn-secondary">Regenerate section</button>
            <span className="status status-processing">Review recommended</span>
            <button className="btn btn-primary">Save edits</button>
          </div>
        </article>
      </div>
    </section>
  );
}

function SettingsScreen({
  highContrast,
  onContrastChange,
  fontScale,
  onFontScaleChange
}: {
  highContrast: boolean;
  onContrastChange: (value: boolean) => void;
  fontScale: number;
  onFontScaleChange: (value: number) => void;
}) {
  return (
    <section>
      <h2>Accessibility Settings</h2>
      <div className="grid-2">
        <article className="panel">
          <h3>Visual preferences</h3>
          <label className="check-row">
            <input type="checkbox" checked={highContrast} onChange={(e) => onContrastChange(e.target.checked)} />
            <span>Enable high contrast mode</span>
          </label>
          <label htmlFor="fontScale">Text size ({fontScale}%)</label>
          <input
            id="fontScale"
            type="range"
            min={100}
            max={200}
            step={10}
            value={fontScale}
            onChange={(e) => onFontScaleChange(Number(e.target.value))}
          />
        </article>
        <article className="panel">
          <h3>User preference controls</h3>
          <label className="check-row"><span>Default language</span><select><option>English</option><option>Mandarin</option></select></label>
          <label className="check-row"><span>Default output</span><select><option>Transcript + captions</option><option>Alt text + summary</option></select></label>
          <label className="check-row"><span>TTS speed</span><select><option>Normal</option><option>Slow</option><option>Fast</option></select></label>
        </article>
      </div>
    </section>
  );
}

function HistoryScreen() {
  return (
    <section>
      <h2>History</h2>
      <article className="panel">
        <div className="section-head">
          <label htmlFor="history-filter">Filter jobs</label>
          <input id="history-filter" className="input compact" placeholder="Search by job name..." />
        </div>
        <ul className="list">
          {sampleJobs.map((job) => (
            <li key={job.id} className="job-row">
              <div>
                <strong>{job.id}: {job.title}</strong>
                <p>Outputs: {job.outputs.join(", ")} | {job.updatedAt}</p>
              </div>
              <div className="row">
                <span className={`status status-${job.status}`}>{job.status}</span>
                <button className="btn btn-secondary">Open</button>
              </div>
            </li>
          ))}
        </ul>
      </article>
      <article className="panel">
        <h3>Error and loading states</h3>
        <p className="status status-failed">Audio processing failed. Retry or export partial outputs.</p>
        <p className="status status-processing">Processing 65%: generating captions...</p>
      </article>
    </section>
  );
}

export default App;
