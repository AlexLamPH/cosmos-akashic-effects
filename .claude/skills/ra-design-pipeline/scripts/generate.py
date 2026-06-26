#!/usr/bin/env python3
"""Ra design pipeline — TEXT->IMAGE via Alibaba DashScope (Tongyi Wanxiang / Wan).

Generates premium raster art to use as design assets (then composite/build with code).
Requires env ALIBABA_API_KEY. Verified 2026-06-26:
  wan2.2-t2i-plus (quality)  |  wan2.2-t2i-flash (fast)

Usage:
  python3 generate.py --prompt "..." [--prompt "..." ...] \
      [--model wan2.2-t2i-plus] [--size 768*1152] [--n 1] [--out-dir DIR] [--negative "..."]

Prints a JSON manifest [{prompt, file, url}, ...] on stdout.
"""
import argparse, json, os, subprocess, time

ENDPOINT = "https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis"
TASKS = "https://dashscope-intl.aliyuncs.com/api/v1/tasks/"
DEFAULT_NEG = ("cluttered, busy, ornate baroque, thick gold frame, gaudy, rainbow, neon overload, "
               "low quality, blurry, jpeg artifacts, watermark, garbled text, distorted typography, "
               "1960s, retro, dated, plastic, cheap, oversaturated")


def curl(*args):
    return subprocess.run(["curl", "-sS", *args], capture_output=True, text=True).stdout


def submit(key, model, prompt, negative, size, n):
    body = json.dumps({"model": model,
                       "input": {"prompt": prompt, "negative_prompt": negative},
                       "parameters": {"size": size, "n": n}})
    r = json.loads(curl("-X", "POST", ENDPOINT,
                        "-H", f"Authorization: Bearer {key}",
                        "-H", "X-DashScope-Async: enable",
                        "-H", "Content-Type: application/json", "-d", body))
    tid = r.get("output", {}).get("task_id")
    if not tid:
        raise SystemExit(f"submit failed ({model}): {r.get('message') or r.get('code') or r}")
    return tid


def poll(key, tid, tries=40, gap=4):
    for _ in range(tries):
        d = json.loads(curl(TASKS + tid, "-H", f"Authorization: Bearer {key}")).get("output", {})
        st = d.get("task_status")
        if st == "SUCCEEDED":
            return [r["url"] for r in d.get("results", []) if r.get("url")]
        if st == "FAILED":
            raise SystemExit(f"task failed: {json.dumps(d)[:300]}")
        time.sleep(gap)
    raise SystemExit("poll timeout")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--prompt", action="append", required=True, help="prompt (repeatable = batch)")
    ap.add_argument("--model", default="wan2.2-t2i-plus")
    ap.add_argument("--size", default="1024*1024", help="e.g. 1024*1024, 768*1152, 1152*768")
    ap.add_argument("--n", type=int, default=1)
    ap.add_argument("--negative", default=DEFAULT_NEG)
    ap.add_argument("--out-dir", default=".")
    args = ap.parse_args()

    key = os.environ["ALIBABA_API_KEY"]
    os.makedirs(args.out_dir, exist_ok=True)

    # submit all first so they render server-side in parallel; then poll/download
    submitted = [(i, p, submit(key, args.model, p, args.negative, args.size, args.n))
                 for i, p in enumerate(args.prompt)]
    manifest = []
    for i, p, tid in submitted:
        for j, u in enumerate(poll(key, tid)):
            fp = os.path.join(args.out_dir, f"gen-{i}-{j}.png")
            curl(u, "-o", fp)
            manifest.append({"prompt": p, "file": fp, "url": u})
            print(f"OK {fp}")
    print(json.dumps(manifest, indent=2))


if __name__ == "__main__":
    main()
