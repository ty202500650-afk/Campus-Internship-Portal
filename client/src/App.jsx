
import { useState } from 'react';
import './App.css';


function App() {
  const [currentPage, setCurrentPage] = useState('Home');

  const pages = [
    'Home',
    'Jobs & Internships',
    'My Applications',
    'Employer',
    'Admin',
  ];

  
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
    alert("Unable to connect to the server. Please try again.");
  }
};


  return (
    <>
      <header className="topbar">
        <div className="brand">CampusLink</div>

        <nav>
          {pages.map((page) => (
            <button
              key={page}
              className={`nav-btn ${currentPage === page ? 'active' : ''}`}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ))}
        </nav>

        <div id="authActions">
          <button
            className="btn btn-secondary"
            onClick={() => setCurrentPage('Login')}
          >
            Login
          </button>

          <button
            className="btn btn-primary"
            onClick={() => setCurrentPage('Create Account')}
          >
            Create Account
          </button>
        </div>
      </header>

      <main className="container">
        {currentPage === 'Home' && (
          <section className="page active">
            <div className="hero">
              <h1>Your Next Opportunity Awaits</h1>
              <p>
                Discover jobs and internships, build your experience,
                and take the next step in your career.
              </p>

              <div className="searchbar">
                <input
                  type="text"
                  placeholder="Search jobs or internships..."
                />
                <button className="btn btn-primary">
                  Search
                </button>
              </div>
            </div>

            <h2>Why Choose CampusLink?</h2>

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

            <h2>Featured Opportunities</h2>
            <div id="featuredJobs">
              <p>Job opportunities will appear here.</p>
            </div>
          </section>
        )}

        
{currentPage === 'Login' && (
  <section className="page active">
    <div className="form-card">
      <h1>Welcome Back!</h1>
      <p>Log in to your CampusLink account.</p>

      <form onSubmit={(event) => event.preventDefault()}>
        <label htmlFor="loginEmail">Email Address</label>
        <input
          id="loginEmail"
          type="email"
          placeholder="Enter your email"
          required
        />

        <label htmlFor="loginPassword">Password</label>
        <input
          id="loginPassword"
          type="password"
          placeholder="Enter your password"
          required
        />

        <button className="btn btn-primary" type="submit">
          Login
        </button>
      </form>

      <p>
        Don't have an account?{' '}
        <button
          className="nav-btn"
          onClick={() => setCurrentPage('Create Account')}
        >
          Create Account
        </button>
      </p>
    </div>
  </section>
)}

{currentPage === 'Create Account' && (
  <section className="page active">
    <div className="form-card">
      <h1>Create Your Account</h1>
      <p>Join CampusLink and discover opportunities.</p>

      <form onSubmit={(event) => event.preventDefault()}>
        

<label htmlFor="registerFirstName">First Name</label>
<input
  id="registerFirstName"
  type="text"
  placeholder="Enter your first name"
  required
/>

<label htmlFor="registerMiddleInitial">
  Middle Initial (Optional)
</label>
<input
  id="registerMiddleInitial"
  type="text"
  placeholder="Enter your middle initial (optional)"
  maxLength={1}
/>

<label htmlFor="registerLastName">Last Name</label>
<input
  id="registerLastName"
  type="text"
  placeholder="Enter your last name"
  required
/>


        <label htmlFor="registerEmail">Email Address</label>
        <input
          id="registerEmail"
          type="email"
          placeholder="Enter your email"
          required
        />

        <label htmlFor="registerPassword">Password</label>
        <input
          id="registerPassword"
          type="password"
          placeholder="Create a password"
          minLength={8}
          required
        />

        <label htmlFor="registerRole">Account Type</label>
        <select id="registerRole" required defaultValue="">
          <option value="" disabled>
            Select account type
          </option>
          <option value="student">Student</option>
          <option value="employer">Employer</option>
        </select>

        <button className="btn btn-primary" type="submit">
          Create Account
        </button>
      </form>

      <p>
        Already have an account?{' '}
        <button
          className="nav-btn"
          onClick={() => setCurrentPage('Login')}
        >
          Login
        </button>
      </p>
    </div>
  </section>
)}

{!['Home', 'Login', 'Create Account'].includes(currentPage) && (
  <section className="page active">
    <h1>{currentPage}</h1>
    <p>This section is ready for us to build next.</p>
    <button
      className="btn btn-primary"
      onClick={() => setCurrentPage('Home')}
    >
      Back to Home
    </button>
  </section>
)}
      </main>

      <footer>
        © 2026 CampusLink · Job &amp; Internship Portal for Students
      </footer>
    </>
  );
}

export default App;
