import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import styles from './styles.module.scss';

type Tab = 'privacy' | 'terms';

export const LegalPage = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<Tab>('privacy');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'terms' || tab === 'privacy') {
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
      </div>

      <div className={styles.content}>
        {activeTab === 'privacy' ? <PrivacyPolicy /> : <TermsOfService />}
      </div>
    </div>
  );
};

const PrivacyPolicy = () => (
  <div className={styles.document}>
    <h2>Privacy Policy</h2>
    <p className={styles.lastUpdated}>Last Updated: February 22, 2026</p>

    <section>
      <h3>Introduction</h3>
      <p>
        This Privacy Policy describes how Mobile Legends Wiki (Unofficial) ("we", "our", or "the app") 
        handles information when you use our application.
      </p>
    </section>

    <section>
      <h3>Information We Collect</h3>
      
      <h4>Account Information (Optional)</h4>
      <p>If you choose to sign in with Google, we receive and store the following information from your Google account:</p>
      <ul>
        <li><strong>Display name</strong> — used to personalize your experience</li>
        <li><strong>Email address</strong> — used as your unique account identifier</li>
        <li><strong>Profile picture URL</strong> — displayed in the app interface</li>
      </ul>
      <p>Sign-in is optional. You can use the app without creating an account.</p>

      <h4>User-Generated Content</h4>
      <ul>
        <li>Hero builds you create and publish</li>
        <li>Your favorites list (liked heroes)</li>
      </ul>

      <h4>Automatically Collected Information</h4>
      <ul>
        <li>We may collect anonymous usage statistics through analytics (if enabled)</li>
        <li>Browser type and device information for improving user experience</li>
        <li>Basic server logs (IP address, request timestamps) collected by our hosting provider</li>
      </ul>
    </section>

    <section>
      <h3>How We Use Your Information</h3>
      <ul>
        <li>To authenticate your identity and maintain your session</li>
        <li>To save and display your hero builds and favorites</li>
        <li>To personalize your experience (display name, avatar)</li>
        <li>We do <strong>not</strong> use your data for advertising or marketing</li>
        <li>We do <strong>not</strong> sell or share your personal data with third parties</li>
      </ul>
    </section>

    <section>
      <h3>Data Storage</h3>
      <ul>
        <li>Account data and user content are stored in a PostgreSQL database hosted on Railway</li>
        <li>Authentication tokens (JWT) are stored locally in your browser</li>
        <li>Game data (heroes, items, stats) is fetched from our public API</li>
        <li>All communications use HTTPS encryption</li>
      </ul>
    </section>

    <section>
      <h3>Third-Party Services</h3>
      <p>This app uses the following third-party services:</p>
      <ul>
        <li><strong>Google Sign-In (Google OAuth 2.0)</strong> — for authentication. Google's privacy policy: <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">policies.google.com/privacy</a></li>
        <li><strong>Railway</strong> — hosting provider, may collect basic server logs</li>
      </ul>
    </section>

    <section>
      <h3>Account Deletion & Your Rights</h3>
      <ul>
        <li>You can log out at any time, which clears your local session</li>
        <li>To request full deletion of your account and all associated data (builds, favorites), contact us via GitHub</li>
        <li>You can also revoke our app's access to your Google account at <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer">myaccount.google.com/permissions</a></li>
      </ul>
    </section>

    <section>
      <h3>Children's Privacy</h3>
      <p>This service is not directed to children under 13 years of age. We do not knowingly collect personal information from children under 13.</p>
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
      <h3>Changes to This Policy</h3>
      <p>We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated date.</p>
    </section>

    <section>
      <h3>Disclaimer</h3>
      <p>
        This app is an unofficial, fan-made project. We are not affiliated with, endorsed by, 
        or sponsored by Moonton Technology Co., Ltd.
      </p>
      <p>
        All Mobile Legends game content, images, character names, and trademarks are property 
        of Moonton Technology Co., Ltd.
      </p>
    </section>

    <section>
      <h3>Contact</h3>
      <p>For questions about this Privacy Policy or to request data deletion, please open an issue on our <a href="https://github.com/Wink007/moba-game-database" target="_blank" rel="noopener noreferrer">GitHub repository</a>.</p>
    </section>
  </div>
);

const TermsOfService = () => (
  <div className={styles.document}>
    <h2>Terms of Service</h2>
    <p className={styles.lastUpdated}>Last Updated: February 22, 2026</p>

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
        <li>Open an issue on our <a href="https://github.com/Wink007/moba-game-database" target="_blank" rel="noopener noreferrer">GitHub repository</a></li>
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
