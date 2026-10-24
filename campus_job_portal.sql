
CREATE DATABASE IF NOT EXISTS campus_job_portal;

USE campus_job_portal;



CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('Student', 'Employer', 'Admin') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE companies (
    company_id INT AUTO_INCREMENT PRIMARY KEY,
    company_name VARCHAR(150) NOT NULL,
    address VARCHAR(255) NOT NULL,
    contact_email VARCHAR(100),
    contact_number VARCHAR(20)
);


CREATE TABLE student_profiles (
    student_profile_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    student_number VARCHAR(30) UNIQUE,
    course VARCHAR(100) NOT NULL,
    year_level TINYINT UNSIGNED NOT NULL,
    contact_number VARCHAR(20),

    FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);


CREATE TABLE employer_profiles (
    employer_profile_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    company_id INT NOT NULL,
    position VARCHAR(100) NOT NULL,
    contact_number VARCHAR(20),

    FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    FOREIGN KEY (company_id)
        REFERENCES companies(company_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

-- ==========================================
-- TABLE 5: JOB POSTINGS
-- ==========================================

CREATE TABLE job_postings (
    posting_id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    employer_profile_id INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT NOT NULL,
    deadline DATE NOT NULL,
    status ENUM('Open', 'Closed') NOT NULL DEFAULT 'Open',

    FOREIGN KEY (company_id)
        REFERENCES companies(company_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    FOREIGN KEY (employer_profile_id)
        REFERENCES employer_profiles(employer_profile_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);



CREATE TABLE applications (
    application_id INT AUTO_INCREMENT PRIMARY KEY,
    student_user_id INT NOT NULL,
    posting_id INT NOT NULL,
    application_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM(
        'Pending',
        'Shortlisted',
        'Rejected',
        'Accepted'
    ) NOT NULL DEFAULT 'Pending',

    FOREIGN KEY (student_user_id)
        REFERENCES users(user_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    FOREIGN KEY (posting_id)
        REFERENCES job_postings(posting_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    UNIQUE (student_user_id, posting_id)
);


CREATE TABLE documents (
    document_id INT AUTO_INCREMENT PRIMARY KEY,
    application_id INT NOT NULL,
    document_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (application_id)
        REFERENCES applications(application_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);
