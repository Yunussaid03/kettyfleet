export default function Sidebar() {
    return (
        <aside className = "w-64 min-h-screen bg-gray-900 text-white p-5">
            <h2 className="text-2xl font-bold mb-8">
                KettyFleet
            </h2>
           

          <nav>
            <ul className="space-y-4">
                <li>Dashboard</li>
                <li>Vehicles</li>
                <li>Clients</li>
                <li>Jobs</li>
                <li>Reports</li>
                </ul>
                </nav>  
        </aside>
    );

}