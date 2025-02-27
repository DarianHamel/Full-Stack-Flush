import React from "react";
import "../design/AboutUs.css";

const teamMembers = [
  { name: "Mateo DeSousa", role: "Full Stack Developer" },
  { name: "Kaye Mendoza", role: "Full Stack Developer" },
  { name: "Darian Hamel", role: "Full Stack Developer" },
  { name: "Prashant Nigam", role: "Full Stack Developer" },
  { name: "Scott Barrett", role: "Full Stack Developer" },
  { name: "Chineze Obi", role: "Full Stack Developer" },
];

const AboutUs = () => {
  return (
    <div className="about-container">
      <header className="about-header">
        <h1>About Full Stack Flush</h1>
      </header>

    <section className="vision-statement">
    <p>
        <strong>Full Stack Flush</strong> is more than just a gambling web application — it’s a commitment to reshaping how people gamble. Our vision is to create an engaging 
        and entertaining platform that prioritizes <strong>ethical gambling practices</strong> and promotes <strong>healthy gambling habits</strong>.
    </p>
    <p>
        We believe gambling should be fun, not harmful. That’s why <strong>Full Stack Flush</strong> 
        is designed with built-in safeguards like <strong>mandatory betting and time limits</strong>, 
        alongside <strong>regular reminders</strong> that inform users about the risks of gambling. 
        These features are not optional — they’re essential, because responsible gambling should be 
        the standard, not the exception.
    </p>
    <p>
        By combining innovative gameplay with a deep focus on user well-being, our goal is to 
        <strong> set a new industry standard</strong> — one where gambling is safe, responsible, 
        and sustainable. Together, we can redefine the gambling experience for the better.
    </p>
        </section>

        <section className="team-section">
            <h2>Meet Our Team</h2>
                <div className="team-grid">
                    {teamMembers.map((member, index) => (
                    <div key={index} className="team-card">
                        <div className="team-photo" />
                        <div className="team-name">{member.name}</div>
                        <div className="team-role">{member.role}</div>
                    </div>
                ))}
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
