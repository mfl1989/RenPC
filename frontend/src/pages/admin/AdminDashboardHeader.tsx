import { NavLink } from 'react-router-dom'

type AdminSection = 'orders' | 'inquiries'

interface AdminDashboardHeaderProps {
  title: string
  subtitle: string
  currentSection: AdminSection
  onLogout: () => void
}

function tabClassName(isActive: boolean): string {
  return isActive
    ? 'inline-flex items-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm'
    : 'inline-flex items-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-50'
}

export default function AdminDashboardHeader({ title, subtitle, currentSection, onLogout }: AdminDashboardHeaderProps) {
  return (
    <header className="border-b border-slate-200 bg-white shadow-sm">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-slate-900">{title}</h1>
          <p className="text-sm text-slate-500">{subtitle}</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <nav className="flex flex-wrap gap-2" aria-label="管理画面メニュー">
            <NavLink to="/admin/orders" className={({ isActive }) => tabClassName(isActive || currentSection === 'orders')}>
              注文一覧
            </NavLink>
            <NavLink to="/admin/inquiries" className={({ isActive }) => tabClassName(isActive || currentSection === 'inquiries')}>
              問い合わせ一覧
            </NavLink>
          </nav>
          <button
            onClick={onLogout}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
          >
            ログアウト
          </button>
        </div>
      </div>
    </header>
  )
}