import Link from "next/link";

const updates = [
	{
		version: "v2.1",
		date: "Feb 2026",
		title: "Writing history and smarter highlights",
		items: [
			"Inline grammar highlights with clearer explanations",
			"Session history search by prompt and keyword",
			"Faster analysis for long Task 2 essays",
		],
	},
	{
		version: "v2.0",
		date: "Jan 2026",
		title: "Eloqua Pro rollout",
		items: [
			"Pro plans with priority analysis queue",
			"Vocabulary upgrades with C1/C2 suggestions",
			"Improved score prediction for Task 1",
		],
	},
	{
		version: "v1.9",
		date: "Dec 2025",
		title: "Stability and onboarding refresh",
		items: [
			"New onboarding path for first-time users",
			"Cleaner dashboard layout and faster loading",
			"Security hardening for auth callbacks",
		],
	},
];

const roadmap = [
	{
		title: "Realtime feedback",
		desc: "Suggestions appear as you type, with context-aware explanations.",
	},
	{
		title: "Rubric drill-down",
		desc: "A dedicated view for Coherence, Lexical Resource, and Grammar.",
	},
	{
		title: "Study plans",
		desc: "Weekly goals based on your weak bands and topic trends.",
	},
];

export default function ChangelogPage() {
	return (
		<div className="min-h-screen bg-white text-slate-900">
			<div
				className="fixed inset-0 pointer-events-none z-0 opacity-[0.35]"
				style={{
					backgroundImage:
						"radial-gradient(#cbd5e1 1px, transparent 1px)",
					backgroundSize: "36px 36px",
				}}
			/>

			<section className="relative z-10 max-w-6xl mx-auto px-6 pt-28 pb-16">
				<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-100 text-cyan-700 text-xs font-semibold tracking-wide uppercase">
					On working
					<span className="inline-flex w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
				</div>

				<div className="mt-6 grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-12 items-start">
					<div>
						<h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 leading-[1.1]">
							Changelog and product progress
						</h1>
						<p className="mt-5 text-lg text-slate-600 leading-relaxed max-w-2xl">
							We are actively shipping improvements to Eloqua. This page tracks
							the work in progress, recent releases, and what is coming next.
						</p>

						<div className="mt-8 flex flex-wrap gap-3">
							<div className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm font-semibold text-slate-700 shadow-sm">
								Status: Building
							</div>
							<div className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm font-semibold text-slate-700 shadow-sm">
								Release cadence: Biweekly
							</div>
							<div className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm font-semibold text-slate-700 shadow-sm">
								Focus: Accuracy + Speed
							</div>
						</div>
					</div>

					<div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-cyan-50/60 p-6 shadow-xl shadow-cyan-900/5">
						<h2 className="text-xl font-bold text-slate-900">
							Current sprint
						</h2>
						<div className="mt-4 space-y-4">
							{[
								"Rewrite quality tuning for Task 2",
								"New pricing flow with clearer feature tiers",
								"Prompt history filters and sorting",
							].map((item) => (
								<div
									key={item}
									className="flex items-start gap-3 rounded-xl bg-white/80 border border-slate-100 px-4 py-3"
								>
									<span className="mt-1.5 h-2.5 w-2.5 rounded-full bg-cyan-500" />
									<p className="text-sm text-slate-700 leading-relaxed">
										{item}
									</p>
								</div>
							))}
						</div>
						<div className="mt-6 flex items-center gap-3 text-sm">
							<span className="text-slate-500">Want updates?</span>
							<Link
								href="/pricing"
								className="font-semibold text-cyan-700 hover:text-cyan-600"
							>
								See plans
							</Link>
						</div>
					</div>
				</div>
			</section>

			<section className="relative z-10 bg-slate-50 border-y border-slate-200">
				<div className="max-w-6xl mx-auto px-6 py-16">
					<div className="flex items-center justify-between flex-wrap gap-4">
						<h2 className="text-2xl font-bold text-slate-900">Recent updates</h2>
						<Link
							href="/dashboard"
							className="text-sm font-semibold text-slate-600 hover:text-cyan-600"
						>
							Go to dashboard
						</Link>
					</div>

					<div className="mt-8 space-y-6">
						{updates.map((update) => (
							<div
								key={update.version}
								className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
							>
								<div className="flex flex-wrap items-center gap-4">
									<span className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
										{update.version}
									</span>
									<span className="text-sm text-slate-500">{update.date}</span>
								</div>
								<h3 className="mt-4 text-xl font-semibold text-slate-900">
									{update.title}
								</h3>
								<ul className="mt-4 grid gap-2 text-sm text-slate-600">
									{update.items.map((item) => (
										<li key={item} className="flex items-start gap-2">
											<span className="mt-1 h-2 w-2 rounded-full bg-cyan-500" />
											{item}
										</li>
									))}
								</ul>
							</div>
						))}
					</div>
				</div>
			</section>

			<section className="relative z-10 max-w-6xl mx-auto px-6 py-16">
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					<div className="lg:col-span-2 rounded-2xl border border-slate-200 p-6 bg-white shadow-sm">
						<h2 className="text-2xl font-bold text-slate-900">Up next</h2>
						<p className="mt-3 text-slate-600">
							The roadmap is focused on faster feedback and stronger learning
							loops. These items are actively being designed or built.
						</p>
						<div className="mt-6 grid gap-4">
							{roadmap.map((item) => (
								<div
									key={item.title}
									className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-4"
								>
									<h3 className="text-lg font-semibold text-slate-900">
										{item.title}
									</h3>
									<p className="mt-2 text-sm text-slate-600">{item.desc}</p>
								</div>
							))}
						</div>
					</div>

					<div className="rounded-2xl border border-slate-200 p-6 bg-gradient-to-b from-white to-slate-50">
						<h2 className="text-xl font-bold text-slate-900">Working notes</h2>
						<div className="mt-5 space-y-4 text-sm text-slate-600">
							<div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
								We are refining prompt scoring to better match IELTS rubric
								language.
							</div>
							<div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
								The next release prioritizes speed for long essays and complex
								prompts.
							</div>
							<div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
								Quality checks are run before every deploy to keep rewrites
								consistent.
							</div>
						</div>
						<div className="mt-6 border-t border-slate-200 pt-5">
							<p className="text-sm text-slate-500">
								Questions or ideas? We listen closely to user feedback.
							</p>
							<Link
								href="/pricing"
								className="mt-3 inline-flex text-sm font-semibold text-cyan-700 hover:text-cyan-600"
							>
								Contact support
							</Link>
						</div>
					</div>
				</div>
			</section>

			<section className="relative z-10 bg-slate-900 text-white">
				<div className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-[1.2fr_0.8fr] gap-10 items-center">
					<div>
						<h2 className="text-3xl font-bold">Stay in the loop</h2>
						<p className="mt-4 text-slate-200 max-w-xl">
							We post releases here first. Bookmark the page or check the
							dashboard for live updates.
						</p>
					</div>
					<div className="rounded-2xl bg-white/10 border border-white/10 p-6">
						<div className="text-sm uppercase tracking-wider text-slate-300">
							Next drop
						</div>
						<div className="mt-3 text-2xl font-semibold">Late Feb 2026</div>
						<p className="mt-3 text-sm text-slate-200">
							Focused on realtime feedback and history analytics.
						</p>
						<Link
							href="/analyze"
							className="mt-5 inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-cyan-500 text-white text-sm font-semibold hover:bg-cyan-600"
						>
							Try the latest build
						</Link>
					</div>
				</div>
			</section>
		</div>
	);
}
