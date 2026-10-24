
import { useState, useEffect } from "react";
import "./App.css";

// ========================================
// JOBS & INTERNSHIPS PAGE
// ========================================
function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/api/jobs")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load jobs.");
        }

        return response.json();
      })
      .then((data) => {
        setJobs(data);
      })
      .catch((err) => {
        console.error("Jobs loading error:", err);
        setError("Unable to load jobs. Please check your backend.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const filteredJobs = jobs.filter((job) => {
    const search = searchTerm.toLowerCase();

    return (
      job.title?.toLowerCase().includes(search) ||
      job.company_name?.toLowerCase().includes(search) ||
      job.description?.toLowerCase().includes(search)
    );
  });

  const formatDeadline = (deadline) => {
    if (!deadline) return "Not specified";

    const dateString =
      typeof deadline === "string"
        ? deadline.slice(0, 10)
        : deadline;

    const date = new Date(`${dateString}T00:00:00`);

    return Number.isNaN(date.getTime())
      ? "Not specified"
      : date.toLocaleDateString();
  };

  return (
    <section className="jobs-page">
      <div className="jobs-heading">
        <p className="eyebrow">YOUR NEXT OPPORTUNITY</p>
        <h1>Jobs & Internships</h1>
        <p>
          Discover opportunities and take the next step
          in your career with InternLink.
        </p>
      </div>

      <div className="jobs-search">
        <input
          type="text"
          placeholder="Search by job title, company, or description..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
      </div>

      {loading && (
        <p className="jobs-message">Loading opportunities...</p>
      )}

      {error && (
        <p className="jobs-message jobs-error">{error}</p>
      )}

      {!loading && !error && jobs.length === 0 && (
        <div className="jobs-empty">
          <h2>No jobs available yet</h2>
          <p>
            New opportunities will appear here when employers
            publish open job postings.
          </p>
        </div>
      )}

      {!loading && !error && jobs.length > 0 && (
        <>
          <p className="jobs-count">
            {filteredJobs.length} opportunit
            {filteredJobs.length === 1 ? "y" : "ies"} found
          </p>

          {filteredJobs.length === 0 ? (
            <p className="jobs-message">
              No opportunities match your search.
            </p>
          ) : (
            <div className="jobs-grid">
              {filteredJobs.map((job) => (
                <article
                  className="job-card"
                  key={job.posting_id}
                >
                  <div className="job-card-top">
                    <span className="job-status">
                      {job.status}
                    </span>
                  </div>

                  <h2>{job.title}</h2>

                  <h3 className="job-company">
                    {job.company_name}
                  </h3>

                  <p className="job-description">
                    {job.description}
                  </p>

                  <div className="job-requirements">
                    <strong>Requirements</strong>
                    <p>{job.requirements}</p>
                  </div>

                  <div className="job-deadline">
                    <strong>Application deadline</strong>
                    <p>{formatDeadline(job.deadline)}</p>
                  </div>

                  <button
                    className="btn btn-primary job-apply-btn"
                    onClick={() =>
                      alert(
                        "Job application functionality will be added next."
                      )
                    }
                  >
                    View Application Options
                  </button>
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}

// ========================================
// MAIN APPLICATION
// ========================================
function App() {
  const [currentPage, setCurrentPage] = useState("Home");

  const pages = [
    "Home",
    "Jobs & Internships"
  ];

  // ========================================
  // REGISTER ACCOUNT
  // ========================================
  const handleRegister = async (event) => {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);

    const accountData = {
      first_name: formData.get("first_name"),
      middle_initial: formData.get("middle_initial"),
      last_name: formData.get("last_name"),
      email: formData.get("email"),
      password: formData.get("password"),
      role: formData.get("role")
    };

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(accountData)
        }
      );

      const result = await response.json();

      if (!response.ok) {
        alert(result.message || "Registration failed.");
        return;
      }

      alert("Account created successfully!");

      form.reset();
      setCurrentPage("Login");
    } catch (error) {
      console.error("Registration error:", error);

      alert(
        "Unable to connect to the server. Please check that your backend is running."
      );
    }
  };

  // ========================================
  // PAGE LAYOUT
  // ========================================
  return (
    <>
      <header className="topbar">
        <button
          className="brand"
          onClick={() => setCurrentPage("Home")}
        >
          InternLink
        </button>

        <nav>
          {pages.map((page) => (
            <button
              key={page}
              className={`nav-btn ${
                currentPage === page ? "active" : ""
              }`}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ))}
        </nav>

        <div id="authActions">
          <button
            className="btn btn-secondary"
            onClick={() => setCurrentPage("Login")}
          >
            Login
          </button>

          <button
            className="btn btn-primary"
            onClick={() => setCurrentPage("Create Account")}
          >
            Create Account
          </button>
        </div>
      </header>

      <main className="container">
        {/* HOME PAGE */}
        {currentPage === "Home" && (
          <section className="page active">
            <div className="hero">
              <p className="eyebrow">WELCOME TO INTERNLINK</p>

              <h1>Your Next Opportunity Awaits</h1>

              <p>
                Discover jobs and internships, build your
                experience, and take the next step in your career.
              </p>

              <div className="searchbar">
                <input
                  type="text"
                  placeholder="Search jobs or internships..."
                  aria-label="Search jobs and internships"
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      setCurrentPage("Jobs & Internships");
                    }
                  }}
                />

                <button
                  className="btn btn-primary"
                  onClick={() =>
                    setCurrentPage("Jobs & Internships")
                  }
                >
                  Find Opportunities
                </button>
              </div>
            </div>

            <h2>Why Choose InternLink?</h2>

            <div className="feature-grid">
              <div className="feature-card">
                <h3>Find Opportunities</h3>
                <p>
                  Explore jobs and internships suited to your interests.
                </p>
              </div>

              <div className="feature-card">
                <h3>Apply Easily</h3>
                <p>
                  Keep your applications organized in one place.
                </p>
              </div>

              <div className="feature-card">
                <h3>Start Your Career</h3>
                <p>
                  Take your first steps toward your future career.
                </p>
              </div>
            </div>

            <div className="featured-heading">
              <div>
                <h2>Explore Opportunities</h2>
                <p>
                  Find your next job or internship.
                </p>
              </div>

              <button
                className="btn btn-secondary"
                onClick={() =>
                  setCurrentPage("Jobs & Internships")
                }
              >
                View All Jobs
              </button>
            </div>
          </section>
        )}

        {/* JOBS PAGE */}
        {currentPage === "Jobs & Internships" && (
          <JobsPage />
        )}

        {/* LOGIN PAGE */}
        {currentPage === "Login" && (
          <section className="page active">
            <div className="form-card">
              <h1>Welcome Back!</h1>

              <p>Log in to your InternLink account.</p>

              <form
                onSubmit={(event) => {
                  event.preventDefault();

                  alert(
                    "Login functionality has not been connected to the backend yet."
                  );
                }}
              >
                <label htmlFor="loginEmail">
                  Email Address
                </label>

                <input
                  id="loginEmail"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  autoComplete="email"
                  required
                />

                <label htmlFor="loginPassword">
                  Password
                </label>

                <input
                  id="loginPassword"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />

                <button
                  className="btn btn-primary"
                  type="submit"
                >
                  Login
                </button>
              </form>

              <p>
                Don't have an account?{" "}
                <button
                  className="nav-btn"
                  onClick={() =>
                    setCurrentPage("Create Account")
                  }
                >
                  Create Account
                </button>
              </p>
            </div>
          </section>
        )}

        {/* CREATE ACCOUNT PAGE */}
        {currentPage === "Create Account" && (
          <section className="page active">
            <div className="form-card">
              <h1>Create Your Account</h1>

              <p>
                Join InternLink and discover opportunities.
              </p>

              <form onSubmit={handleRegister}>
                <label htmlFor="registerFirstName">
                  First Name
                </label>

                <input
                  id="registerFirstName"
                  name="first_name"
                  type="text"
                  placeholder="Enter your first name"
                  autoComplete="given-name"
                  required
                />

                <label htmlFor="registerMiddleInitial">
                  Middle Initial (Optional)
                </label>

                <input
                  id="registerMiddleInitial"
                  name="middle_initial"
                  type="text"
                  placeholder="Enter your middle initial"
                  maxLength={1}
                />

                <label htmlFor="registerLastName">
                  Last Name
                </label>

                <input
                  id="registerLastName"
                  name="last_name"
                  type="text"
                  placeholder="Enter your last name"
                  autoComplete="family-name"
                  required
                />

                <label htmlFor="registerEmail">
                  Email Address
                </label>

                <input
                  id="registerEmail"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  autoComplete="email"
                  required
                />

                <label htmlFor="registerPassword">
                  Password
                </label>

                <input
                  id="registerPassword"
                  name="password"
                  type="password"
                  placeholder="Create a password"
                  autoComplete="new-password"
                  minLength={8}
                  required
                />

                <label htmlFor="registerRole">
                  Account Type
                </label>

                <select
                  id="registerRole"
                  name="role"
                  required
                  defaultValue=""
                >
                  <option value="" disabled>
                    Select account type
                  </option>

                  <option value="Student">
                    Student
                  </option>

                  <option value="Employer">
                    Employer
                  </option>
                </select>

                <button
                  className="btn btn-primary"
                  type="submit"
                >
                  Create Account
                </button>
              </form>

              <p>
                Already have an account?{" "}
                <button
                  className="nav-btn"
                  onClick={() => setCurrentPage("Login")}
                >
                  Login
                </button>
              </p>
            </div>
          </section>
        )}
      </main>

      <footer>
        © 2026 InternLink Student Job &amp; Internship Portal
      </footer>
    </>
  );
}

export default App;
