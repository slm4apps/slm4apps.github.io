#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Fail when the tree contains secrets, private addresses, personal paths, ticket references, e-mail addresses or working notes.

    python3 scripts/scan_private.py                 # scan every file git would commit (tracked + untracked, minus .gitignore)
    python3 scripts/scan_private.py --walk          # scan all files under the root, ignoring git
    python3 scripts/scan_private.py path1 path2     # scan given files
    python3 scripts/scan_private.py --json

Used by CI, by scripts/promote.py and by scripts/first_push.sh. Findings never print the matched text, only rule, file and line, so the
scan output itself is safe to paste. A line containing the marker `scan: allow` is skipped (use it for the rule definitions and
test fixtures only, never for real data). Exit code 0 = clean, 1 = findings, 2 = usage error.
The patterns are assembled from pieces so that this file does not match its own rules."""
import argparse, json, os, re, subprocess, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
J = "".join


def R(*parts, flags=re.I):
    return re.compile(J(parts), flags)


RULES = [
    # --- secrets and tokens
    ("secret:gitlab-token", R("gl", "pat-[A-Za-z0-9_-]{10,}", flags=0)),
    ("secret:github-token", R("(?:gh", "p_|gho_|ghs_|ghu_|github_", "pat_)[A-Za-z0-9_]{20,}", flags=0)),
    ("secret:openai-style-key", R(r"\bs", "k-[A-Za-z0-9_-]{20,}", flags=0)),
    ("secret:aws-key-id", R(r"\bAK", "IA[0-9A-Z]{16}\\b", flags=0)),
    ("secret:huggingface-token", R(r"\bh", "f_[A-Za-z0-9]{30,}", flags=0)),
    ("secret:slack-token", R(r"\bxo", "x[abp]-[A-Za-z0-9-]{10,}", flags=0)),
    ("secret:bearer-token", R(r"\bBear", "er\\s+[A-Za-z0-9._~+/=-]{16,}")),
    ("secret:private-key-header", R("-----BEGIN ", "[A-Z ]*PRIVATE KEY-----", flags=0)),
    ("secret:assigned-credential", R(r"\b(?:pass", "word|passwd|secret|api[_-]?key|access[_-]?token|auth[_-]?token)\\b\\s*[:=]\\s*[\"'][^\"'\\s]{6,}[\"']")),
    ("secret:azure-or-openai-key", R(r"(?:az", "ure|open", "ai)[^\\n]{0,60}(?:key|secret)[^\\n]{0,20}[:=]\\s*[\"']?[A-Za-z0-9]{24,}")),
    ("secret:webhook", R(r"(?:discord(?:app)?\.com/api/web", "hooks|hooks\\.sla", "ck\\.com/services)")),
    # --- private network addresses
    ("internal:vpn-address", R(r"\b100\.64\.\d+\.\d+")),
    ("internal:private-address", R(r"\b10\.100\.\d+\.\d+")),
    # --- personal paths
    ("path:home-directory", R(r"(?:/Us", "ers/[A-Za-z0-9._-]+|C:\\\\Us", "ers\\\\|/home/(?!runner\\b)[A-Za-z0-9._-]+)")),
    # --- ticket references
    ("ticket:hash-number", re.compile(r"(?<![\w&/#-])#\d{2,4}(?![\w.])")),
    ("ticket:task-tag", R(r"\btask-\d{2,4}\b")),
    ("ticket:issue-url", R(r"/issues/\d+")),
    # --- private run folders (results of maintainer runs, never shipped)
    ("path:private-run-dir", R("~/(?:slm-", "runs|release-v0\\.|b1\\d|parts-", "tiny|smallbase-|mascot/|Movies/)|vm-arch", "ive|bench-", "out/")),
    # --- working notes: who decided, the plan's own ids, dated session notes
    ("process:owner-reference", R(r"\bthe own", r"er\b|\(own", r"er\b|\bown", r"er(?:'s)? (?:go|orders?|decision|approved|asked|said|review)\b")),
    ("process:proposal-or-order-id", R(r"\b(?:propos", r"al|ord", r"er)s? \d{1,3}\b")),
    ("process:step-id", R(r"\bB(?:[1-9]|1[0-4])[a-d]?\b|\bA(?:[1-9]|\.\d{1,2}[a-z])[a-e]?\b|\bR1\d\b", flags=0)),
    ("process:dated-note", R(r"\b\d{1,2} (?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\b(?!,? \d{4})|\b\d{1,2}:\d{2} U", r"TC\b", flags=0)),
    # --- model identity: the base model's stock system line must never ship (the model is Maris3D)
    ("identity:stock-system-prompt", R("You are Q", "wen, created by Ali", "baba")),
    # --- placeholders and maintainer links: a public file is finished and links only to public files
    ("process:placeholder", R(r"\bTO", r"DO\b|\bFIX", r"ME\b", flags=0)),
    ("process:internal-link", R(r"\binter", r"nal/rel", r"ease/|\bDESIGN-[A-Z]")),
    ("process:plan-step", R(r"\bS\d{1,2} st", r"ep \d")),
    # --- e-mail addresses (GitHub noreply addresses are allowed)
    ("email:address", re.compile(r"\b[A-Za-z0-9._%+-]+@(?!users\.noreply\.github\.com)[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}\b")),
]
# Names that are private in themselves (a company, a machine, a workspace, a user name) cannot be
# spelled in a public file, not even to search for them. The maintainers keep those rules in a
# file that is not part of the public tree; the scanner adds them when the file is there.
PRIVATE_RULES = os.path.join(ROOT, "internal", "release", "scan-rules-private.json")
if os.path.exists(PRIVATE_RULES):
    with open(PRIVATE_RULES) as _f:
        # a word boundary in these rules also holds next to "_" and digits: a machine name inside a key such as
        # name_980m must match as well as the name in a sentence
        RULES += [(_name, re.compile(_pattern.replace(r"\b", r"(?:(?<![A-Za-z0-9])|(?![A-Za-z0-9]))"), re.I))
                  for _name, _pattern in json.load(_f)]
ALLOW_MARK = "scan: " + "allow"
# Rules that legitimately match in some files: letter-and-digit part names in the recipe data,
# and the fixed text of licences (owners, dates of publication).
RULE_SKIPS = [("process:", re.compile(r"(?:^|/)(?:LICEN[CS]E[^/]*|LICENSES/.*|NOTICE[^/]*|recipes\.json)$"))]
# The 0.1 weights were trained with this system sentence (the project's name before Maris3D). 0.1 ships as it was
# trained, so this exact sentence may carry the old name; nothing else may.
FROZEN_0_1 = re.compile(re.escape("You are SLM4" + "Blender-0.5B, a compact local model by slm4apps"))


def _rules(name):
    return [(r, rx) for r, rx in RULES if not any(r.startswith(pre) and px.search(name) for pre, px in RULE_SKIPS)]
SKIP_DIRS = {".git", "__pycache__", "node_modules", ".venv", "build", "dist"}
INTERNAL = "internal"  # maintainer-only working notes: tracked on main, never part of the public release commit (see scripts/first_push.sh)
MAX_BYTES = 200_000_000     # above this only model weights, which are not part of the tree


def scan_text(text, name="<text>"):
    out, rules = [], _rules(name)
    for n, line in enumerate(text.splitlines(), 1):
        if ALLOW_MARK in line:
            continue
        for rule, rx in rules:
            if rx.search(line):
                if rule == "internal:codename" and FROZEN_0_1.search(line):
                    continue
                out.append({"file": name, "line": n, "rule": rule})
    return out


ZSTD, GZIP = b"\x28\xb5\x2f\xfd", b"\x1f\x8b"


def _inflate(raw):
    """The bytes inside a compressed file (a .blend is saved zstd- or gzip-compressed), or None
    when this machine cannot read them."""
    if raw[:4] == ZSTD:
        try:
            from compression import zstd                      # Python 3.14+
            return zstd.decompress(raw)
        except Exception:
            pass
        try:
            return subprocess.run(["zstd", "-dc"], input=raw, capture_output=True, check=True).stdout
        except (OSError, subprocess.CalledProcessError):
            return None
    if raw[:2] == GZIP:
        import gzip
        try:
            return gzip.decompress(raw)
        except Exception:
            return None
    return raw


def scan_binary(raw, rel):
    """A scene file, an exported model or a picture can carry the path it was saved from, a user
    name or a host name (an FBX stores the path of the .blend it came from). Its readable strings
    (runs of 8 or more printable characters) are searched with every rule except the ticket and
    e-mail and working-note ones, which random bytes match by chance. A compressed file that cannot be opened here
    is a finding: nothing goes out unread."""
    data = _inflate(raw)
    if data is None:
        return [{"file": rel, "line": 0, "rule": "unread:compressed-file"}]
    text = b"\n".join(re.findall(rb"[\x20-\x7e]{8,}", data)).decode("ascii")
    return [{"file": rel, "line": 0, "rule": rule} for rule, rx in RULES
            if not rule.startswith(("ticket:", "email:", "process:")) and rx.search(text)]


GGUF_NAME_OK = re.compile(r"^Maris3D\b")          # every GGUF we ship is named for the product
NO_TEXT_RULES = ("ticket:", "email:", "process:")   # random bytes match these by chance


def scan_gguf(path, rel):
    """A GGUF carries metadata written by the converter: the folder the base model was read from
    (general.base_model.*), tags made from that path, a name guessed from the training folder and the
    base model's chat template. Every string value is searched with every rule, and the product rules
    are checked: the name starts with Maris3D, no base_model entry or tag is a local path or a build
    tool, and a model file's template names Maris3D and not the base model's stock identity."""
    import gguf_meta
    try:
        meta = gguf_meta.read_all(path)
    except Exception:
        return [{"file": rel, "line": 0, "rule": "unread:gguf-metadata"}]
    out = []
    for k, v in meta.items():
        for x in (v if isinstance(v, list) else [v]):
            if isinstance(x, str):
                out += [{"file": rel, "line": 0, "rule": "%s (gguf %s)" % (rule, k)} for rule, rx in RULES
                        if not rule.startswith(NO_TEXT_RULES) and rx.search(x)]
    name = meta.get("general.name")
    if not isinstance(name, str) or not GGUF_NAME_OK.search(name):
        out.append({"file": rel, "line": 0, "rule": "gguf:name-not-maris3d (general.name)"})
    for k, v in meta.items():
        if k.startswith("general.base_model.") and isinstance(v, str) and (
                v.startswith("/") or "huggingface.co//" in v or re.search(r"home/|users/", v, re.I)):
            out.append({"file": rel, "line": 0, "rule": "gguf:base-model-is-a-local-path (%s)" % k})
    for t in meta.get("general.tags") or []:
        if isinstance(t, str) and (t.startswith("/") or ":/" in t or t in ("mlx",)):
            out.append({"file": rel, "line": 0, "rule": "gguf:tag-from-build-machine (general.tags)"})
    if meta.get("general.type") == "model" and "Maris3D" not in str(meta.get("tokenizer.chat_template", "")):
        out.append({"file": rel, "line": 0, "rule": "identity:template-without-maris3d (tokenizer.chat_template)"})
    return out


def scan_zip(path, rel):
    """A wheel or zip: every member's name and contents, scanned as files of their own."""
    import zipfile
    out = []
    try:
        with zipfile.ZipFile(path) as z:
            for info in z.infolist():
                if info.is_dir():
                    continue
                mrel = rel + "!" + info.filename
                out += [{"file": mrel, "line": 0, "rule": r} for r, rx in _rules(mrel) if rx.search(info.filename)]
                raw = z.read(info)
                if b"\0" in raw[:4096] or raw[:4] == ZSTD or raw[:2] == GZIP:
                    out += scan_binary(raw, mrel)
                else:
                    out += scan_text(raw.decode("utf-8", "replace"), mrel)
    except Exception:
        out.append({"file": rel, "line": 0, "rule": "unread:archive"})
    return out


def scan_large(path, rel):
    """A file too big to load at once: its readable strings, read in pieces. Nothing is skipped unread."""
    rules = [(r, rx) for r, rx in RULES if not r.startswith(NO_TEXT_RULES)]
    hit, tail = set(), b""
    with open(path, "rb") as f:
        while True:
            chunk = f.read(64 << 20)
            if not chunk:
                break
            text = b"\n".join(re.findall(rb"[\x20-\x7e]{8,}", tail + chunk)).decode("ascii")
            tail = chunk[-512:]
            hit |= {r for r, rx in rules if r not in hit and rx.search(text)}
    return [{"file": rel, "line": 0, "rule": r} for r in sorted(hit)]


def scan_file(path, rel):
    out = [{"file": rel, "line": 0, "rule": r} for r, rx in _rules(rel) if rx.search(rel)]  # file names count too
    try:
        with open(path, "rb") as f:
            magic = f.read(4)
        if magic == b"GGUF":
            return out + scan_gguf(path, rel)
        if magic == b"PK\x03\x04":
            return out + scan_zip(path, rel)
        if os.path.getsize(path) > MAX_BYTES:
            return out + scan_large(path, rel)
        with open(path, "rb") as f:
            raw = f.read()
    except OSError:
        return out + [{"file": rel, "line": 0, "rule": "unread:file"}]
    if b"\0" in raw[:4096] or raw[:4] == ZSTD or raw[:2] == GZIP:  # binary
        return out + scan_binary(raw, rel)
    return out + scan_text(raw.decode("utf-8", "replace"), rel)


def git_files(root):
    try:
        r = subprocess.run(["git", "-C", root, "ls-files", "-z", "--cached", "--others", "--exclude-standard"], capture_output=True, check=True)
        files = [p for p in r.stdout.decode().split("\0") if p]
        return [p for p in files if os.path.exists(os.path.join(root, p)) and p.split("/")[0] != INTERNAL]
    except (OSError, subprocess.CalledProcessError):
        return None


def walk_files(root):
    out = []
    for d, dirs, files in os.walk(root):
        dirs[:] = [x for x in dirs if x not in SKIP_DIRS and not (d == root and x == INTERNAL)]
        out += [os.path.relpath(os.path.join(d, f), root) for f in files]
    return out


def scan_tree(root=ROOT, files=None, walk=False):
    files = files if files is not None else ((None if walk else git_files(root)) or walk_files(root))
    findings = []
    for rel in sorted(files):
        findings += scan_file(os.path.join(root, rel), rel)
    return files, findings


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    ap.add_argument("paths", nargs="*")
    ap.add_argument("--root", default=ROOT)
    ap.add_argument("--walk", action="store_true", help="ignore git, scan every file under root")
    ap.add_argument("--json", action="store_true")
    a = ap.parse_args(argv)
    files, findings = scan_tree(a.root, a.paths or None, a.walk)
    real = [f for f in findings if not f["rule"].startswith("skip:")]
    if a.json:
        print(json.dumps({"files": len(files), "findings": findings}, indent=1))
    else:
        for f in findings:
            print(f"{f['file']}:{f['line']}: {f['rule']}")
        print(f"scan: {'clean' if not real else str(len(real)) + ' finding(s)'} ({len(files)} files, {len(RULES)} rules)")
    return 1 if real else 0


if __name__ == "__main__":
    sys.exit(main())
