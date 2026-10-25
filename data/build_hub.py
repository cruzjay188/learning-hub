"""Build hub-data.json (front-end/public/) for the Eagle Learning Hub page.

Usage (from the workspace root):  python3 -I learning-hub/data/build_hub.py

Inputs, all inside the workspace:
  schedule/.calendar/*.json   raw Google Calendar list_events pages (saved by /sync)
  learning-hub/data/guides/*.json  one lecture guide per file (spec: data/guides/README.md)
  progress.md                 assignment tracker tables
  notes/work-log/*.md         work logs
  assignments/*/*             git repos (Jeffrey's commits)
"""
import glob
import json
import os
import re
import subprocess
from collections import defaultdict
from datetime import date, datetime, timedelta

HUB = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # learning-hub/
ROOT = os.path.dirname(HUB)  # the workspace
COHORT_START = date(2026, 10, 5)
GRADUATION = date(2027, 1, 15)
AUTHOR_EMAIL = "cruzjay188@gmail.com"
ROUTINE = {"Stand Up", "Stand Down", "Team Meet"}

MODULES = [
    {"id": "m1", "name": "Agents as Tools", "short": "AI", "number": 1},
    {"id": "m2", "name": "Building Applications", "short": "AI", "number": 2},
    {"id": "m3", "name": "Beyond Building", "short": "AI", "number": 3},
    {"id": "m4", "name": "SE Fundamentals", "short": "SE", "number": 4},
    {"id": "m5", "name": "Object-Oriented Programming", "short": "SE", "number": 5},
    {"id": "m6", "name": "Data Structures & Algorithms", "short": "SE", "number": 6},
    {"id": "m7", "name": "Front End", "short": "FS", "number": 7},
    {"id": "m8", "name": "Back End", "short": "FS", "number": 8},
    {"id": "m9", "name": "Full Stack & Deployment", "short": "FS", "number": 9},
    {"id": "proj", "name": "Projects", "short": "PR", "number": None},
]

NAMED_LECTURES = {
    "welcome aboard": "onboarding",
    "prep machine + cli": "onboarding",
    "interacting with assignments": "onboarding",
    "git + github": "git-github",
    "intro to docker": "docker",
    "python + js": "python-js",
    "tdd with jest and pytest": "tdd",
    "github actions": "github-actions",
    "agentic coding as an engineer": "agentic-coding",
}


def lecture_id(title):
    """Map a calendar title to a lecture id, or None when it isn't a lecture."""
    t = title.strip()
    low = t.lower()
    if low in NAMED_LECTURES:
        return NAMED_LECTURES[low]
    if low.startswith("fs-1:"):
        return "fs-intro"
    m = re.match(r"^(AI|FE|BE|DS|OOP|FS|Deployment)[\s-]*(\d+)\s*:", t, re.I)
    if m:
        return f"{m.group(1).lower()}-{m.group(2)}"
    if "personal project kickoff" in low or low.startswith("personal project deadline") or low.startswith("personal project presentations"):
        return "personal-project"
    if "group project kickoff" in low or low.startswith("group projects"):
        return "group-project"
    return None


def module_for(lid):
    if lid == "onboarding":
        return None
    if lid in ("fs-intro", "ai-1", "ai-2", "ai-3"):
        return "m1"
    if lid.startswith("ai-"):
        n = int(lid.split("-")[1])
        return "m2" if n <= 7 else "m3"
    if lid in ("git-github", "docker", "python-js", "tdd", "github-actions"):
        return "m4"
    prefix = lid.split("-")[0]
    return {"oop": "m5", "ds": "m6", "fe": "m7", "be": "m8", "fs": "m9", "deployment": "m9"}.get(prefix, "proj")


def event_kind(title):
    low = title.lower()
    if low == "no class":
        return "noclass"
    if "graduation" in low:
        return "milestone"
    if any(k in low for k in ("work time", "pair programming", "jeopardy")):
        return "work"
    if low.startswith(("bt", "13:30 bt", "1:30pm bt", "gs", "0900 gs")) or any(
        k in low for k in ("consultant", "inclusion", "day in the life", "sitrep", "alumni", "presentation by")
    ):
        return "career"
    if any(k in low for k in ("installfest", "student portal", "student data", "team kickoff", "morning off")):
        return "admin"
    return "event"


def load_calendar():
    events = {}
    for path in sorted(glob.glob(os.path.join(ROOT, "schedule/.calendar/*.json"))):
        with open(path) as f:
            for ev in json.load(f).get("events", []):
                events[ev["id"]] = ev
    out = []
    for ev in events.values():
        title = (ev.get("summary") or "").strip()
        if not title or title in ROUTINE:
            continue
        start = ev["start"]
        if "dateTime" in start:
            dt = datetime.fromisoformat(start["dateTime"])
            d, t = dt.date(), dt.strftime("%H:%M")
        else:
            d, t = date.fromisoformat(start["date"][:10]), None
        out.append((d, t, title))
    return sorted(out, key=lambda e: (e[0], e[1] or "00:00"))


def week_of(d):
    return (d - COHORT_START).days // 7 + 1


def load_guides():
    guides = {}
    for path in sorted(glob.glob(os.path.join(HUB, "data/guides/*.json"))):
        with open(path) as f:
            g = json.load(f)
        guides[g["id"]] = g
    return guides


STATUS = {"✅": "done", "🟡": "in-progress", "⬜": "todo", "❓": "check", "📝": "quiz"}
LINK = re.compile(r"\[([^\]]+)\]\(([^)]+)\)")


def cells(line):
    return [c.strip() for c in line.strip().strip("|").split("|")]


def load_progress():
    assignments, assessments = [], []
    week, section = None, None
    with open(os.path.join(ROOT, "progress.md")) as f:
        for line in f:
            h = re.match(r"^## Week (\d+)", line)
            if h:
                week, section = int(h.group(1)), "week"
                continue
            if line.startswith("## Assessments"):
                section = "assess"
                continue
            if not line.startswith("|") or set(line.strip()) <= set("|-") or re.match(r"^\|\s*(Assignment|Assessment)\s*\|", line):
                continue
            c = cells(line)
            if section == "week" and len(c) >= 5:
                name, status, repo, local, notes = c[:5]
                link = LINK.search(repo)
                slug = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
                assignments.append({
                    "id": slug,
                    "title": name,
                    "week": week,
                    "status": STATUS.get(status.strip(), "todo"),
                    "repo": link.group(2) if link else None,
                    "repoLabel": link.group(1) if link else repo.replace("**", "") or None,
                    "local": local.strip("`") if local not in ("—", "", "↑") else None,
                    "notes": re.sub(r"\[\[([^\]|]+)(?:\|[^\]]*)?\]\]", lambda m: m.group(1).split("/")[-1], LINK.sub(r"\1", notes)).replace("**", "").replace("`", ""),
                })
            elif section == "assess" and len(c) >= 3:
                assessments.append({"title": c[0].replace("**", ""), "covers": c[1], "status": STATUS.get(c[2].strip(), "todo")})
    return assignments, assessments


def load_work_logs():
    logs = []
    for path in sorted(glob.glob(os.path.join(ROOT, "notes/work-log/*.md")), reverse=True):
        name = os.path.basename(path)
        with open(path) as f:
            text = f.read()
        title = re.search(r"^# (.+)$", text, re.M)
        summary = re.search(r"> \[!summary\][^\n]*\n((?:>.*\n?)+)", text)
        summary_text = ""
        if summary:
            summary_text = " ".join(l.lstrip("> ").strip() for l in summary.group(1).splitlines())
            summary_text = re.sub(r"\[\[[^\]|]*\|([^\]]+)\]\]", r"\1", summary_text)
            summary_text = re.sub(r"[*`]", "", summary_text)
        logs.append({
            "date": name[:10],
            "title": title.group(1).strip() if title else name[11:-3],
            "file": f"notes/work-log/{name}",
            "summary": summary_text,
        })
    return logs


def run(cmd, cwd=None):
    try:
        return subprocess.run(cmd, cwd=cwd, capture_output=True, text=True, timeout=60).stdout
    except (OSError, subprocess.TimeoutExpired):
        return ""


def load_commits():
    commits = []
    for repo in sorted(glob.glob(os.path.join(ROOT, "assignments/*/*/.git"))):
        path = os.path.dirname(repo)
        remote = run(["git", "remote", "get-url", "origin"], cwd=path).strip().removesuffix(".git")
        out = run(["git", "log", "--since=2026-10-01", f"--author={AUTHOR_EMAIL}", "--format=%cI%x09%h%x09%s"], cwd=path)
        for line in out.splitlines():
            when, sha, msg = line.split("\t", 2)
            commits.append({"date": when[:10], "when": when, "repo": os.path.basename(path), "sha": sha,
                            "message": msg, "url": f"{remote}/commit/{sha}" if remote.startswith("https://") else None})
    return sorted(commits, key=lambda c: c["when"], reverse=True)


def public_view(data):
    """The course as every student should see it: no one person's notes, paths, statuses, commits or work logs."""
    def public_assignment(a):
        return {"id": a["id"], "title": a["title"], "week": a["week"], "lectures": a.get("lectures", []),
                # quizzes stay quizzes; everything else starts at To do (each student's own status lives in Supabase)
                "status": "quiz" if a["status"] == "quiz" else "todo", "repo": None, "repoLabel": None, "local": None, "notes": ""}
    def public_lecture(l):
        if not l.get("guide"):
            return l
        guide = {k: v for k, v in l["guide"].items() if k != "sources"}  # sources hold local paths and personal notes
        return {**l, "guide": guide}
    return {**data,
            # course assignments are the ones linked to a lecture; personal practice repos aren't
            "assignments": [public_assignment(a) for a in data["assignments"] if a.get("lectures")],
            "assessments": [{**x, "status": "todo"} for x in data["assessments"]],
            "lectures": [public_lecture(l) for l in data["lectures"]],
            "workLogs": [], "commits": [], "repos": []}


def main():
    guides = load_guides()
    events = load_calendar()

    days = defaultdict(list)
    lectures = {}
    for d, t, title in events:
        lid = lecture_id(title)
        kind = "lecture" if lid else event_kind(title)
        if lid in ("personal-project", "group-project"):
            kind = "project"
        days[d].append({"time": t, "title": title, "kind": kind, "lectureId": lid})
        if lid and kind in ("lecture", "project"):
            lec = lectures.setdefault(lid, {"id": lid, "dates": [], "times": [], "title": title})
            if d.isoformat() not in lec["dates"]:
                lec["dates"].append(d.isoformat())
                lec["times"].append(t)

    lecture_list = []
    for lid, lec in lectures.items():
        g = guides.get(lid)
        first = date.fromisoformat(lec["dates"][0])
        raw = lec["title"]
        title = re.sub(r"^(AI|FE|BE|DS|OOP|FS|Deployment)[\s-]*\d+\s*:\s*", "", raw, flags=re.I).strip()
        code_match = re.match(r"^(AI|FE|BE|DS|OOP|FS|Deployment)[\s-]*(\d+)", raw, re.I)
        lecture_list.append({
            "id": lid,
            "code": (g or {}).get("code") or (f"{code_match.group(1)} {code_match.group(2)}" if code_match else None),
            "title": (g or {}).get("title") or title,
            "date": lec["dates"][0],
            "dates": lec["dates"],
            "time": lec["times"][0],
            "week": week_of(first),
            "module": module_for(lid),
            "guide": g,
        })
    lecture_list.sort(key=lambda l: (l["date"], l["time"] or ""))

    day_list = []
    d = COHORT_START
    while d <= GRADUATION:
        if d.weekday() < 5:
            items = days.get(d, [])
            day_list.append({
                "date": d.isoformat(),
                "week": week_of(d),
                "noClass": any(i["kind"] == "noclass" for i in items),
                "items": items,
            })
        d += timedelta(days=1)

    assignments, assessments = load_progress()
    # Link assignments to lectures through the guides' `assignments` lists. "agentic-netflix-clone IV — Auth"
    # becomes "agentic-netflix-clone-iv", which must equal a guide's repo name or prefix it before a dash.
    for a in assignments:
        base = a["title"].split(" — ")[0].strip().lower().replace(" ", "-")
        a["lectures"] = [
            l["id"] for l in lecture_list
            if l["guide"] and any(n.lower() == base or n.lower().startswith(base + "-") for n in l["guide"].get("assignments", []))
        ]

    repos_raw = run(["gh", "repo", "list", "cruzjay188", "--limit", "100", "--json", "name,url,pushedAt,isFork,description"])
    repos = [r for r in json.loads(repos_raw or "[]") if r.get("pushedAt", "") >= "2026-10-01"]

    data = {
        "generatedAt": datetime.now().astimezone().isoformat(timespec="minutes"),
        "cohort": {"name": "Eagle Platoon", "program": "AI + Full-Stack Software Engineering",
                   "start": COHORT_START.isoformat(), "graduation": GRADUATION.isoformat(),
                   "timezone": "America/New_York", "classTimezoneNote": "Class runs on Central time (ET − 1h)"},
        "rhythm": [{"time": "09:30", "label": "Stand Up"}, {"time": "10:00", "label": "Morning lecture"},
                   {"time": "14:30", "label": "Afternoon block"}, {"time": "17:30", "label": "Team Meet"},
                   {"time": "18:00", "label": "Stand Down"}],
        "modules": MODULES,
        "lectures": lecture_list,
        "days": day_list,
        "assignments": assignments,
        "assessments": assessments,
        "workLogs": load_work_logs(),
        "commits": load_commits()[:40],
        "repos": repos,
    }
    # Two copies (docs/security-rules.md §7.2):
    #   front-end/public/hub-data.json  PUBLIC: shared course content only, served to every student by Vercel
    #   data/hub-data.personal.json     PRIVATE (git-ignored): everything, incl. Jeffrey's notes, commits and work logs,
    #                                   for his own claude.ai artifact copy (and site/ while it exists)
    outs = {os.path.join(HUB, "front-end/public/hub-data.json"): public_view(data),
            os.path.join(HUB, "data/hub-data.personal.json"): data}
    if os.path.isdir(os.path.join(HUB, "site")):
        outs[os.path.join(HUB, "site/hub-data.json")] = data
    for path, content in outs.items():
        with open(path, "w") as f:
            json.dump(content, f, ensure_ascii=False, separators=(",", ":"))
    out = " and ".join(os.path.relpath(o, HUB) for o in outs)
    full = sum(1 for l in lecture_list if l["guide"] and l["guide"].get("status") == "full")
    print(f"wrote {out}: {len(lecture_list)} lectures ({full} full guides, "
          f"{sum(1 for l in lecture_list if l['guide'])} with guides), {len(day_list)} class days, "
          f"{len(assignments)} assignments, {len(data['workLogs'])} work logs, {len(data['commits'])} commits")
    missing = [l["id"] for l in lecture_list if not l["guide"]]
    if missing:
        print("lectures without a guide:", ", ".join(missing))
    unused = sorted(set(guides) - set(lectures))
    if unused:
        print("guides with no calendar match:", ", ".join(unused))


if __name__ == "__main__":
    main()
