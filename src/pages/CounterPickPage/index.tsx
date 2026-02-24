import React from 'react';
import { useTranslation } from 'react-i18next';
import { useGameStore } from '../../store/gameStore';
import { getHeroName } from '../../utils/translation';
import { Loader } from '../../components/Loader';
import { useCounterPick } from './useCounterPick';
import { SingleResults } from './SingleResults';
import { TeamResults } from './TeamResults';
import { PlusIcon, SingleIcon, TeamIcon, EmptyIcon } from './icons';
import styles from './styles.module.scss';

export const CounterPickPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const { selectedGameId } = useGameStore();

  const {
    mode, selectedHero, teamHeroes, searchQuery, isSelectorOpen, selectingSlot,
    selectorRef, filteredHeroes, isLoading, singleResults, teamResults,
    setSelectedHero, setSearchQuery, handleSelectHero, openSelector, closeSelector,
    removeTeamHero, clearAll, switchMode,
  } = useCounterPick(selectedGameId, lang);

  if (isLoading) return <Loader />;

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>{t('counterPick.title')}</h1>
        <p className={styles.description}>{t('counterPick.description')}</p>
      </div>

      {/* Mode tabs */}
      <div className={styles.modeTabs}>
        <button
          className={`${styles.modeTab} ${mode === 'single' ? styles.modeTabActive : ''}`}
          onClick={() => switchMode('single')}
        >
          <SingleIcon />
          <span>{t('counterPick.singleMode')}</span>
        </button>
        <button
          className={`${styles.modeTab} ${mode === 'team' ? styles.modeTabActive : ''}`}
          onClick={() => switchMode('team')}
        >
          <TeamIcon />
          <span>{t('counterPick.teamMode')}</span>
        </button>
      </div>

      {/* Selection area */}
      <div className={styles.selectionArea}>
        {mode === 'single' ? (
          <div className={styles.singleSelect}>
            <div
              className={`${styles.heroSlot} ${selectedHero ? styles.heroSlotFilled : ''}`}
              onClick={() => openSelector()}
            >
              {selectedHero ? (
                <>
                  <div className={styles.slotImageWrap}>
                    <img
                      src={selectedHero.head || selectedHero.image}
                      alt={getHeroName(selectedHero, lang)}
                      className={styles.slotImage}
                    />
                  </div>
                  <span className={styles.slotName}>{getHeroName(selectedHero, lang)}</span>
                  <button
                    className={styles.slotRemove}
                    onClick={(e) => { e.stopPropagation(); setSelectedHero(null); }}
                  >
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1 1l8 8M9 1l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  </button>
                </>
              ) : (
                <div className={styles.slotPlaceholder}>
                  <div className={styles.slotPlaceholderIcon}><PlusIcon /></div>
                  <span>{t('counterPick.selectHero')}</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className={styles.teamSelect}>
            <div className={styles.teamSlots}>
              {[0, 1, 2, 3, 4].map(i => (
                <div
                  key={i}
                  className={`${styles.heroSlot} ${styles.heroSlotSmall} ${teamHeroes[i] ? styles.heroSlotFilled : ''}`}
                  onClick={() => teamHeroes[i] ? openSelector(i) : openSelector()}
                >
                  {teamHeroes[i] ? (
                    <>
                      <div className={styles.slotImageWrap}>
                        <img
                          src={teamHeroes[i].head || teamHeroes[i].image}
                          alt={getHeroName(teamHeroes[i], lang)}
                          className={styles.slotImage}
                        />
                      </div>
                      <span className={styles.slotName}>{getHeroName(teamHeroes[i], lang)}</span>
                      <button
                        className={styles.slotRemove}
                        onClick={(e) => { e.stopPropagation(); removeTeamHero(i); }}
                      >
                        <svg width="8" height="8" viewBox="0 0 10 10" fill="none"><path d="M1 1l8 8M9 1l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                      </button>
                    </>
                  ) : (
                    <div className={styles.slotPlaceholder}>
                      <div className={styles.slotPlaceholderIcon}><PlusIcon /></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {teamHeroes.length > 0 && (
              <button className={styles.clearBtn} onClick={clearAll}>
                {t('counterPick.clearAll')}
              </button>
            )}
          </div>
        )}

        {/* Hero selector modal */}
        {isSelectorOpen && (
          <div className={styles.selectorOverlay} onClick={closeSelector}>
            <div className={styles.selector} ref={selectorRef} onClick={(e) => e.stopPropagation()}>
              <div className={styles.selectorHeader}>
                <input
                  type="text"
                  className={styles.selectorSearch}
                  placeholder={t('counterPick.searchHero')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
                <button className={styles.selectorClose} onClick={closeSelector}>×</button>
              </div>
              <div className={styles.selectorGrid}>
                {filteredHeroes.map(hero => {
                  const isSelected = mode === 'single'
                    ? selectedHero?.id === hero.id
                    : teamHeroes.some(h => h.id === hero.id);
                  return (
                    <button
                      key={hero.id}
                      className={`${styles.selectorHero} ${isSelected ? styles.selectorHeroSelected : ''}`}
                      onClick={() => handleSelectHero(hero)}
                      disabled={isSelected && mode === 'team' && selectingSlot === null}
                    >
                      <img
                        src={hero.head || hero.image}
                        alt={getHeroName(hero, lang)}
                        className={styles.selectorHeroImg}
                      />
                      <span className={styles.selectorHeroName}>{getHeroName(hero, lang)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      <div className={styles.results}>
        {mode === 'single' && selectedHero && singleResults && (
          <SingleResults hero={selectedHero} results={singleResults} lang={lang} gameId={selectedGameId} t={t} />
        )}
        {mode === 'team' && teamHeroes.length > 0 && teamResults && (
          <TeamResults results={teamResults} lang={lang} gameId={selectedGameId} t={t} enemyCount={teamHeroes.length} />
        )}
        {mode === 'single' && !selectedHero && (
          <div className={styles.emptyState}>
            <EmptyIcon />
            <p>{t('counterPick.selectHeroPrompt')}</p>
          </div>
        )}
        {mode === 'team' && teamHeroes.length === 0 && (
          <div className={styles.emptyState}>
            <EmptyIcon />
            <p>{t('counterPick.selectEnemyPrompt')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CounterPickPage;
