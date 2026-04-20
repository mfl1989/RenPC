/** 申込フロー進捗（Step 1〜4 共通） */
export function StepProgress({ step }: { step: 1 | 2 | 3 | 4 }) {
  const labels = ['品目', '日時', 'お客様情報', '確認'] as const
  return (
    <div className="mb-6 rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-600 md:text-sm">
        {labels.map((label, i) => {
        const n = (i + 1) as 1 | 2 | 3 | 4
        const active = n === step
        const done = n < step
        return (
          <div key={label} className="flex items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 ${
                active
                  ? 'bg-orange-500 text-white'
                  : done
                    ? 'bg-emerald-100 text-emerald-900'
                    : 'bg-slate-200 text-slate-600'
              }`}
            >
              {n}. {label}
            </span>
            {i < labels.length - 1 ? (
              <span className="hidden h-px w-4 bg-slate-300 sm:block" aria-hidden />
            ) : null}
          </div>
        )
        })}
      </div>
    </div>
  )
}
