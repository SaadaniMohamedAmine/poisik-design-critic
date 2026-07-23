# 03 — Upload & Image Processing

**Depends on:** `01-init-setup.md`, `02-design-system.md`
**Goal:** a reliable upload pipeline from "user drags a file" to "a correctly resized image ready for the AI Vision call."

## Tasks

1. **UploadThing setup**
   - Configure a file router accepting `image/jpeg`, `image/png`, `image/webp`, max size 10MB, max count 1 (2 for the comparison feature, see `06-support-pages.md`)
   - Server-side callback stores the resulting file URL

2. **Dropzone component**
   - Drag-and-drop area + click-to-browse fallback (use `react-dropzone` or a hand-rolled equivalent)
   - Match the Stitch export exactly: dashed `border-strong` outline, Lucide `UploadCloud` icon, copy "Drag & drop your UI screenshot, or click to browse", caption listing accepted formats and size limit
   - On file select: show a preview thumbnail, filename, file size, and a primary "Analyze" button — do not auto-submit

3. **Client-side validation**
   - Reject wrong file types and oversized files **before** upload starts
   - Error copy (expert/posé tone, exact strings):
     - Wrong type: "This file type isn't supported — please use JPG, PNG, or WebP."
     - Too large: "This file exceeds the 10MB limit — try compressing it first."

4. **Server-side resize**
   - API route receives the UploadThing file URL, downloads the image, resizes with `sharp` so the longest side is max 1024px (preserve aspect ratio, no upscaling if already smaller)
   - Output as a buffer/base64 suitable for the Vision API call in `04-ai-analysis.md`

5. **Error handling**
   - Network failure during upload → toast: "Upload failed — check your connection and try again."
   - Resize/processing failure → toast: "Something went wrong processing this image — try again."

## Definition of Done
- Uploading a valid JPG/PNG/WebP under 10MB works end to end and produces a resized (≤1024px) image server-side
- Uploading an unsupported type or oversized file shows the correct inline error and never reaches the server
- Manually verified: a 4000px-wide screenshot comes back ≤1024px on its longest side, aspect ratio unchanged
