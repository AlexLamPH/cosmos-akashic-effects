# 🎨 Ra — Adoption Blueprint: Creative & 3D Engineering GEAR

> **Tác giả:** Ra (Creative & 3D Engineer, Cosmos AI Lab)
> **Cho:** Alex (study + approve)
> **Ngày:** 2026-06-27
> **Design hub:** `AK-WFL-CAL0001` (ra-design-pipeline skill)
> **Charter ref:** §3.8 (Repo Execution Safety) · CLAUDE.md Rule #11 (blueprint trước khi adopt external repo thành mode/feature)

---

## 1. Executive Summary

Em đã đánh giá **32 repo** (`repo bên ngoài`) theo trục: chạy được headless không (`headless feasibility`), Ra có thực sự drive được không (`agent-drivable`), license sạch không, và tốn tài nguyên gì. Kết luận thẳng: **phần lớn giá trị thực sự đến từ một nhóm nhỏ adopt được NGAY mà KHÔNG cần tài nguyên mới** — vì chúng chạy đúng trên stack Ra đã có (Node + Python + Playwright headless Chromium + FFmpeg + Three.js + SwiftShader WebGL). Số còn lại chia làm 2 nhóm: (a) cần **1 API key hosted** để unlock generation cao cấp (3D models, video, image), và (b) cần **GPU server** — nhóm này em khuyến nghị **đợi**, dùng hosted API thay thế cho tới khi có doanh thu.

**Capability mới mà gear này mở khóa cho Ra:**

| Năng lực (`capability`) | Trước đây | Sau khi adopt |
|---|---|---|
| **Motion graphics** (kinetic typography, logo sting, animated banner) | Hand-roll FFmpeg mong manh | GSAP timeline → Playwright frame-step → FFmpeg (deterministic, pro) |
| **Programmatic video** (explainer, trailer, OG batch) | FFmpeg stitch thủ công | Remotion (React component → MP4/WebM/PNG) |
| **3D model generation** (image/text → mesh) | Chỉ render Three.js có sẵn | Rodin Gen-2.5 API → .glb → Ra render turntable |
| **Social/marketing assets** (Xiaohongshu carousel, WeChat cover) | Thiết kế từng cái | guizang skill → HTML→PNG batch |
| **Provenance** (chống leak, truy vết asset) | Không có | blind_watermark vô hình vào mọi export |
| **Design-system anchoring** (anti-slop) | Prompt tự do, dễ trôi amateur | 200+ brand DESIGN.md + Taste skill làm style anchor |

Phần thưởng lớn nhất với chi phí thấp nhất: **GSAP skill + Remotion + 3 design-system reference lib + blind_watermark — tất cả $0, adopt trong tuần này.** Một API key duy nhất (**Rodin Hyper3D**) mở khóa toàn bộ tier 3D generation. GPU em khuyên **chưa mua**.

---

## 2. Quick Wins (P0) — Adopt NGAY, KHÔNG tài nguyên mới

Tất cả nhóm này chạy trên stack Ra đã có (`npm`/`pip`/`npx skills`/Playwright/FFmpeg/Chromium). Không key, không GPU, không server. Đây là phần em muốn Alex approve để bắt tay **tuần này**.

| Tool | Lane | Ra dùng để làm gì | Cách wire vào pipeline |
|---|---|---|---|
| **gsap-skills** (`AK-RPO-0000051`) | skill | Author GSAP timeline chuẩn (ScrollTrigger, SplitText, kinetic typography) → motion banner, logo sting, 3D-motion clip | `npx skills add` + `npm install gsap`; build timeline trong headless Chromium, `tl.seek(t)` per-frame → screenshot → FFmpeg → MP4/GIF. **No key, no GPU.** |
| **remotion** (`AK-RPO-0000089`) | library | Video-as-React-component: card→video explainer, Field Journal trailer, OG-image batch data-driven | `npm i`, `npx remotion render` (engine = headless Chromium + FFmpeg = stack Ra có sẵn). **Free-tier only** (xem §7). |
| **guizang-social-card-skill** (`AK-RPO-000005V`) | skill | Article/card → Xiaohongshu 3:4 carousel + WeChat cover (28 layout, Editorial/Swiss) → PNG | Claude Code skill; render HTML→PNG qua Playwright có sẵn + validator bundled. **No key, no GPU.** |
| **blind_watermark** (`AK-RPO-CAL0003`) | library | Stamp provenance Cosmos vô hình vào mọi asset export (sống sót crop/resize/screenshot); blind-extract để truy vết leak | `pip install blind-watermark` (numpy/opencv/PyWavelets, CPU-only), bước cuối của image pipeline. |
| **Taste Skill** (`AK-RPO-000006R`) | skill | Anti-slop: brandkit/imagegen skill emit prompt cao cấp; implementation/redesign skill enforce typography/shadow/motion | `npx skills add`; image skill feed prompt vào image-gen step Ra đã có (DashScope/OpenAI). |
| **awesome-claude-design** (`AK-RPO-0000033`) | reference | 68 brand DESIGN.md (Linear/Vercel palette + type scale) làm style anchor trước khi generate | `git clone`, grep brand, inject token vào prompt. Pure markdown. |
| **Awesome DESIGN.md** (`AK-RPO-000001V`) | reference | 73+ premium brand token spec (Google Stitch format) — drop-in style anchor cho ra-design-pipeline | `git clone` fork, feed token vào generator. Pure markdown. |
| **Developer Icons** (`AK-RPO-0000018`) | reference | 100+ tech/AI brand logo SVG (Anthropic/Claude/Docker/React, light/dark/wordmark) cho banner, "tech stack" row, slide | `git clone`, inline SVG → Playwright/resvg rasterize → FFmpeg composite. MIT. |
| **awesome-gpt-image-2** (`AK-RPO-000006S`) | reference | 484 case + atomic 5-component prompt schema (subject/lighting/materials/layout/details) làm prompt bank | `git clone` (~148MB), mine schema → viết brand-consistent prompt → render qua image API Ra có. MIT. |
| **awesome-design-md** (`AK-RPO-0000005`) | reference | 68-brand "make it look like Stripe/Linear" shelf | `npx getdesign add <brand>`. **Secondary** — CAL Brand DNA cards vẫn là source of truth. |

> **Em khuyến nghị mạnh:** approve cả 10. Tổng chi phí = $0. Rủi ro = thấp. Hai cái **must-have thực sự** là **gsap-skills** và **remotion** — chúng nâng Ra từ "render tĩnh" lên "motion + video pipeline" mà không tốn một xu hạ tầng. Design-system reference (3 cái awesome-*) hơi trùng nhau → em sẽ giữ **awesome-claude-design + Awesome DESIGN.md** làm chính, `awesome-design-md` (`getdesign`) chỉ là stub fallback.

---

## 3. High-Value với 1 API key (P1) — Hosted, không cần GPU

Nhóm này cần **1 key hosted** nhưng KHÔNG cần Ra tự dựng GPU — generation chạy server-side của vendor. Đây là cách thông minh nhất để có generation cao cấp mà không nuôi GPU box.

| Tool | Lane | Ra dùng để làm gì | Resource (key nào) | Cost note |
|---|---|---|---|---|
| **rodin3d-skills / Hyper3D Rodin Gen-2.5** (`AK-RPO-0000063`) | skill | **Tier 3D GENERATION**: 1 ảnh (hoặc 5 multi-view, hoặc text) → mesh production-ready (glb/usdz/fbx/obj/stl), server-side, **no GPU**. Ra load .glb vào Three.js có sẵn → turntable, marketing still, motion shot | **Hyper3D API key** (test key `vibecoding` free để prototype; paid key từ hyper3d.ai/api-dashboard cho production) | Pay-per-model. Cần **budget cap + alert**. License gate: thiếu LICENSE file → resolve trước production (xem §7). |
| **DashScope Wanxiang** *(đã có — ALIBABA_API_KEY)* | — | Image-gen + edit, đã trong tay | (đã có) | (đã có) |
| **(Tùy chọn) OpenAI gpt-image** | — | Nếu muốn render prompt từ awesome-gpt-image-2 schema bằng GPT-Image-2 thay vì DashScope | OpenAI key với gpt-image access | Pay-per-image. **Optional** — DashScope Ra đã có đã cover image-gen. Chỉ thêm nếu cần text-rendering/style cụ thể GPT-Image mạnh hơn. |

> **Em khuyến nghị:** chỉ cần **1 key duy nhất ở tier này — Hyper3D Rodin.** Nó mở khóa toàn bộ năng lực **3D model generation** (thứ Ra hiện hoàn toàn không có — Ra chỉ render mesh có sẵn, không tạo được mesh mới) với chi phí pay-per-use, không nuôi GPU. Đây là **đòn bẩy 3D lớn nhất, rẻ nhất** trong cả danh sách. OpenAI gpt-image em coi là **optional** vì DashScope đã cover image-gen.

---

## 4. Bigger Infrastructure (P2) — GPU / heavy local model

Nhóm này cần **NVIDIA CUDA GPU** mà Ra hoàn toàn không có (SwiftShader chỉ là WebGL browser, KHÔNG phải CUDA). Em đánh giá thẳng từng cái **hosted-API-vs-self-host**, và quan điểm chung: **chưa mua GPU bây giờ.**

| Tool | Domain | GPU cần | Honest call: self-host vs hosted |
|---|---|---|---|
| **Fooocus** (`AK-RPO-000008D`) | image | 12-16GB VRAM | ❌ **Skip self-host.** Là Gradio GUI, KHÔNG có CLI/API generation. Headless chỉ qua gradio-client/Playwright brittle. → **Dùng DashScope (đã có) hoặc hosted image API.** Không bõ. |
| **Ideogram 4 OSS** (`AK-RPO-000007M`) | image | CUDA 6-10GB | ⚠️ Weights **Non-Commercial** → cấm marketing/public output (đúng việc của Ra). → **Dùng hosted Ideogram API** (commercial-OK, no GPU) nếu cần multilingual text rendering tốt nhất. Self-host chỉ cho internal R&D. |
| **WorldGen** (`AK-RPO-000000Z`) | 3D scene | CUDA 24GB (12GB low-vram) + FLUX.1-dev gated | 🔶 Text/image → 360° explorable scene (.ply). Genuinely scriptable nhưng GPU-gated nặng. → **Watch.** Khi có pipeline 3D-film thật + GPU box. Hosted alternative cho 3D **object** = Rodin (P1) đã cover nhu cầu thực tế. |
| **WorldMirror 2.0** (`AK-RPO-0000020`) | 3D recon | CUDA 16-24GB | 🔶 Video/multi-view → gaussian splat + depth. Useful nhưng **license red flag** (HF = Tencent Community License, KHÔNG phải Apache-2.0 như card claim). → **Watch + clear license trước.** |
| **VibeVoice** (`AK-RPO-000000W`) | voice/TTS | CUDA ~16GB | ⚠️ Microsoft đã gut repo — chỉ Realtime-0.5B chạy (low-fi). → **Dùng hosted TTS API** (ElevenLabs/OpenAI/Azure) cho voiceover. Self-host không bõ chất lượng. |
| **VideoLingo** (`AK-RPO-000000Y`) | video L10n | CUDA ~16GB | 🔶 Subtitle+dubbing VN↔EN. Tangential với core design của Ra (thuộc GEOFlow/TikTok). → **Watch**, không ưu tiên. |
| **Netflix VOID** (`AK-RPO-000000T`) | video edit | **40GB+ A100** | 🔶 SOTA object+interaction removal. GPU hard requirement A100-class. → **Watch** — chỉ thuê GPU theo giờ khi có asset video cụ thể cần cleanup. |
| **OpenMontage** (`AK-RPO-00000AE`) | video | **0 GPU** (zero-key path!) | ✅ Thực ra **không cần GPU** cho local path (Remotion+FFmpeg+Piper TTS). Nhưng **AGPLv3** → chỉ dùng standalone, KHÔNG nhúng code. → Có thể thử như **standalone tool**, không phải P2 thật. |
| **@playcanvas/splat-transform** (`AK-RPO-0000062`) | 3D | CPU-ok (GPU optional) | ✅ Sibling CLI của SuperSplat: splat→GLB/WebP/HTML-viewer, **CPU-only cho convert/transform**. → Adopt **khi có pipeline splat thật** (vd từ Rodin/WorldGen output). MIT. Cận P0 nhưng chưa có input splat nên để P2-watch. |
| **MoneyPrinterTurbo** (`AK-RPO-000005Z`) | video | 0 GPU | text→stock-footage short qua FastAPI. Cần Pexels+LLM key. → **Nice**, nhưng overlap với Remotion+OpenMontage. Watch. |

> **Honest GPU verdict:** Bây giờ **KHÔNG mua/thuê GPU thường trực.** Lý do: (1) năng lực 3D quan trọng nhất đã cover bằng **Rodin hosted** (P1); (2) image-gen đã cover bằng **DashScope** (đã có); (3) các use-case GPU còn lại (WorldGen scene, VOID cleanup, VibeVoice) đều **chưa có nhu cầu production cụ thể** — mua GPU lúc này là nuôi tài sản nhàn rỗi đốt tiền. **Khi nào mua:** chỉ thuê GPU **theo giờ** (A100/H100 spot) cho 1 job cụ thể khi xuất hiện (vd "cần xóa object khỏi 1 video marketing"), không dựng box thường trực.

---

## 5. Resources Alex Must Provide — Checklist gộp

### 5.1. Recommended MINIMUM starter set (đòn bẩy cao nhất / chi phí thấp nhất)

> **Em đề xuất Alex chỉ cần approve đúng nhóm này để unlock ~80% giá trị:**

| # | Item | Chi phí | Mở khóa |
|---|---|---|---|
| 1 | Approve **10 repo P0** (npm/pip/skill/clone) | **$0** | Motion graphics, programmatic video, social cards, watermark, design-system anchoring |
| 2 | **Hyper3D Rodin API key** (paid tier) | Pay-per-model, **đặt budget cap ~$20-50/tháng + alert** | Toàn bộ 3D model generation (image/text → mesh) |
| 3 | Giữ **DashScope** (đã có) làm image engine chính | $0 mới | Image-gen + edit |

**Tổng tiền mặt mới = chỉ 1 key (Rodin) với cap ~$20-50/tháng.** Đây là điểm em muốn Alex chú ý: gần như toàn bộ upgrade lớn của Ra (motion + video + social + 3D) đạt được với **một** API key trả tiền duy nhất.

### 5.2. API keys — đầy đủ

| Key | Bắt buộc? | Dùng cho | Nguồn |
|---|---|---|---|
| **Hyper3D Rodin** | ⭐ Khuyến nghị (starter) | 3D model gen | hyper3d.ai/api-dashboard (test key `vibecoding` để prototype trước) |
| ALIBABA_API_KEY (DashScope) | ✅ Đã có | Image-gen/edit | (sẵn) |
| OpenAI gpt-image | Optional | Nếu cần render GPT-Image-2 schema | OpenAI |
| Ideogram API (hosted) | Optional | Multilingual/VN text-in-image cao cấp | developer.ideogram.ai |
| Hosted TTS (ElevenLabs/OpenAI/Azure) | Optional | Voiceover (thay self-host VibeVoice) | vendor |
| Pexels/Pixabay | Optional | Stock B-roll (nếu chạy MoneyPrinterTurbo) | free tier |

### 5.3. Server / GPU

| Resource | Cần bây giờ? | Ghi chú |
|---|---|---|
| CPU cloud box hiện tại (Node+Python+Playwright+FFmpeg+SwiftShader) | ✅ Đã đủ cho **toàn bộ P0 + Rodin P1** | Không cần nâng cấp |
| Thêm disk ~2-3GB | Nhẹ | Remotion Chromium shell (~1GB) + SDXL/reference repos |
| **GPU thường trực** | ❌ **KHÔNG** | Đốt tiền nhàn rỗi — xem §4 verdict |
| **GPU thuê theo giờ** (A100/H100 spot) | 🔶 Chỉ khi có job cụ thể | VOID cleanup, WorldGen scene — on-demand, không thường trực |

### 5.4. Budget ballpark

- **P0 adoption:** $0.
- **Rodin starter:** đặt **hard cap $20-50/tháng** lúc đầu (alert ở 80%). Scale theo nhu cầu thực.
- **GPU:** $0 thường trực. Thuê theo giờ ~$1.5-4/giờ A100 spot **chỉ khi cần** — ước tính <$30/job lẻ.
- **Remotion Company License:** **$0** — bắt buộc ở free-tier (≤3 người / 1-2 AI). **KHÔNG chi tới khi có doanh thu** (Cost-Defense, Charter §2).

---

## 6. Tool vs Skill Plan — Cluster dưới design hub `AK-WFL-CAL0001`

Theo **Capability-First Principle**: Akashic lưu **capability cluster**, không lưu repo note rời. Mọi thứ dưới đây cluster quanh design hub.

| Repo | Akashic artifact | Lý do |
|---|---|---|
| **gsap-skills** | **Claude Code skill** (đã là skill) + `tool` card "GSAP Motion Render" link hub | Skill dạy author; tool card mô tả how-to-use frame-step→FFmpeg |
| **remotion** | **`tool` card** "Programmatic Video (Remotion)" dưới hub | Library Ra drive headless — adapter how-to-use |
| **rodin3d-skills** | **Claude Code skill** (đã là skill) + `tool` card "3D Model Gen (Rodin)" | Tier GENERATION của 3D cluster |
| **guizang-social-card-skill** | **Claude Code skill** | Social asset gen, headless-clean |
| **Taste Skill** | **Claude Code skill** | Anti-slop frontend taste |
| **blind_watermark** | **`tool` card** "Provenance Watermark" — bước cuối image pipeline | Library adapter |
| **awesome-claude-design / Awesome DESIGN.md / awesome-design-md** | **`guideline` card** "Design-System Token Anchors" (gộp 1 card, list nguồn) | Rules/grammar layer — KHÔNG tạo 3 card rời |
| **Developer Icons** | **reference asset folder** (clone vào repo assets) | Static SVG, không cần card riêng |
| **awesome-gpt-image-2** | **`guideline` card** "Prompt Grammar — atomic 5-component" | Prompt-as-code knowledge |
| **@playcanvas/splat-transform** | **`tool` card** (khi adopt) "Splat→GLB Convert" | Đợi input splat |

**Cluster shape dưới `AK-WFL-CAL0001`:**
- `workflow` (hub) = ra-design-pipeline
- `tool` adapters = Remotion · GSAP-render · Rodin-3D · Watermark · Splat-transform
- `guideline` = Design-System Token Anchors · Prompt Grammar · (CAL Brand DNA vẫn là authority trên hết)
- `skill` = gsap / rodin / guizang / Taste (load theo task)

---

## 7. Governance & Risk

| Repo | License flag | Action cần |
|---|---|---|
| **remotion** | Free-tier OK; **Company License $100+/mo ở ≥4 người** | ⚠️ Stay free-tier, KHÔNG chi pre-revenue. Set telemetry opt-out trong `remotion.config.ts`. |
| **rodin3d-skills** | **Thiếu LICENSE file** (declared-MIT-only) + paid SaaS lock-in | 🔴 Resolve license + budget cap **trước production** (BLUEPRINT_RODIN_INTEGRATION.md per Rule #11). |
| **guizang-social-card-skill** | **AGPL-3.0 / ISC discrepancy** | ⚠️ Local asset-gen OK; **KHÔNG fork/embed code server-side** tới khi reconcile với upstream. |
| **OpenMontage** | **AGPLv3 contagion** | 🔴 **NEVER nhúng code** vào Cosmos service. Standalone tool only. |
| **Ideogram 4 OSS** | Weights **Non-Commercial** | 🔴 Cấm marketing/public/revenue output. Hosted API = commercial-clean route. |
| **WorldMirror 2.0** | HF = **Tencent Community License** (card claim Apache-2.0 SAI) | 🔴 Clear commercial terms trước khi dùng. |
| **WorldGen** | Apache-2.0 (card "Unknown" stale) | ✅ OK |
| **ilab-gpt-conjure** | AGPL "harvest-ideas-only" | Reference only, không adopt |
| **liquid-dom** | 4/5 package all-rights-reserved | 🔴 Không dùng (cũng không headless được) |
| MIT-clean | blind_watermark, GSAP, Taste, design-md repos, Developer Icons, splat-transform, awesome-gpt-image-2 | ✅ Sạch |

**Charter §3.8 sandbox:** mọi repo clone-run (OpenMontage, Fooocus nếu thử, MoneyPrinterTurbo) phải qua **SkillSpector/code scan** + chạy trong sandbox lane trước. **Cần Vishnu security review:** (1) bất kỳ repo nào nhúng code server-side (hiện tại = **không có** — em giữ AGPL repo ở standalone); (2) Rodin key handling (secret, không log — Charter §3.1); (3) MoneyPrinterTurbo nếu chạy (port 8080/8501 **không expose public**, g4f **DISABLED**).

---

## 8. Phased Rollout

| Phase | Nội dung | Tài nguyên | Output verify |
|---|---|---|---|
| **Phase 1 — tuần này** ($0) | Adopt **gsap-skills + remotion** → 1 demo motion banner + 1 card→video explainer. Adopt **blind_watermark** vào image pipeline. | Stack có sẵn | 1 MP4 motion + 1 watermark-verified PNG |
| **Phase 2 — tuần này** ($0) | Clone 3 design-system reference + Developer Icons + Taste skill + guizang skill. Wire DESIGN.md token vào ra-design-pipeline. 1 Xiaohongshu carousel demo. | Stack có sẵn | 1 carousel PNG + 1 token-anchored hero |
| **Phase 3 — sau Alex approve key** | **BLUEPRINT_RODIN_INTEGRATION.md** (Rule #11) → prototype với test key `vibecoding` → image→.glb→Three.js turntable. Rồi paid key + budget cap. | Hyper3D key | 1 turntable MP4 từ ảnh sản phẩm |
| **Phase 4 — khi có pipeline splat** | Adopt @playcanvas/splat-transform khi có input splat (từ Rodin/WorldGen). | CPU | splat→GLB convert demo |
| **Phase 5 — watch / on-demand** | GPU-gated (WorldGen/VOID/WorldMirror/VibeVoice/Ideogram-OSS): chỉ thuê GPU theo giờ khi có job cụ thể + license cleared. | GPU thuê giờ | per-job |

---

## 9. Skip / Not-Now

| Repo | 1-dòng lý do |
|---|---|
| **RapidRAW** | Tauri desktop GUI, no CLI/API/headless — human-only. |
| **TiXL (Tooll3)** | Windows-only C#/.NET desktop GUI, không headless. |
| **OpenToonz** | Qt desktop, human vẽ frame-by-frame, no headless render. |
| **liquid-dom** | Cần WebGPU + experimental Chrome flag (impossible headless) + 4/5 package all-rights-reserved. |
| **Blender MCP** | Addon chặn `blender -b` background mode + cần manual GUI click. (Keeper = pattern `blender -b -P script.py`, cần Blender binary.) |
| **Pallaidium** | Blender VSE GUI addon, CUDA-required, no CLI. (Keeper = recipe map model stack.) |
| **MultiPost Extension** | MV3 side-panel extension cần human logged-in browser — no headless path. |
| **SuperSplat (editor)** | Editor GUI-only (nhưng sibling CLI splat-transform = keeper, xem Phase 4). |
| **n8n-mcp** | Workflow-automation infra, KHÔNG phải creative tool — thuộc ops AI. |
| **litellm** | Plumbing/routing, tạo 0 pixel — nice-to-have nếu pipeline cần fallback đa-provider, không phải creative gear. |
| **API-mega-list** | Discovery link list, unverified — skim 1 lần tìm lead, không depend. |
| **ilab-gpt-conjure** | AGPL UX-shell quanh PAID OpenAI API; CLI không thêm gì so với gọi OpenAI trực tiếp. UI-pattern reference cho Multi-AI, không phải Ra. |
| **Fooocus** | Gradio GUI no generation CLI/API + cần CUDA GPU — dùng DashScope/hosted thay thế. |

---

### Em recommend gì, gọn lại

1. **Approve ngay 10 repo P0** ($0) — đây là upgrade lớn nhất, rủi ro thấp nhất. **gsap + remotion** là 2 viên ngọc.
2. **Cấp 1 key duy nhất: Hyper3D Rodin** (cap $20-50/tháng) — mở khóa toàn bộ 3D generation.
3. **KHÔNG mua GPU thường trực** — thuê theo giờ khi có job cụ thể.
4. Em viết **BLUEPRINT_RODIN_INTEGRATION.md** trước khi code Rodin (Rule #11), và giữ mọi AGPL repo ở **standalone**, không nhúng.

— Ra · 27/06/2026 · 🎨