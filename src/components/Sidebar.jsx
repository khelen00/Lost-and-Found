import FindItLogo from "./FindItLogo";
const menuGroups = [
  {
    title: "OVERVIEW",
    items: [
      { label: "Dashboard", icon: "⌂" },
    ],
  },
  {
    title: "ITEMS",
    items: [
      { label: "Report Lost", icon: "−" },
      { label: "Report Found", icon: "+" },
      { label: "My Reports", icon: "▤" },
      { label: "Possible Matches", icon: "⇄" },
      { label: "Browse Found Items", icon: "⌕" },
    ],
  },
  {
    title: "CLAIMS",
    items: [
      { label: "My Claims", icon: "✓" },
      { label: "Admin Panel", icon: "▦" },
    ],
  },
];

function Sidebar({ page, setPage, user, logout }) {
  const initials = (user?.name || "Student")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-mark">
        <FindItLogo size={38} />
        </div>
        

        <div className="brand-copy">
          <h2>Campus</h2>
          <p className="subtitle">LOST &amp; FOUND</p>
        </div>
      </div>

      <div className="sidebar-caption">
        STUDENT WORKSPACE
      </div>

      <nav className="sidebar-navigation" aria-label="Main navigation">
        {menuGroups.map((group) => (
          <div className="sidebar-group" key={group.title}>
            <p className="sidebar-group-title">{group.title}</p>

            <div className="sidebar-group-items">
              {group.items.map((item) => {
                const isActive = page === item.label;

                return (
                  <button
                    key={item.label}
                    type="button"
                    className={`sidebar-link${isActive ? " active" : ""}`}
                    onClick={() => setPage(item.label)}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <span className="sidebar-link-icon" aria-hidden="true">
                      {item.icon}
                    </span>

                    <span className="sidebar-link-label">
                      {item.label}
                    </span>

                    {isActive && (
                      <span className="sidebar-active-dot" aria-hidden="true" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="sidebar-user">
          <div className="sidebar-avatar" aria-hidden="true">
            {initials || "S"}
          </div>

          <div className="sidebar-user-details">
            <p className="sidebar-user-name">
              {user?.name || "Student Account"}
            </p>
            <p className="sidebar-user-role">Student account</p>
          </div>
        </div>

        <button
          type="button"
          className="sidebar-logout"
          onClick={logout}
        >
          <span aria-hidden="true">↪</span>
          <span>Log Out</span>
        </button>

        <p className="sidebar-footer-note">
          Campus Lost &amp; Found
        </p>
      </div>
    </aside>
  );
}

export default Sidebar;
