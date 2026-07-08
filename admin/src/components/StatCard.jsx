function StatCard({ label, value, sub }) {
  return (
    <div className="rounded-[20px] border border-line glass p-5 transition-all hover:glow-ring">
      <p className="text-xs font-medium uppercase tracking-wider text-muted">{label}</p>
      <p className="mt-2 text-3xl font-bold text-gradient">{value?.toLocaleString() ?? '—'}</p>
      {sub && <p className="mt-1 text-xs text-muted">{sub}</p>}
    </div>
  )
}

export default StatCard
