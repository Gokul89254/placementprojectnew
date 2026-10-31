CREATE TABLE IF NOT EXISTS interview_schedules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    application_id INT NOT NULL,
    round_name VARCHAR(100) NOT NULL,
    scheduled_at DATETIME NOT NULL,
    mode VARCHAR(20) NOT NULL DEFAULT 'online' CHECK (mode IN ('online', 'in_person')),
    location VARCHAR(255),
    meeting_link VARCHAR(500),
    notes TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_interview_schedules_application FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS placement_results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    application_id INT NOT NULL UNIQUE,
    result_status VARCHAR(20) NOT NULL CHECK (result_status IN ('offered', 'accepted', 'declined')),
    package_amount DECIMAL(12,2),
    offer_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_placement_results_application FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
);
