#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Pick the sentence-to-call examples from the recorded christmas-street run.

    python3 tools/make_calls.py PROMPTS.jsonl public/replay/christmas-street.json public/replay/calls.json

Truth rule: the sentence is a real prompt of the published take; the call fields (tool, part, t_ms, corrected) are copied from the
recorded replay event whose part name matches the name in the sentence. Nothing is generated. One example per primitive kind."""
import json, re, sys

prompts, replay, out = sys.argv[1:4]
events = json.load(open(replay))["events"]
by_part = {}
for e in events:
    by_part.setdefault(e["part"], e)
picks, seen = [], set()
for line in open(prompts):
    r = json.loads(line)
    p = r.get("prompt")
    if not p:
        continue
    kind = re.search(r"\b(cylinder|torus|cube|sphere|cone|plane)\b", p)
    name = re.search(r"named (\w+)", p)
    if not (kind and name) or kind.group(1) in seen or name.group(1) not in by_part:
        continue
    seen.add(kind.group(1))
    e = by_part[name.group(1)]
    picks.append({"kind": kind.group(1), "sentence": p,
                  "call": {"tool": e["tool"], "part": e["part"], "t_ms": e["t_ms"], "corrected": e["corrected"]}})
    if len(picks) == 4:
        break
json.dump({"source": "demo/christmas-street take, recorded run", "examples": picks}, open(out, "w"), indent=1)
print(len(picks), "examples")
