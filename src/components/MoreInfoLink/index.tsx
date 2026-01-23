import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from './styles.module.scss';

interface MoreInfoLinkProps {
  linkTo: string;
}

export const MoreInfoLink = ({ linkTo }: MoreInfoLinkProps) => {
  const { t } = useTranslation();
  return (
    <Link className={styles['more-info-link']} to={linkTo}>
      <p>{t('home.moreInfo')}</p>
      <img className={styles['more-info-icon']} src="/arrow-small.svg" alt="more info" />
    </Link>
  );
};
