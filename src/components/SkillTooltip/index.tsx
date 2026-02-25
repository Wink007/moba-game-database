import parse from 'html-react-parser';
import styles from './styles.module.scss';
import { SkillParameter } from '../../types/hero';

export interface SkillTooltipProps {
  name: string;
  effect: string[];
  description: string;
  parameters?: SkillParameter;
}

const SkillTooltip = ({
  name,
  effect,
  description,
  parameters,
}: SkillTooltipProps) =>  (
        <div className={styles.tooltip}>
            <div className={styles.header}>
                <div className={styles.titleSection}>
                    <h3 className={styles.name}>{name}</h3>
                    <div className={styles.stats}>
                        {parameters && Object.entries(parameters).map(([label, value], index) => {

                            return (
                                <div key={index} className={styles.stat}>
                                    <span>{`${label}: `}</span>
                                    <span>{value}</span>
                                </div>
                        )})}
                    </div>
                </div>
                <div className={styles.effect}>
                    {effect.map(e => {
                        return <span className={styles.effectItem} key={e}>{e}</span>
                    })}
                </div>
            </div>
            <div className={styles.description}>
                {description.split('\n').map((paragraph, index) => (
                    <p key={index} className={styles.paragraph}>
                        {parse(paragraph)}
                    </p>
                ))}
            </div>
        </div>
    );

export default SkillTooltip;
