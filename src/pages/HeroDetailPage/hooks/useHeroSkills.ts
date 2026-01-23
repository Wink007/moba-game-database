import { useState, useEffect } from 'react';
import { HeroSkill } from '../../../types/hero';
import { UseHeroSkillsReturn } from './interface';

export const useHeroSkills = (
  skills: HeroSkill[],
  initialSkillIndex: number = 0
): UseHeroSkillsReturn => {
  const [selectedSkillIndex, setSelectedSkillIndex] = useState<number>(initialSkillIndex);
  const [transformIndex, setTransformIndex] = useState(0);

  // Filter and sort base skills (non-transformed)
  const baseSkills = skills
    .filter(skill => !skill.is_transformed)
    .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));

  // Filter and sort transformed skills
  const transformedSkills = skills
    .filter(skill => skill.is_transformed)
    .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));

  // Calculate max transformation levels
  const maxTransforms = transformedSkills.length > 0 
    ? Math.max(...transformedSkills.map(s => s.transformation_order || 0))
    : 0;

  // Get display skills based on current transform index
  const displaySkills = transformIndex === 0
    ? baseSkills
    : baseSkills.map(base => 
        transformedSkills.find(
          t => t.replaces_skill_id === base.id && t.transformation_order === transformIndex
        ) || base
      );

  // Cycle through transformations
  const cycleTransform = () => {
    setTransformIndex((prev) => (prev + 1) % (maxTransforms + 1));
  };

  // Selected skill
  const selectedSkill = displaySkills[selectedSkillIndex] || displaySkills[0];

  // Reset skill index if out of bounds
  useEffect(() => {
    if (selectedSkillIndex >= displaySkills.length && displaySkills.length > 0) {
      setSelectedSkillIndex(0);
    }
  }, [displaySkills, selectedSkillIndex]);

  return {
    baseSkills,
    transformedSkills,
    displaySkills,
    selectedSkill,
    maxTransforms,
    transformIndex,
    cycleTransform,
    setSelectedSkillIndex,
    setTransformIndex,
  };
};
