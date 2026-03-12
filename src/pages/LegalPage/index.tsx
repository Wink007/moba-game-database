import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSEO } from '../../hooks/useSEO';
import styles from './styles.module.scss';

type Tab = 'privacy' | 'terms' | 'cookies';

export const LegalPage = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<Tab>('privacy');

  useSEO({
    title: 'Legal Information',
    description: 'Privacy policy, terms of service and cookie policy for MOBA Wiki.',
  });

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'terms' || tab === 'privacy' || tab === 'cookies') {
      setActiveTab(tab);
    }
  }, [searchParams]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Legal Information</h1>
        <p className={styles.subtitle}>
          Understanding your rights and our policies
        </p>
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'privacy' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('privacy')}
        >
          Privacy Policy
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'terms' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('terms')}
        >
          Terms of Service
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'cookies' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('cookies')}
        >
          Cookie Policy
        </button>
      </div>

      <div className={styles.content}>
        {activeTab === 'privacy' && <PrivacyPolicy />}
        {activeTab === 'terms' && <TermsOfService />}
        {activeTab === 'cookies' && <CookiePolicy />}
      </div>
    </div>
  );
};

const PrivacyPolicy = () => (
  <div className={styles.document}>
    <h2>Privacy Policy</h2>
    <p className={styles.lastUpdated}>Last Updated: March 2, 2026</p>

    <section>
      <h3>Introduction</h3>
      <p>
        This Privacy Policy describes how Mobile Legends Wiki (Unofficial) (&quot;we&quot;, &quot;our&quot;, or &quot;the app&quot;)
        collects, uses, and protects your information when you use our website and application.
        We are committed to compliance with the General Data Protection Regulation (GDPR) and other applicable privacy laws.
      </p>
    </section>

    <section>
      <h3>Legal Basis for Processing (GDPR)</h3>
      <p>We process your personal data on the following legal bases:</p>
      <ul>
        <li><strong>Consent</strong> — when you choose to sign in with Google or accept cookies</li>
        <li><strong>Legitimate interests</strong> — for basic server security and fraud prevention</li>
        <li><strong>Contract performance</strong> — to provide account features (saves, favorites)</li>
      </ul>
    </section>

    <section>
      <h3>Information We Collect</h3>

      <h4>Account Information (Optional)</h4>
      <p>If you choose to sign in with Google, we receive and store:</p>
      <ul>
        <li><strong>Display name</strong> — to personalize your experience</li>
        <li><strong>Email address</strong> — as your unique account identifier</li>
        <li><strong>Profile picture URL</strong> — displayed in the app interface</li>
      </ul>
      <p>Sign-in is entirely optional. You can use the app without creating an account.</p>

      <h4>User-Generated Content</h4>
      <ul>
        <li>Hero builds you create and publish</li>
        <li>Your favorites list</li>
      </ul>

      <h4>Automatically Collected Information</h4>
      <ul>
        <li>Basic server logs (IP address, request timestamps) — collected by our hosting provider Railway</li>
        <li>Browser type and device information for improving user experience</li>
      </ul>

      <h4>Advertising Data</h4>
      <p>
        This site uses <strong>Google AdSense</strong> to display advertisements. Google may use cookies
        and similar technologies to show personalized ads based on your browsing activity.
        You can manage advertising preferences at{' '}
        <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer">adssettings.google.com</a>.
      </p>
    </section>

    <section>
      <h3>How We Use Your Information</h3>
      <ul>
        <li>To authenticate your identity and maintain your session</li>
        <li>To save and display your hero builds and favorites</li>
        <li>To personalize your experience (display name, avatar)</li>
        <li>To display relevant advertisements via Google AdSense</li>
        <li>We do <strong>not</strong> sell your personal data to third parties</li>
        <li>We do <strong>not</strong> use your personal data for our own marketing</li>
      </ul>
    </section>

    <section>
      <h3>Your Rights Under GDPR</h3>
      <p>If you are located in the European Economic Area (EEA), you have the following rights:</p>
      <ul>
        <li><strong>Right of access</strong> — request a copy of the personal data we hold about you</li>
        <li><strong>Right to rectification</strong> — request correction of inaccurate personal data</li>
        <li><strong>Right to erasure</strong> — request deletion of your account and all associated data</li>
        <li><strong>Right to data portability</strong> — receive your data in a structured, machine-readable format</li>
        <li><strong>Right to object</strong> — object to processing based on legitimate interests</li>
        <li><strong>Right to restriction</strong> — request restricted processing of your data</li>
        <li><strong>Right to withdraw consent</strong> — withdraw consent at any time without affecting prior processing</li>
      </ul>
      <p>
        To exercise any of these rights, contact us at{' '}
        <a href="mailto:privacy@mobawiki.com">privacy@mobawiki.com</a> or via our{' '}
        <a href="https://github.com/Wink007/moba-game-database" target="_blank" rel="noopener noreferrer">GitHub repository</a>.
        We will respond within 30 days.
      </p>
    </section>

    <section>
      <h3>Data Storage &amp; Retention</h3>
      <ul>
        <li>Account data is stored in a PostgreSQL database hosted on Railway (EU/US region)</li>
        <li>Authentication tokens (JWT) are stored locally in your browser and expire automatically</li>
        <li>We retain account data until you request deletion</li>
        <li>Server logs are retained for up to 30 days</li>
        <li>All communications use HTTPS encryption</li>
      </ul>
    </section>

    <section>
      <h3>Third-Party Services</h3>
      <p>This app uses the following third-party services that may process your data:</p>
      <ul>
        <li>
          <strong>Google Sign-In (OAuth 2.0)</strong> — authentication.{' '}
          <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google Privacy Policy</a>
        </li>
        <li>
          <strong>Google AdSense</strong> — advertising.{' '}
          <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer">Google Ads Policy</a>
        </li>
        <li>
          <strong>Railway</strong> — hosting provider. May collect basic server logs.
        </li>
      </ul>
    </section>

    <section>
      <h3>Cookies</h3>
      <p>
        We use cookies for authentication and advertising. For full details, see our{' '}
        <button
          style={{ background: 'none', border: 'none', color: '#6b8cff', cursor: 'pointer', padding: 0, textDecoration: 'underline', font: 'inherit' }}
          onClick={() => document.querySelectorAll('button').forEach(b => { if (b.textContent === 'Cookie Policy') b.click(); })}
        >
          Cookie Policy
        </button>.
      </p>
    </section>

    <section>
      <h3>Data Security</h3>
      <ul>
        <li>All API communications use HTTPS encryption</li>
        <li>Passwords are never stored — authentication is handled entirely by Google</li>
        <li>JWT tokens are used for session management with expiration</li>
        <li>Database access is restricted and secured</li>
      </ul>
    </section>

    <section>
      <h3>Children's Privacy</h3>
      <p>This service is not directed to children under 13. We do not knowingly collect personal information from children under 13. If you believe a child has provided us data, contact us to have it removed.</p>
    </section>

    <section>
      <h3>International Transfers</h3>
      <p>
        Your data may be transferred to and processed in countries outside the EEA (including the United States)
        by our third-party providers (Google, Railway). These transfers are protected by standard contractual clauses
        or adequacy decisions.
      </p>
    </section>

    <section>
      <h3>Disclaimer</h3>
      <p>This app is an unofficial, fan-made project not affiliated with, endorsed by, or sponsored by Moonton Technology Co., Ltd.</p>
      <p>All Mobile Legends game content, images, character names, and trademarks are property of Moonton Technology Co., Ltd.</p>
    </section>

    <section>
      <h3>Changes to This Policy</h3>
      <p>We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated date. Continued use after changes constitutes acceptance.</p>
    </section>

    <section>
      <h3>Contact &amp; Data Controller</h3>
      <p>For privacy questions, data requests, or complaints:</p>
      <ul>
        <li>Email: <a href="mailto:privacy@mobawiki.com">privacy@mobawiki.com</a></li>
        <li>GitHub: <a href="https://github.com/Wink007/moba-game-database" target="_blank" rel="noopener noreferrer">github.com/Wink007/moba-game-database</a></li>
      </ul>
      <p>You also have the right to lodge a complaint with your local data protection authority.</p>
    </section>
  </div>
);

const TermsOfService = () => (
  <div className={styles.document}>
    <h2>Terms of Service</h2>
    <p className={styles.lastUpdated}>Last Updated: March 2, 2026</p>

    <section>
      <h3>1. Acceptance of Terms</h3>
      <p>
        By accessing and using Mobile Legends Wiki (Unofficial), you accept and agree to be bound 
        by these Terms of Service.
      </p>
    </section>

    <section>
      <h3>2. Description of Service</h3>
      <p>Mobile Legends Wiki (Unofficial) is a fan-made, community-driven information resource providing:</p>
      <ul>
        <li>Hero statistics and information</li>
        <li>Item databases and builds</li>
        <li>Game guides and rankings</li>
        <li>Community-contributed content</li>
      </ul>
    </section>

    <section>
      <h3>3. Disclaimer</h3>
      
      <h4>Unofficial Service</h4>
      <ul>
        <li>This is an <strong>UNOFFICIAL</strong> fan-made application</li>
        <li><strong>NOT affiliated with, endorsed by, or sponsored by Moonton Technology Co., Ltd.</strong></li>
        <li>We are not responsible for game-related issues or decisions</li>
        <li>Information is provided "as is" without warranties</li>
      </ul>

      <h4>Intellectual Property</h4>
      <ul>
        <li>All Mobile Legends game content, images, characters, and trademarks are property of <strong>Moonton Technology Co., Ltd.</strong></li>
        <li>Game assets are used under Fair Use for informational and educational purposes</li>
        <li>We do not claim ownership of any game content</li>
      </ul>

      <h4>Data Accuracy</h4>
      <ul>
        <li>Game data is sourced from public APIs and community contributions</li>
        <li>We strive for accuracy but cannot guarantee 100% correctness</li>
        <li>Game balance changes may cause temporary inaccuracies</li>
        <li>Always verify critical information with official sources</li>
      </ul>
    </section>

    <section>
      <h3>4. User Accounts</h3>
      <p>You may optionally sign in using your Google account. By signing in, you agree that:</p>
      <ul>
        <li>You are responsible for all activity under your account</li>
        <li>We store your display name, email, and profile picture from Google</li>
        <li>Your builds and favorites are associated with your account</li>
        <li>You may request account deletion at any time via GitHub</li>
        <li>We may suspend or delete accounts that violate these terms</li>
      </ul>
    </section>

    <section>
      <h3>5. User Conduct</h3>
      <p>Users agree to:</p>
      <ul>
        <li>Use the service for informational purposes only</li>
        <li>Not attempt to hack, disrupt, or damage the service</li>
        <li>Not use automated tools to scrape data excessively</li>
        <li>Not create builds with offensive, hateful, or inappropriate content</li>
        <li>Respect intellectual property rights</li>
      </ul>
    </section>

    <section>
      <h3>6. Limitation of Liability</h3>
      <ul>
        <li>We provide this service free of charge</li>
        <li>We are not liable for any damages arising from use of this app</li>
        <li>No warranty of service availability or uptime</li>
        <li>Not responsible for third-party content or links</li>
      </ul>
    </section>

    <section>
      <h3>7. Content Ownership</h3>
      
      <h4>Game Content</h4>
      <ul>
        <li>All Mobile Legends content © Moonton Technology Co., Ltd.</li>
      </ul>

      <h4>User Contributions</h4>
      <ul>
        <li>Community-contributed guides and builds remain property of contributors</li>
        <li>By contributing, you grant us license to display the content</li>
      </ul>
    </section>

    <section>
      <h3>8. Service Modifications</h3>
      <p>We reserve the right to:</p>
      <ul>
        <li>Modify or discontinue the service at any time</li>
        <li>Update these terms without prior notice</li>
        <li>Remove content that violates intellectual property rights</li>
      </ul>
    </section>

    <section>
      <h3>9. Third-Party Links</h3>
      <ul>
        <li>May contain links to third-party websites</li>
        <li>We are not responsible for external content</li>
        <li>Use third-party services at your own risk</li>
      </ul>
    </section>

    <section>
      <h3>10. Age Restrictions</h3>
      <ul>
        <li>Service intended for users 13 years and older</li>
        <li>Younger users should obtain parental consent</li>
      </ul>
    </section>

    <section>
      <h3>11. Governing Law</h3>
      <p>These terms are governed by international Fair Use principles and intellectual property law.</p>
    </section>

    <section>
      <h3>12. Contact</h3>
      <p>For questions or concerns about these Terms:</p>
      <ul>
        <li>Email: <a href="mailto:privacy@mobawiki.com">privacy@mobawiki.com</a></li>
        <li>GitHub: <a href="https://github.com/Wink007/moba-game-database" target="_blank" rel="noopener noreferrer">github.com/Wink007/moba-game-database</a></li>
      </ul>
    </section>

    <section>
      <h3>13. Severability</h3>
      <p>If any provision of these terms is found unenforceable, remaining provisions remain in effect.</p>
    </section>

    <div className={styles.acknowledgment}>
      <p><strong>By using Mobile Legends Wiki (Unofficial), you acknowledge that:</strong></p>
      <ul>
        <li>This is an unofficial fan project</li>
        <li>You understand the disclaimers above</li>
        <li>You accept these terms and conditions</li>
      </ul>
    </div>
  </div>
);

const CookiePolicy = () => (
  <div className={styles.document}>
    <h2>Cookie Policy</h2>
    <p className={styles.lastUpdated}>Last Updated: March 2, 2026</p>

    <section>
      <h3>What Are Cookies?</h3>
      <p>
        Cookies are small text files placed on your device when you visit a website. They are widely used
        to make websites work, improve efficiency, and provide information to site owners.
      </p>
    </section>

    <section>
      <h3>Cookies We Use</h3>

      <h4>1. Essential Cookies</h4>
      <p>Required for the website to function. Cannot be disabled.</p>
      <ul>
        <li>
          <strong>auth_token</strong> (localStorage) — stores your JWT authentication token to keep you logged in.
          Expires when you log out or when the token expires.
        </li>
        <li>
          <strong>cookie_consent</strong> (localStorage) — stores your cookie preference (accepted/declined).
          Expires never (permanent).
        </li>
      </ul>

      <h4>2. Advertising Cookies</h4>
      <p>Used to display personalized advertisements. Only set if you accept cookies.</p>
      <ul>
        <li>
          <strong>Google AdSense</strong> — Google uses cookies (e.g., <code>__gads</code>, <code>__gpi</code>) to
          serve and measure ads. Google may use your browsing data to show relevant ads.
        </li>
        <li>
          Provider: Google LLC, 1600 Amphitheatre Parkway, Mountain View, CA 94043, USA
        </li>
        <li>
          More info: <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer">Google Advertising Policies</a>
        </li>
      </ul>

      <h4>3. Analytics Cookies</h4>
      <p>Currently not in use. We do not run any analytics tracking tools at this time.</p>
    </section>

    <section>
      <h3>Your Choices</h3>
      <ul>
        <li>
          <strong>Cookie banner</strong> — when you first visit, you can Accept or Decline non-essential cookies.
          If you decline, advertising cookies will not be loaded.
        </li>
        <li>
          <strong>Change your preference</strong> — clear your browser's localStorage to reset your choice
          and see the banner again.
        </li>
        <li>
          <strong>Browser settings</strong> — you can block or delete cookies via your browser settings.
          Note: blocking essential cookies may prevent login from working.
        </li>
        <li>
          <strong>Google Ad settings</strong> — manage personalized ad preferences at{' '}
          <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer">adssettings.google.com</a>.
        </li>
        <li>
          <strong>Opt out of interest-based ads</strong> — visit{' '}
          <a href="https://optout.networkadvertising.org" target="_blank" rel="noopener noreferrer">networkadvertising.org</a>{' '}
          or{' '}
          <a href="https://www.youronlinechoices.eu" target="_blank" rel="noopener noreferrer">youronlinechoices.eu</a> (EU).
        </li>
      </ul>
    </section>

    <section>
      <h3>Legal Basis (GDPR)</h3>
      <ul>
        <li><strong>Essential cookies</strong> — legitimate interest (necessary for service operation)</li>
        <li><strong>Advertising cookies</strong> — consent (only loaded after you click "Accept")</li>
      </ul>
    </section>

    <section>
      <h3>Contact</h3>
      <p>For questions about our cookie usage:</p>
      <ul>
        <li>Email: <a href="mailto:privacy@mobawiki.com">privacy@mobawiki.com</a></li>
      </ul>
    </section>
  </div>
);
