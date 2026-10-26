import { useState, useEffect } from "react";
import "./App.css";

const API_BASE = "http://localhost:5000";

const readStoredUser = () => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const storedUser = window.localStorage.getItem("internlink-user");
    return storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    console.error("Unable to read stored user:", error);
    return null;
  }
};

function JobsPage({ token, onOpenApplication }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const loadJobs = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/jobs`);

        if (!response.ok) {
          throw new Error("Failed to load jobs.");
        }

        const data = await response.json();
        setJobs(data);
      } catch (err) {
        console.error("Jobs loading error:", err);
        setError("Unable to load jobs. Please check your backend.");
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
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
      typeof deadline === "string" ? deadline.slice(0, 10) : deadline;

    const date = new Date(`${dateString}T00:00:00`);

    return Number.isNaN(date.getTime())
      ? "Not specified"
      : date.toLocaleDateString();
  };

  return (
    <section className="jobs-page">
      <div className="jobs-heading">
        <p className="eyebrow">YOUR NEXT OPPORTUNITY</p>
        <h1>Jobs &amp; Internships</h1>
        <p>
          Discover opportunities and take the next step in your career with
          InternLink.
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

      {loading && <p className="jobs-message">Loading opportunities...</p>}

      {error && <p className="jobs-message jobs-error">{error}</p>}

      {!loading && !error && jobs.length === 0 && (
        <div className="jobs-empty">
          <h2>No jobs available yet</h2>
          <p>
            New opportunities will appear here when employers publish open job
            postings.
          </p>
        </div>
      )}

      {!loading && !error && jobs.length > 0 && (
        <>
          <p className="jobs-count">
            {filteredJobs.length} opportunity
            {filteredJobs.length === 1 ? "" : "ies"} found
          </p>

          {filteredJobs.length === 0 ? (
            <p className="jobs-message">No opportunities match your search.</p>
          ) : (
            <div className="jobs-grid">
              {filteredJobs.map((job) => (
                <article className="job-card" key={job.posting_id}>
                  <div className="job-card-top">
                    <span className="job-status">{job.status}</span>
                  </div>

                  <h2>{job.title}</h2>

                  <h3 className="job-company">{job.company_name}</h3>

                  <p className="job-description">{job.description}</p>

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
                    onClick={() => onOpenApplication(job)}
                  >
                    {token ? "Apply Now" : "Login to Apply"}
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

function MyApplicationsPage({ token }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    const loadApplications = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/applications/my`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Unable to load applications.");
        }

        const data = await response.json();
        setApplications(data);
      } catch (err) {
        console.error("My applications error:", err);
        setError("Unable to load your applications right now.");
      } finally {
        setLoading(false);
      }
    };

    loadApplications();
  }, [token]);

  const formatDate = (value) => {
    if (!value) return "Not available";

    return new Date(value).toLocaleDateString();
  };

  return (
    <section className="page active applications-page">
      <div className="jobs-heading">
        <p className="eyebrow">YOUR APPLICATIONS</p>
        <h1>My Applications</h1>
      </div>

      {loading && <p className="jobs-message">Loading your applications...</p>}

      {error && <p className="jobs-message jobs-error">{error}</p>}

      {!loading && !error && applications.length === 0 && (
        <div className="jobs-empty">
          <h2>No applications yet</h2>
          <p>You have not applied for any jobs or internships yet.</p>
        </div>
      )}

      {!loading && !error && applications.length > 0 && (
        <div className="applications-list">
          {applications.map((application) => (
            <article className="application-card" key={application.application_id}>
              <div className="application-topline">
                <div>
                  <h3>{application.title}</h3>
                  <p>{application.company_name}</p>
                </div>
                <span
                  className={`status ${
                    application.status === "Pending"
                      ? "status-pending"
                      : application.status === "Accepted"
                        ? "status-accepted"
                        : application.status === "Shortlisted"
                          ? "status-shortlisted"
                          : application.status === "Rejected"
                            ? "status-rejected"
                            : ""
                  }`}
                >
                  {application.status}
                </span>
              </div>

              <p>
                Applied on{" "}
                <strong>{formatDate(application.application_date)}</strong>
              </p>
              <p>
                Deadline: <strong>{formatDate(application.deadline)}</strong>
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function App() {
  const [currentPage, setCurrentPage] = useState("Home");
  const [token, setToken] = useState(() => {
    if (typeof window === "undefined") return "";
    return window.localStorage.getItem("internlink-token") || "";
  });
  const [user, setUser] = useState(readStoredUser);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applicationForm, setApplicationForm] = useState({
    cover_letter: "",
    resume_text: "",
  });
  const [submittingApplication, setSubmittingApplication] = useState(false);

  useEffect(() => {
    if (token) {
      window.localStorage.setItem("internlink-token", token);
    } else {
      window.localStorage.removeItem("internlink-token");
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      setUser(null);
      window.localStorage.removeItem("internlink-user");
      return;
    }

    const loadCurrentUser = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Session invalid.");
        }

        const result = await response.json();
        const nextUser = result.user;
        setUser(nextUser);
        window.localStorage.setItem("internlink-user", JSON.stringify(nextUser));
      } catch (error) {
        console.error("Auth profile fetch error:", error);
        setToken("");
        setUser(null);
      }
    };

    loadCurrentUser();
  }, [token]);

  const pages = ["Home", "Jobs & Internships"];

  if (user) {
    pages.push("My Applications");
  }

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
      role: formData.get("role"),
    };

    try {
      const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(accountData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Registration failed.");
      }

      alert("Account created successfully!");
      if (form && typeof form.reset === "function") {
        form.reset();
      }
      setCurrentPage("Login");
    } catch (error) {
      console.error("Registration error:", error);
      alert(error.message || "Unable to create your account.");
    }
  };

  const handleLogin = async (event) => {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const loginData = {
      email: formData.get("email"),
      password: formData.get("password"),
    };

    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Login failed.");
      }

      setToken(result.token);
      setUser(result.user);
      window.localStorage.setItem("internlink-user", JSON.stringify(result.user));
      setCurrentPage("Jobs & Internships");
      if (form && typeof form.reset === "function") {
        form.reset();
      }
    } catch (error) {
      console.error("Login error:", error);
      alert(error.message || "Unable to log in. Please try again.");
    }
  };

  const handleLogout = () => {
    setToken("");
    setUser(null);
    window.localStorage.removeItem("internlink-user");
    setCurrentPage("Home");
  };

  const openApplicationModal = (job) => {
    if (!token) {
      alert("Please log in to apply for opportunities.");
      setCurrentPage("Login");
      return;
    }

    setSelectedJob(job);
    setApplicationForm({ cover_letter: "", resume_text: "" });
  };

  const closeApplicationModal = () => {
    setSelectedJob(null);
    setApplicationForm({ cover_letter: "", resume_text: "" });
    setSubmittingApplication(false);
  };

  const handleApplicationSubmit = async (event) => {
    event.preventDefault();

    if (!selectedJob) {
      return;
    }

    try {
      setSubmittingApplication(true);

      const response = await fetch(`${API_BASE}/api/applications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          posting_id: selectedJob.posting_id,
          cover_letter: applicationForm.cover_letter,
          resume_text: applicationForm.resume_text,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Application failed.");
      }

      alert("Application submitted successfully!");
      closeApplicationModal();
      setCurrentPage("My Applications");
    } catch (error) {
      console.error("Application submission error:", error);
      alert(error.message || "Unable to submit your application.");
    } finally {
      setSubmittingApplication(false);
    }
  };

  return (
    <>
      <header className="topbar">
        <button className="brand" onClick={() => setCurrentPage("Home")}>
          InternLink
        </button>

        <nav>
          {pages.map((page) => (
            <button
              key={page}
              className={`nav-btn ${currentPage === page ? "active" : ""}`}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ))}
        </nav>

        <div id="authActions">
          {user ? (
            <>
              <span className="user-badge">Hi, {user.name?.split(" ")[0]}</span>
              <button className="btn btn-secondary" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <button className="btn btn-secondary" onClick={() => setCurrentPage("Login")}>
                Login
              </button>
              <button className="btn btn-primary" onClick={() => setCurrentPage("Create Account")}>
                Create Account
              </button>
            </>
          )}
        </div>
      </header>

      <main className="container">
        {currentPage === "Home" && (
          <section className="page active">
            <div className="hero">
              <p className="eyebrow">WELCOME TO INTERNLINK</p>

              <h1>Your Next Opportunity Awaits</h1>

              <p>
                Discover jobs and internships, build your experience, and take
                the next step in your career.
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
                  onClick={() => setCurrentPage("Jobs & Internships")}
                >
                  Find Opportunities
                </button>
              </div>
            </div>

            <h2>Why Choose InternLink?</h2>

            <div className="feature-grid">
              <div className="feature-card">
                <h3>Find Opportunities</h3>
                <p>Explore jobs and internships suited to your interests.</p>
              </div>

              <div className="feature-card">
                <h3>Apply Easily</h3>
                <p>Keep your applications organized in one place.</p>
              </div>

              <div className="feature-card">
                <h3>Start Your Career</h3>
                <p>Take your first steps toward your future career.</p>
              </div>
            </div>

            <div className="featured-heading">
              <div>
                <h2>Explore Opportunities</h2>
                <p>Find your next job or internship.</p>
              </div>

              <button
                className="btn btn-secondary"
                onClick={() => setCurrentPage("Jobs & Internships")}
              >
                View All Jobs
              </button>
            </div>
          </section>
        )}

        {currentPage === "Jobs & Internships" && (
          <JobsPage token={token} onOpenApplication={openApplicationModal} />
        )}

        {currentPage === "My Applications" && <MyApplicationsPage token={token} />}

        {currentPage === "Login" && (
          <section className="page active">
            <div className="form-card">
              <h1>Welcome Back!</h1>

              <p>Log in to your InternLink account.</p>

              <form onSubmit={handleLogin}>
                <label htmlFor="loginEmail">Email Address</label>

                <input
                  id="loginEmail"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  autoComplete="email"
                  required
                />

                <label htmlFor="loginPassword">Password</label>

                <input
                  id="loginPassword"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />

                <button className="btn btn-primary" type="submit">
                  Login
                </button>
              </form>

              <p>
                Don&apos;t have an account?{" "}
                <button className="nav-btn" onClick={() => setCurrentPage("Create Account")}>
                  Create Account
                </button>
              </p>
            </div>
          </section>
        )}

        {currentPage === "Create Account" && (
          <section className="page active">
            <div className="form-card">
              <h1>Create Your Account</h1>

              <p>Join InternLink and discover opportunities.</p>

              <form onSubmit={handleRegister}>
                <div className="form-row">
                  <div>
                    <label htmlFor="registerFirstName">First Name</label>
                    <input
                      id="registerFirstName"
                      name="first_name"
                      type="text"
                      placeholder="Enter your first name"
                      autoComplete="given-name"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="registerMiddleInitial">Middle Initial (Optional)</label>
                    <input
                      id="registerMiddleInitial"
                      name="middle_initial"
                      type="text"
                      placeholder="Enter your middle initial"
                      maxLength={1}
                    />
                  </div>
                </div>

                <label htmlFor="registerLastName">Last Name</label>
                <input
                  id="registerLastName"
                  name="last_name"
                  type="text"
                  placeholder="Enter your last name"
                  autoComplete="family-name"
                  required
                />

                <label htmlFor="registerEmail">Email Address</label>
                <input
                  id="registerEmail"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  autoComplete="email"
                  required
                />

                <label htmlFor="registerPassword">Password</label>
                <input
                  id="registerPassword"
                  name="password"
                  type="password"
                  placeholder="Create a password"
                  autoComplete="new-password"
                  minLength={8}
                  required
                />

                <label htmlFor="registerRole">Account Type</label>
                <select id="registerRole" name="role" required defaultValue="">
                  <option value="" disabled>
                    Select account type
                  </option>
                  <option value="Student">Student</option>
                  <option value="Employer">Employer</option>
                </select>

                <button className="btn btn-primary" type="submit">
                  Create Account
                </button>
              </form>

              <p>
                Already have an account?{" "}
                <button className="nav-btn" onClick={() => setCurrentPage("Login")}>
                  Login
                </button>
              </p>
            </div>
          </section>
        )}
      </main>

      {selectedJob && (
        <div className="modal-backdrop" onClick={closeApplicationModal}>
          <div className="modal" onClick={(event) => event.stopPropagation()}>
            <h2>Apply to {selectedJob.title}</h2>
            <p>
              <strong>{selectedJob.company_name}</strong>
            </p>

            <form onSubmit={handleApplicationSubmit}>
              <label htmlFor="coverLetter">Cover Letter</label>
              <textarea
                id="coverLetter"
                rows="5"
                value={applicationForm.cover_letter}
                onChange={(event) =>
                  setApplicationForm((current) => ({
                    ...current,
                    cover_letter: event.target.value,
                  }))
                }
                placeholder="Briefly describe why you're a strong candidate for this opportunity."
              />

              <label htmlFor="resumeText">Resume Summary</label>
              <textarea
                id="resumeText"
                rows="5"
                value={applicationForm.resume_text}
                onChange={(event) =>
                  setApplicationForm((current) => ({
                    ...current,
                    resume_text: event.target.value,
                  }))
                }
                placeholder="Paste a short summary of your education, experience, and skills."
              />

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={closeApplicationModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submittingApplication}>
                  {submittingApplication ? "Submitting..." : "Submit Application"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <footer>© 2026 InternLink Student Job &amp; Internship Portal</footer>
    </>
  );
}

export default App;
