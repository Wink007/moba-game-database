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
    <p className={styles.lastUpdated}>Last Updated: February 20, 2026</p>

    <section>
      <h3>Introduction</h3>
      <p>
        This Privacy Policy describes how Mobile Legends Wiki (Unofficial) ("we", "our", or "the app") 
        handles information when you use our application.
      </p>
    </section>

    <section>
      <h3>Information We Collect</h3>
      
      <h4>Information You Provide</h4>
      <ul>
        <li>We do not require user accounts or personal information</li>
        <li>We do not collect or store any personally identifiable information</li>
      </ul>

      <h4>Automatically Collected Information</h4>
      <ul>
        <li>We may collect anonymous usage statistics through analytics (if enabled)</li>
        <li>Browser type and device information for improving user experience</li>
        <li>No tracking of individual users</li>
      </ul>
    </section>

    <section>
      <h3>Data Storage</h3>
      <ul>
        <li>All game data (heroes, items, stats) is fetched from our public API</li>
        <li>No personal user data is stored on our servers</li>
        <li>No cookies are used for tracking purposes</li>
      </ul>
    </section>

    <section>
      <h3>Third-Party Services</h3>
      <p>This app may use third-party services that may collect information:</p>
      <ul>
        <li>Hosting provider (Railway) - may collect basic server logs</li>
      </ul>
    </section>

    <section>
      <h3>Children's Privacy</h3>
      <p>This service does not knowingly collect information from children under 13 years of age.</p>
    </section>

    <section>
      <h3>Data Security</h3>
      <ul>
        <li>We do not store personal information</li>
        <li>All API communications use HTTPS encryption</li>
        <li>Game data is publicly available information</li>
      </ul>
    </section>

    <section>
      <h3>Changes to This Policy</h3>
      <p>We may update this Privacy Policy from time to time. Changes will be posted on this page.</p>
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
      <p>For questions about this Privacy Policy, please open an issue on our GitHub repository.</p>
    </section>
  </div>
);

const TermsOfService = () => (
  <div className={styles.document}>
    <h2>Terms of Service</h2>
    <p className={styles.lastUpdated}>Last Updated: February 20, 2026</p>

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
      <h3>4. User Conduct</h3>
      <p>Users agree to:</p>
      <ul>
        <li>Use the service for informational purposes only</li>
        <li>Not attempt to hack, disrupt, or damage the service</li>
        <li>Not use automated tools to scrape data excessively</li>
        <li>Respect intellectual property rights</li>
      </ul>
    </section>

    <section>
      <h3>5. Limitation of Liability</h3>
      <ul>
        <li>We provide this service free of charge</li>
        <li>We are not liable for any damages arising from use of this app</li>
        <li>No warranty of service availability or uptime</li>
        <li>Not responsible for third-party content or links</li>
      </ul>
    </section>

    <section>
      <h3>6. Content Ownership</h3>
      
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
      <h3>7. Service Modifications</h3>
      <p>We reserve the right to:</p>
      <ul>
        <li>Modify or discontinue the service at any time</li>
        <li>Update these terms without prior notice</li>
        <li>Remove content that violates intellectual property rights</li>
      </ul>
    </section>

    <section>
      <h3>8. Third-Party Links</h3>
      <ul>
        <li>May contain links to third-party websites</li>
        <li>We are not responsible for external content</li>
        <li>Use third-party services at your own risk</li>
      </ul>
    </section>

    <section>
      <h3>9. Age Restrictions</h3>
      <ul>
        <li>Service intended for users 13 years and older</li>
        <li>Younger users should obtain parental consent</li>
      </ul>
    </section>

    <section>
      <h3>10. Governing Law</h3>
      <p>These terms are governed by international Fair Use principles and intellectual property law.</p>
    </section>

    <section>
      <h3>11. Contact</h3>
      <p>For questions or concerns about these Terms:</p>
      <ul>
        <li>Open an issue on our GitHub repository</li>
        <li>Contact through official channels listed on the website</li>
      </ul>
    </section>

    <section>
      <h3>12. Severability</h3>
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
