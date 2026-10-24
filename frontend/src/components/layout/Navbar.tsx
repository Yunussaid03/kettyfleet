export default function Navbar() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div className="flex items-center space-x-3">
        <h3 className="text-base font-semibold text-slate-800">
          Fleet Operations
        </h3>
        <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
          ERP
        </span>
      </div>
      <div className="flex items-center text-xs text-slate-500">
        KettyFleet v1.0
      </div>
    </header>
  );
}