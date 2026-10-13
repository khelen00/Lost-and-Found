
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import "./MainLayout.css";

const mobileNavItems = [
  { label: "Home", page: "Dashboard", icon: "⌂" },
  { label: "Lost", page: "Report Lost", icon: "−" },
  { label: "Found", page: "Browse Found Items", icon: "+" },
  { label: "Claims", page: "My Claims", icon: "◇" },
  { label: "Reports", page: "My Reports", icon: "▤" },
];

function MainLayout({ page, setPage, user, logout, children }) {
  return (
    <div className="app">
      <Sidebar
        page={page}
        setPage={setPage}
        user={user}
        logout={logout}
      />

      <main className="main">
        <Header page={page} user={user} logout={logout} />

        <div className="main-content" key={page}>
          {children}
        </div>
      </main>

      <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
        {mobileNavItems.map((item) => {
          const active =
            page === item.page ||
            (item.page === "Browse Found Items" && page === "Submit Claim");

          return (
            <button
              key={item.label}
              type="button"
              className={`mobile-nav-item${active ? " active" : ""}`}
              onClick={() => setPage(item.page)}
              aria-current={active ? "page" : undefined}
            >
              <span className="mobile-nav-icon" aria-hidden="true">
                {item.icon}
              </span>
              <span className="mobile-nav-label">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

export default MainLayout;
