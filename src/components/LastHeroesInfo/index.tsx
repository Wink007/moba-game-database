import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { useLatestHeroesQuery, useHeroSkillsQuery } from "../../queries/useHeroesQuery";
import { useGameStore } from "../../store/gameStore";
import { Lanes, LanesIcons } from "../../enum";
import { getSkillName, getSkillDescription } from '../../utils/translation';
import s from './styles.module.scss';
import { MoreInfoLink } from '../MoreInfoLink';
import SkillTooltip from '../SkillTooltip';

/* ── Skeleton ── */
const SkeletonBlock = ({ w, h, r, delay }: { w?: string; h?: string; r?: string; delay?: number }) => (
    <div
        className={s.shimmer}
        style={{ width: w, height: h, borderRadius: r ?? '8px', animationDelay: delay ? `${delay}ms` : undefined }}
    />
);

const LastHeroesInfoSkeleton = ({ title }: { title: string }) => (
    <div className={s.wrapper}>
        <h2 className={s.title}>{title}</h2>
        <div className={s.card}>
            <div className={s.showcase}>
                <SkeletonBlock w="100%" h="100%" r="0" />
            </div>
            <div className={s.details}>
                <SkeletonBlock w="180px" h="32px" delay={100} />
                <div className={s.rolesRow}>
                    <SkeletonBlock w="56px" h="24px" r="6px" delay={150} />
                    <SkeletonBlock w="72px" h="24px" r="6px" delay={200} />
                </div>
                <div className={s.skillsRow}>
                    {[0,1,2,3].map(i => <SkeletonBlock key={i} w="56px" h="56px" r="14px" delay={250 + i * 60} />)}
                </div>
                <div className={s.statsGrid}>
                    {[0,1,2,3].map(i => (
                        <div key={i} className={s.statItem}>
                            <SkeletonBlock w="80px" h="12px" r="4px" delay={450 + i * 50} />
                            <SkeletonBlock w="100%" h="6px" r="3px" delay={500 + i * 50} />
                        </div>
                    ))}
                </div>
                <SkeletonBlock w="130px" h="40px" r="10px" delay={700} />
                <div className={s.thumbs}>
                    {[0,1,2,3,4,5].map(i => <SkeletonBlock key={i} w="52px" h="52px" r="50%" delay={800 + i * 40} />)}
                </div>
            </div>
        </div>
    </div>
);

/* ── Main component ── */
export const LastHeroesInfo = () => {
    const { t, i18n } = useTranslation();
    const { selectedGameId } = useGameStore();
    const { data: latestHeroes, isLoading: heroesLoading } = useLatestHeroesQuery(selectedGameId, 6);
    const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
    const [transformIndex, setTransformIndex] = useState(0);
    const [hoveredSkillId, setHoveredSkillId] = useState<number | null>(null);
    const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
    const tooltipRef = useRef<HTMLDivElement>(null);
    const skillRefs = useRef<Map<number, HTMLDivElement>>(new Map());

    const currentHeroId = latestHeroes?.[currentHeroIndex]?.id || 0;
    const { data: allSkills, isLoading, isPlaceholderData } = useHeroSkillsQuery(currentHeroId);
    const showSkillSkeletons = isLoading && !isPlaceholderData;

    const baseSkills = allSkills?.filter(sk => !sk.is_transformed) || [];
    const transformedSkills = allSkills?.filter(sk => sk.is_transformed) || [];

    const maxTransforms = transformedSkills.length > 0
        ? Math.max(...transformedSkills.map(sk => sk.transformation_order || 0))
        : 0;

    const displaySkills = transformIndex === 0
        ? baseSkills
        : baseSkills.map(base =>
            transformedSkills.find(
                tr => tr.replaces_skill_id === base.id && tr.transformation_order === transformIndex
            ) || base
          );

    const cycleTransform = () => setTransformIndex(prev => (prev + 1) % (maxTransforms + 1));
    const changeHero = (index: number) => { setCurrentHeroIndex(index); setTransformIndex(0); };
    const nextHero = () => changeHero((currentHeroIndex + 1) % latestHeroes!.length);
    const prevHero = () => changeHero((currentHeroIndex - 1 + latestHeroes!.length) % latestHeroes!.length);

    useEffect(() => {
        if (!hoveredSkillId || !tooltipRef.current) return;
        const skillEl = skillRefs.current.get(hoveredSkillId);
        if (!skillEl) return;

        const sr = skillEl.getBoundingClientRect();
        const tr = tooltipRef.current.getBoundingClientRect();
        const pad = 12;
        const scrollY = window.scrollY;
        const scrollX = window.scrollX;

        // Center horizontally, clamp to viewport
        let left = sr.left + scrollX + sr.width / 2 - tr.width / 2;
        left = Math.max(pad + scrollX, Math.min(left, scrollX + window.innerWidth - tr.width - pad));

        // Prefer above; if not enough space, show below
        let top = sr.top + scrollY - tr.height - 10;
        if (sr.top - tr.height - 10 < pad) {
            top = sr.bottom + scrollY + 10;
        }

        setTooltipPos({ top, left });
    }, [hoveredSkillId]);

    const abilityLabels = [
        t('home.abilities.durability'),
        t('home.abilities.offense'),
        t('home.abilities.abilityEffects'),
        t('home.abilities.difficulty'),
    ];
    const abilityColors = ['#22c55e', '#ef4444', '#a78bfa', '#f59e0b'];

    if (heroesLoading || !latestHeroes?.length) {
        return <LastHeroesInfoSkeleton title={t('home.latestHeroesInfo')} />;
    }

    const hero = latestHeroes[currentHeroIndex];

    return (
        <div className={s.wrapper}>
            <h2 className={s.title}>{t('home.latestHeroesInfo')}</h2>

            <div className={s.card}>
                {/* ── Showcase (painting + overlay) ── */}
                <div className={s.showcase}>
                    <img className={s.painting} src={hero?.painting} alt={hero?.name} />
                    <div className={s.paintingOverlay} />

                    {hero?.lane && hero.lane.length > 0 && (
                        <div className={s.laneIcons}>
                            {hero.lane.map(lane => {
                                const laneKey = Object.values(Lanes).find(l => l.toLowerCase() === lane.toLowerCase());
                                return (
                                    <img key={lane} src={laneKey ? LanesIcons[laneKey as Lanes] : ''} alt={lane} title={lane} className={s.laneIcon} />
                                );
                            })}
                        </div>
                    )}

                    <button className={s.navBtn} data-dir="prev" onClick={prevHero} aria-label="Previous hero">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                    <button className={s.navBtn} data-dir="next" onClick={nextHero} aria-label="Next hero">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                </div>

                {/* ── Details panel ── */}
                <div className={s.details}>
                    <p className={s.heroName}>{hero?.name}</p>

                    {hero?.roles && hero.roles.length > 0 && (
                        <div className={s.rolesRow}>
                            {hero.roles.map(role => (
                                <span key={role} className={s.roleTag}>{role}</span>
                            ))}
                        </div>
                    )}

                    {/* Skills */}
                    <div className={s.skillsRow}>
                        {showSkillSkeletons && [0,1,2,3].map(i => <div key={i} className={s.skillSkeleton} />)}
                        {!showSkillSkeletons && displaySkills.map(skill => (
                            <div
                                key={skill.id}
                                ref={el => { if (el) skillRefs.current.set(skill.id, el); else skillRefs.current.delete(skill.id); }}
                                className={s.skillItem}
                                onMouseEnter={() => setHoveredSkillId(skill.id)}
                                onMouseLeave={() => setHoveredSkillId(null)}
                            >
                                <img src={skill.image || skill.preview} alt={getSkillName(skill, i18n.language)} title={getSkillName(skill, i18n.language)} className={s.skillIcon} />
                            </div>
                        ))}
                        {hoveredSkillId && !showSkillSkeletons && (() => {
                            const skill = displaySkills.find(sk => sk.id === hoveredSkillId);
                            if (!skill) return null;
                            return createPortal(
                                <div ref={tooltipRef} className={s.tooltipWrap} style={{ top: tooltipPos.top, left: tooltipPos.left }}>
                                    <SkillTooltip
                                        name={getSkillName(skill, i18n.language)}
                                        effect={skill.effect_types || []}
                                        description={getSkillDescription(skill, i18n.language)}
                                        parameters={skill.skill_parameters}
                                    />
                                </div>,
                                document.body
                            );
                        })()}
                        {maxTransforms > 0 && (
                            <button
                                type="button"
                                onClick={cycleTransform}
                                className={`${s.transformBtn} ${transformIndex > 0 ? s.transformBtnActive : ''}`}
                                title={transformIndex === 0 ? t('heroDetail.showTransformation') : t('heroDetail.transformation', { index: transformIndex })}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" fill="currentColor"/></svg>
                                {transformIndex > 0 && <span className={s.transformIdx}>{transformIndex}</span>}
                            </button>
                        )}
                    </div>

                    {/* Abilities */}
                    <div className={s.statsGrid}>
                        {showSkillSkeletons && [0,1,2,3].map((_, i) => <div key={i} className={s.statItemSkeleton} />)}
                        {!showSkillSkeletons && hero?.abilityshow?.map((ability, i) => (
                            <div key={`${ability}-${i}`} className={s.statItem}>
                                <div className={s.statLabel}>
                                    <span>{abilityLabels[i]}</span>
                                    <span className={s.statValue}>{ability}</span>
                                </div>
                                <div className={s.statTrack}>
                                    <div
                                        className={s.statFill}
                                        style={{ '--fill-w': `${ability}%`, '--fill-color': abilityColors[i] } as React.CSSProperties}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <MoreInfoLink linkTo={`${selectedGameId}/heroes/${hero?.id}`} />

                    {/* Hero selector */}
                    <div className={s.thumbs}>
                        {latestHeroes.map((h, idx) => (
                            <button
                                key={h.id}
                                className={`${s.thumb} ${idx === currentHeroIndex ? s.thumbActive : ''}`}
                                onClick={() => changeHero(idx)}
                            >
                                <img src={h?.head} alt={h.name} className={s.thumbImg} />
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}