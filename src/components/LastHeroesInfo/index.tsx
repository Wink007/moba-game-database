import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useHeroesQuery, useHeroSkillsQuery } from "../../queries/useHeroesQuery";
import { useGameStore } from "../../store/gameStore";
import { Lanes, LanesIcons } from "../../enum";
import style from './styles.module.scss';
import { MoreInfoLink } from '../MoreInfoLink';
import SkillTooltip from '../SkillTooltip';

export const LastHeroesInfo = () => {
    const { t } = useTranslation();
    const { selectedGameId } = useGameStore();
    const { data: heroes } = useHeroesQuery(selectedGameId);
    const latestHeroes = heroes?.sort((a, b) => b.id - a.id).slice(0, 6);
    const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
    const [transformIndex, setTransformIndex] = useState(0);
    const [hoveredSkillId, setHoveredSkillId] = useState<number | null>(null);
    const [tooltipOffset, setTooltipOffset] = useState({ x: 0, y: 0 });
    const tooltipRef = useRef<HTMLDivElement>(null);
    
    const currentHeroId = latestHeroes?.[currentHeroIndex]?.id || 0;
    const { data: allSkills, isLoading } = useHeroSkillsQuery(currentHeroId);

    const baseSkills = allSkills?.filter(s => !s.is_transformed) || [];
    const transformedSkills = allSkills?.filter(s => s.is_transformed) || [];

    const maxTransforms = transformedSkills.length > 0 
        ? Math.max(...transformedSkills.map(s => s.transformation_order || 0))
        : 0;

    const displaySkills = transformIndex === 0
        ? baseSkills
        : baseSkills.map(base => 
            transformedSkills.find(
                t => t.replaces_skill_id === base.id && t.transformation_order === transformIndex
            ) || base
          );

    const cycleTransform = () => {
        setTransformIndex((prev) => (prev + 1) % (maxTransforms + 1));
    };

    const changeHero = (index: number) => {
        setCurrentHeroIndex(index);
        setTransformIndex(0);
    };

    const nextHero = () => changeHero((currentHeroIndex + 1) % latestHeroes!.length);
    const prevHero = () => changeHero((currentHeroIndex - 1 + latestHeroes!.length) % latestHeroes!.length);

    useEffect(() => {
        // Застосовуємо коригування тільки для великих екранів (більше 768px)
        if (hoveredSkillId && tooltipRef.current && window.innerWidth > 768) {
            const tooltip = tooltipRef.current;
            const rect = tooltip.getBoundingClientRect();
            
            let offsetX = 0;
            let offsetY = 0;
            
            // Перевірка правого краю екрану
            if (rect.right > window.innerWidth) {
                const overflow = rect.right - window.innerWidth;
                offsetX = -(overflow + 16);
            }
            
            // Перевірка лівого краю екрану
            if (rect.left < 0) {
                const overflow = Math.abs(rect.left);
                offsetX = overflow + 16;
            }
            
            // Перевірка верхнього краю екрану
            if (rect.top < 0) {
                const overflow = Math.abs(rect.top);
                offsetY = overflow + 16;
            }
            
            // Перевірка нижнього краю екрану
            if (rect.bottom > window.innerHeight) {
                const overflow = rect.bottom - window.innerHeight;
                offsetY = -(overflow + 16);
            }
            
            setTooltipOffset({ x: offsetX, y: offsetY });
        } else {
            setTooltipOffset({ x: 0, y: 0 });
        }
    }, [hoveredSkillId]);

    const abilitiesLabel = [
        t('home.abilities.durability'), 
        t('home.abilities.offense'), 
        t('home.abilities.abilityEffects'), 
        t('home.abilities.difficulty')
    ];

    return (
        <div className={style['last-heroes-info-wrapper']}>
            <h2>{t('home.latestHeroesInfo')}</h2>
            <div className={style.info}>
                <div className={style['hero-detail']}>
                    <button className={style['prev-button']} onClick={prevHero}>
                        <img src="/arrow.svg" alt="Previous" />
                    </button>
                    <div className={style['hero-preview-wrapper']}>
                        <div className={style['lane-icon-wrapper']}>
                            {latestHeroes?.[currentHeroIndex]?.lane?.map((lane => {
                                const laneKey = Object.values(Lanes).find(l => l === lane);
                                return (
                                    <img 
                                        key={lane} 
                                        src={laneKey ? LanesIcons[laneKey as Lanes] : ''} 
                                        alt={lane} 
                                        title={lane}
                                        className={style['lane-icon']}
                                    />
                                );
                            }))}
                        </div>
                            <img className={style['hero-preview']} src={latestHeroes?.[currentHeroIndex]?.painting} alt={latestHeroes?.[currentHeroIndex]?.name} />
                    </div>
                    <div className={style['hero-info']}>  
                        <div className={style['hero-name-lane']}>
                            <div className={style['hero-name-lane-wrapper']}>
                                <p className={style['hero-name']}>{latestHeroes?.[currentHeroIndex]?.name}</p>
                                <div className={style['hero-roles']}>
                                    {latestHeroes?.[currentHeroIndex]?.roles.map((role) => (
                                        <p key={role} className={style['hero-role']}>{role}</p>
                                    ))}
                                </div>
                            </div>
                        <div className={style['hero-skills']}>
                            {isLoading && [0,1,2,3].map((skill) => (
                                <div key={skill} className={style['skill-item-skeleton']} />
                            ))}
                            {!isLoading && displaySkills?.map((skill) => (
                                    <div 
                                        key={skill.id}
                                        data-skill-id={skill.id}
                                        className={style['skill-item']}
                                        onMouseEnter={() => setHoveredSkillId(skill.id)}
                                        onMouseLeave={() => setHoveredSkillId(null)}
                                    >
                                        <img 
                                            src={skill.preview} 
                                            alt={skill.skill_name} 
                                            title={skill.skill_name} 
                                            className={style['skill-icon']} 
                                        />
                                        {hoveredSkillId === skill.id && (
                                            <div 
                                                ref={tooltipRef}
                                                className={style['tooltip-wrapper']}
                                                style={{
                                                    transform: `translate(calc(-50% + ${tooltipOffset.x}px), ${tooltipOffset.y}px)`
                                                }}
                                            >
                                                <SkillTooltip
                                                    name={skill.skill_name}
                                                    effect={skill.effect_types || []}
                                                    description={skill.skill_description || ''}
                                                    parameters={skill.skill_parameters}
                                                />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            {maxTransforms > 0 && (
                                <button
                                    type="button"
                                    onClick={cycleTransform}
                                    className={style['transform-button']}
                                >
                                    <img src="/switch-skills.png" alt="switch skills" />
                                </button>
                            )}
                        </div>
                        </div>
                        <div className={style['abilities-list']}>
                            {isLoading && [0,1,2,3].map((_, index) => (
                                <div key={index} className={style['ability-row-skeleton']} />
                            ))}
                            {!isLoading && latestHeroes?.[currentHeroIndex]?.abilityshow?.map((ability, index) => (
                                <div key={`${ability}-${index}`} className={style['ability-row']}>
                                    <div className={style['ability-label']}>{abilitiesLabel[index]}</div>
                                    <div className={style['ability-item']}>
                                        <div className={style['ability-bar']} style={{ width: `${ability}%`}}/>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <MoreInfoLink linkTo={`${selectedGameId}/heroes/${latestHeroes?.[currentHeroIndex]?.id}`} />
                        <div className={style['hero-list-wrapper']}>
                            {latestHeroes?.map((hero, index) => (
                                <button 
                                    key={hero.id} 
                                    className={`${style['hero-list']} ${index === currentHeroIndex && style['hero-list--active']}`}
                                    onClick={() => changeHero(index)}
                                >
                                    <img className={style['hero-item']} src={hero?.head} alt={hero.name} />
                                </button>
                            ))}
                        </div>
                    </div>
                    <button className={style['next-button']} onClick={nextHero}>
                        <img src="/arrow.svg" alt="Next" />
                    </button>
                </div>
            </div>
        </div>
    );
}