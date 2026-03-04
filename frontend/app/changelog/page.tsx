import Link from "next/link";

const updates = [
	{
		week: "Week 6",
		date: "Feb 16-23, 2026",
		title: "Brand refresh & accessibility improvements",
		items: [
			"Complete rebrand with teal color scheme (#378F96) matching new logo",
			"Added 'No login required' feature - analyze instantly without account",
			"Expanded multilingual support to 18+ languages for AI feedback",
			"Landing page redesign with improved messaging",
			"Analyze page UI enhancements with teal theme",
			"Updated README documentation with current features",
			"Improved user experience for anonymous users",
		],
	},
	{
		week: "Week 5",
		date: "Feb 9-16, 2026",
		title: "Admin panel & performance optimization",
		items: [
			"Admin dashboard for managing users, prompts, and rules",
			"Enhanced error tracking and analytics",
			"Performance improvements for long essays",
			"Database query optimization",
			"Better error handling and user feedback",
		],
	},
	{
		week: "Week 4",
		date: "Feb 2-9, 2026",
		title: "Authentication & premium features",
		items: [
			"Supabase authentication integration",
			"User submission history page",
			"Pro subscription with LemonSqueezy payment integration",
			"Elite polished rewrite feature for Pro users",
			"Pricing modal with feature comparison",
			"Daily quota system (Anonymous: 1, Free: 2, Pro: unlimited)",
		],
	},
	{
		week: "Week 3",
		date: "Jan 26 - Feb 2, 2026",
		title: "Learning features & analytics",
		items: [
			"Dashboard with performance analytics",
			"Grammar rules knowledge base",
			"Interactive grammar lesson modal",
			"AI-generated personalized quizzes",
			"Error frequency tracking and visualization",
			"Score trajectory charts",
		],
	},
	{
		week: "Week 2",
		date: "Jan 19-26, 2026",
		title: "Core features expansion",
		items: [
			"Enhanced error detection algorithms",
			"Improved feedback quality and clarity",
			"Better UI/UX for error highlighting",
			"Writing prompt suggestions system",
			"Initial dashboard framework",
		],
	},
	{
		week: "Week 1",
		date: "Jan 12-19, 2026",
		title: "Foundation & core analysis",
		items: [
			"Project setup with Next.js 14 and FastAPI",
			"Google Gemini AI integration for essay analysis",
			"Real-time error detection and highlighting",
			"Writing quality score prediction (0-10)",
			"Detailed feedback generation",
			"Landing page with hero section and features",
			"Basic analyze page with text input",
		],
	},
];

const roadmap = [
	{
		title: "Real-time typing feedback",
		desc: "Get suggestions as you type with live error detection and instant corrections.",
	},
	{
		title: "Advanced analytics dashboard",
		desc: "Deeper insights into writing patterns, weak areas, and improvement trends over time.",
	},
	{
		title: "Mobile app",
		desc: "Native iOS and Android apps for on-the-go essay analysis and practice.",
	},
	{
		title: "Collaborative features",
		desc: "Share essays with teachers or peers for feedback and collaborative learning.",
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
				<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-100 text-teal-700 text-xs font-semibold tracking-wide uppercase">
					On working
					<span className="inline-flex w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
				</div>

				<div className="mt-6 grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-12 items-start">
					<div>
						<h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 leading-[1.1]">
							Changelog and product progress
						</h1>
						<p className="mt-5 text-lg text-slate-600 leading-relaxed max-w-2xl">
							We are actively shipping improvements to Wrytt. This page tracks
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

					<div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-teal-50/60 p-6 shadow-xl shadow-teal-900/5">
						<h2 className="text-xl font-bold text-slate-900">
							Current sprint
						</h2>
						<div className="mt-4 space-y-4">
							{[
								"Performance optimization for faster analysis",
								"Enhanced error explanation clarity",
								"Mobile responsiveness improvements",
							].map((item) => (
								<div
									key={item}
									className="flex items-start gap-3 rounded-xl bg-white/80 border border-slate-100 px-4 py-3"
								>
									<span className="mt-1.5 h-2.5 w-2.5 rounded-full bg-teal-500" />
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
								className="font-semibold text-teal-700 hover:text-teal-600"
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
							className="text-sm font-semibold text-slate-600 hover:text-teal-600"
						>
							Go to dashboard
						</Link>
					</div>

					<div className="mt-8 space-y-6">
						{updates.map((update) => (
							<div
								key={update.week}
								className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
							>
								<div className="flex flex-wrap items-center gap-4">
									<span className="inline-flex items-center px-3 py-1 rounded-full bg-teal-100 text-teal-700 text-xs font-semibold">
										{update.week}
									</span>
									<span className="text-sm text-slate-500">{update.date}</span>
								</div>
								<h3 className="mt-4 text-xl font-semibold text-slate-900">
									{update.title}
								</h3>
								<ul className="mt-4 grid gap-2 text-sm text-slate-600">
									{update.items.map((item) => (
										<li key={item} className="flex items-start gap-2">
											<span className="mt-1 h-2 w-2 rounded-full bg-teal-500" />
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
								Just completed full rebrand with teal color scheme to match the new logo design.
							</div>
							<div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
								Removed login barriers - users can now analyze essays instantly without creating an account.
							</div>
							<div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
								Expanded multilingual support to 18+ languages for AI feedback localization.
							</div>
						</div>
						<div className="mt-6 border-t border-slate-200 pt-5">
							<p className="text-sm text-slate-500">
								Questions or ideas? We listen closely to user feedback.
							</p>
							<a
								href="mailto:contact@wrytt.live"
								className="mt-3 inline-flex text-sm font-semibold text-teal-700 hover:text-teal-600"
							>
								Contact support
							</a>
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
						<div className="mt-3 text-2xl font-semibold">Week 7 - Feb 23+</div>
						<p className="mt-3 text-sm text-slate-200">
							Focused on performance optimization and mobile experience.
						</p>
						<Link
							href="/analyze"
							className="mt-5 inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-teal-500 text-white text-sm font-semibold hover:bg-teal-600"
						>
							Try the latest build
						</Link>
					</div>
				</div>
			</section>
		</div>
	);
}
