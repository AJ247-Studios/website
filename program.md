# website-autobench

This is an experiment to have the LLM autonomously optimize the website's loading performance.

## Setup

To set up a new experiment, work with the user to:

1. **Agree on a run tag**: propose a tag based on today's date (e.g. `apr19`). The branch `autobench/<tag>` must not already exist — this is a fresh run.
2. **Create the branch**: `git checkout -b autobench/<tag>` from current main.
3. **Read the in-scope files**: The repo is small. Read these files for full context:
   - `benchmark.mjs` — performance measurement script. Do not modify.
   - `package.json` — dependencies. Do not modify.
   - `next.config.ts` — Next.js configuration.
   - `app/` — the Next.js application code.
   - `components/` — React components.
   - `public/` — static assets.
4. **Verify dependencies**: Check that `node_modules/` exists. If not, run `npm install`.
5. **Verify website runs**: Ensure `npm run dev` starts successfully on port 3000.
6. **Initialize results.tsv**: Create `results.tsv` with just the header row. The baseline will be recorded after the first run.
7. **Confirm and go**: Confirm setup looks good.

Once you get confirmation, kick off the experimentation.

## Experimentation

The website must be running (`npm run dev` on port 3000) before each experiment. You launch the benchmark simply as: `node benchmark.mjs`.

**What you CAN do:**
- Modify any website file — this includes `app/`, `components/`, `public/`, `next.config.ts`, `tailwind.config.ts`, etc. Everything is fair game: code optimization, image compression, lazy loading, code splitting, bundle analysis, etc.

**What you CANNOT do:**
- Modify `benchmark.mjs`. It is read-only. It contains the fixed benchmark logic.
- Install new packages or add dependencies to `package.json`. You can only use what's already installed.
- Modify the benchmark harness. The `measureLoadTime()` function in `benchmark.mjs` is the ground truth metric.

**The goal is simple: get the lowest load_time_ms.** Since the benchmark is consistent, you don't need to worry about variance — run the benchmark as-is. Everything is fair game: optimize images, add code splitting, remove unused code, optimize imports, compress assets, improve component rendering, etc. The only constraint is that the website still runs without crashing.

**Simplicity criterion**: All else being equal, simpler is better. A small improvement that adds ugly complexity is not worth it. Conversely, removing something and getting equal or better results is a great outcome — that's a simplification win. When evaluating whether to keep a change, weigh the complexity cost against the improvement magnitude. A 1ms improvement that adds 20 lines of hacky code? Probably not worth it. A 1ms improvement from deleting code? Definitely keep. An improvement of ~0ms but much simpler code? Keep.

**The first run**: Your very first run should always be to establish the baseline, so you will run the benchmark script as is with no changes.

## Output format

Once the script finishes it prints a summary like this:

```
load_time_ms: 7.3
all_runs: [6.5, 6.9, 7.3, 7.4, 7.7]
```

Note that the script runs 5 iterations and reports the median. You can extract the key metric from the output:

```
node benchmark.mjs 2>&1 | grep "^load_time_ms:"
```

## Logging results

When an experiment is done, log it to `results.tsv` (tab-separated, NOT comma-separated — commas break in descriptions).

The TSV has a header row and 5 columns:

```
commit	load_time_ms	memory_mb	status	description
```

1. git commit hash (short, 7 chars)
2. load_time_ms achieved (e.g. 7.300) — use 0.000 for crashes
3. memory_mb (not currently tracked, use 0)
4. status: `keep`, `discard`, or `crash`
5. short text description of what this experiment tried

Example:

```
commit	load_time_ms	memory_mb	status	description
a1b2c3d	7.300	0	keep	baseline
b2c3d4e	6.800	0	keep	compress images in public/
c3d4e5f	7.100	0	discard	add heavy animation library
d4e5f6g	0.000	0	crash	broke the build
```

## The experiment loop

The experiment runs on a dedicated branch (e.g. `autobench/apr19`).

LOOP FOREVER:

1. Look at the git state: the current branch/commit we're on
2. Tune the website with an experimental idea by directly hacking the code.
3. If the change affects the build, verify it still works: `npm run build` (or check dev server starts)
4. git commit
5. Ensure the website is running on port 3000
6. Run the experiment: `node benchmark.mjs > run.log 2>&1`
7. Read out the results: `grep "^load_time_ms:" run.log`
8. If the grep output is empty, the run crashed. Run `tail -n 50 run.log` to read the error and attempt a fix. If you can't get things to work after more than a few attempts, give up.
9. Record the results in the tsv (NOTE: do not commit the results.tsv file, leave it untracked by git)
10. If load_time_ms improved (lower), you "advance" the branch, keeping the git commit
11. If load_time_ms is equal or worse, you git reset back to where you started

The idea is that you are a completely autonomous researcher trying things out. If they work, keep. If they don't, discard. And you're advancing the branch so that you can iterate. If you feel like you're getting stuck in some way, you can rewind but you should probably do this very very sparingly (if ever).

**Timeout**: Each experiment should take ~30 seconds total (benchmark runs 5x). If a run exceeds 2 minutes, kill it and treat it as a failure (discard and revert).

**Crashes**: If a run crashes (build error, dev server crash, etc.), use your judgment: If it's something dumb and easy to fix (e.g. a typo, a missing import), fix it and re-run. If the idea itself is fundamentally broken, just skip it, log "crash" as the status in the tsv, and move on.

**NEVER STOP**: Once the experiment loop has begun (after the initial setup), do NOT pause to ask the human if you should continue. Do NOT ask "should I keep going?" or "is this a good stopping point?". The human might be asleep, or gone from a computer and expects you to continue working *indefinitely* until you are manually stopped. You are autonomous. If you run out of ideas, think harder — analyze what's actually slow, check bundle size, look at network requests, try optimization techniques from web performance best practices. The loop runs until the human interrupts you, period.

As an example use case, a user might leave you running while they sleep. If each experiment takes you ~30 seconds then you can run approx 120/hour, for a total of about 1000 over the duration of the average human sleep. The user then wakes up to experimental results, all completed by you while they slept!
