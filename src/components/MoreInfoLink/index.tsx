import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from './styles.module.scss';

interface MoreInfoLinkProps {
  linkTo: string;
}

export const MoreInfoLink = ({ linkTo }: MoreInfoLinkProps) => {
  const { t } = useTranslation();
  return (
    <Link className={styles.link} to={linkTo}>
      <span>{t('home.moreInfo')}</span>
      <svg className={styles.arrow} width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Link>
  );
};
