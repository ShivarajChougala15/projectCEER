import './Footer.css';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaGithub, FaLinkedin } from 'react-icons/fa';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-content">
                    <div className="footer-section">
                        <h3 className="text-gradient">Project CEER</h3>
                        <p className="text-muted">
                            Exploration Lab Management System for KLE Technological University
                        </p>
                    </div>

                    <div className="footer-section">
                        <h4>Contact</h4>
                        <div className="contact-info">
                            <div className="contact-item">
                                <FaEnvelope />
                                <span>lab@kletech.ac.in</span>
                            </div>
                            <div className="contact-item">
                                <FaPhone />
                                <span>+91 1234567890</span>
                            </div>
                            <div className="contact-item">
                                <FaMapMarkerAlt />
                                <span>KLE Tech, Hubballi</span>
                            </div>
                        </div>
                    </div>

                    <div className="footer-section">
                        <h4>Quick Links</h4>
                        <ul className="footer-links">
                            <li><a href="#about">About Lab</a></li>
                            <li><a href="#projects">Projects</a></li>
                            <li><a href="#guidelines">Guidelines</a></li>
                            <li><a href="#faq">FAQ</a></li>
                        </ul>
                    </div>

                    <div className="footer-section">
                        <h4>Follow Us</h4>
                        <div className="social-links">
                            <a href="#" className="social-icon">
                                <FaGithub />
                            </a>
                            <a href="#" className="social-icon">
                                <FaLinkedin />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>&copy; 2026 Project CEER. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
