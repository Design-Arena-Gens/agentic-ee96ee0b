'use client';

import { FormEvent, useMemo, useState } from 'react';

type FormState = {
  businessType: string;
  audience: string;
  platform: string;
  tone: string;
  goal: string;
};

type PostIdea = {
  day: string;
  idea: string;
  caption: string;
  hashtags: string[];
};

type Context = FormState & {
  businessNoun: string;
  audienceShort: string;
  platformFeed: string;
  toneOpener: string;
  toneCloser: string;
  goalVerb: string;
};

type PlanState = {
  posts: PostIdea[];
  notes: string;
};

const daySlots = [
  'Mon · 6 PM',
  'Wed · 6 PM',
  'Fri · 6 PM',
  'Sun · 5 PM',
  'Tue · 7 PM',
  'Thu · 6 PM',
  'Sat · 10 AM',
  'Mon · 11 AM',
  'Wed · 12 PM',
  'Fri · 4 PM',
];

const toneOpeners: Record<string, string> = {
  Friendly: 'Hey there',
  Professional: 'Good afternoon',
  Bold: 'Heads up',
  Casual: 'Morning friends',
};

const toneClosers: Record<string, string> = {
  Friendly: 'See you soon!',
  Professional: 'Appreciate you being here.',
  Bold: "Let's make it happen.",
  Casual: 'Catch you later :)',
};

const goalPhrases: Record<string, string> = {
  'Get leads': 'invite a few new folks to reach out',
  'Build trust': 'show how much we care',
  'Increase engagement': 'spark a louder comment thread',
  'Educate audience': 'share something useful you can try right away',
};

const platformFeeds: Record<string, string> = {
  Instagram: 'feed',
  Facebook: 'page',
  LinkedIn: 'updates',
  Twitter: 'timeline',
};

const defaultForm: FormState = {
  businessType: 'Neighborhood coffee shop',
  audience: 'local regulars and curious foodies',
  platform: 'Instagram',
  tone: 'Friendly',
  goal: 'Increase engagement',
};

type TemplateBuilder = (ctx: Context, index: number) => Omit<PostIdea, 'day'>;

const templates: TemplateBuilder[] = [
  (ctx) => ({
    idea: 'Warm hello + today’s focus',
    caption: `${ctx.toneOpener} ${ctx.audienceShort}! ${ctx.businessNoun} just waved from the ${ctx.platformFeed} because we're trying to ${ctx.goalVerb} tonight. If you stop by, let us know what you’re sipping on – I’ll be in the comments for a bit ${ctx.toneCloser}`,
    hashtags: createHashtags(ctx, ['hello', 'eveningcheckin', 'communitytime']),
  }),
  (ctx) => ({
    idea: 'Behind-the-scenes snapshot',
    caption: `Grabbed a quick behind-the-scenes snap while the crew was mid-rush… not perfect lighting but the vibe felt right. These small messy moments are why I love running ${ctx.businessNoun}. Any other ${ctx.audienceShort} want a longer peek?`,
    hashtags: createHashtags(ctx, ['behindthescenes', 'realday', 'keepingitreal']),
  }),
  (ctx) => ({
    idea: 'Tiny how-to or tip list',
    caption: `${ctx.toneOpener}! Been jotting down a quick tip for folks who ask:\n1. Start with fresh ingredients (yep, the boring answer).\n2. Taste, tweak, then share.\n3. Don’t overthink the presentation—trust your gut.\nAnyway, hope it helps someone today.`,
    hashtags: createHashtags(ctx, ['quicktip', 'trythis', 'notesfromthecounter']),
  }),
  (ctx) => ({
    idea: 'Customer shout-out story',
    caption: `Still smiling about a chat with Lena this morning—she said ${ctx.businessNoun} feels like “a calm corner in the week.” That kind of feedback keeps us going. Got a story too? Toss it in here so we can celebrate you.`,
    hashtags: createHashtags(ctx, ['customerlove', 'communitystory', 'feelgood']),
  }),
  (ctx) => ({
    idea: 'Team highlight moment',
    caption: `Meet Josh (camera shy, sorry in advance). He’s the one making sure everything tastes the way it should. He’s been obsessing over a new idea and kinda forced us to try four versions—worth it. Drop him a little hype below.`,
    hashtags: createHashtags(ctx, ['teamspotlight', 'shopcrew', 'peoplefirst']),
  }),
  (ctx) => ({
    idea: 'Process reel or mini demo',
    caption: `Tossing up a quick reel later: start to finish in under 30 seconds. It’s not fancy, but you’ll see the scrappy way we pull a batch together when it’s hectic. Ping me if you want the slower, nerdy breakdown too.`,
    hashtags: createHashtags(ctx, ['processpeek', 'reelidea', 'scrappymagic']),
  }),
  (ctx) => ({
    idea: 'Weekend vibe or offer reminder',
    caption: `Weekend mood is creeping in already. If you swing by on Saturday, mention this post so we know you’re part of the crew—there might be an extra treat hiding behind the counter 😉`,
    hashtags: createHashtags(ctx, ['weekendplans', 'littlesurprise', 'treatyourself']),
  }),
  (ctx) => ({
    idea: 'Open question or micro poll',
    caption: `Need your brain for a sec: we’re testing two new ideas and can’t pick the best one. Do you want something classic done right, or something a bit weird but fun? Drop a simple “classic” or “weird” so we can run with it.`,
    hashtags: createHashtags(ctx, ['weighin', 'yourvote', 'buildwithus']),
  }),
  (ctx) => ({
    idea: 'Expert take or myth bust',
    caption: `${ctx.toneOpener}! Tiny myth we hear a lot: you need pricey gear to enjoy what we make. Nope. We’ve tested budget setups that still taste incredible. I’ll share a little gear list tomorrow if that helps.`,
    hashtags: createHashtags(ctx, ['mythbust', 'learnwithus', 'budgetfriendly']),
  }),
  (ctx) => ({
    idea: 'Quick gratitude note + CTA',
    caption: `Just a quick thank-you for sticking with ${ctx.businessNoun}. If you felt seen by anything we posted this week, mind sharing it with someone new? Word of mouth still beats every ad we try.`,
    hashtags: createHashtags(ctx, ['gratitude', 'sharethelove', 'smallbizlife']),
  }),
];

function buildContext(form: FormState): Context {
  const trimmedBusiness = form.businessType.trim() || 'our crew';
  const trimmedAudience = form.audience.trim() || 'friends';
  return {
    ...form,
    businessNoun: trimmedBusiness,
    audienceShort: trimmedAudience,
    platformFeed: platformFeeds[form.platform] ?? 'feed',
    toneOpener: toneOpeners[form.tone] ?? 'Hey there',
    toneCloser: toneClosers[form.tone] ?? 'Talk soon!',
    goalVerb: goalPhrases[form.goal] ?? 'keep the conversation going',
  };
}

function makeTag(input: string): string {
  if (!input) return '';
  const trimmed = input.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('#')) {
    return trimmed.replace(/\s+/g, '');
  }
  const cleaned = trimmed
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '');
  return cleaned ? `#${cleaned}` : '';
}

function createHashtags(ctx: Context, extras: string[]): string[] {
  const pool = [
    ctx.businessNoun,
    ctx.goal,
    ctx.platform,
    ctx.audienceShort,
    ...extras,
    ctx.platformFeed,
  ];
  const seen = new Set<string>();
  const tags: string[] = [];

  for (const candidate of pool) {
    const tag = makeTag(candidate);
    if (tag && !seen.has(tag)) {
      seen.add(tag);
      tags.push(tag);
    }
    if (tags.length >= 5) break;
  }

  const defaults = ['#smallbusiness', '#marketingnotes', '#staycurious'];
  for (const fallback of defaults) {
    if (tags.length >= 5) break;
    if (!seen.has(fallback)) {
      seen.add(fallback);
      tags.push(fallback);
    }
  }

  return tags.slice(0, 5);
}

function generateNotes(ctx: Context): string {
  const platformTip =
    ctx.platform === 'Instagram'
      ? 'Lean on warm, vertical photos—little motion blur is fine if it feels real.'
      : ctx.platform === 'LinkedIn'
        ? 'Pair posts with clean graphics or a candid team photo so it still feels human.'
        : ctx.platform === 'Facebook'
          ? 'Pull in a mix of horizontal shots and casual smartphone clips; FB still loves that blend.'
          : 'Keep visuals bold with quick cuts or GIF loops to stand out in the feed.';

  return `Notes for Client: Aim for natural light, grab a quick portrait or two of the team, and keep text overlays minimal. ${platformTip}`;
}

function producePlan(form: FormState): PlanState {
  const ctx = buildContext(form);
  const count = Math.min(templates.length, 10);
  const posts = templates.slice(0, count).map((template, index) => ({
    day: daySlots[index % daySlots.length],
    ...template(ctx, index),
  }));
  return {
    posts,
    notes: generateNotes(ctx),
  };
}

export default function HomePage() {
  const [form, setForm] = useState<FormState>(defaultForm);
  const [plan, setPlan] = useState<PlanState>(() => producePlan(defaultForm));

  const isSubmitDisabled = useMemo(() => {
    return !form.businessType.trim() || !form.audience.trim();
  }, [form.businessType, form.audience]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPlan(producePlan(form));
  };

  return (
    <div className="bg-zinc-100 min-h-screen pb-16 text-zinc-900">
      <header className="border-b border-zinc-200 bg-white/70 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-col gap-2 px-6 py-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Session tool</p>
            <h1 className="text-2xl font-semibold sm:text-3xl">
              Social Post Session Planner
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-zinc-600">
              Fill in the basics, hit generate, and you’ll get a batch of human-sounding ideas with captions, hashtags, and a quick schedule.
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-5xl flex-col gap-10 px-6 pt-8">
        <form
          onSubmit={handleSubmit}
          className="grid gap-6 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm"
        >
          <div className="grid gap-2">
            <label className="text-sm font-medium text-zinc-700" htmlFor="businessType">
              Business type
            </label>
            <input
              id="businessType"
              name="businessType"
              value={form.businessType}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, businessType: event.target.value }))
              }
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm shadow-inner focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-300"
              placeholder="Boutique fitness studio, family law firm, farm-to-table cafe…"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-zinc-700" htmlFor="audience">
              Audience
            </label>
            <input
              id="audience"
              name="audience"
              value={form.audience}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, audience: event.target.value }))
              }
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm shadow-inner focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-300"
              placeholder="local parents, busy founders, design-curious folks…"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-zinc-700" htmlFor="platform">
                Platform
              </label>
              <select
                id="platform"
                name="platform"
                value={form.platform}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, platform: event.target.value }))
                }
                className="rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-300"
              >
                <option>Instagram</option>
                <option>LinkedIn</option>
                <option>Facebook</option>
                <option>Twitter</option>
              </select>
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium text-zinc-700" htmlFor="tone">
                Tone
              </label>
              <select
                id="tone"
                name="tone"
                value={form.tone}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, tone: event.target.value }))
                }
                className="rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-300"
              >
                <option>Friendly</option>
                <option>Professional</option>
                <option>Bold</option>
                <option>Casual</option>
              </select>
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium text-zinc-700" htmlFor="goal">
                Goal
              </label>
              <select
                id="goal"
                name="goal"
                value={form.goal}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, goal: event.target.value }))
                }
                className="rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-300"
              >
                <option>Increase engagement</option>
                <option>Get leads</option>
                <option>Build trust</option>
                <option>Educate audience</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={isSubmitDisabled}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
            >
              Generate posts
            </button>
            <span className="text-xs text-zinc-500">
              Keep descriptions short and real—no need for fancy wording.
            </span>
          </div>
        </form>

        <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-zinc-800">
              Planned posts ({plan.posts.length} total)
            </h2>
            <span className="text-xs uppercase tracking-[0.2em] text-zinc-400">
              Day | Idea | Caption | Hashtags
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead>
                <tr className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500">
                  <th className="w-[120px] border border-zinc-200 px-3 py-2 font-medium">
                    Day
                  </th>
                  <th className="border border-zinc-200 px-3 py-2 font-medium">
                    Post Idea
                  </th>
                  <th className="border border-zinc-200 px-3 py-2 font-medium">
                    Caption
                  </th>
                  <th className="border border-zinc-200 px-3 py-2 font-medium">
                    Hashtags
                  </th>
                </tr>
              </thead>
              <tbody>
                {plan.posts.map((post) => (
                  <tr key={`${post.day}-${post.idea}`} className="align-top">
                    <td className="border border-zinc-200 px-3 py-3 text-xs font-semibold text-zinc-700">
                      {post.day}
                    </td>
                    <td className="border border-zinc-200 px-3 py-3 text-sm font-medium text-zinc-800">
                      {post.idea}
                    </td>
                    <td className="border border-zinc-200 px-3 py-3 whitespace-pre-line text-sm text-zinc-700">
                      {post.caption}
                    </td>
                    <td className="border border-zinc-200 px-3 py-3 text-sm text-zinc-600">
                      {post.hashtags.join(' ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-5 text-sm text-zinc-700">
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Notes for Client
          </h3>
          <p className="leading-relaxed">
            {plan.notes}
          </p>
        </section>
      </main>
    </div>
  );
}
