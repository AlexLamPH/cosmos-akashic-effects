#!/usr/bin/env python3
"""Ra design pipeline — instruction-based image EDIT via DashScope qwen-image-edit.

"Design on top of the image": refine a generated/source image with a natural-language
instruction (remove text, change mood, add/clean elements). Requires env ALIBABA_API_KEY.
Verified 2026-06-26 with model qwen-image-edit (multimodal-generation endpoint, sync).

Source image: a public URL (PROVEN path — feed the url from generate.py's manifest) or a
local file path (base64 data-URI, best-effort).

Usage:
  python3 edit.py --image "<url|path>" --instruction "remove all text, keep the vortex, premium" \
      [--out edited.png] [--model qwen-image-edit] [--negative "..."]
"""
import argparse, base64, json, os, subprocess

ENDPOINT = "https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation"


def curl(*args):
    return subprocess.run(["curl", "-sS", *args], capture_output=True, text=True).stdout


def img_ref(src):
    if src.startswith(("http://", "https://")):
        return src
    with open(src, "rb") as f:
        b = base64.b64encode(f.read()).decode()
    ext = (os.path.splitext(src)[1].lstrip(".") or "png").lower()
    return f"data:image/{ext};base64,{b}"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--image", required=True, help="source image URL (proven) or local path (base64)")
    ap.add_argument("--instruction", required=True)
    ap.add_argument("--out", default="edited.png")
    ap.add_argument("--model", default="qwen-image-edit")
    ap.add_argument("--negative", default="text, letters, watermark, low quality, distorted")
    args = ap.parse_args()

    key = os.environ["ALIBABA_API_KEY"]
    body = json.dumps({
        "model": args.model,
        "input": {"messages": [{"role": "user", "content": [
            {"image": img_ref(args.image)},
            {"text": args.instruction},
        ]}]},
        "parameters": {"negative_prompt": args.negative, "watermark": False},
    })
    d = json.loads(curl("-X", "POST", ENDPOINT,
                        "-H", f"Authorization: Bearer {key}",
                        "-H", "Content-Type: application/json", "-d", body))
    if "output" not in d:
        raise SystemExit(f"edit failed: {json.dumps(d)[:300]}")

    edited = None
    for c in d["output"]["choices"][0]["message"]["content"]:
        if isinstance(c, dict) and c.get("image"):
            edited = c["image"]
    if not edited:
        raise SystemExit(f"no image in output: {json.dumps(d['output'])[:300]}")

    curl(edited, "-o", args.out)
    print(f"OK {args.out}\nsource_url: {edited}")


if __name__ == "__main__":
    main()
