import { useRef, useState } from 'react'

function Step7Photo({ previewUrl, onFileSelect, getFieldClass, errors }) {
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef(null)

  const handleFiles = (files) => {
    const selected = files?.[0]
    if (selected) onFileSelect(selected)
  }

  const handleDrop = (event) => {
    event.preventDefault()
    setIsDragging(false)
    handleFiles(event.dataTransfer.files)
  }

  return (
    <div className="space-y-5">
      <h2 className="font-heading text-3xl text-[var(--navy)]">Profile Photo</h2>
      <p className="text-sm text-[var(--muted)]">
        Upload a professional headshot (JPG or PNG). Minimum 400x400px is recommended for print-quality presentation.
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg"
        className="sr-only"
        onChange={(event) => handleFiles(event.target.files)}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`mx-auto flex min-h-60 w-full max-w-md flex-col items-center justify-center rounded-full border-2 border-dashed px-6 text-center transition ${
          isDragging ? 'border-[var(--gold2)] bg-[var(--gray)]' : 'border-[var(--gold)] bg-[var(--plat)]'
        } ${getFieldClass('photo_url')}`}
      >
        {previewUrl ? (
          <img src={previewUrl} alt="Profile preview" className="h-56 w-56 rounded-full object-cover" />
        ) : (
          <>
            <div className="flex h-20 w-20 items-center justify-center rounded-full border border-[var(--gold)]/70 text-[var(--gold)]">
              <svg viewBox="0 0 24 24" className="h-10 w-10" aria-hidden="true">
                <path
                  d="M8 7h2l1.5-2h5L18 7h2a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h2l2-3Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <circle cx="12" cy="13" r="3.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </div>
            <p className="mt-4 text-sm font-semibold text-[var(--navy)]">Upload Photo</p>
            <p className="mt-1 text-xs text-[var(--muted)]">Drag and drop or click to browse</p>
          </>
        )}
      </button>
      {errors.photo_url && <p className="text-center text-xs text-[var(--red)]">{errors.photo_url}</p>}

      <div className="rounded-xl border border-[var(--gold)]/50 bg-[var(--gray)] px-4 py-3">
        <p className="font-heading text-2xl text-[var(--navy2)]">Almost done!</p>
        <p className="text-sm text-[var(--muted)]">
          Review your entries and submit your profile for inclusion in the ministry presentation portfolio.
        </p>
      </div>
    </div>
  )
}

export default Step7Photo
