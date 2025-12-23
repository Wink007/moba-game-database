/Users/alexwink/Library/Python/3.9/lib/python/site-packages/urllib3/__init__.py:35: NotOpenSSLWarning: urllib3 v2 only supports OpenSSL 1.1.1+, currently the 'ssl' module is compiled with 'LibreSSL 2.8.3'. See: https://github.com/urllib3/urllib3/issues/3020
  warnings.warn(
-- SQL UPDATE STATEMENTS FOR HERO SKILLS
-- Generated from https://mlbb-stats.ridwaanhall.com/api/
-- Execute these in your PostgreSQL database

BEGIN;

-- Aamon
UPDATE hero_skills 
SET skill_description = 'Aamon enters the <font color="a6aafb">Camouflage</font> state each time he hits an enemy with a skill, during which he cannot be targeted, recovers 25<font color="62f8fe"> (+15% Total Magic Power)</font> plus 3% of his lost HP every 0.5s, and gains 80% extra Movement Speed that rapidly decays over 3s.
Upon leaving the <font color="a6aafb">Camouflage</font> state, Aamon immediately resets his Basic Attack''s cooldown and enhances his Basic Attacks within the next 3s. Each enhanced Basic Attack deals 70<font color="fba51f"> (+100% Total Physical Attack)</font> <font color="62f8fe">(+115% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font>. The first attack after actively leaving <font color="a6aafb"> Camouflage</font> is enhanced to deal 84<font color="fba51f"> (+120% Total Physical Attack)</font> <font color="62f8fe">(+138% Total Magic Power)</font> damage and reduces all skill cooldowns by 1s.'
WHERE skill_name = 'Invisible Armor' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Aamon' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = '<font color="a6aafb">Passive:</font> Aamon charges his armor through enhanced Basic Attacks or while camouflaged. At 5 charges, Aamon throws 6 shards at the target on his next attack, each shard dealing 50<font color="62f8fe"> (+15% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font>. The shards will then scatter around the target.

<font color="a6aafb">Active:</font> Aamon throws a shard at a nearby enemy, dealing 175<font color="62f8fe"> (+60% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font>.'
WHERE skill_name = 'Soul Shards' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Aamon' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Aamon throws a shard forward, dealing 120<font color="62f8fe"> (+50% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> to enemies along the way. The shard will return to Aamon after a short delay and allow him to enter the <font color="a6aafb">Camouflage</font> state.
If the shard hits a non-minion enemy, it''ll slow them by 50% for 2s and return to Aamon immediately.'
WHERE skill_name = 'Slayer Shards' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Aamon' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Aamon throws all shards at a designated enemy and slows them by 30% for 1.5s. After a short delay, the shards will fly to the enemy''s location again, each dealing 90<font color="62f8fe"> (+24% Total Magic Power)</font>-150<font color="62f8fe"> (+40% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font>.

The number of shards increases with Aamon''s armor charges and the shards on the ground (8-25).
The damage dealt increases with the target''s lost HP, to the max when the target''s HP is below 30%. The same target takes less damage from subsequent attacks.'
WHERE skill_name = 'Endless Shards' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Aamon' AND game_id = 1);

-- Akai
UPDATE hero_skills 
SET skill_description = 'Akai gains a 25<font color="26e407"> (+5% Total HP)</font> shield for 4s on each skill cast and marks enemy heroes and Creeps hit by his skills.

Akai''s Basic Attacks deal 25<font color="26e407"> (+5% Total HP)</font> extra <font color="fb1f1f">Physical Damage</font> to marked enemies.'
WHERE skill_name = 'Tai Chi' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Akai' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Akai charges in the target direction, dealing 300<font color="fba51f"> (+50% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to enemies along the way. If Akai hits an enemy hero during this process, he''ll knock them airborne for 0.5s and be able to roll in the Joystick''s direction once.

Akai can cast <font color="a6aafb">Headbutt</font> during <font color="a6aafb">Heavy Spin</font> to quickly adjust his position.'
WHERE skill_name = 'Headbutt' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Akai' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Akai smashes the ground with his body, dealing 270<font color="26e407"> (+6% Total HP)</font> <font color="fb1f1f">Physical Damage</font> to nearby enemies and slowing them by 45% for 2s.'
WHERE skill_name = 'Body Slam' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Akai' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Akai removes all debuffs on him and spins for 4s, gaining Slow Immunity while continuously dealing 100<font color="fba51f"> (+50% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to nearby enemies and knocking them back. Enemy heroes knocked back will knock back other heroes they collide with during the process.

Akai also gradually increases his Movement Speed by 70% over the duration. This skill can only be interrupted by Suppression.'
WHERE skill_name = 'Heavy Spin' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Akai' AND game_id = 1);

-- Aldous
UPDATE hero_skills 
SET skill_description = 'After every 2 Basic Attacks, Aldous gains a 500 (+3 times the number of <font color="a6aafb">Soul Steal</font> stacks) shield for 3s on his next Basic Attack.
This effect can only be triggered once every 5s.'
WHERE skill_name = 'Contract: Transform' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Aldous' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Aldous unleashes his inner energy to enhance his next Basic Attack to deal <font color="fb1f1f">Physical Damage</font> equal to 200<font color="fba51f"> (+100% Total Physical Attack)</font> plus 5 times the number of <font color="a6aafb">Soul Steal</font> stacks.

If this attack kills an enemy hero/Siege Minion/other non-hero unit, Aldous will gain 10/10/4 stacks of <font color="a6aafb">Soul Steal</font> (up to 650 stacks).

The enhanced Basic Attack deals 300% extra Base Damage to Minions or Creeps. Aldous gets an extra 5/2 stack(s) of <font color="a6aafb">Soul Steal</font> when a nearby enemy Siege Minion/other non-hero unit dies.'
WHERE skill_name = 'Contract: Soul Steal' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Aldous' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Aldous assumes a defensive stance, gaining 30% Damage Reduction and 20% extra Movement Speed for 2s or until manual cancellation. He then deals 100<font color="fba51f"> (+20% Total Physical Attack)</font>-200<font color="fba51f"> (+40% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to nearby enemies and stuns them for 0.5-1s (scales with defensive stance duration).'
WHERE skill_name = 'Contract: Explosion' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Aldous' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Aldous gains vision of all enemy heroes for 5s. During this time, if Aldous uses this skill again, he can dash toward an enemy hero. When Aldous hits that enemy hero, he will deal <font color="fb1f1f">Physical Damage</font> equal to 250 plus 8% of the target''s Max HP and knock back the target for 1s. (Aldous can interrupt target''s Recall during the dash.)'
WHERE skill_name = 'Contract: Chase Fate' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Aldous' AND game_id = 1);

-- Alice
UPDATE hero_skills 
SET skill_description = 'When Alice''s skills hit, she gains 1 stack(s) of <font color="a6aafb">Crimson</font>, lasting 4s. Once <font color="a6aafb">Crimson</font> reaches 2 stacks, <font color="a6aafb">Blood Banquet</font> activates, dealing 25<font color="62f8fe"> (+30% Total Magic Power)</font> plus 0.5%-2.5% of the target''s Max HP (scales with level) as <font color="7f62fe">Magic Damage</font> to nearby units (hitting heroes with skills refreshes the duration) and recovering 10<font color="26e407"> (+3% Extra Max HP)</font> HP for Alice every 0.5s.
While <font color="a6aafb">Blood Banquet</font> is active, Alice gains 8% Movement Speed. <font color="a6aafb">Blood Banquet</font> can deal up to 70(+10*Hero Level) <font color="7f62fe">Magic Damage</font> to creeps.'
WHERE skill_name = 'Crimson Blood Banquet' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Alice' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Alice fires blood energy forward, dealing 100<font color="62f8fe"> (+50% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font>. Before the blood energy dissipates, this skill can be cast again to activate <font color="a6aafb">Scarlet Shadow</font>, allowing Alice to blink to the blood energy''s location.'
WHERE skill_name = 'Crimson Gleam' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Alice' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Alice performs a deadly dance, dealing 350<font color="62f8fe"> (+130% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> to nearby enemies and slowing them by 70% for 1s. If <font color="a6aafb">Blood Banquet</font> is active at this time, it also scorches enemies, dealing 300% of <font color="a6aafb">Blood Banquet</font>''s damage and healing Alice for the same amount.'
WHERE skill_name = 'Doom Waltz' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Alice' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Alice surrounds herself with blood, gaining Control Immunity and 50% Damage Reduction while slowing herself by 50%. After 1.5s, she descends with force, dealing 500<font color="62f8fe"> (+150% Total Magic Power)</font><font color="26e407"> (+20% Extra Max HP)</font> <font color="7f62fe">Magic Damage</font> to all enemies in range and immobilizing them for 1s.
While charging her Ultimate, Alice can only use <font color="a6aafb">Scarlet Shadow</font>.'
WHERE skill_name = 'Throne of Ruin' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Alice' AND game_id = 1);

-- Alpha
UPDATE hero_skills 
SET skill_description = 'When Alpha uses a skill, Beta will be summoned to attack. Enemies that are hit by Beta 2 time(s) will be <font color="a6aafb">Locked On</font>.

<font color="a6aafb">Locked On</font>: After Alpha deals damage to the target, Beta will fire a laser at them, dealing 80<font color="fba51f"> (+80% Extra Physical Attack)</font> <font color="ffe63c">(+8*Hero Level)</font> <font color="ffe63c">True Damage</font> and briefly applying a powerful slow effect.
This skill only deals 75% damage to Creeps.'
WHERE skill_name = 'Beta, Advance!' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Alpha' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Alpha unleashes an energy wave in the target direction, dealing 100<font color="fba51f"> (+90% Extra Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to enemies in its path and slowing them by 40% for 1s.

Beta then strafes enemies along the same path, dealing 60<font color="fba51f"> (+30% Extra Physical Attack)</font> <font color="ffe63c">True Damage</font>.'
WHERE skill_name = 'Rotary Impact' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Alpha' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'After a short delay, Alpha swings his blade in the target direction, dealing 180<font color="fba51f"> (+100% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to enemies in a fan-shaped area and restoring 40<font color="fba51f"> (+30% Extra Physical Attack)</font> HP for each enemy hit.

Beta then strafes enemies in the same area, dealing 60<font color="fba51f"> (+30% Total Physical Attack)</font> <font color="ffe63c">True Damage</font>.'
WHERE skill_name = 'Force Swing' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Alpha' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Beta dives to the target location, dealing 100<font color="fba51f"> (+20% Extra Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to enemies hit and stunning them for 1s. Alpha then leaps towards the same location, knocking enemies in his path airborne and carrying them to the landing location. Alpha then slams down, dealing 250<font color="fba51f"> (+100% Extra Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> and slowing the enemies by 40% for 1.5s.

Beta then attacks the same area 5 times, dealing 15<font color="fba51f"> (+30% Extra Physical Attack)</font> <font color="ffe63c">True Damage</font> each time.'
WHERE skill_name = 'Spear of Alpha' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Alpha' AND game_id = 1);

-- Alucard
UPDATE hero_skills 
SET skill_description = 'After each skill cast, Alucard''s next Basic Attack allows him to dash to the target''s location and deal <font color="fba51f"> (+125% Total Physical Attack)</font> Physical Damage.
<font color="a6aafb">Demon Hunter</font>: Alucard deals 10% extra damage to Creeps.'
WHERE skill_name = 'Pursuit' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Alucard' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Alucard rolls to the target location and slams his blade on the ground, dealing 270<font color="fba51f"> (+85% Extra Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to enemies hit and slowing them by 40% for 2s.'
WHERE skill_name = 'Groundsplitter' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Alucard' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Alucard launches a whirling slash, dealing 345<font color="fba51f"> (+120% Extra Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to nearby enemies.'
WHERE skill_name = 'Whirling Smash' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Alucard' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = '<font color="a6aafb">Passive</font>: Alucard permanently gains 10% Hybrid Lifesteal.
<font color="a6aafb">Active</font>: Alucard absorbs the energy of enemies in the target area, reducing their Movement Speed by 30% and Hybrid Defense by 10. Alucard gains 10 Hybrid Defense for each enemy hero hit, and reduces the cooldown of his other skills to 50% for 6s.
<font color="a6aafb">Use Again</font>: Alucard releases a shockwave in the target direction, dealing 400<font color="fba51f"> (+200% Extra Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to enemies hit.'
WHERE skill_name = 'Fission Wave' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Alucard' AND game_id = 1);

-- Angela
UPDATE hero_skills 
SET skill_description = 'Angela gains 5% extra Movement Speed for 4s each time she casts a skill (up to 20%). When she''s attached to an allied hero, the Movement Speed boost is transferred to the allied hero.'
WHERE skill_name = 'Smart Heart' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Angela' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Angela sends <font color="a6aafb">Love Waves</font> in the target direction, dealing 170<font color="62f8fe"> (+80% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> to enemies hit, revealing their positions briefly, and applying a stack of <font color="a6aafb">Lover''s Mark</font> (up to 5 stacks). Each stack of <font color="a6aafb">Lover''s Mark</font> increases the damage by 20% and slows enemies hit by 8% for 3s.

<font color="a6aafb">Love Waves</font> also restore 150<font color="62f8fe"> (+75% Total Magic Power)</font> HP to allied heroes hit. Angela can store up to 5 charges of this skill and the recharge time is affected by Cooldown Reduction.'
WHERE skill_name = 'Love Waves' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Angela' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Angela launches a <font color="a6aafb">Puppet String</font> at the target enemy (excluding minions), dealing 300<font color="62f8fe"> (+40% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> and gradually slowing them by up to 80%. If the enemy is still connected to the string after 3s, they''ll be immobilized for 1.5s and dealt 450<font color="62f8fe"> (+60% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font>.

Each stack of <font color="a6aafb">Lover''s Mark</font> increases the final damage by 20%.'
WHERE skill_name = 'Puppet-on-a-String' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Angela' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Angela begins channeling, applying a 600<font color="62f8fe"> (+150% Total Magic Power)</font> shield that lasts 6s to the target allied hero regardless of distance. After the channeling is complete, she attaches herself to the allied hero for 20s, during which she can cast skills at zero Mana cost.
Angela can cast this skill again to cancel the channeling or detach herself from the allied hero. The attaching state will end early if the allied hero is killed.'
WHERE skill_name = 'Heartguard' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Angela' AND game_id = 1);

-- Argus
UPDATE hero_skills 
SET skill_description = 'When Argus'' Meteoric Sword reaches 100 <font color="a6aafb">Malice Energy</font>, he will launch a <font color="a6aafb">Demonic Slash</font> with his next Basic Attack, dealing 180<font color="fba51f"> (+80% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> and recovering 150<font color="fba51f"> (+10% Total Physical Attack)</font> HP. This attack ignores 40% of the target''s Physical Defense.
Argus'' Meteoric Sword gains 5 <font color="a6aafb">Malice Energy</font> per second and 10 Energy per Basic Attack (critical strikes grant an additional 10 Energy).'
WHERE skill_name = 'Warmonger' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Argus' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Argus stretches out a demonic hand in the target direction, dealing 125<font color="fba51f"> (+60% Extra Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to the first enemy hero or Creep hit, stunning them for 0.7s, and pulling him and the target towards each other. If no enemy is hit, Argus pulls himself toward the hand''s destination instead.
<font color="a6aafb">Use Again</font>: Argus dashes and strikes in the target direction, dealing 175<font color="fba51f"> (+100% Extra Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to enemies along the path.'
WHERE skill_name = 'Demonic Grip' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Argus' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'After a short delay, Argus thrusts his Meteoric Sword in the target direction, dealing 120<font color="fba51f"> (+100% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to enemies hit (200% damage against minions) and reducing their Movement Speed by 80% for 0.8s. The delay time decreases as Argus''s Attack Speed increases. Enemy heroes hit will be <font color="a6aafb">Cursed</font> for 4s, during which they leave a Cursed Trail behind. Argus gains 20% Movement Speed while on a Cursed Trail.
<font color="a6aafb">Meteoric Sword</font> damage counts as Basic Attack damage and can trigger Attack Effects. Hitting heroes restores 100 <font color="a6aafb">Malice Energy</font> (excess is preserved).'
WHERE skill_name = 'Meteoric Sword' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Argus' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Argus removes all debuffs on himself, dealing 150<font color="fba51f"> (+50% Total Physical Attack)</font> <font color="fba51f">Physical Damage</font> to nearby enemies and becoming the <font color="a6aafb">Fallen Angel</font> for 4s (hitting heroes enhances <font color="a6aafb">Warmonger</font>). <font color="a6aafb">Fallen Angel</font>: Gains 40% Movement Speed that decays over 1s; when the transformation ends, he converts all his damage dealt in the Fallen Angel state into HP. If he takes fatal damage in the Fallen Angel state, the duration of the Movement Speed boost will be reset, and he will gain <font color="a6aafb">Death Immunity</font> for 4s. <font color="a6aafb">Enhanced Warmonger</font>: <font color="a6aafb">Demonic Slash</font> grants 50 Malice Energy (50 extra Malice Energy with critical hits).
If <font color="a6aafb">Death Immunity</font> isn''t triggered, the cooldown will be reduced by 50%.'
WHERE skill_name = 'Eternal Evil' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Argus' AND game_id = 1);

-- Arlott
UPDATE hero_skills 
SET skill_description = 'Arlott possesses a demonic eye that will <font color="a6aafb">Mark</font> enemy units near Arlott that become affected by control effects for 7s.
The eye will also automatically <font color="a6aafb">Mark</font> a nearby enemy hero in vision every 7s.'
WHERE skill_name = 'Demon Gaze' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Arlott' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Arlott swings his lance forward, dealing 200<font color="fba51f"> (+60% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> and briefly stunning targets in an area. Targets hit by the farther part of the AOE will be stunned for 1s instead.'
WHERE skill_name = 'Dauntless Strike' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Arlott' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Arlott charges at an enemy, dealing 135<font color="fba51f"> (+60% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> (this skill cannot be interrupted during movement).
If Arlott''s target is <font color="a6aafb">Marked</font>, he gains a brief burst of Movement Speed, and this skill will deal double damage, immediately refresh its cooldown, and recover 70<font color="fba51f"> (+60% Total Physical Attack)</font> HP to Arlott (only restores 50% of that amount when used on a non-hero unit).'
WHERE skill_name = 'Vengeance' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Arlott' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = '<font color="a6aafb">Passive</font>: Each level-up reduces <font color="a6aafb">Demon Gaze</font>''s interval by 1s.
<font color="a6aafb">Active</font>: Arlott cleaves in front of him, dealing 400<font color="fba51f"> (+80% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to targets in the area while pushing them to the end of the AOE and briefly revealing their location (this skill can only be interrupted by Suppression).'
WHERE skill_name = 'Final Slash' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Arlott' AND game_id = 1);

-- Atlas
UPDATE hero_skills 
SET skill_description = 'Atlas generates <font color="a6aafb">Frigid Breath</font> around him for 5s each time he casts a skill. Enemies affected by <font color="a6aafb">Frigid Breath</font> will have their Movement Speed gradually reduced over 2s, after which they''ll be frozen for 0.5s.

Atlas gains 20<font color="26e407"> (+0.5% Extra Max HP)</font>- extra Physical & Magic Defense when <font color="a6aafb">Frigid Breath</font> is present.'
WHERE skill_name = 'Frigid Breath' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Atlas' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Atlas smashes the ground and causes 3 explosions, dealing 400<font color="62f8fe"> (+100% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> to enemies.

<font color="a6aafb">Ejected State</font>: If Atlas is ejected from his Mecha Sentry, both he and his Mecha will cast Annihilate.'
WHERE skill_name = 'Annihilate' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Atlas' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Atlas enters <font color="a6aafb">Ejected State</font>, gaining 40% Movement Speed and immunity to Slowing Effects. In this state, the Mecha Sentry will follow the pilot at an increasing speed (can only be controlled by Suppression). Once they meet, Atlas will return to the Mecha, dealing 320<font color="62f8fe"> (+80% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> to enemies nearby and stunning them for 0.8s.
<font color="a6aafb">Ejected State</font>: Atlas and his Mecha share the same HP bar and reduce 50% of the damage taken in this state.'
WHERE skill_name = 'Perfect Match' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Atlas' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Atlas hurls chains around and starts to channel (can only be interrupted by Suppression), dealing 225<font color="62f8fe"> (+75% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> to enemy heroes hit and slowing them by 40% for 3s.
Use this skill again while channeling: Atlas will drag the targets toward him and plunk them down on the designated location, dealing 360<font color="62f8fe"> (+180% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font>.
Use this skill in <font color="a6aafb">Ejected State</font>: The Mecha Sentry will return to Atlas immediately, but the stun effect will be replaced by 40% Slowing Effect.'
WHERE skill_name = 'Fatal Links' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Atlas' AND game_id = 1);

-- Aulus
UPDATE hero_skills 
SET skill_description = 'Aulus adds a stack of <font color="a6aafb">Fighting Spirit</font> to his axe per second for 3s after dealing damage to any enemy (up to 3 stacks). Each stack grants 15% extra Attack Speed. Aulus also deals 42-210 extra <font color="fb1f1f">Physical Damage</font> with his Basic Attacks at max <font color="a6aafb">Fighting Spirit</font> stacks (scales with level). The damage counts as Attack Effect.'
WHERE skill_name = 'Fighting Spirit' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Aulus' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Aulus removes all Slowing Effects and gains 30% extra Movement Speed and 30% Damage Reduction against attacks from the front for 5s.'
WHERE skill_name = 'Aulus, Charge!' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Aulus' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Aulus brandishes his axe, dealing 200<font color="fba51f"> (+70% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to enemies in a fan-shaped area and slowing them by 20% for 3s. At max stacks of <font color="a6aafb">Fighting Spirit</font>, he deals additional <font color="fb1f1f">Physical Damage</font> equal to 3.5% of the targets'' Max HP. After hitting enemy targets, he enhances his Basic Attacks for 3s. Aulus recovers HP by 50<font color="26e407"> (+1% Total HP)</font> after each Basic Attack.'
WHERE skill_name = 'The Power of Axe' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Aulus' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = '<font color="a6aafb">Passive:</font> Every time Undying Fury is upgraded, Aulus crafts a part for his axe in order. <font color="a6aafb">Blade Craft:</font> His Basic Attacks deal 50 extra <font color="fb1f1f">Physical Damage</font>. <font color="a6aafb">Handle Craft:</font> Permanently increases his Attack Range by 65% and the range of <font color="a6aafb">The Power of Axe</font>. <font color="a6aafb">Hammer Craft:</font> Permanently increases his Physical Penetration by 20%.

<font color="a6aafb">Active:</font> Aulus raises his axe and smashes it to the ground (this skill can only be interrupted by Suppression), dealing 210<font color="fba51f"> (+100% Extra Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to enemies in a line and slowing them by 90% for 0.5s. A burning trail that lasts for 5s is left on the ground, dealing 90<font color="fba51f"> (+40% Extra Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to enemies who walk on it every 0.5s and slowing them by 70%.'
WHERE skill_name = 'Undying Fury' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Aulus' AND game_id = 1);

-- Aurora
UPDATE hero_skills 
SET skill_description = 'Upon taking fatal damage, Aurora freezes herself for 1.5s, becoming invincible during this time and gradually recovering 30% Max HP. This effect has a 150s cooldown.

Aurora''s freeze effects can also affect Turrets.'
WHERE skill_name = 'Pride of Ice' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Aurora' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Aurora summons an icy meteorite to strike at the target location, dealing 400<font color="62f8fe"> (+90% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> and slowing targets hit by 40% for 1s. Afterward, 5 hailstones fall, each dealing 40<font color="62f8fe"> (+10% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font>.'
WHERE skill_name = 'Hailstone Blast' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Aurora' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Aurora blows Frosty Breeze in a fan-shaped area in the target direction, dealing 225<font color="62f8fe"> (+75% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> to enemies hit, and creating a frozen area at the far-end of the attack that deals a total of 225<font color="62f8fe"> (+75% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> to enemies in the area and freezes them for 1s.'
WHERE skill_name = 'Frosty Breeze' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Aurora' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Aurora creates a frost path in the target direction, dealing 100<font color="62f8fe"> (+40% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> to enemies in the path and reducing their Movement Speed by 80% for 1.2s. The frost path gradually becomes glaciers that spread until reaching their maximum size and shattering, dealing 600<font color="62f8fe"> (+150% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> to all enemies in the area and freezing targets for 1s. Every 100 Magic Power that Aurora has will increase the freeze duration by 0.2s.'
WHERE skill_name = 'Frigid Glacier' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Aurora' AND game_id = 1);

-- Badang
UPDATE hero_skills 
SET skill_description = 'Every time Badang''s Basic Attack hits a target, he gains a stack of <font color="a6aafb">Chivalry Fist</font>. After gaining 4 stacks, his next Basic Attack deals 50<font color="fba51f"> (+30% Total Physical Attack)</font> extra <font color="fb1f1f">Physical Damage</font> to enemies hit and knocks them back. Enemies that are knocked into obstacles will be stunned for 0.6s (Minions and Creeps are stunned directly).
<font color="a6aafb">Fist Wind</font> generated by Badang''s skills will trigger this effect directly, and <font color="a6aafb">Fist Wind</font> from his Ultimate increases the stun duration to 1s.'
WHERE skill_name = 'Chivalry Fist' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Badang' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Badang unleashes a gust of <font color="a6aafb">Fist Wind</font> in the target direction, dealing 125<font color="fba51f"> (+90% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to enemies hit, slowing them by 30% for 1.5s, and knocking them back. The <font color="a6aafb">Fist Wind</font> will explode upon hitting an obstacle, dealing 100<font color="fba51f"> (+60% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to nearby enemies. <font color="a6aafb">Fist Wind</font> can trigger attack effects and grants Badang 1 <font color="a6aafb">Chivalry Fist</font> stack upon cast.
Badang stores up to 2 <font color="a6aafb">Fist Wind</font> charges and restores 1 charge every 10.4s.'
WHERE skill_name = 'Fist Wind' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Badang' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Badang dashes in the target direction, dealing 230<font color="fba51f"> (+50% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to enemies in his path while gaining a 350<font color="fba51f"> (+150% Total Physical Attack)</font> shield that lasts 5s. He stops immediately upon hitting an enemy hero, slightly knocking them back while creating an obstacle that lasts 4s behind them. Enemies hit by the obstacle are dealt 130<font color="fba51f"> (+30% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font>.

<font color="a6aafb">Use Again</font>: Badang removes the obstacle he created.'
WHERE skill_name = 'Fist Break' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Badang' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Badang throws a flurry of punches in the target direction, dealing 60<font color="fba51f"> (+54% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to enemies hit multiple times (can trigger attack effects). The <font color="a6aafb">Fist Wind</font> generated by the punches will explode upon hitting an obstacle, dealing 30<font color="fba51f"> (+27% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to nearby enemies.
Badang is immune to control effects for the duration.'
WHERE skill_name = 'Fist Crack' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Badang' AND game_id = 1);

-- Balmond
UPDATE hero_skills 
SET skill_description = 'Balmond recovers 5% Max HP after killing a Minion or Creep, and 20% Max HP after killing a hero.'
WHERE skill_name = 'Bloodthirst' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Balmond' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Balmond charges in the target direction for a set distance or until he hits an enemy hero, dealing 150<font color="fba51f"> (+60% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to enemies along the way. The enemy hero hit will be knocked back slightly, and will have their Movement Speed reduced by 40% and Physical Defense reduced by 40% for 3s.'
WHERE skill_name = 'Soul Lock' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Balmond' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Balmond gains 15% Movement Speed that decays over time and spins with his axe for 3s, dealing 25<font color="26e407"> (+2% Extra Max HP)</font> <font color="fba51f"> (+25% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> per hit to nearby enemies up to 14 times. Each subsequent hit on the same enemy will deal 8.5% increased damage (up to 68%).

The Physical Attack bonus portion of the damage can Crit.'
WHERE skill_name = 'Cyclone Sweep' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Balmond' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Balmond unleashes a huge strike in the target direction (this skill can only be interrupted by Suppression), dealing <font color="ffe63c">True Damage</font> equal to 150<font color="fba51f"> (+70% Total Physical Attack)</font> plus 30% of the target''s lost HP.

This skill only deals up to 1000 damage to non-hero units.'
WHERE skill_name = 'Lethal Counter' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Balmond' AND game_id = 1);

-- Bane
UPDATE hero_skills 
SET skill_description = 'Bane infuses his weapon with a stack of <font color="a6aafb">Tidal Energy</font> each time he uses a skill (up to 2 stacks). Each of his subsequent Basic Attacks consumes a stack to deal <font color="fb1f1f">Physical Damage</font> equal to <font color="fba51f"> (+95% Total Physical Attack)</font> plus 4(+0.4*Hero Level)% of the target''s Max HP to nearby enemies.'
WHERE skill_name = 'Shark Bite' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Bane' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Bane fires his Crab Claw Cannon in the target direction, dealing 150<font color="fba51f"> (+160% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to the first enemy hit and then 150% damage to a random enemy behind them (prioritizes enemy heroes). Enemies hit are slowed by 10<font color="62f8fe"> (+10% Total Magic Power)</font>% for 1s.

Every 100 <font color="fba51f">Physical Attack</font> Bane possesses reduces this skill''s cooldown by an additional 8%.'
WHERE skill_name = 'Crab Claw Cannon' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Bane' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Bane chugs his ale, recovering 200<font color="62f8fe"> (+150% Total Magic Power)</font> plus 5<font color="62f8fe"> (+1.5% Total Magic Power)</font>% of his lost HP and gaining 50% extra Movement Speed that decays over 2.5s.

<font color="a6aafb">Use Again</font>: Bane spits venom in the target direction, dealing 140<font color="62f8fe"> (+130% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> (scales up to 200% with charging time) to enemies in a fan-shaped area.
Every 100 <font color="62f8fe">Magic Power</font> Bane possesses additionally reduces this skill''s cooldown by 7%.'
WHERE skill_name = 'Ale' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Bane' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Bane summons a school of sharks to charge in the target direction, dealing 700<font color="fba51f"> (+80% Total Physical Attack)</font> <font color="62f8fe">(+150% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> to enemies hit, knocking them airborne for 0.6s, and slowing them by 75% (decays over 3s).
This skill deals 40% damage to turrets.'
WHERE skill_name = 'Deadly Catch' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Bane' AND game_id = 1);

-- Barats
UPDATE hero_skills 
SET skill_description = 'Detona gains a stack of <font color="a6aafb">Big Guy</font> for 12s each time it or Barats damages an enemy with their skills (up to 10 stacks). Each stack of <font color="a6aafb">Big Guy</font> increases Detona''s size and grants 4-10 extra Hybrid Defense (scales with the level of <font color="a6aafb">Detona''s Welcome</font>). At max stacks, Detona gains 20% extra Resilience, and its Basic Attacks are replaced with <font color="a6aafb">Trample</font>, which deals <font color="fba51f"> (+140% Total Physical Attack)</font> <font color="26e407">(+3.5% Total HP)</font> <font color="fb1f1f">Physical Damage</font> to enemies in a circular area, slows them by 40% for 0.2s, and refreshes the duration of <font color="a6aafb">Big Guy</font> with each hit.'
WHERE skill_name = 'Big Guy' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Barats' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Detona spits contaminated oil in the target direction, dealing 60<font color="26e407"> (+7% Total HP)</font> <font color="fb1f1f">Physical Damage</font> to enemies in a fan-shaped area. Barats then ignites the oil with a firecracker, dealing 120<font color="fba51f"> (+180% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to enemies in the area (only 50% damage to Creeps).

The area of effect of <font color="a6aafb">So-Called Teamwork</font> increases with the number of <font color="a6aafb">Big Guy</font> stacks.'
WHERE skill_name = 'So-Called Teamwork' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Barats' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Barats fires two missiles at the target location, dealing 100<font color="fba51f"> (+75% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> and slowing enemies by 40% for 1s. The missiles expel fumes from their exhausts upon landing, dealing 100<font color="fba51f"> (+75% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to enemies in a rectangular area and pushing them toward Barats.'
WHERE skill_name = 'Missile "Expert"' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Barats' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'After a short delay, Detona charges in the target direction, dealing 120<font color="fba51f"> (+70% Total Physical Attack)</font> <font color="26e407">(+1.2% Total HP)</font> <font color="fb1f1f">Physical Damage</font> to the first enemy hit, devouring and suppressing them for 1.2s before spitting them out. If the target hits an enemy hero or a wall after being spit out, the target will cause an explosion, they and nearby enemies will take an additional 180<font color="fba51f"> (+105% Total Physical Attack)</font> <font color="26e407">(+5% Total HP)</font> <font color="fb1f1f">Physical Damage</font> and be stunned for 1s.
For the duration, Barats becomes immune to control effects. If the channeling is canceled, 50% of the skill cooldown will be refunded.
<font color="a6aafb">Passive</font>: Detona gains 4 stacks of <font color="a6aafb">Big Guy</font> upon respawn.'
WHERE skill_name = 'Detona''s Welcome' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Barats' AND game_id = 1);

-- Baxia
UPDATE hero_skills 
SET skill_description = 'Baxia activates the "Baxia Mark" permanently, reducing the final damage received by 15(+1*Hero Level).
At the same time, Baxia will reduce the Shield and HP Regen of enemies hit by his skills by 40% for 4s.'
WHERE skill_name = 'Baxia Mark' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Baxia' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Baxia retracts himself into his shield and accelerates forward. When hitting an enemy unit, he will deal 300<font color="62f8fe"> (+60% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> to it and nearby enemies, stunning the target for 0.8s and slightly knocking other nearby enemies back. 
During the process of accelerating forward, use this skill again to launch Baxia upward so that he can cross obstacles and enemy minions. When leaping up, if there is an enemy hero under Baxia, he will strike this hero, dealing 375<font color="62f8fe"> (+75% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> to this hero and nearby enemies, stunning the target hit for 1.5s, and slightly knocking other nearby enemy targets back.'
WHERE skill_name = 'Baxia-Shield Unity' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Baxia' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Baxia throws out his shield, dealing <font color="7f62fe">Magic Damage</font> equal to 180<font color="62f8fe"> (+120% Total Magic Power)</font> plus 6% of the target''s Max HP to the enemies along the way, marking them for 5s, and slowing them by 50% for 1s. The shield disappears upon hitting the first enemy hero or creep.
Baxia can cast the skill again in a short while. If an enemy hero or creep is hit by the skill, the skill''s cooldown will be reduced to 15%.'
WHERE skill_name = 'Shield of Spirit' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Baxia' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Baxia holds his shield to the front and begins sprinting frantically, gaining 30% extra Movement Speed for 10s while leaving a lava path behind. Enemies on the path will take 40<font color="62f8fe"> (+30% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> and be slowed by 15% for 0.5s every 0.5s.
For the duration, the Damage Reduction effect from <font color="a6aafb">Baxia Mark</font> is increased to 200%.'
WHERE skill_name = 'Tortoise’s Puissance' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Baxia' AND game_id = 1);

-- Beatrix
UPDATE hero_skills 
SET skill_description = 'Her extraordinary talent in the field of mechanics allowed Beatrix to produce 4 weapon(s) of truly awe-inspiring firepower.
<font color="a6aafb">Renner</font> Basic Attack - Longshot: Fire a powerful shot in the enemy''s current direction, dealing <font color="fba51f"> (+365% Total Physical Attack)</font> -<font color="fba51f"> (+400% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to the first target hit (this shot can be dodged, and blocked by others). Deals 75% damage to Creeps.<font color="a6aafb">Bennett</font> Basic Attack - Area Bombing: Bombard an area, dealing <font color="fba51f"> (+230% Total Physical Attack)</font> -<font color="fba51f"> (+300% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to all enemies in range and slowing them by 40% for 0.5s. Deals 75% damage to Creeps.<font color="a6aafb">Wesker</font> Basic Attack - Proximity Advantage: Fire 5 shots at the target, each dealing <font color="fba51f"> (+178% Total Physical Attack)</font> -<font color="fba51f"> (+220% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> (inherits a portion of Attack Effects). Damage dealt to targets hit multiple times will decay to 25%. Deals 75% damage to Creeps.<font color="a6aafb">Nibiru</font> Basic Attack - Rapid Fire: Lets loose a volley of 4 shots at the target, each shot dealing <font color="fba51f"> (+51% Total Physical Attack)</font> -<font color="fba51f"> (+65% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> (inherits a portion of Attack Effects). Deals 75% damage to Creeps.
Beatrix cannot Crit, and converts every 1% Critical Chance gained into 2 Physical Attack.'
WHERE skill_name = 'Mechanical Genius' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Beatrix' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = '<font color="a6aafb">Passive</font>: Beatrix can carry 2 weapons at once, and increase her <font color="fba51f">Physical Attack</font> by 5.
<font color="a6aafb">Active</font>: Beatrix takes 0.5s to swap her primary weapon with the secondary she has slung over her back, gaining an all-new way to attack and Ultimate.'
WHERE skill_name = 'Masterful Gunner' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Beatrix' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Beatrix rolls forward while fully reloading her current weapon.'
WHERE skill_name = 'Tactical Reposition' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Beatrix' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Beatrix calmly sets up <font color="a6aafb">Renner</font> on the battlefield and takes aim. When releasing the skill, she deals 700<font color="fba51f"> (+280% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to the first enemy hit.

Beatrix can aim for up to 8s, and she can cancel it early to reduce the cooldown by 50%.

This shot can penetrate Minions and only deals 75% damage to non-hero units.'
WHERE skill_name = 'Renner''s Apathy' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Beatrix' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Having escaped battle for 3s, Beatrix can call for her butler Morgan to provide her with a backup weapons crate.
Beatrix must then choose two from the crate to serve as her primary and secondary weapons.
Her weapon selection is interrupted if she commits any action or is controlled during this period.'
WHERE skill_name = 'Need Backup' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Beatrix' AND game_id = 1);

-- Belerick
UPDATE hero_skills 
SET skill_description = 'For every 50 damage inflicted upon Belerick, he has a 25% chance to shoot the nearest enemy unit, dealing <font color="7f62fe">Magic Damage</font> equal to 55(+5*Hero Level) plus 1.8% of his Max HP (scales with level). This attack can be triggered once every 0.4s.
His HP obtained from Equipment and Emblems is increased by 30%.'
WHERE skill_name = 'Deadly Thorns' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Belerick' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Belerick releases vines in a designated direction, dealing 200<font color="62f8fe"> (+50% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> to enemies along the path and slowing them by 25%. Ancient Seeds left by the vines will erupt into thorns after 1s, dealing 200<font color="62f8fe"> (+50% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> to enemies on the path and taunting them for 1.2s.

Deals 80% extra damage against Minions.'
WHERE skill_name = 'Ancient Seed' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Belerick' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Belerick increases his Movement Speed by 80% and enhances his next Basic Attack. (The Movement Speed gained will decrease in 2s.)
This enhanced Basic Attack deals 300<font color="62f8fe"> (+60% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> and slows the target by 60% for 1.4s. Belerick also recovers HP equal to 240 plus 10% of his lost HP.
Each time Deadly Thorns is triggered, reduce the cooldown of this skill by 1s.'
WHERE skill_name = 'Nature''s Strike' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Belerick' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Belerick conjures spreading vines around him, dealing 100<font color="62f8fe"> (+30% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> to enemies in the area 4 times, taunting and slowing them for 1.5s.'
WHERE skill_name = 'Wrath of Dryad' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Belerick' AND game_id = 1);

-- Benedetta
UPDATE hero_skills 
SET skill_description = 'When holding down the <font color="a6aafb">Basic Attack</font> button, Benedetta enters the Swordout state and charges up Sword Intent. If the <font color="a6aafb">Basic Attack</font> button is released after the Sword Intent is fully charged, Benedetta will use Swordout Slash in <font color="a6aafb">the direction she''s facing</font> and dash forward, dealing <font color="fba51f"> (+200% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to enemies on the path (counts as Skill Damage and is reduced to 50% on Minions and Creeps).

Benedetta can only use Swordout Slash when her Sword Intent is fully charged and she is in Swordout state by holding down the <font color="a6aafb">Basic Attack</font> button.

Benedetta also gains Sword Intent by dealing damage with her Basic Attacks and skills.'
WHERE skill_name = 'Elapsed Daytime' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Benedetta' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Benedetta withdraws swiftly and leaves a shadow in front. After a short delay, her shadow slashes forward in a fan-shaped area, dealing 200<font color="fba51f"> (+75% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> and slowing the enemies by 60% for 0.5s.

Meanwhile, Benedetta dashes forward to slash, dealing 75<font color="fba51f"> (+100% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font>. (If the target is hit by her shadow, damage caused by Benedetta herself will increase to 200%.)'
WHERE skill_name = 'Phantom Slash' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Benedetta' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Benedetta raises her weapon to defend, gaining Control Immunity and blocking damage from any source for 0.8s. After this, she stabs in the designated direction, dealing 300<font color="fba51f"> (+80% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font>.

If Benedetta successfully fends off any damage while defending, she will gain full <font color="a6aafb">Sword Intent</font>. If she fends off any control effects, her subsequent stab stuns the target for 1.5s.'
WHERE skill_name = 'An Eye for An Eye' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Benedetta' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Benedetta clenches Alecto, dashes forward (Benedetta is untargetable during the dash), and performs a slash after a short delay, detonating the Sword Intent along the path. For 2.5s, the Sword Intent deals up to a total of 1560<font color="fba51f"> (+1105% Extra Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to enemies within and slows them by 50%.'
WHERE skill_name = 'Alecto: Final Blow' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Benedetta' AND game_id = 1);

-- Brody
UPDATE hero_skills 
SET skill_description = 'With his Basic Attacks resonated with the Abyss Power within his body, Brody is able to move while winding up his Basic Attacks (which will be interrupted when casting skills), at the cost of having longer Basic Attack Animation and lower Attack Speed Bonus. Each Basic Attack deals <font color="fba51f"> (+140% Total Physical Attack)</font> <font color="ffe63c">(+45*Hero Level)</font> <font color="fb1f1f">Physical Damage</font> (of which the damage scaling with level cannot be critical), increases Movement Speed by 30% (which will decay rapidly in 1.2s), and applies 1 stack of <font color="a6aafb">Abyss Mark</font> on the enemy, capped at 4 stacks.
Each stack of <font color="a6aafb">Abyss Mark</font> increases Brody''s damage against the target by 5% and his Movement Speed by 5%.'
WHERE skill_name = 'Abyss Corrosion' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Brody' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Brody launches a shock wave in the designated direction, dealing 150<font color="fba51f"> (+170% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font>, slowing the enemies by 30% for 1.2s, and applying 1 stack of <font color="a6aafb">Abyss Mark</font>.

As the shock wave travels, for each enemy it hits, it deals an extra 10% damage, inflicts extra 5% slow effect, and applies an additional stack of <font color="a6aafb">Abyss Mark</font>, capped at 130% damage, 45% slow effect, and 4 stacks. This skill deals only 80% damage to Minions.'
WHERE skill_name = 'Abyss Impact' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Brody' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Brody dashes to an enemy, dealing 200<font color="fba51f"> (+70% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to the target, stunning the target for 0.8s, and applying 1 stack of <font color="a6aafb">Abyss Mark</font> on the target.
Upon hitting the target, he is able to move one more time in the movement direction, gaining 45% Movement Speed that will decay rapidly in 1.2s.'
WHERE skill_name = 'Corrosive Strike' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Brody' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Brody locks on all the targets within 8 unit(s), dealing 300<font color="fba51f"> (+165% Extra Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to them. If the target has an <font color="a6aafb">Abyss Mark</font>, all <font color="a6aafb">Abyss Marks</font> will be reset, dealing <font color="fb1f1f">Physical Damage</font> equal to 136<font color="fba51f"> (+72% Extra Physical Attack)</font> plus 4% of the target''s lost HP for each stack the target has.'
WHERE skill_name = 'Torn-Apart Memory' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Brody' AND game_id = 1);

-- Bruno
UPDATE hero_skills 
SET skill_description = 'Bruno gains 2.5% extra Crit Chance each time he deals damage with his skills (up to 8 stacks).

Bruno has higher Physical Attack but only gains 80% extra Attack Speed from all sources.'
WHERE skill_name = 'Mecha Legs' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Bruno' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Bruno kicks a Powerball on his next Basic Attack, dealing 100<font color="fba51f"> (+100% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to the target, slowing them by 30%, and speeding up by 30% for 0.5s.

The Powerball then bounces back toward Bruno and lands on the ground. He or allied heroes can retrieve the Powerball for another attack and reduce the cooldown of <font color="a6aafb">Flying Tackle</font> by 1s.'
WHERE skill_name = 'Volley Shot' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Bruno' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Bruno makes a slide tackle in the target direction, dealing 140<font color="fba51f"> (+40% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to enemies in his path and stunning them for 0.5s.

If the Powerball is bouncing back, Bruno also draws the Powerball toward him.'
WHERE skill_name = 'Flying Tackle' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Bruno' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Bruno kicks his Energy Ball at the target enemy hero, dealing 250<font color="fba51f"> (+83% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> and knocking them back. The Energy Ball then bounces between nearby enemies up to 10 times, each time dealing 150<font color="fba51f"> (+50% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font>. Each hit also reduces the enemy''s Physical Defense by 4% for 8s (up to 3 stacks).'
WHERE skill_name = 'Worldie' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Bruno' AND game_id = 1);

-- Carmilla
UPDATE hero_skills 
SET skill_description = 'Each time Carmilla deals damage to an enemy hero, she steals 7-11 Physical & Magic Defense (scales with level) from them. The stolen Physical & Magic Defense can stack up to 5 times and lasts 5s. However, Carmilla can only steal defense from the same enemy hero once every 3s.'
WHERE skill_name = 'Vampire Pact' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Carmilla' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Carmilla summons three Crimson Flowers that circle around her for 5s, dealing 65<font color="62f8fe"> (+30% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> each time they hit an enemy and slowing them by 6% for 0.8s (the slow effect stacks up to 30%).

Carmilla recovers 45<font color="62f8fe"> (+21% Total Magic Power)</font> HP each time a Crimson Flower deals damage (only recovers 30% of that amount when hitting minions).'
WHERE skill_name = 'Crimson Flower' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Carmilla' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Carmilla accumulates Bloodbath Energy, gaining 70% Movement Speed that decays over 4.5s.

<font color="a6aafb">Use Again</font>: Carmilla unleashes the accumulated Bloodbath Energy on the target enemy hero or Creep, dealing 150<font color="62f8fe"> (+120% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> and stunning them for 0.6s. The damage and stun duration scale with the accumulation time (up to 100%).'
WHERE skill_name = 'Bloodbath' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Carmilla' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Carmilla casts Curse of Blood on the target location, slowing enemies hit by 50%. After 0.8s, enemies still within the area will take 450<font color="62f8fe"> (+130% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font>, and will be immobilized for 1s, slowed by 30% and linked for 5s.

When a linked enemy takes damage or becomes controlled, all the other linked targets take 50% of the damage and become controlled for 100% of the duration. Enemies can move away from one another to break the link.'
WHERE skill_name = 'Curse of Blood' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Carmilla' AND game_id = 1);

-- Cecilion
UPDATE hero_skills 
SET skill_description = 'Cecilion gains 10 extra Max Mana and recovers 10 Mana each time his skill hits an enemy. Cooldown: 1s.

Cecilion has higher Max Mana and Mana Regen, and his skill damage scales with his Max Mana.'
WHERE skill_name = 'Overflowing' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Cecilion' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Cecilion commands a giant bat to dive at the target location, gaining 30% extra Movement Speed for 1s, dealing 85<font color="62f8fe"> (+70% Total Magic Power)</font> <font color="a6aafb">(+7% Total Mana)</font> <font color="7f62fe">Magic Damage</font> to enemies in its path. The bat also deals 170<font color="62f8fe"> (+140% Total Magic Power)</font> <font color="a6aafb">(+14% Total Mana)</font> extra <font color="7f62fe">Magic Damage</font> to those near the landing point, and applies <font color="a6aafb">Overflowing</font> effect once.

Each subsequent cast within 6s increases this skill''s Mana cost by 1.5 times (up to 4 stacks).'
WHERE skill_name = 'Bat Impact' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Cecilion' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Cecilion summons a pair of opposing claws at the target location that will clasp together after a short delay, pulling enemies in their paths to the center while dealing them 200<font color="62f8fe"> (+45% Total Magic Power)</font> <font color="a6aafb">(+1.2% Total Mana)</font> <font color="7f62fe">Magic Damage</font> and immobilizing them for 1s.'
WHERE skill_name = 'Sanguine Claws' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Cecilion' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Cecilion unleashes his Blood Demon power, gaining 60% extra Movement Speed (decays over the duration) and Slow Immunity for 1.5s. Meanwhile, he fires 36 bolts of blood energy at nearby enemies, each dealing 35<font color="62f8fe"> (+8% Total Magic Power)</font> <font color="a6aafb">(+0.3% Total Mana)</font> <font color="7f62fe">Magic Damage</font> to the enemy hit and slowing them by 3% (up to 30%) for 1s.

Each bolt also restores 10 plus 1% of Cecilion''s lost HP for him on hit.'
WHERE skill_name = 'Bats Feast' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Cecilion' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'When Carmilla is nearby, Cecilion can summon her to become a Vermil Shadow around him, granting him a 520-800 shield (scales with Carmilla''s level).
Carmilla can choose to leave Cecilion and charge at the target location, gaining an equal shield while dealing 520-800 <font color="7f62fe">Magic Damage</font> (scales with level) to nearby enemies and slowing them by 30% for 1s.'
WHERE skill_name = 'Moonlit Waltz' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Cecilion' AND game_id = 1);

-- Chang'e
UPDATE hero_skills 
SET skill_description = 'Each time Chang''e deals damage to an enemy, she leaves a mark on them. Each mark reduces the target''s Movement Speed by 1%, stacking up to 20%.'
WHERE skill_name = 'Trouble Maker' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Chang''e' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Chang''e sends an energy sphere in the target direction, dealing 350<font color="62f8fe"> (+130% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> to enemies in its path and slowing them by 10% for 1.5s.

<font color="a6aafb">Crescent Moon</font>: The <font color="a6aafb">Crescent Moon</font> sends 4 extra energy spheres along with Chang''e''s, each dealing 20% damage and slowing enemies hit. The slow effect can stack (up to 20%).'
WHERE skill_name = 'Starmoon Shockwave' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Chang''e' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Chang''e summons the <font color="a6aafb">Crescent Moon</font>, gaining a permanent 300<font color="62f8fe"> (+150% Total Magic Power)</font> shield and 10% Movement Speed (that lasts until the shield is destroyed). Each time Chang''e casts a skill, she also gains 50% Movement Speed that decays over 2.5s. <font color="a6aafb">Crescent Moon</font> also allows Chang''e''s Basic Attacks to deal 20<font color="62f8fe"> (+35% Total Magic Power)</font> additional <font color="7f62fe">Magic Damage</font> 2 times.

Each time Chang''e deals Magic Damage with her Basic Attack and skills, the cooldown of this skill is reduced by 0.2s.'
WHERE skill_name = 'Crescent Moon' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Chang''e' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Chang''e fires 30 meteors in the target direction over 4s, each dealing 60<font color="62f8fe"> (+21% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> to the first enemy hit. This skill deals 100% extra damage to Minions and Creeps. Chang''e also gains 10% Movement Speed for the duration.

<font color="a6aafb">Crescent Moon</font>: The <font color="a6aafb">Crescent Moon</font> also fires meteors along with Chang''e, each dealing 33% damage.'
WHERE skill_name = 'Meteor Shower' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Chang''e' AND game_id = 1);

-- Chip
UPDATE hero_skills 
SET skill_description = 'Chip starts eating potato chips once every 2s when out of combat, regenerating HP equal to 300 plus 45% of lost HP after finishing a whole bag (requires 4 bites). After eating a bag of chips, Chip will be full and cannot eat again for 5s. (The bite count will be saved if he enters combat before finishing a whole bag.)'
WHERE skill_name = 'Snack Time!' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Chip' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Chip rams his hovercraft into the ground, dealing <font color="7f62fe">Magic Damage</font> equal to 100 plus 4% of the target''s Max HP and applying <font color="a6aafb">Chip''s Mark</font> on enemy units hit. Chip gains a 300<font color="62f8fe"> (+60% Total Magic Power)</font> Shield upon hitting an enemy hero, which increases by 40% for each additional enemy hero hit. Chip''s next Basic Attack will become ranged and also hit all nearby enemies with <font color="a6aafb">Chip''s Mark</font>, detonating the mark to deal 150<font color="62f8fe"> (+30% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> and stun each target for 0.6s.'
WHERE skill_name = 'Crash Course' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Chip' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Chip rushes for 2s, gaining up to 65% extra Movement Speed, after which he maintains the max speed for 2s.

Chip''s next Basic Attack will cause him to charge at the enemy, dealing 200<font color="62f8fe"> (+30% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> and knocking them back slightly.'
WHERE skill_name = 'Overtime' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Chip' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Chip drops the <font color="a6aafb">Main Portal</font> on an enemy hero, dealing 200<font color="62f8fe"> (+60% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> and briefly slowing them by 25%. The Main Portal deals 2 times the damage and immobilizes them for 1s after a delay. Meanwhile, he creates <font color="a6aafb">Connecting Portals</font> near allied heroes 10 units away and behind the allied Base. The <font color="a6aafb">Main Portal</font> and <font color="a6aafb">Connecting Portals</font> last up to 15s.
<font color="a6aafb">Connecting Portal</font>: Heroes (on both teams) can teleport from <font color="a6aafb">Connecting Portals</font> to the <font color="a6aafb">Main Portal</font>, and allied heroes gain Burst Movement Speed for 1.5s and a 500 shield.
<font color="a6aafb">Main Portal</font>: The Main Portal inherits 70% of Chip''s attributes. Heroes can stand on the <font color="a6aafb">Main Portal</font> for 2s to return to the <font color="a6aafb">Connecting Portal</font> they came from. Casting skills or launching Basic Attacks will reset the stand time.'
WHERE skill_name = 'Shortcut' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Chip' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Chip has 4 fixed <font color="a6aafb">Beacons</font> on the map when the battle starts. Use this skill to teleport to any other <font color="a6aafb">Beacon</font>. (This skill cannot be used in combat.)'
WHERE skill_name = 'Why Walk?' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Chip' AND game_id = 1);

-- Chou
UPDATE hero_skills 
SET skill_description = 'After traveling 5 units, Chou deals 180% damage on his next Basic Attack (cannot Crit), briefly slows the target by 90% and reduces their Physical Defense by 10(+1*Hero Level) for 3s (up to 2 stacks).'
WHERE skill_name = 'Only Fast' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Chou' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Chou strikes in the target direction, dealing 180<font color="fba51f"> (+70% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to enemies hit. This skill can be cast 3 times before it goes on cooldown. On the 3rd cast, Chou also knocks enemies hit airborne.

Hitting an enemy hero with the 3rd cast resets the cooldown of <font color="a6aafb">Shunpo</font>.'
WHERE skill_name = 'Jeet Kune Do' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Chou' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Chou charges in the target direction, gaining Control Immunity and a 200<font color="fba51f"> (+200% Extra Physical Attack)</font> shield.'
WHERE skill_name = 'Shunpo' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Chou' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Chou strikes a roundhouse kick at the target enemy hero, dealing them 400<font color="fba51f"> (+200% Extra Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> and knocking them back.

Cast the skill again to chase up the target, dealing a total of 480<font color="fba51f"> (+240% Extra Physical Attack)</font> <font color="fb1f1f">Physical Damage</font>.'
WHERE skill_name = 'The Way of Dragon' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Chou' AND game_id = 1);

-- Cici
UPDATE hero_skills 
SET skill_description = 'Cici generates a stack of Delight after dealing damage, increasing her Movement Speed by 0.75% and Spell Vamp by 0.75% per stack up to 10 times, doubling the effects at full stacks.'
WHERE skill_name = 'Performer''s Delight' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Cici' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Cici uses Yoyo to continuously attack the nearest enemy within range (prioritizing heroes) for 3.5s, hitting them up to 10 times, and dealing <font color="fb1f1f">Physical Damage</font> equal to 60 plus 3<font color="fba51f"> (+1.2% Extra Physical Attack)</font>% of the target''s Max HP per hit. Cici can move and use other skills during this attack.

If there is no enemy within range, Yoyo will attack Turrets or the Base instead.

This skill deals 20% extra damage to Minions.'
WHERE skill_name = 'Yo-Yo Blitz' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Cici' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Cici leaps to a target location. If she lands on any unit (not including Turrets and Base), she can leap again in the Joystick''s direction. If she lands on an enemy with the first leap, she deals 200<font color="fba51f"> (+40% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to them.'
WHERE skill_name = 'Buoyant Bounce' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Cici' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Cici throws Yoyo at the target enemy hero and links them with another nearby enemy hero, dealing 100<font color="fba51f"> (+10% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font>, slowing them by 30%, and pulling them together for 4s. 

During this time, Cici can use <font color="a6aafb">Yo-Yo Blitz</font> to attack both linked targets at the same time. If only one target is within the range of <font color="a6aafb">Yo-Yo Blitz</font>, Cici will attack the target twice, but the damage of the second attack will be reduced to 25%.'
WHERE skill_name = 'Curtain Call' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Cici' AND game_id = 1);

-- Claude
UPDATE hero_skills 
SET skill_description = '<font color="a6aafb">Dexter</font> assists Claude on each of his Basic Attacks, dealing 25<font color="fba51f"> (+25% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to the same target (inherits a portion of Attack Effects).'
WHERE skill_name = 'Battle Side-by-side' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Claude' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Claude emits a disruption wave in the target direction, dealing 250<font color="fba51f"> (+40% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to enemies in a fan-shaped area and reducing their Movement Speed by 20% and Attack Speed by 10%.

For each enemy hit, Claude gains 4% Movement & Attack Speed (doubled for enemy heroes hit) for 6s (up to 5 stacks).'
WHERE skill_name = 'Art of Thievery' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Claude' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Claude conjures a mirror image of <font color="a6aafb">Dexter</font> at the target location that automatically attacks nearby enemies for 5.5s. The mirror image''s Basic Attack deals 25<font color="fba51f"> (+25% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> and can trigger Claude''s attack effects.

<font color="a6aafb">Use Again</font>: Claude switches places with the mirror image.'
WHERE skill_name = 'Battle Mirror Image' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Claude' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Claude and <font color="a6aafb">Dexter</font> rapidly fire at nearby enemies for 3s, dealing 140<font color="fba51f"> (+10% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to up to two enemies with each shot (these attacks count as Basic Attacks). Claude also gains a 20<font color="fba51f"> (+3% Total Physical Attack)</font> shield each time the Ultimate deals damage to an enemy.'
WHERE skill_name = 'Blazing Duet' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Claude' AND game_id = 1);

-- Clint
UPDATE hero_skills 
SET skill_description = 'After each skill cast, Clint''s next Basic Attack within 4s penetrates a line of enemies, dealing 150<font color="fba51f"> (+100% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font>. This damage can trigger attack effects, and the part affected by Physical Attack can Crit.'
WHERE skill_name = 'Double Shot' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Clint' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Clint fires 5 bullets in quick succession in the target direction, each dealing 250<font color="fba51f"> (+85% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to the enemy hit.

The bullets will spread evenly across enemies in a fan-shaped area. Enemies hit by multiple bullets will take less damage after the first bullet.'
WHERE skill_name = 'Quick Draw' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Clint' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Clint shoots a trap net in the target direction, slightly jumping back while dealing 140<font color="fba51f"> (+30% Total Physical Attack)</font><font color="62f8fe"> (+150% Total Magic Power)</font> <font color="fb1f1f">Physical Damage</font> to the first enemy hit and immobilizing them for 1.2s.

Successfully hitting an enemy reduces the cooldown of this skill by 40%.'
WHERE skill_name = 'Trapping Recoil' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Clint' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Clint launches a grenade in the target direction that explodes on the first enemy hit, dealing 280<font color="fba51f"> (+100% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> and slowing them by 50% for 0.5s.

Clint gains a grenade charge every 10s (up to 3).'
WHERE skill_name = 'Grenade Bombardment' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Clint' AND game_id = 1);

-- Cyclops
UPDATE hero_skills 
SET skill_description = 'Each time Cyclops hits an enemy with his skills, all his skill cooldowns are reduced by 0.5s.'
WHERE skill_name = 'Starlit Hourglass' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Cyclops' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Cyclops casts two Stardust Disks in the target direction, each dealing 275<font color="62f8fe"> (+60% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> to enemies in its path.'
WHERE skill_name = 'Stardust Shock' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Cyclops' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Cyclops conjures Starlit Spheres around himself while gaining 50% Movement Speed that decays over 2s. The spheres will automatically seek and attack nearby enemies (prioritizes enemy heroes), exploding on collision and dealing 200<font color="62f8fe"> (+40% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> to the enemy. Enemies hit by multiple spheres will take reduced damage after the first hit.'
WHERE skill_name = 'Planets Attack' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Cyclops' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Cyclops creates a Planetary Sphere and sends it after the target enemy hero or Creep, dealing 500<font color="62f8fe"> (+120% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> and immobilizing them for 0.75-1.5s (increases with travel distance).'
WHERE skill_name = 'Star Power Lockdown' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Cyclops' AND game_id = 1);

-- Diggie
UPDATE hero_skills 
SET skill_description = 'Upon death, Diggie reverses time and turns back to egg form, in which he can continue to move around and gains a new set of skills. He cannot be targeted in egg form and will revive after a period of time.'
WHERE skill_name = 'Young Again' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Diggie' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Diggie flings an owl alarm to the target location that remains stationary for 25s or until it reacts to the first enemy in range, chasing them and exploding upon collision. The explosion deals 350<font color="62f8fe"> (+100% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> to enemies hit and slows them by 30%.

Diggie gains 2 stacks of <font color="a6aafb">Dangerous Sparks</font> each time an enemy hero is hit by the explosion (up to 60 stacks), each stack increasing the skill''s damage by 1%. He loses half the stacks upon death, but can gain 1 stack of <font color="a6aafb">Dangerous Sparks</font> each time his skill hits an enemy hero when in egg form.

Up to 5 owl alarms can exist at the same time.'
WHERE skill_name = 'Auto Alarm Bomb' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Diggie' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Diggie marks the target enemy hero for 4s and pulls them back to their previous location after the duration ends, dealing 150<font color="62f8fe"> (+100% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> and briefly slowing them by 80%.

If the enemy moves out of the circle, the pull will be triggered early.'
WHERE skill_name = 'Reverse Time' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Diggie' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Diggie removes all debuffs on nearby allied heroes (including himself) and grants them a 650<font color="62f8fe"> (+300% Total Magic Power)</font> shield and Control Immunity for 2s. He also gains 50% Movement Speed for 0.5s.'
WHERE skill_name = 'Time Journey' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Diggie' AND game_id = 1);

-- Dyrroth
UPDATE hero_skills 
SET skill_description = 'When Dyrroth''s Rage reaches 50%, he will enhance <font color="a6aafb">Burst Strike</font> and <font color="a6aafb">Spectre Step</font>.
After every 2 Basic Attacks, Dyrroth will release Circle Strike, dealing <font color="fba51f"> (+160% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to enemies in the circle and recovering <font color="26e407">(20 + 8% of his Max HP)</font> (halved against Minions) (Circle Strike doesn''t have Attack Effect). Each time he hits an enemy hero, the cooldown of <font color="a6aafb">Burst Strike</font> and <font color="a6aafb">Spectre Step</font> will be reduced by 1s.'
WHERE skill_name = 'Wrath of the Abyss' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Dyrroth' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Dyrroth releases a burst strike in a designated direction. Each burst deals 200<font color="fba51f"> (+60% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to enemies and slows them by 25% for 1.5s. (The damage decays against the same target and decreases to only 75% on minions.)

<font color="a6aafb">Abyss Enhanced</font>: Burst Strike has a longer range, deals 140% of the original damage, and its Slowing Effect is doubled.'
WHERE skill_name = 'Burst Strike' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Dyrroth' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Dyrroth dashes in the designated direction. He will stop when he has traveled the max distance or hits one enemy hero or a Creep, dealing 230<font color="fba51f"> (+60% Extra Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to the target and slightly knocking them back. When he uses this skill again, he will lock onto a target and release a Fatal Strike, dealing 345<font color="fba51f"> (+120% Extra Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> and reducing the target''s Physical Defense by 40% for 4s.
<font color="a6aafb">Abyss Enhanced</font>: Fatal Strike will reach further and deal 150% of the original damage, slow the target by an extra 90% and reduce the target''s Physical Defense by 60% for 4s.'
WHERE skill_name = 'Spectre Step' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Dyrroth' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'After a short delay, Dyrroth launches a destructive strike in the target direction (this skill can only be interrupted by Suppression), dealing 650<font color="fba51f"> (+250% Extra Physical Attack)</font> plus 20% of the target''s lost HP as <font color="fb1f1f">Physical Damage</font> to enemies in its path, and slowing them by 55% for 0.8s. This skill deals up to 1500 damage to non-hero enemies.'
WHERE skill_name = 'Abysm Strike' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Dyrroth' AND game_id = 1);

-- Edith
UPDATE hero_skills 
SET skill_description = 'After each skill cast, Edith and Phylax become Overloaded for 3s, during which all Basic Attacks will trigger chain lightning, dealing extra <font color="7f62fe">Magic Damage</font> equal to <font color="62f8fe"> (+20% Total Magic Power)</font> plus 3(+0.2*Hero Level)% of the target''s Max HP to up to 4 enemies.
Chain lightning damage against Minions is increased to 150%.'
WHERE skill_name = 'Overload' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Edith' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'After a 0.75s delay, Edith controls Phylax to launch an earth-shattering blow in a designated direction, dealing 225<font color="26e407"> (+10% Total HP)</font> <font color="fb1f1f">Physical Damage</font> to enemies hit (deals 120% damage to minions) and knocking them airborne for 0.8s.
This skill can only be interrupted by Suppression.'
WHERE skill_name = 'Earth Shatter' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Edith' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Edith controls Phylax to charge in the target direction, dealing 90<font color="26e407"> (+3% Total HP)</font> <font color="fb1f1f">Physical Damage</font> to enemies along the way.

If Phylax hits an enemy hero during the charge, it will stop immediately and throw them over its shoulder, dealing 108<font color="26e407"> (+5% Total HP)</font> <font color="fb1f1f">Physical Damage</font>.'
WHERE skill_name = 'Onward' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Edith' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = '<font color="a6aafb">Passive:</font> When inside Phylax, Edith can accumulate Wrath according to the damage she receives (calculated before damage reduction).

<font color="a6aafb">Active:</font> Edith ejects herself forward from Phylax, knocking back nearby enemies. After that, she takes flight and can perform ranged Basic Attacks, each dealing 35<font color="fba51f"> (+75% Total Physical Attack)</font> <font color="62f8fe">(+25% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font>. Edith also gains new skills in this state. When in flight, Edith gains 350<font color="26e407"> (+5% Total HP)</font>-350<font color="26e407"> (+20% Total HP)</font> extra Shield, 50%-150% extra Attack Speed and 5%-20% Hybrid Lifesteal based on the Wrath she accumulated, and converts each point of <font color="26e407">Extra Physical Defense</font> and <font color="26e407">Extra Magic Defense</font> into 3.5 <font color="62f8fe">Magic Power</font>. The flight state lasts up to 8s.'
WHERE skill_name = 'Primal Wrath' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Edith' AND game_id = 1);

-- Esmeralda
UPDATE hero_skills 
SET skill_description = 'Esmeralda manipulates Stardust and Frostmoon: Stardust deals Physical Damage while Frostmoon deals Magic Damage and gives the target a shield equal to 135% of Frostmoon''s damage dealt. Each Basic Attack deals <font color="fba51f"> (+100% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> and 100<font color="62f8fe"> (+75% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font>.
The damage dealt by Esmeralda ignores all shield effects and gradually converts her shield into HP.'
WHERE skill_name = 'Starmoon Casket' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Esmeralda' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Esmeralda gains 400<font color="62f8fe"> (+150% Total Magic Power)</font> Shield and 40% Movement Speed which rapidly decays over its duration for 4s. Meanwhile, she gradually transforms the shields of her nearby enemies into her own shield, capped at 50% of her Max HP.'
WHERE skill_name = 'Frostmoon Shield' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Esmeralda' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Esmeralda waves Stardust and Frostmoon, dealing 240<font color="fba51f"> (+60% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> and 300<font color="62f8fe"> (+120% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> to nearby enemies. Each time she deals damage to a hero, the cooldown of <font color="a6aafb">Frostmoon Shield</font> is reduced by 1.5s (damaging non-hero units grants a 0.5s reduction) and the enemy''s Movement Speed is reduced by 10% for 1.5s.'
WHERE skill_name = 'Stardust Dance' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Esmeralda' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Esmeralda coheres the power of Astrospace into her two weapons - Stardust and Frostmoon. The longer this skill is channeled, the longer the cast range.

<font color="a6aafb">Use Again</font>: Esmeralda casts Stardust at the target location, dealing 350<font color="fba51f"> (+90% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font>, and then blinks to the target location and casts Frostmoon, dealing 350<font color="62f8fe"> (+140% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> and immobilizing enemies in the area for 1s.'
WHERE skill_name = 'Falling Starmoon' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Esmeralda' AND game_id = 1);

-- Estes
UPDATE hero_skills 
SET skill_description = '<font color="a6aafb">Scripture of the Moon Elf</font> will charge energy into Estes slowly. When it reaches 100 stacks, it will improve his next Basic Attack, dealing 250<font color="fba51f"> (+100% Total Physical Attack)</font> <font color="62f8fe">(+150% Total Magic Power)</font> points of <font color="7f62fe">Magic Damage</font> to the target. The damage will ricochet, dealing 125<font color="fba51f"> (+50% Total Physical Attack)</font> <font color="62f8fe">(+75% Total Magic Power)</font> points of <font color="7f62fe">Magic Damage</font> to nearby enemies and slowing them by 60%. This lasts 1.5s.'
WHERE skill_name = 'Scripture of the Moon Elf' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Estes' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Estes recovers 200<font color="62f8fe"> (+110% Total Magic Power)</font> HP for the target allied hero immediately and links himself with them for 5s. While linked, both heroes gain 15 Hybrid Defense, and the target slowly recovers 360<font color="62f8fe"> (+90% Total Magic Power)</font> HP. Linking with an allied hero increases Estes'' Movement Speed by 15%, as well as the energy charging speed of the Scripture of the Moon Elf.

Being too far from the target will break the link.'
WHERE skill_name = 'Moonlight Immersion' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Estes' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Estes drops a flood of moonlight on the target area, dealing 350<font color="62f8fe"> (+70% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> to enemy units within it. Afterwards, it turns to a domain of the Moon Goddess and reveals enemies inside it. Enemies will be slowed by 90% for 1.5s if they touch the edge of the domain area. (The slow effect will decay over time.)'
WHERE skill_name = 'Domain of Moon Goddess' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Estes' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Estes casts an enhanced <font color="a6aafb">Moonlight Immersion</font> on himself and all nearby allied heroes, refreshing <font color="a6aafb">Moonlight Immersion</font> on them and enhancing it for 8s.

Enhanced <font color="a6aafb">Moonlight Immersion</font>: Doubles the Instant Basic Healing and Hybrid Defense Increase, and heals the target for 1020<font color="62f8fe"> (+225% Total Magic Power)</font> HP over time.'
WHERE skill_name = 'Blessing of Moon Goddess' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Estes' AND game_id = 1);

-- Eudora
UPDATE hero_skills 
SET skill_description = 'Eudora''s skills inflict <font color="a6aafb">Superconductor</font> for 3s on hit and can trigger additional effects against enemies affected by <font color="a6aafb">Superconductor</font>.'
WHERE skill_name = 'Superconductor' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Eudora' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Eudora deals 350<font color="62f8fe"> (+150% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> to enemies in a fan-shaped area.

Enemies affected by <font color="a6aafb">Superconductor</font> will take 190<font color="62f8fe"> (+30% Total Magic Power)</font> extra <font color="7f62fe">Magic Damage</font> after a short delay.'
WHERE skill_name = 'Forked Lightning' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Eudora' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Eudora hurls an orb of lightning at the target enemy, dealing 350<font color="62f8fe"> (+80% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font>, stunning them for 1.2s, and reducing their Magic Defense by 10 for 1.8s.

If the enemy is affected by <font color="a6aafb">Superconductor</font>, the lightning orb will bounce to up to 3 nearby enemies (prioritizes enemy heroes), dealing 175<font color="62f8fe"> (+40% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> and stunning them for 0.9s.'
WHERE skill_name = 'Ball Lightning' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Eudora' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Eudora calls down a blast of lightning on the target enemy, dealing 480<font color="62f8fe"> (+180% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font>.

If the enemy is affected by <font color="a6aafb">Superconductor</font>, dark clouds appear over their head and unleash an additional lightning strike on the area after 0.8s, dealing 440<font color="62f8fe"> (+150% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> to enemies within and 360<font color="62f8fe"> (+150% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> to nearby enemies.'
WHERE skill_name = 'Thunder’s Wrath' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Eudora' AND game_id = 1);

-- Fanny
UPDATE hero_skills 
SET skill_description = 'During flight, Fanny deals 10%-20% extra damage to enemies hit (scales with flying speed) and applies a stack of <font color="a6aafb">Prey Mark</font> to them (up to 2 stacks) on each attack. Her subsequent skill hits on marked enemy heroes restore 8 energy per stack for her. The energy restoration is reduced if she hits multiple enemy heroes within a short period of time.'
WHERE skill_name = 'Air Superiority' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Fanny' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Fanny whirls her blades, dealing 275<font color="fba51f"> (+85% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to nearby enemies.'
WHERE skill_name = 'Tornado Strike' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Fanny' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Fanny shoots a cable in the target direction that pulls her to the first obstacle hit. She can cast this skill again within 2s until her energy runs out. Each successive cast reduces the skill''s energy cost by 2.

Fanny automatically casts <font color="a6aafb">Tornado Strike</font> upon hitting an enemy mid-flight, as long as her energy is sufficient.'
WHERE skill_name = 'Steel Cable' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Fanny' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Fanny leaps at the target enemy hero or Creep with her blades, dealing 400<font color="fba51f"> (+200% Extra Physical Attack)</font> <font color="fb1f1f">Physical Damage</font>. Each stack of <font color="a6aafb">Prey Mark</font> on the target increases this damage by 30%.'
WHERE skill_name = 'Cut Throat' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Fanny' AND game_id = 1);

-- Faramis
UPDATE hero_skills 
SET skill_description = 'Every 4s, Faramis'' next skill against enemy heroes and summoned objects generates a soul fragment on the spot. Faramis can absorb the soul fragment to restore 100<font color="62f8fe"> (+50% Total Magic Power)</font> HP and gain 2 extra Magic Power (up to 40 stacks). Upon death, he consumes the absorbed soul fragments to reduce the respawn timer, each reducing the timer by 3% (up to 90%). Enemies that die around Faramis also have a chance to drop soul fragments.'
WHERE skill_name = 'Vicious Retrieval' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Faramis' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Faramis enters the Shadow state for 3s, gaining 70% extra Movement Speed, 25 extra Physical & Magic Defense, 20% cooldown reduction of this skill, and the ability to move through terrain. Enemy heroes that come into contact with Faramis in this state are dealt 250<font color="62f8fe"> (+60% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> and applied with a <font color="a6aafb">Nether Mark</font>. Upon leaving the Shadow state, Faramis drags all the marked enemy heroes toward him, dealing 250<font color="62f8fe"> (+60% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font>. Use again to leave the Shadow state early and drag marked enemies toward him.
The range of soul fragment absorption is increased while this skill is active.'
WHERE skill_name = 'Shadow Stampede' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Faramis' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Faramis gathers Nether energy in a fan-shaped area ahead, dealing 330<font color="62f8fe"> (+144% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> to enemies within. The energy will then split and bounce to nearby enemies, dealing 200<font color="62f8fe"> (+86% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> (splits up to 2 time(s) on enemy hero hits and 1 time(s) on non-enemy hero hits).'
WHERE skill_name = 'Ghost Bursters' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Faramis' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Faramis turns his surroundings into the <font color="a6aafb">Nether Realm</font> for 6s, making affected allied heroes (including himself) enter the <font color="a6aafb">Specter</font> state and granting them 400 plus 10<font color="62f8fe"> (+5% Total Magic Power)</font>% extra HP and 50% extra Movement Speed for 1s. When the <font color="a6aafb">Specter</font> state breaks, the hero will clear all debuffs and enter a brief Resurrection state for 1.3s. An allied hero''s <font color="a6aafb">Specter</font> state ends when they leave the <font color="a6aafb">Nether Realm</font>.'
WHERE skill_name = 'Nether Realm' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Faramis' AND game_id = 1);

-- Floryn
UPDATE hero_skills 
SET skill_description = 'Dew''s <font color="a6aafb">Lantern</font> will permanently increase Floryn''s attributes by a small amount.

After leaving combat for 5s, Floryn can share the <font color="a6aafb">Flower of Hope</font> with an allied hero (30s cooldown), which will grant them a 100<font color="62f8fe"> (+70% Total Magic Power)</font> shield each time they are healed by Floryn.

Floryn will never sell the <font color="a6aafb">Lantern</font>.'
WHERE skill_name = 'Dew' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Floryn' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Floryn tosses an Energy Seed at the target enemy, dealing 180<font color="62f8fe"> (+100% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font>. Healing Fruits will then spawn and bounce to nearby allied heroes, restoring their <font color="26e407">HP</font> by 175<font color="62f8fe"> (+90% Total Magic Power)</font>.'
WHERE skill_name = 'Sow' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Floryn' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Floryn casts a blob of energy ahead that explodes upon hitting an enemy, dealing 175<font color="62f8fe"> (+90% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> to nearby enemies and stunning them for 0.5s (and revealing their positions briefly).'
WHERE skill_name = 'Sprout' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Floryn' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Floryn resonates with Dew''s power, recovering 250<font color="62f8fe"> (+100% Total Magic Power)</font> <font color="26e407">HP</font> for all allied heroes 2 time(s) no matter where they are. This effect also increases their Shield and HP Regen effects by 12% for 2s.'
WHERE skill_name = 'Bloom' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Floryn' AND game_id = 1);

-- Franco
UPDATE hero_skills 
SET skill_description = 'If no damage is taken within 5s, Franco gains 10% Movement Speed, recovers 1% Max HP per second, and begins accumulating <font color="a6aafb">Wasteland Force</font> (up to 10 stacks).

Franco will consume all <font color="a6aafb">Wasteland Force</font> stacks on his next skill cast to increase the skill''s damage by up to 150%.'
WHERE skill_name = 'Wasteland Force' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Franco' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Franco launches an iron hook in the target direction. The hook will snag the first enemy unit hit, dealing 400<font color="fba51f"> (+100% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> and dragging them to Franco.'
WHERE skill_name = 'Iron Hook' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Franco' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Franco lashes out, dealing <font color="fb1f1f">Physical Damage</font> equal to 300 plus 4% of his Max HP to nearby enemies and slowing them by 70% for 1.5s.'
WHERE skill_name = 'Fury Shock' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Franco' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Franco suppresses the target enemy hero for 1.8s and strikes them 6 times over the duration, each time dealing 50<font color="fba51f"> (+70% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font>.'
WHERE skill_name = 'Bloody Hunt' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Franco' AND game_id = 1);

-- Fredrinn
UPDATE hero_skills 
SET skill_description = 'Fredrinn gains 1 <font color="a6aafb">Combo Point</font> that lasts 5s each time his skill hits a non-minion enemy, up to 4 <font color="a6aafb">Combo Points</font>. His Ultimates cost different numbers of <font color="a6aafb">Combo Points</font>.

Fredrinn stores 100% of the damage he receives as <font color="a6aafb">Crystal Energy</font>, which decays after 5s at a rate of 10% Max HP per second.
Fredrinn can convert the stored <font color="a6aafb">Crystal Energy</font> into HP by 20% of his damage dealt (10% for damage dealt to minions). Gaining a <font color="a6aafb">Combo Point</font> resets the decaying timer.'
WHERE skill_name = 'Crystalline Armor' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Fredrinn' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Fredrinn thrusts his sword in the target direction, dealing 125<font color="26e407"> (+7% Total HP)</font> <font color="fba51f">(+120% Extra Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to enemies hit and slowing them by 30% for 2s. His next Basic Attack gains extra attack range and deals 85<font color="fba51f"> (+100% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font>.
This skill deals 200% damage to non-hero enemies.'
WHERE skill_name = 'Piercing Strike' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Fredrinn' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Fredrinn dashes in the target direction, dealing 140<font color="fba51f"> (+80% Extra Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to the first non-minion enemy hit. His next Basic Attack knocks the target airborne for 0.3s.'
WHERE skill_name = 'Brave Assault' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Fredrinn' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Fredrinn deals 210<font color="fba51f"> (+100% Extra Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to nearby enemies and taunts them for 1s. Hitting a non-minion enemy grants Fredrinn 25 Physical & Magic Defense for 3s and reduces the cooldowns of <font color="a6aafb">Piercing Strike</font> and <font color="a6aafb">Brave Assault</font> by 75%.
This skill costs 1 <font color="a6aafb">Combo Point</font>.'
WHERE skill_name = 'Energy Eruption' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Fredrinn' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Fredrinn slams his sword in the target direction (this skill can only be interrupted by Suppression), dealing 600 plus 21% of his <font color="a6aafb">Crystal Energy</font> as <font color="fb1f1f">Physical Damage</font> to enemies in a fan-shaped area after a short delay. Enemies in the center of the area take 175% damage. This skill doubles the conversion ratio based on damage dealt to enemy heroes from stored <font color="a6aafb">Crystal Energy</font> to HP.
This skill costs 3 <font color="a6aafb">Combo Points</font>.'
WHERE skill_name = 'Appraiser''s Wrath' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Fredrinn' AND game_id = 1);

-- Freya
UPDATE hero_skills 
SET skill_description = 'Freya gains 300<font color="fba51f"> (+75% Total Physical Attack)</font> stacks of <font color="a6aafb">Sacred Orb</font> and enters the <font color="a6aafb">Valkyrie</font> state, gaining a 40% shield and 2 Physical Attack. Meanwhile, her Basic Attacks become ranged and deal <font color="a6aafb">splash</font> damage. The <font color="a6aafb">Valkyrie</font> state lasts for 12s.'
WHERE skill_name = 'Valkyrie Descent' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Freya' AND game_id = 1);

-- Gatotkaca
UPDATE hero_skills 
SET skill_description = 'Gatotkaca gains Physical Defense equal to 2% of his lost HP (up to 200). For every 300 damage he takes (calculated before damage reduction), he gains 5 Rage (up to 100).

Upon reaching over 25 Rage, Gatotkaca''s next Basic Attack becomes enhanced, consuming all Rage to deal extra <font color="7f62fe">Magic Damage</font> and recover HP. The extra damage scales with his Rage, level, and Magic Power.'
WHERE skill_name = 'Steel Bones' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Gatotkaca' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Gatotkaca slams the ground, creating a shattered zone in the target direction while dealing 200<font color="62f8fe"> (+150% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> to enemies within. Enemies in the shattered zone will take 100<font color="62f8fe"> (+20% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> per second and be slowed by 30%.'
WHERE skill_name = 'Blast Iron Fist' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Gatotkaca' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Gatotkaca begins channeling, then sprints in the target direction with a battle cry, forcing enemies on the path to attack him, dealing 200<font color="62f8fe"> (+100% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> for 0.9 - 1.5s. The taunt duration and sprint distance scale with the channel time. Canceling the Skill reduces 50% of the remaining Cooldown.'
WHERE skill_name = 'Unbreakable' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Gatotkaca' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Gatotkaca jumps to the target location, dealing 500<font color="62f8fe"> (+300% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> to nearby enemies and knocking them airborne for 1s. Enemies near the center of the area will be knocked airborne for a longer duration, while enemies on the fringes will be pulled to the center.

The camera will move with the skill indicator but won''t grant extra sight.'
WHERE skill_name = 'Avatar of the Guardian' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Gatotkaca' AND game_id = 1);

-- Gloo
UPDATE hero_skills 
SET skill_description = 'Enemies gain a stack of <font color="a6aafb">Sticky</font> each time they''re hit by Gloo''s skills, decreasing their Movement Speed by 4% for 6s. Stacks up to 5.
Each stack of <font color="a6aafb">Sticky</font> on an enemy reduces their damage dealt to Gloo by 4%.'
WHERE skill_name = 'Stick, Stick' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Gloo' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Gloo reaches out and slams the ground, dealing 80<font color="62f8fe"> (+80% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> to the enemy.
At the final location, a <font color="a6aafb">Goo</font> is left behind that explodes after 3s to deal 300<font color="26e407"> (+12% Extra Max HP)</font> <font color="7f62fe">Magic Damage</font> to nearby enemies and immobilize them for 1s. If Gloo touches the <font color="a6aafb">Goo</font>, it will explode immediately, reset the skill''s cooldown, and heal Gloo for 2.5% of Max HP if the explosion hits an enemy (doubled if it hits an enemy hero).'
WHERE skill_name = 'Slam, Slam' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Gloo' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Gloo splits into Goos, dealing 100<font color="62f8fe"> (+80% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> to enemies in a fan-shaped area and immobilizing them for 0.5s. While split, Gloo gains 10% Movement Speed and deals 80<font color="62f8fe"> (+15% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> every 0.25s to enemies it touches, lasting 4s.
If this skill hits a <font color="a6aafb">Goo</font>, Gloo will charge over to merge with it, dragging enemies in its path in the same direction for a distance.'
WHERE skill_name = 'Spread, Spread' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Gloo' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Unlocked when any enemy hero has full <font color="a6aafb">Sticky</font> stacks. Gloo attaches itself to the target enemy hero for up to 9s, recovering 25% of its Max HP. For the duration, its Basic Attacks are converted to deal 30<font color="62f8fe"> (+50% Total Magic Power)</font> <font color="26e407"> (+6% Extra Max HP)</font> <font color="7f62fe">Magic Damage</font>, and it transfers 80% of the damage it receives (excluding damage from turrets) to its host. If the target dies while attached, this skill''s cooldown is reduced to 5s.'
WHERE skill_name = 'Grab, Grab' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Gloo' AND game_id = 1);

-- Gord
UPDATE hero_skills 
SET skill_description = 'After Gord hits an enemy 4 times with skills within a short period of time, the next skill damage will deal an additional 140<font color="62f8fe"> (+60% Total Magic Power)</font> <font color="ffe63c">True Damage</font> and slow them by 20% for 1s (the slow effect stacks up to 2 times).'
WHERE skill_name = 'Mystic Favor' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Gord' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Gord conjures a Mystic Orb that bounces in the target direction and explodes on the first enemy hit, dealing 270<font color="62f8fe"> (+80% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> to enemies in the area, while stunning them and revealing their locations for 1s.'
WHERE skill_name = 'Mystic Projectile' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Gord' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Gord creates an energy field in the target area, dealing 30<font color="62f8fe"> (+14% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> every 0.25s to enemies within (up to 16 times).'
WHERE skill_name = 'Mystic Injunction' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Gord' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Gord unleashes an energy beam in the target direction, dealing 110<font color="62f8fe"> (+32% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> to enemies hit every 0.2s (up to 16 times).

The direction of the beam can be adjusted using the Joystick.'
WHERE skill_name = 'Mystic Gush' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Gord' AND game_id = 1);

-- Granger
UPDATE hero_skills 
SET skill_description = 'Granger''s unique Demon Hunting <font color="a6aafb">Gun</font> and <font color="a6aafb">Cannon</font> are powered by Demonic Energy. Both his weapons start with 800 max Energy. His <font color="a6aafb">Gun</font> restores 8% Energy per second while his <font color="a6aafb">Cannon</font> restores 2% Energy per second. Killing a Minion / Creep permanently increases their max Energy by 6 / 6, and instantly restores their Energy by 5% / 5%, respectively. Each kill or assist on an enemy hero permanently increases both weapons'' max Energy by 12 and instantly restores 10% Energy.

Every 1% Cooldown Reduction converts to 2 Physical Attack. Demonic Energy costs are not affected by Energy Cost Reduction.'
WHERE skill_name = 'Capriccio' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Granger' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Granger rapidly fires 6 shot(s) with his <font color="a6aafb">Gun</font>, with each shot dealing 60<font color="fba51f"> (+45% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> and consuming 70 <font color="a6aafb">Gun</font> Energy. The last shot is guaranteed to Crit. While firing, Granger''s Movement Speed is increased by 10%.

Granger stops firing when he runs out of Energy, or when the skill is cast again. <font color="a6aafb">Rhapsody</font> has no cooldown and can be cast once his <font color="a6aafb">Gun</font> Energy is over 420.'
WHERE skill_name = 'Rhapsody' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Granger' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Granger uses his Demon Hunter agility to dash in the target direction, instantly restoring 15% Energy for his <font color="a6aafb">Gun</font>.

<font color="a6aafb">Rondo</font> can be cast while channeling <font color="a6aafb">Rhapsody</font>. Each time <font color="a6aafb">Rhapsody</font> hits an enemy, <font color="a6aafb">Rondo''s</font> Cooldown is reduced by 0.5s.'
WHERE skill_name = 'Rondo' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Granger' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Granger fires his <font color="a6aafb">Cannon</font> in the target direction, dealing 150<font color="fba51f"> (+110% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to the first enemy hero hit and other targets in the blast radius. Targets hit will be briefly slowed. Granger can roll in the Joystick''s direction after each shot.
<font color="a6aafb">Death Sonata</font> can be cast while firing <font color="a6aafb">Rhapsody</font>. <font color="a6aafb">Death Sonata</font> has a brief cooldown and consumes 250 of Granger''s <font color="a6aafb">Cannon</font> Energy per shot.'
WHERE skill_name = 'Death Sonata' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Granger' AND game_id = 1);

-- Grock
UPDATE hero_skills 
SET skill_description = 'Grock gains a Shield equal to 14% of his Max HP and empowers the next Basic Attack to deal <font color="fb1f1f">Physical Damage</font> equal to 4<font color="26e407"> (+2% Total Physical Defense)</font>% of the target''s Max HP (capped at 300<font color="ffe63c">(+20*Hero Level)</font> against non-hero units). This effect has a 18-12s cooldown (decreases with level), which reduces by 200% when near terrain.

Grock''s skills cannot be interrupted, and he gains 30<font color="ffe63c">(+6*Hero Level)</font>% extra Physical Defense while the Shield is active.'
WHERE skill_name = 'Bastion of Stone' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Grock' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Grock strikes forward with massive force, dealing 240<font color="fba51f"> (+100% Extra Physical Attack)</font> <font color="fb1f1f">Physical Damage</font>. Enemies with obstacles behind them are knocked back into the obstacle, launched airborne, and take extra <font color="fb1f1f">Physical Damage</font> equal to 4<font color="26e407"> (+2% Total Physical Defense)</font>% of their Max HP (capped at 300<font color="ffe63c">(+20*Hero Level)</font> against non-hero units). If there are no obstacles behind, enemies are only knocked back slightly.'
WHERE skill_name = 'Mighty Swing' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Grock' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'After a brief delay, Grock summons a stone wall in the target area, dealing 100<font color="fba51f"> (+60% Extra Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> and knocking enemies towards him.
<font color="a6aafb">Use Again</font>: Cancel the wall early.'
WHERE skill_name = 'Earthen Rampart' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Grock' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Grock charges forward and gains Control Immunity, dealing 100<font color="fba51f"> (+50% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to enemies in his path. Upon hitting terrain, he immediately stops and triggers a massive explosion that knocks nearby enemies airborne for 1s and deals 650<font color="fba51f"> (+300% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font>. If this skill doesn''t hit terrain, 50% of its cooldown is refunded.'
WHERE skill_name = 'Tectonic Charge' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Grock' AND game_id = 1);

-- Guinevere
UPDATE hero_skills 
SET skill_description = 'Guinevere deals 25% extra damage to airborne enemies and deals <font color="fba51f"> (+80% Total Physical Attack)</font> <font color="62f8fe">(+60% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> with her Basic Attacks. 
Guinevere builds Super Magic each time she deals damage. Once fully charged, her next Basic Attack becomes guided, dealing 80<font color="fba51f"> (+100% Total Physical Attack)</font> <font color="62f8fe">(+90% Total Magic Power)</font> <font color="7f62fe">Magic damage</font> on hit and restoring <font color="26e407">80 plus 8% of her lost HP</font>.
Enemies hit by Guinevere''s skills or enhanced Basic Attack will be marked for 5s. Those with 3 marks will be knocked airborne when hit by her Violet Requiem.'
WHERE skill_name = 'Super Magic' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Guinevere' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Guinevere releases an energy orb in the target direction, dealing 300<font color="62f8fe"> (+125% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> and slowing enemies by 25% for 1.2s.
Successfully hitting an enemy reduces all her skill cooldowns by 1s.'
WHERE skill_name = 'Energy Wave' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Guinevere' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Guinevere leaps to the target location, dealing 250<font color="62f8fe"> (+80% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font>. Enemy heroes and Creeps hit will be knocked airborne for 1s and take 125<font color="62f8fe"> (+50% Total Magic Power)</font> additional <font color="7f62fe">Magic Damage</font>.
<font color="a6aafb">Use Again</font>: Guinevere blinks toward the target direction and leaves an illusion behind. If the illusion takes damage by hero, it restores Super Magic for Guinevere and explodes after 1.5s, dealing 100<font color="62f8fe"> (+30% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> to nearby enemies.'
WHERE skill_name = 'Spatial Migration' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Guinevere' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Guinevere creates a force field around her, gaining Control Immunity while attacking nearby enemies 11 times within 2s, dealing 880<font color="62f8fe"> (+385% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> in total.
Airborne enemies hit will be knocked airborne again, up to 8 additional times.'
WHERE skill_name = 'Violet Requiem' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Guinevere' AND game_id = 1);

-- Gusion
UPDATE hero_skills 
SET skill_description = 'Each skill cast adds a rune to Gusion''s dagger (stacks up to 4 times). Each stack enhances Gusion''s next Basic Attack to deal additional damage equal to 3% of the target''s Max HP and restore 50<font color="62f8fe"> (+25% Total Magic Power)</font> HP to himself.'
WHERE skill_name = 'Dagger Specialist' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Gusion' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Gusion throws a dagger in the target direction, dealing 200<font color="62f8fe"> (+50% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> to the first enemy hit and marking them.

<font color="a6aafb">Use Again</font>: Gusion moves behind the marked enemy, dealing 200<font color="62f8fe"> (+100% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> to them. This skill cannot be interrupted while Gusion is moving behind the marked enemy.'
WHERE skill_name = 'Sword Spike' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Gusion' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Gusion throws a volley of daggers in the target direction, each dealing 100<font color="62f8fe"> (+40% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> to enemies hit and slowing them by 6% for 2s (when hit by multiple daggers, the slow effect can stack up to 30%).

<font color="a6aafb">Use Again</font>: Gusion recalls the daggers, each dealing 65<font color="62f8fe"> (+40% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> to enemies in its path.'
WHERE skill_name = 'Shadowblade Slaughter' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Gusion' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Gusion dashes to the target location, resetting the cooldowns of <font color="a6aafb">Sword Spike</font> and <font color="a6aafb">Shadowblade Slaughter</font>. If <font color="a6aafb">Shadowblade Slaughter</font> was cast once before the reset, Gusion can throw another five daggers on his next <font color="a6aafb">Shadowblade Slaughter</font> cast, and recall a total of ten daggers afterward.

<font color="a6aafb">Use Again</font>: Gusion dashes a short distance in the target direction.'
WHERE skill_name = 'Incandescence' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Gusion' AND game_id = 1);

-- Hanabi
UPDATE hero_skills 
SET skill_description = 'Hanabi''s Basic Attacks and skills will launch Petal Blades after hitting a target, dealing 30% damage, and bouncing up to 4 times to nearby enemies. Bounces from her Basic Attacks inherit her Attack Effects.'
WHERE skill_name = 'Ninjutsu: Petal Barrage' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Hanabi' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = '<font color="a6aafb">Passive</font>: The secret Ninjutsu of the Scarlet Shadow makes Hanabi immune to control effects when she has a shield from any source.

<font color="a6aafb">Active</font>: Hanabi gains a 300<font color="fba51f"> (+40% Total Physical Attack)</font> shield for 5s. When the shield is active, Hanabi gains 20% Movement Speed and 25% Attack Speed, and 20% of her damage dealt to enemy heroes will be added to this shield (only adds 10% of the damage dealt to non-hero units). This shield cannot exceed 50% of Hanabi''s max HP.'
WHERE skill_name = 'Ninjutsu: Equinox' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Hanabi' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Hanabi fires the energy Kunai in the targeted direction, dealing 350<font color="fba51f"> (+80% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to enemies along the way and reducing their Movement Speed by 60% for 1s. Enemy units hit will also be marked, allowing Hanabi''s next Bounce Damage from Basic Attacks to deal 30<font color="fba51f"> (+100% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> on them with no damage decay.'
WHERE skill_name = 'Ninjutsu: Soul Scroll' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Hanabi' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Hanabi throws Higanbana in the targeted direction, dealing 300<font color="fba51f"> (+50% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to the first enemy hero hit and immobilizing them for 0.8s. After 1s, Higanbana will bloom at the location of the first hit, dealing 300<font color="fba51f"> (+50% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to nearby enemies. Subsequent hits on the same target decay to 30% damage.'
WHERE skill_name = 'Forbidden Jutsu: Higanbana' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Hanabi' AND game_id = 1);

-- Hanzo
UPDATE hero_skills 
SET skill_description = 'Damage dealt by Hanzo''s Basic Attacks and skills inflicts a stack of <font color="a6aafb">Dark Ninjutsu</font> on the target, up to 5 stacks. <font color="a6aafb">Ninjutsu: Demon Feast</font> can only be cast on targets with full stacks of <font color="a6aafb">Dark Ninjutsu</font>.'
WHERE skill_name = 'Ame no Habakiri' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Hanzo' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'The skill can only be used on targets with max stacks of <font color="a6aafb">Dark Ninjutsu</font>. When targeting a creep, Hanzo will immediately devour it and digest it over a period of time to recover 20% HP.
When targeting the Turtle, Lord, or enemy heroes, he deals 600<font color="fba51f"> (+120% Extra Physical Attack)</font> <font color="fb1f1f">Physical Damage</font>, recovers 10% HP, and reduces this skill''s cooldown by 60%.'
WHERE skill_name = 'Ninjutsu: Demon Feast' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Hanzo' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Hanzo dashes in the target direction, leaving <font color="a6aafb">dark mist</font> in front that deals 90<font color="fba51f"> (+45% Extra Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to enemies in the area every 0.5s, up to 5 times (this damage counts as Basic Attack damage but cannot Crit).
The <font color="a6aafb">dark mist</font> slows enemies in the area by 40% and grants Hanzo 20% Movement Speed.'
WHERE skill_name = 'Ninjutsu: Dark Mist' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Hanzo' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Hanzo charges into battle as <font color="a6aafb">Hanekage</font>, consuming 17 Energy per second. He gains 2 Energy when a non-hero unit dies nearby and 20 Energy when it''s a hero. After consuming all his Energy, Hanzo''s body will be slowly drawn to Hanekage''s current position.
While in Hanekage form, Hanzo''s body is invincible, and Hanekage ignores obstacles and gains 50% Movement Speed (decays over time) and 30% Attack Speed.
After being killed, <font color="a6aafb">Hanekage</font> will be immediately drawn to Hanzo''s position, during which he recovers 16% HP and cannot be targeted. This effect is also triggered when the skill is cast again. If <font color="a6aafb">Hanekage</font> is killed, Hanzo will be slowed by 50% and reveal his location for 6s.'
WHERE skill_name = 'Kinjutsu: Pinnacle Ninja' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Hanzo' AND game_id = 1);

-- Harith
UPDATE hero_skills 
SET skill_description = 'Harith gains insight from his Key. He gains 7% Hybrid Lifesteal for each nearby enemy hero, stacking up to 35%.'
WHERE skill_name = 'Key Insight' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Harith' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Harith creates a phantom of himself in a distant location. Harith and his phantom will then release <font color="a6aafb">Synchro Fission</font> toward each other, dealing 165<font color="62f8fe"> (+60% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> to all enemy units on the path. When the 2 energy waves collide, an explosion occurs, dealing 495<font color="62f8fe"> (+180% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> to all enemies in the explosion area.'
WHERE skill_name = 'Synchro Fission' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Harith' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Harith dashes towards the target direction, gaining a 120<font color="62f8fe"> (+120% Total Magic Power)</font> shield and enhancing his next Basic Attack. Harith''s enhanced Basic Attack deals 200<font color="fba51f"> (+100% Total Physical Attack)</font><font color="62f8fe">(+60% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> and slows enemies by 40%. Hitting an enemy with Harith''s enhanced Basic Attack reduces the cooldown of <font color="a6aafb">Chrono Dash</font> by 3s. This shield can stack up to 3 times.

The enhanced Basic Attack deals 50<font color="fba51f"> (+100% Total Physical Attack)</font><font color="62f8fe">(+100% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> to Turrets.'
WHERE skill_name = 'Chrono Dash' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Harith' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Harith uses his Key to summon the Zaman Force. When the multidimensional rift appears, the cooldown of <font color="a6aafb">Chrono Dash</font> is reduced by 4s. The rift initially slows enemy heroes in the area by 50%, and will continuously slow enemy heroes by 15% afterwards.
If Harith comes into contact with the rift using <font color="a6aafb">Chrono Dash</font>, he will absorb the energy within and reduce the cooldown of <font color="a6aafb">Synchro Fission</font> by 1s and <font color="a6aafb">Chrono Dash</font> by 3s.
Harith gains 15% Resilience while on the rift.'
WHERE skill_name = 'Zaman Force' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Harith' AND game_id = 1);

-- Harley
UPDATE hero_skills 
SET skill_description = 'Harley''s mastery of magic allows his Basic Attacks and skills to reduce the enemy''s Magic Defense by 2 and increase his Attack Speed by 5%-10% (scales with hero level) for 3s on hit. This effect stacks up to 10 times.
Harley''s Basic Attacks deal 60<font color="fba51f"> (+50% Total Physical Attack)</font> <font color="62f8fe">(+60% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font>.'
WHERE skill_name = 'Magic Master' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Harley' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Harley throws 3 waves of cards, 3 cards per wave. Each card deals 130<font color="62f8fe"> (+25% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> to enemies.
After the same target is hit 3 time(s), the damage will decay to 50% on subsequent hits.'
WHERE skill_name = 'Poker Trick' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Harley' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Harley blinks in the designated direction, leaving a magic hat at his starting location. His Movement Speed increases by 60% for 2s, then rapidly decays to normal over 4s.

<font color="a6aafb">Use Again</font>: Return to the hat''s location.'
WHERE skill_name = 'Space Escape' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Harley' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Harley casts a magic ring of fire at an enemy hero, dealing 200<font color="62f8fe"> (+60% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> and a 40% slow effect that decays to 15% after 1.5s. The ring will stay around the target, during which Harley can hit the ring to damage the target. The ring will explode after 4s, dealing <font color="7f62fe">Magic Damage</font> equal to 200<font color="62f8fe"> (+50% Total Magic Power)</font> plus 30% of the damage taken by the target while the ring was active.'
WHERE skill_name = 'Deadly Magic' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Harley' AND game_id = 1);

-- Hayabusa
UPDATE hero_skills 
SET skill_description = 'Hayabusa''s attacks apply a stack of <font color="a6aafb">Shadow Mark</font> on hit (up to 4 stacks). Each stack lasts 6s and increases Hayabusa''s damage to the enemy by 5%.'
WHERE skill_name = 'Ninjutsu: Trace of Shadow' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Hayabusa' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Hayabusa throws three returning shurikens in the target direction, each dealing 220<font color="fba51f"> (+75% Extra Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to enemies hit and slowing them by 35% for 2s. Enemies hit by multiple shurikens take 70% less damage after the first hit, and Creeps take 50% less damage after the first hit. Hayabusa restores 10 energy when hitting non-Minion enemies.

<font color="a6aafb">Passive</font>: Hayabusa permanently gains 3% Spell Vamp.'
WHERE skill_name = 'Ninjutsu: Phantom Shuriken' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Hayabusa' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Hayabusa dashes in the target direction and releases four phantoms that travel in separate directions. The phantoms will remain at the end of their paths or attach themselves to the first enemy hero hit, dealing 130<font color="fba51f"> (+30% Extra Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> and slowing them by 40% for 2s. Hayabusa will immediately stop if he hits an enemy hero during the dash.

<font color="a6aafb">Use Again</font>: Hayabusa teleports to a phantom''s location and reduces the cooldown of <font color="a6aafb">Ninjutsu: Phantom Shuriken</font> by 1s. If the phantom is attached to an enemy hero, he also deals 130<font color="fba51f"> (+30% Extra Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to the enemy.'
WHERE skill_name = 'Ninjutsu: Quad Shadow' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Hayabusa' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Hayabusa blends into the shadows and launches 6 single-target attacks on enemies in the area, each dealing 140<font color="fba51f"> (+32% Extra Physical Attack)</font> <font color="fb1f1f">Physical Damage</font>.

The attacks prioritize enemies with <font color="a6aafb">Shadow Mark</font> and each will consume a mark to deal 90<font color="fba51f"> (+40% Extra Physical Attack)</font> extra <font color="fb1f1f">Physical Damage</font>. Shadow Kill does not apply <font color="a6aafb">Shadow Mark</font>.'
WHERE skill_name = 'Ougi: Shadow Kill' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Hayabusa' AND game_id = 1);

-- Helcurt
UPDATE hero_skills 
SET skill_description = 'Helcurt remains in <font color="a6aafb">Prowler</font> state until spotted by the enemy team, gaining 15% extra Movement Speed, and continuously regenerating <font color="fba51f"> (+30% Total Physical Attack)</font> HP if he has not dealt any damage.
He gains 50% extra Attack Speed and 50% extra Movement Speed (decreasing over time) for 4s upon being spotted and leaves <font color="a6aafb">Prowler</font> state 0.75s later.
Any hero killed after being hit by Helcurt leaves a <font color="a6aafb">dark fog</font> that explodes and spreads with a cooldown of 10s. Helcurt <font color="a6aafb">Conceals</font> himself while within the <font color="a6aafb">dark fog</font>.'
WHERE skill_name = 'Shadow of Styx' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Helcurt' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = '<font color="a6aafb">Passive</font>: When Helcurt is in <font color="a6aafb">Prowler</font> state, the skill <font color="a6aafb">terrifies</font> enemy heroes hit and briefly reveals them. Its cooldown decreases 3 times as fast as normal.

<font color="a6aafb">Active</font>: Helcurt blinks to the target location and deals 150<font color="fba51f"> (+70% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to enemies within the area, reducing their Movement Speed by 60% for 0.75s.'
WHERE skill_name = 'Hidden Terror' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Helcurt' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = '<font color="a6aafb">Passive</font>: Helcurt gains one Deadly Stinger for every 1.5s spent in <font color="a6aafb">Prowler</font> state or on each Basic Attack. Up to 5 <font color="a6aafb">stingers</font> can be stored.
<font color="a6aafb">Active</font>: Helcurt fires all <font color="a6aafb">Deadly Stingers</font> forward, each dealing 180<font color="fba51f"> (+50% Extra Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to enemies (Minions and Creeps take only 70% of the damage).
<font color="a6aafb">Deadly Stinger</font> counts as a Basic Attack but cannot Crit.'
WHERE skill_name = 'Deadly Stinger' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Helcurt' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Helcurt summons the Dark Night, reducing all enemies'' sight range and making them lose sight of their allies for 3s. During Dark Night, Helcurt gains 40% extra Movement Speed.

The Dark Night makes it easier for Helcurt to leave enemies'' sight range.'
WHERE skill_name = 'Dark Night Falls' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Helcurt' AND game_id = 1);

-- Hilda
UPDATE hero_skills 
SET skill_description = 'Hilda regenerates 2% of her max HP per second while in the bush. When entering the bush, she gains a shield equal to 110<font color="fba51f"> (+130% Total Physical Attack)</font><font color="ffe63c">(+12*Hero Level)</font> of her max HP. After leaving the bush, the shield lasts for 40%s. This effect has a 40<font color="fba51f"> (+100% Total Physical Attack)</font><font color="ffe63c">(+10*Hero Level)</font>s cooldown.

Hilda''s Basic Attack and Skills apply a <font color="a6aafb">Wilderness Mark</font> on hit, which lasts up to 6s and stacks up to 4. Each stack reduces the target''s Physical Defense and Magic Defense by 6.'
WHERE skill_name = 'Blessing of Wilderness' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Hilda' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Hilda activates the runic power of her great axe, increasing her Movement Speed by 60% for 3s and enhancing her next Basic Attack to deal 10% <font color="fb1f1f">Physical Damage</font> and slow the target by 3 for s. The attack will also deal  <font color="fb1f1f">Physical Damage</font> to enemies behind the target.'
WHERE skill_name = 'Combat Ritual' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Hilda' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Hilda locks onto an enemy target, each time dealing 220<font color="fba51f"> (+100% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font>. This skill can be used 3 times at most. The 2nd attack will deal damage to target''s surroundings, and the 3rd attack will deal damage to and knock back the target and surrounding enemies temporarily.'
WHERE skill_name = 'Art of Hunting' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Hilda' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Hilda launches a powerful slash on the target enemy, dealing 600<font color="fba51f"> (+250% Extra Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> and stunning them for 0.2s. Nearby enemies also take 60% damage. Each stack of <font color="a6aafb">Wilderness Mark</font> makes <font color="a6aafb">Power of Wildness</font> deal 2.5% of the target''s Max HP as extra damage. At max stacks, <font color="a6aafb">Power of Wildness</font> deals 20% of the target''s Max HP as extra damage.'
WHERE skill_name = 'Power of Wildness' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Hilda' AND game_id = 1);

-- Hylos
UPDATE hero_skills 
SET skill_description = 'Hylos gains 1.5 extra Max HP for every 1 extra Max Mana he possesses.

When out of Mana, Hylos can use his HP for skill casts.'
WHERE skill_name = 'Thickened Blood' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Hylos' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Hylos gains 50% Movement Speed and causes his next Basic Attack within 3s to deal 300<font color="62f8fe"> (+80% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> to the target, knocking back and stunning them for 1s.

<font color="A4AAC7">The extra Movement Speed rapidly decays over the duration and vanishes after the next Basic Attack.</font>'
WHERE skill_name = 'Law and Order' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Hylos' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Hylos releases the <font color="a6aafb">Ring of Punishment</font>, dealing 100<font color="62f8fe"> (+20% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> to nearby enemies per second while slowing them by 4% and reducing their Attack Speed by 7.5% for 2.5s (up to 8 stacks). Each stack also increases the enemy''s damage taken from the <font color="a6aafb">Ring of Punishment</font> by 5%. The <font color="a6aafb">Ring of Punishment</font> consumes 30 Mana per second when it''s active.

<font color="a6aafb">Use Again</font>: Hylos cancels the <font color="a6aafb">Ring of Punishment</font>.'
WHERE skill_name = 'Ring of Punishment' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Hylos' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Hylos creates a huge pathway in the target direction, reducing enemies'' Movement Speed by 75% for 1s. The pathway lasts 6s.
When on the pathway, Hylos gains Slow Immunity and recovers 3% of his Max HP per second. Allied heroes moving along the pathway gain 60% extra Movement Speed, while enemy heroes on the pathway will be slowed by 25%.'
WHERE skill_name = 'Glorious Pathway' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Hylos' AND game_id = 1);

-- Irithel
UPDATE hero_skills 
SET skill_description = 'Irithel and Leo''s immaculate teamwork allows her to shoot while moving. Each Basic Attack will shoot 2 crossbow bolt(s) (but takes longer to refill) that deal <font color="fba51f"> (+55% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> per bolt (inherits a portion of Attack Effects).
Moving will build up <font color="a6aafb">Jungle Heart</font>, up to a maximum of 10 units, and cause the next Basic Attack to unleash 1 additional bolt(s).'
WHERE skill_name = 'Jungle Heart' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Irithel' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Irithel launches a volley of arrows on the target area, dealing 330<font color="fba51f"> (+60% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to enemies within and reducing their Physical Defense by 15 for 3s.'
WHERE skill_name = 'Strafe' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Irithel' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Leo lets out a piercing roar, dealing 200<font color="fba51f"> (+60% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to nearby enemies and slowing them by 40% for 2s.'
WHERE skill_name = 'Force of The Queen' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Irithel' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Irithel orders Leo to leap in the target direction and empowers her crossbow for 10s. For the duration, she gains 30 Movement Speed and her Basic Attacks shoot enhanced crossbow bolts, dealing 100<font color="fba51f"> (+65% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to the target and nearby units. <font color="a6aafb">Jungle Heart</font> also accumulates faster for the duration.'
WHERE skill_name = 'Heavy Crossbow' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Irithel' AND game_id = 1);

-- Jawhead
UPDATE hero_skills 
SET skill_description = 'Each time Jawhead deals damage to an enemy hero or a Creep, he inflicts a stack of Mecha Suppression on them for 3s (up to 6 stacks). Each stack of Mecha Suppression increases all damage dealt to the target by 2% (limited to 50% for Creeps).'
WHERE skill_name = 'Mecha Suppression' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Jawhead' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Jawhead launches up to 12 missiles at random nearby enemies over 5s, each missile dealing 135<font color="fba51f"> (+30% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to the enemy hit.'
WHERE skill_name = 'Smart Missiles' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Jawhead' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Jawhead gains 30% Movement Speed and a 500<font color="fba51f"> (+100% Total Physical Attack)</font> shield for 5s.

<font color="a6aafb">Use Again</font>: Jawhead flings the nearest unit (prioritizes heroes) to the target location, dealing 300<font color="fba51f"> (+80% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to enemies in the area and stunning them for 0.5s. Can be used on allied heroes and they will not take damage.'
WHERE skill_name = 'Ejector' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Jawhead' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Jawhead charges into the target enemy hero, dealing 350<font color="fba51f"> (+150% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> and briefly stunning them. Enemies around the target are knocked back and dealt the same amount of damage. Jawhead is immune to control effects during the charge.'
WHERE skill_name = 'Unstoppable Force' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Jawhead' AND game_id = 1);

-- Johnson
UPDATE hero_skills 
SET skill_description = 'When Johnson''s HP drops below 30%, he gains a 300<font color="26e407"> (+700% Total Physical Defense)</font> shield for 10s. Cooldown: 100s.'
WHERE skill_name = 'Electro Airbag' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Johnson' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Johnson throws his wrench toward the target location, dealing 120<font color="26e407"> (+220% Total Physical Defense)</font> <font color="7f62fe">Magic Damage</font> to enemies in its path. Enemies around the landing point are stunned for 0.8s.'
WHERE skill_name = 'Impact Wrench' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Johnson' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Johnson raises his shield, continuously dealing 120<font color="62f8fe"> (+60% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> to enemies in a fan-shaped area in the target direction, reducing their Movement Speed and Magic Defense by 10% (stacks up to 3 times) for 2s.
While his shield is raised, Johnson can perform Basic Attacks and cast skills.'
WHERE skill_name = 'Electromagnetic Waves' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Johnson' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = '<font color="a6aafb">Passive</font>: Johnson''s Physical Defense is increased by 10%.
Johnson transforms into a car. An allied hero can use <font color="a6aafb">Hop In</font> when near Johnson to board the car (only 1 allied hero can ride with Johnson). The car will explode upon hitting an enemy hero, dealing 300<font color="26e407"> (+240% Total Physical Defense)</font>-450<font color="26e407"> (+360% Total Physical Defense)</font> <font color="7f62fe">Magic Damage</font> to nearby enemies, stunning them for 0.5-1s (scales with driving time), and creating an electrified zone at the location. The zone continuously deals 60<font color="62f8fe"> (+20% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> and slows enemies within. Johnson''s location will be revealed to the enemy for 3s when casting this skill.'
WHERE skill_name = 'Full Throttle' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Johnson' AND game_id = 1);

-- Joy
UPDATE hero_skills 
SET skill_description = 'Joy becomes <font color="a6aafb">Angry!</font> each time her skill hits a non-Minion enemy, dealing 100<font color="62f8fe"> (+80% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> and increasing her Movement Speed by 60% that decays over 4s (hitting the <font color="a6aafb">Leonin Crystal</font> will also grant the Movement Speed effect). This effect has a cooldown of 4s for each target.

Joy''s Basic Attack will deal 65<font color="fba51f"> (+65% Total Physical Attack)</font>  <font color="62f8fe">(+65% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font>.'
WHERE skill_name = 'Humph, Joy''s Angry!' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Joy' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Joy summons a <font color="a6aafb">Leonin Crystal</font> at the target location, dealing 200<font color="62f8fe"> (+40% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> to nearby enemies and slowing them by 30% for 1s. The <font color="a6aafb">Leonin Crystal</font> lasts up to 2s.'
WHERE skill_name = 'Look, Leonin Crystal!' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Joy' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Joy dashes in the target direction, dealing 120<font color="62f8fe"> (+40% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> to enemies in her path. Hitting an enemy or the <font color="a6aafb">Leonin Crystal</font> allows Joy to cast this skill again within 0.8s and gain 1 <font color="a6aafb">Beat Energy</font>. Casting this skill on the beat increases the skill damage by 100% and grants a 80<font color="62f8fe"> (+60% Total Magic Power)</font> shield that lasts 3s.

This skill can be cast up to 4 times in succession.'
WHERE skill_name = 'Meow, Rhythm of Joy!' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Joy' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Joy increases her Physical & Magic Defense by 15<font color="62f8fe"> (+10% Total Magic Power)</font> and gains 30% Movement Speed. Over the next 3s, she pulses 8 times, dealing 120<font color="62f8fe"> (+40% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> each time to nearby enemies.
Each <font color="a6aafb">Meow, Rhythm of Joy!</font> cast on the beat increases this skill''s damage by 40%. If perfect rhythm is achieved by hitting every beat with <font color="a6aafb">Meow, Rhythm of Joy!</font>, Joy also gains 40% Spell Vamp while this skill is active.
This skill unlocks when Joy acquires <font color="a6aafb">Beat Energy</font>. Casting this skill with 3 <font color="a6aafb">Beat Energy</font> will remove all debuffs on Joy and make her immune to slow effects while this skill is active.'
WHERE skill_name = 'Ha, Electrifying Beats!' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Joy' AND game_id = 1);

-- Julian
UPDATE hero_skills 
SET skill_description = 'After casting two different skills, Julian enhances his third skill. Casting the enhanced skill makes all his skills go on a 9-6s Cooldown (decreases with his level).
After casting any skill, his Basic Attacks for the next 2s will deal 100<font color="fba51f"> (+100% Total Physical Attack)</font> <font color="62f8fe">(+100% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> and pull the target toward him (deals 85% damage to Creeps). Casting another skill extends the duration.
Julian gains 15% extra Hybrid Lifesteal for 5s each time he hits an enemy hero with his skills (up to 3 stacks).'
WHERE skill_name = 'Smith''s Legacy' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Julian' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Julian hurls a flying scythe in the target direction, dealing 420<font color="62f8fe"> (+140% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> to enemies along the way and slowing them by 30% for 1s.
The scythe disappears upon hitting a non-minion enemy.'
WHERE skill_name = 'Scythe' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Julian' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Julian summons a flying sword and dashes in the target direction, dealing 400<font color="62f8fe"> (+80% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> to enemies along the way.'
WHERE skill_name = 'Sword' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Julian' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Julian casts chains at the target location, dealing 300<font color="62f8fe"> (+100% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> to enemies hit after a short delay and immobilizing them for 1.2s.'
WHERE skill_name = 'Chain' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Julian' AND game_id = 1);

-- Kagura
UPDATE hero_skills 
SET skill_description = 'Upon retrieving the <font color="a6aafb">Seimei Umbrella</font>, Kagura gains a 450<font color="62f8fe"> (+80% Total Magic Power)</font> shield, stuns nearby enemies for 0.5s, and slows them by 60% for 1s. Cooldown: 4.5s.'
WHERE skill_name = 'Yin Yang Gathering ' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Kagura' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Kagura sends the <font color="a6aafb">Seimei Umbrella</font> to the target location, dealing 315<font color="62f8fe"> (+105% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> to enemies in its path and slowing them by 60% for 0.5s. The Umbrella will automatically return to Kagura when she''s too far away.
This skill deals 130% damage to non-hero enemies.'
WHERE skill_name = 'Seimei Umbrella Open ' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Kagura' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Kagura removes all debuffs on her and leaps in the target direction, while leaving the <font color="a6aafb">Seimei Umbrella</font> behind.'
WHERE skill_name = 'Rasho Umbrella Flee' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Kagura' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Kagura invokes the power of the <font color="a6aafb">Seimei Umbrella</font>, dealing 330<font color="62f8fe"> (+105% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> to nearby enemies, knocking them back, and slowing them by 60% for 0.5s.'
WHERE skill_name = 'Yin Yang Overturn' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Kagura' AND game_id = 1);

-- Karina
UPDATE hero_skills 
SET skill_description = 'Karina''s third consecutive attack on the same enemy deals extra <font color="ffe63c">True Damage</font> equal to 100 plus 5<font color="62f8fe"> (+2.5% Total Magic Power)</font>% of their lost HP (up to 2000 <font color="ffe63c">True Damage</font> against creeps).

If the target is an enemy hero, the cooldowns of Karina''s non-Ultimate skills are reduced by 1.5s.'
WHERE skill_name = 'Shadow Combo' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Karina' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Karina enters the <font color="a6aafb">Dance of Blades</font> state for 3.5s, during which she gains 45% extra Movement Speed, blocks all incoming Basic Attacks, and reflects 100<font color="62f8fe"> (+30% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> back to the attacker (the damage reflection effect has a cooldown of 0.4s).

Karina''s next Basic Attack within the duration deals 150<font color="62f8fe"> (+55% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font>, slows the target by 45% for 1s, and is guaranteed to Crit. Casting the enhanced Basic Attack or <font color="a6aafb">Shadow Assault</font> ends the <font color="a6aafb">Dance of Blades</font> state early.'
WHERE skill_name = 'Dance of Blades' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Karina' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Karina launches a spinning slash, dealing 375<font color="62f8fe"> (+125% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> to nearby enemies.'
WHERE skill_name = 'Dance of Death' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Karina' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Karina dashes to the target enemy hero, dealing them 350<font color="62f8fe"> (+160% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font>, applying a <font color="a6aafb">Shadow Mark</font> to them, and leaving a <font color="a6aafb">Shadowform</font> behind them. The <font color="a6aafb">Shadow Mark</font> and <font color="a6aafb">Shadowform</font> both last 5s. If the enemy dies within the duration, the cooldown of this skill is reset.

<font color="a6aafb">Use Again</font>: Karina dashes back to the <font color="a6aafb">Shadowform</font>''s location, dealing 150<font color="62f8fe"> (+50% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> to enemies along the way.'
WHERE skill_name = 'Shadow Assault' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Karina' AND game_id = 1);

-- Karrie
UPDATE hero_skills 
SET skill_description = 'Karrie''s Basic Attacks and skills apply a stack of <font color="a6aafb">Lightwheel Mark</font> on hit. Once a target has 5 stacks of <font color="a6aafb">Lightwheel Marks</font>, the marks will turn into a lightwheel, dealing <font color="ffe63c">True Damage</font> equal to 5<font color="fba51f"> (+1% Extra Physical Attack)</font>% of the target''s Max HP to them (only up to 300 damage against Creeps).'
WHERE skill_name = 'Lightwheel Mark' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Karrie' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Karrie releases a sphere of surging energy in the target direction, dealing 250<font color="fba51f"> (+90% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to enemies in its path. The sphere will stop upon hitting an enemy hero or reaching its max travel distance, continuously dealing 150<font color="fba51f"> (+20% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to nearby enemies and slowing them by 80% for 1s.'
WHERE skill_name = 'Spinning Lightwheel' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Karrie' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Karrie dashes in the target direction while throwing a lightwheel at the nearest enemy, dealing 150<font color="fba51f"> (+70% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> and applying a stack of <font color="a6aafb">Lightwheel Mark</font> on them.

When in <font color="a6aafb">Dual Wield</font> state, Karrie throws two lightwheels instead.'
WHERE skill_name = 'Phantom Step' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Karrie' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Karrie enters <font color="a6aafb">Dual Wield</font> state for 10s, during which she gains 20% Movement Speed and throws two lightwheels with each Basic Attack, each dealing 40<font color="fba51f"> (+50% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> and inheriting a portion of Attack Effects.'
WHERE skill_name = 'Speedy Lightwheel' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Karrie' AND game_id = 1);

-- Khaleed
UPDATE hero_skills 
SET skill_description = 'Khaleed accumulates <font color="a6aafb">Desert Power</font> while moving. After <font color="a6aafb">Desert Power</font> is fully charged, he will glide on sand, increasing Movement Speed by 35%, making his next Basic Attack deal 50<font color="fba51f"> (+140% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to the target (cannot Crit), and reducing the target''s Movement Speed by 40% for 1.5s.'
WHERE skill_name = 'Sand Walk' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Khaleed' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Khaleed whirls his scimitar, dealing 200<font color="fba51f"> (+140% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to enemies in the area and pulling them toward him. This skill can be used up to 3 time(s) in a row.

This skill deals 50% damage to Minions and Creeps.'
WHERE skill_name = 'Desert Tornado' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Khaleed' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Khaleed protects himself with the power of the quicksand, restoring 60 plus 5% of his lost HP and 10 <font color="a6aafb">Desert Power</font> every 0.5s, reducing damage taken by 25% for up to 4s.

While channeling, quicksand appears under his feet, slowing the enemy by 60%.
This skill is a Focused Cast. Any other controls will interrupt this skill.'
WHERE skill_name = 'Quicksand Guard' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Khaleed' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Khaleed rides the sandstorm and charges toward a designated location, dealing 100<font color="fba51f"> (+50% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to enemies along the way and knocking them toward his destination. Khaleed is immune to control effects during this process.

Upon reaching the destination, Khaleed will smash the ground, dealing 450<font color="fba51f"> (+160% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to enemies in the area and stunning them for 1s, and fully charge his <font color="a6aafb">Desert Power</font>.'
WHERE skill_name = 'Raging Sandstorm' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Khaleed' AND game_id = 1);

-- Khufra
UPDATE hero_skills 
SET skill_description = 'Khufra activates the Spell Curse left by Esmeralda every 8s, enhancing his next Basic Attack. The enhanced Basic Attack gains extra attack range and deals <font color="7f62fe">Magic Damage</font> equal to <font color="fba51f"> (+120% Total Physical Attack)</font> plus 6% of the target''s Max HP. He also slows the target by 30% for 1.5s and heals 8% of his Max HP on hit.
Each time Khufra applies a control effect to an enemy hero with his skill, the cooldown of <font color="a6aafb">Spell Curse</font> is reduced by 4s.'
WHERE skill_name = 'Spell Curse' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Khufra' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Khufra pulls the bandage on his arms to launch himself in the specified direction, dealing <font color="fb1f1f">Physical Damage</font> equal to 50 plus 7<font color="fba51f"> (+1.5% Extra Physical Attack)</font>% of his Max HP to all enemy units on the path. When blinking to the furthest distance or encountering a first enemy hero, Khufra will immediately stop, dealing <font color="fb1f1f">Physical Damage</font> equal to 50 plus 7<font color="fba51f"> (+1.5% Extra Physical Attack)</font>% of his Max HP to enemies nearby and then knocking them in the air for up to 1s.'
WHERE skill_name = 'Tyrant''s Revenge' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Khufra' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Khufra uses bandage to wrap himself into a magic bouncing ball, increasing his own Physical & Magic Defense by 30%. Enemies trying to use blink skills to move across Khufra will be knocked airborne. 
Each time the magic bouncing ball hits the ground, it will deal <font color="7f62fe">Magic Damage</font> equal to 50 plus 3<font color="fba51f"> (+2% Extra Physical Attack)</font>% of his Max HP to enemies nearby and slow them by 80% for 0.2s.'
WHERE skill_name = 'Bouncing Ball' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Khufra' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Khufra pushes back all enemy targets around him toward his front (this skill can only be interrupted by Suppression), dealing 300<font color="fba51f"> (+100% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> and slowing them down for 1.25s. If the enemies are knocked against walls, extra <font color="fb1f1f">Physical Damage</font> equal to 150% of this skill''s damage will be inflicted upon them, and they will be stunned, instead of slowed.'
WHERE skill_name = 'Tyrant''s Rage' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Khufra' AND game_id = 1);

-- Kimmy
UPDATE hero_skills 
SET skill_description = 'Kimmy can move and aim in different directions while using her Spray Gun, but she cannot lock onto a specific target. Each Spray Gun attack deals <font color="fba51f"> (+18% Total Physical Attack)</font> <font color="62f8fe">(+24% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font>. Hitting enemy heroes / non-hero units restores 6 / 3 Starlium, respectively. At max Starlium, she continuously consumes it to enhance her Basic Attacks, making them deal <font color="fba51f"> (+22.5% Total Physical Attack)</font> <font color="62f8fe">(+30% Total Magic Power)</font> damage and pierce targets (enhanced Basic Attacks only benefit from 50% Spell Vamp Ratio).

Kimmy can keep moving while shooting and does not benefit from Attack Speed Bonus. Every 1% Attack Speed she gains is converted to 1 Magic Power.

Kimmy''s Basic Attacks only deal 60% damage to Turrets.'
WHERE skill_name = 'Aerial Dominance' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Kimmy' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Kimmy uses her jetpack to take flight, removing and becoming immune to Slow Effects. She can pass through terrain and gains 120% Movement Speed that decays over 1s. During the flight, she fires 4 Chemical Bolts at nearby enemies, each dealing 20<font color="fba51f"> (+25% Total Physical Attack)</font> <font color="62f8fe">(+30% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> and slowing them by 50% for 0.5s.
Kimmy does not consume Starlium during flight.'
WHERE skill_name = 'Anti-Grav Thruster' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Kimmy' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Kimmy fires a Starlium Beam in the target direction that immobilizes enemies in its path and deals 300<font color="fba51f"> (+50% Total Physical Attack)</font> <font color="62f8fe">(+60% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> for 1s.
Gain 20 Starlium for each enemy hero hit.'
WHERE skill_name = 'Starlium Beam' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Kimmy' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Kimmy charges and fires a Traction Pulse in a target direction. Upon hitting an enemy or reaching its max range, it explodes to deal 150<font color="fba51f"> (+45% Total Physical Attack)</font> <font color="62f8fe">(+54% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> to nearby enemies and creates a force field that slows enemies within by 50%. 
After 1s, the field contracts, pulling all enemy heroes to its center and dealing 15% of their current HP as Magic Damage while slowing them by 50% for 2s. Gain 40 Starlium for each enemy hero hit.'
WHERE skill_name = 'Traction Pulse' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Kimmy' AND game_id = 1);

-- Lancelot
UPDATE hero_skills 
SET skill_description = 'Each time Lancelot charges, his damage is increased by 7.5% for 4s, up to 30%.'
WHERE skill_name = 'Soul Cutter' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Lancelot' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Lancelot charges in the target direction, dealing 150<font color="fba51f"> (+50% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to enemies along the way and applying a <font color="a6aafb">Sword Mark</font> to the first unmarked enemy hit. The <font color="a6aafb">Sword Mark</font> lasts 3s.

If Lancelot successfully applies a <font color="a6aafb">Sword Mark</font> to an enemy, the skill''s cooldown will be reset.'
WHERE skill_name = 'Puncture' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Lancelot' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Lancelot strikes in the target direction 3 times, each time dealing 220<font color="fba51f"> (+120% Extra Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to enemies hit (damage is reduced when multiple enemies are hit). He''s untargetable during this process. Enemies in the center of the area take all the 3 hits and are slowed by 20% for 0.5s. The slow effect can stack.'
WHERE skill_name = 'Thorned Rose' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Lancelot' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'After a short delay, Lancelot performs an executioner''s strike in the target direction, dealing 350<font color="fba51f"> (+170% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to enemies hit. He is invincible throughout the process.'
WHERE skill_name = 'Phantom Execution' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Lancelot' AND game_id = 1);

-- Lapu-Lapu
UPDATE hero_skills 
SET skill_description = 'Lapu-Lapu accumulates 10 <font color="a6aafb">Bravery Blessing</font> each time he deals damage (halved for damage dealt to non-hero units). When <font color="a6aafb">Bravery Blessing</font> is full, Lapu-Lapu''s next <font color="a6aafb">Basic Attack</font> will make him dash toward the target, dealing <font color="fba51f"> (+150% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> (cannot Crit) and granting him a shield that absorbs 250 (+65*Hero Level) damage for 2.5s.'
WHERE skill_name = 'Homeland Defender' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Lapu-Lapu' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Lapu-Lapu releases two boomerangs in the target direction, each boomerang dealing 140<font color="fba51f"> (+50% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to enemies hit on its way out and back.

Enemies hit by both boomerangs take 50% damage from the second hit.'
WHERE skill_name = 'Justice Blades' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Lapu-Lapu' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Lapu-Lapu dashes in the target direction, dealing 100<font color="fba51f"> (+50% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to enemies along the way.'
WHERE skill_name = 'Jungle Warrior' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Lapu-Lapu' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Lapu-Lapu leaps to the target location while combining his twin blades into one, dealing 300<font color="fba51f"> (+80% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to nearby enemies upon landing and slowing them by 60% for 1s. (This skill cannot be interrupted.)
Lapu-Lapu gains 3 times the <font color="a6aafb">Bravery Blessing</font> from this skill and skills in transformed state.
For the next 10s, Lapu-Lapu enters <font color="a6aafb">Great Sword</font> stance and gains enhanced skills, 30 extra Physical & Magic Defense, and his Basic Attack damage is increased to 120%.'
WHERE skill_name = 'Bravest Fighter' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Lapu-Lapu' AND game_id = 1);

-- Layla
UPDATE hero_skills 
SET skill_description = 'Layla deals increased damage to enemies farther away from her (starting at 100% and increasing to 115% at 6 units away). This does not include Turrets.'
WHERE skill_name = 'Malefic Gun' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Layla' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Layla fires a Malefic Bomb in the target direction, dealing 200<font color="fba51f"> (+80% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to the first enemy hit (can Crit).

Upon hitting an enemy, Layla''s Basic Attacks and <font color="a6aafb">Void Projectile</font> gain extra range for 3s, and she gains 60% extra Movement Speed that decays over 1.2s. The duration of the Movement Speed boost is doubled if an enemy hero is hit.'
WHERE skill_name = 'Malefic Bomb' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Layla' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Layla fires an orb of Malefic Energy at the target enemy that explodes on hit, dealing 170<font color="fba51f"> (+65% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to targets in the area and applying a <font color="a6aafb">Magic Mark</font> on them for 3s.
When Layla hits an enemy with a <font color="a6aafb">Magic Mark</font>, she deals 100<font color="fba51f"> (+35% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to nearby enemies and stuns them for 0.25s.'
WHERE skill_name = 'Void Projectile' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Layla' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Layla fires a blast of Malefic Energy in the target direction, dealing 500<font color="fba51f"> (+150% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to enemies in a line.

<font color="a6aafb">Passive:</font> The range of Layla''s <font color="a6aafb">Void Projectile</font> and Basic Attacks is increased by 0.6 units. Her sight range is also slightly increased each time this skill is upgraded.'
WHERE skill_name = 'Destruction Rush' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Layla' AND game_id = 1);

-- Leomord
UPDATE hero_skills 
SET skill_description = 'Leomord''s Basic Attacks are guaranteed to Crit against enemies below 25 Max HP, dealing 100 damage.
Leomord converts every 200% Crit Chance gained into 100<font color="ffe63c">(+10*Hero Level)</font><font color="26e407"> (+15% Extra Max HP)</font> Physical Attack.'
WHERE skill_name = 'The Oath Keeper' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Leomord' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Leomord gains a 150<font color="fba51f"> (+50% Total Physical Attack)</font> shield and begins channeling, slowing enemies in the target direction by 25%. When the channeling is complete or interrupted, he thrusts his sword in the same direction, dealing up to 500<font color="fba51f"> (+180% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to enemies hit (scales with channel time) and slowing them by 40% for 1s.
Leomord can cast this skill again to actively interrupt the channeling.'
WHERE skill_name = 'Momentum' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Leomord' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Leomord charges in a designated direction, dealing 300<font color="fba51f"> (+50% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to enemies along the way and slowing them by 30% for 1s.'
WHERE skill_name = 'Decimation Assault' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Leomord' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Leomord summons <font color="a6aafb">Barbiel</font> to rush to him, knocking back and dealing 100<font color="fba51f"> (+40% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to all enemies in its path.
If <font color="a6aafb">Barbiel</font> comes in contact with Leomord, they will enter the Mounted State, gaining 50% Movement Speed that decays over 2s.
<font color="a6aafb">Mounted State</font>: Leomord gains a brand-new set of skills, and his Basic Attack can be used while moving and hits a circular area to deal AOE damage. Leomord also gains 70 Movement Speed and 30 Physical & Magic Defense. This lasts 10s.'
WHERE skill_name = 'Phantom Steed' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Leomord' AND game_id = 1);

-- Lesley
UPDATE hero_skills 
SET skill_description = 'If Lesley doesn''t take damage for 5s, her next Basic Attack gains extra range and 50% Crit Chance and deals 100<font color="fba51f"> (+100% Total Physical Attack)</font> <font color="ffe63c">True Damage</font> (20% extra damage against minions).
Each point of fixed Physical Penetration and each 1% Physical Penetration Lesley acquires is converted into 1% Crit Damage, but her base Crit Damage is reduced to 130%.
Lesley''s Basic Attack restores 5 points of energy and her <font color="a6aafb">Lethal Shot</font> doubles the amount of energy restored. The <font color="a6aafb">Lethal Shot</font> effect will activate immediately after Lesley uses a skill.'
WHERE skill_name = 'Lethal Shot' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Lesley' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Lesley enters the Camouflage state, gaining double Energy Regen, 40% extra Movement Speed, and 85 extra Physical Attack.

The state lasts 3s or until Lesley takes or deals damage. Enemies can detect Lesley''s position through distortions of their surroundings.'
WHERE skill_name = 'Master of Camouflage' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Lesley' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Lesley throws a tactical grenade in the target direction while jumping back slightly, dealing 150<font color="fba51f"> (+50% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to enemies in a fan-shaped area and knocking them back.

Lesley can cast this skill during <font color="a6aafb">Ultimate Snipe</font> to cancel the state and immediately fire a Fatal Bullet at the target. The attack is only triggered when there are unfired Fatal Bullets left.'
WHERE skill_name = 'Tactical Grenade' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Lesley' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Lesley locks onto the target enemy hero and fires 4 Fatal Bullets in succession, each dealing <font color="fb1f1f">Physical Damage</font> equal to 250<font color="fba51f"> (+80% Extra Physical Attack)</font> plus 5% of their lost HP and restoring 10 energy on hit. The Bullets can be blocked by other enemy heroes.

If this skill is interrupted, each remaining Bullet reduces the skill cooldown by 10%.

<font color="a6aafb">Passive</font>: Lesley''s Crit Chance is increased by 10%.'
WHERE skill_name = 'Ultimate Snipe' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Lesley' AND game_id = 1);

-- Ling
UPDATE hero_skills 
SET skill_description = 'Ling''s superb Lightness Skill allows him to leap among walls. He gains 4 extra Lightness Points per second when he''s on a wall and 5 extra Lightness Points each time he deals damage.

Ling gains 1.6 times Crit Chance from all sources but only has 140% Crit Damage.'
WHERE skill_name = 'Cloud Walker' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Ling' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = '<font color="a6aafb">Passive</font>: Ling’s Critical Chance is permanently increased by 2.5%.

<font color="a6aafb">Active</font>: Ling casts his Lightness Skill, leaping onto the designated wall, entering <font color="a6aafb">half-stealth</font> state, restoring Lightness Points more quickly and gaining 30% Movement Speed. If Ling receives damage, he will leave the <font color="a6aafb">half-stealth</font> state. If he is controlled, he will fall onto the ground and be slowed by 30% for 2s. When using this skill to jump from a wall to another, it will reset the Cooldown and refresh the <font color="a6aafb">half-stealth</font> state.'
WHERE skill_name = 'Finch Poise' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Ling' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Ling charges in the target direction and stabs nearby enemies, dealing them 300<font color="fba51f"> (+50% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font>.
If Ling casts this skill when he''s on the wall (no energy cost), he''ll dash to the target location on the ground, dealing 300<font color="fba51f"> (+50% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to enemies in the area and slowing them by 30% for 1.5s. 
<font color="a6aafb">Defiant Sword</font> is regarded as Basic Attack.'
WHERE skill_name = 'Defiant Sword' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Ling' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Ling leaps into the air, becoming invincible and gaining 10% extra Movement Speed for 1.5s. He ignores obstacles when in the air. He then lands on the ground, dealing 250<font color="fba51f"> (+100% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to enemies in the area and slowing them by 40% for 1.5s, knocking those in the center airborne for 1s, and creating a Sword Field for 8s.

Four <font color="a6aafb">Tempest of Blades</font> will also appear on the edge of the Sword Field. Ling can touch them to reduce the cooldown of <font color="a6aafb">Finch Poise</font> by 4s, reset the cooldown of <font color="a6aafb">Defiant Sword</font>, and gain 25 Lightness Points.'
WHERE skill_name = 'Tempest of Blades' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Ling' AND game_id = 1);

-- Lolita
UPDATE hero_skills 
SET skill_description = 'Every 3s, the Noumenon Energy Core grants a 20<font color="26e407"> (+2.5% Total HP)</font> <font color="62f8fe">(+20% Total Magic Power)</font> shield to Lolita and nearby allied heroes, and an extra shield after a skill or the Ultimate is cast. This shield can stack up to 3 times and lasts 30s.'
WHERE skill_name = 'Noumenon Energy Core' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Lolita' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Lolita dashes in the target direction. Her next Basic Attack within 4s will perform a short dash to the target, dealing 400<font color="fba51f"> (+100% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> and stunning them for 0.5s. This damage is doubled against Minions.'
WHERE skill_name = 'Power Charge' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Lolita' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Lolita raises her shield and reflects all incoming ranged Basic Attacks and <font color="a6aafb">Projectiles</font> in the direction of the shield for 3s. The shield will break after taking 1000<font color="26e407"> (+15% Total HP)</font> damage.

The damage and effects from the Unique Passives of an attacker''s equipment will not apply to the shield and will not be reflected. This skill can be interrupted by high level control effects.'
WHERE skill_name = 'Guardian''s Reflection' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Lolita' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Lolita begins charging for 2s while slowing enemies in a fan-shaped area by 60%. When the charging is complete or is stopped, Lolita slams her hammer on the ground, dealing up to 600<font color="fba51f"> (+100% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to enemies in the area and stunning them for up to 2s (the damage and stun duration are based on the charge time).

<font color="a6aafb">Use Again</font>: Lolita immediately stops charging and slams her hammer on the ground.'
WHERE skill_name = 'Noumenon Blast' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Lolita' AND game_id = 1);

-- Lunox
UPDATE hero_skills 
SET skill_description = 'Lunox is twisted by the powers of Chaos and Order.
When Lunox uses <font color="a6aafb">Power of Order</font>, she gains 0.5% of Spell Vamp for every 1% of <font color="7f62fe">Magic Penetration</font>. 
When Lunox uses <font color="a6aafb">Power of Chaos</font>, she gains 0.5% of <font color="7f62fe">Magic Penetration</font> for every 1% of Spell Vamp.'
WHERE skill_name = 'Dreamland Twist' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Lunox' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Lunox summons a rain of starlight upon nearby enemies, dealing 200<font color="62f8fe"> (+110% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font>. The starlight then returns to Lunox, each restoring 75<font color="62f8fe"> (+30% Total Magic Power)</font> HP to her. The HP restored is doubled when hitting enemy heroes.

This skill shares cooldown with <font color="a6aafb">Chaos Assault</font>. Grants one stack of <font color="a6aafb">Power of Order</font> after use and ends the Power of Chaos enhanced state.'
WHERE skill_name = 'Starlight Pulse' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Lunox' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Lunox unleashes Chaos Energy at an enemy, dealing <font color="7f62fe">Magic Damage</font> equal to 250<font color="62f8fe"> (+120% Total Magic Power)</font> plus 2.5% of the target''s Max HP (1.5% of Max HP against Creeps).

This skill shares cooldown with <font color="a6aafb">Starlight Pulse</font>. Grants one stack of <font color="a6aafb">Power of Chaos</font> after use.'
WHERE skill_name = 'Chaos Assault ' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Lunox' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'When Lunox uses the power of Order and Chaos, she will deal 300<font color="62f8fe"> (+150% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> to the targets along the way and slow them by 40% for 2s.'
WHERE skill_name = 'Cosmic Fission' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Lunox' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Lunox is twisted by the powers of Chaos and Order.

When Lunox uses <font color="a6aafb">Power of Order</font>, she gains <font color="a6aafb">Brilliance</font> and becomes invincible while dealing continuous damage to nearby enemies. 

When Lunox uses <font color="a6aafb">Power of Chaos</font>, she gains <font color="a6aafb">Darkening</font> and can blink in a target direction and greatly reduces the cooldown of <font color="a6aafb">Chaos Assault</font> for a brief period.'
WHERE skill_name = 'Order & Chaos' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Lunox' AND game_id = 1);

-- Luo Yi
UPDATE hero_skills 
SET skill_description = 'Luo Yi''s skills can create <font color="a6aafb">Sigils of Yin/Yang</font> on the battlefield. Each Sigil lasts up to 6s.
Sigils of opposite attributes will trigger <font color="a6aafb">Yin-Yang Reaction</font> when they are within a certain distance, dealing 365 (+20*Hero Level) <font color="62f8fe">(+190% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> to the marked enemies, stunning them for 0.3s, and pulling them toward each other.
Each time Luo Yi applies a new Sigil to a marked enemy, she gains a 300 (+10*Hero Level) <font color="62f8fe">(+150% Total Magic Power)</font> shield (up to 3 stacks) and 50% extra Movement Speed that decays over 2s.'
WHERE skill_name = 'Duality' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Luo Yi' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Luo Yi casts the energy of <font color="a6aafb">Yin/Yang</font> in the target direction, dealing 210<font color="62f8fe"> (+135% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> to the first enemy hit and those behind them in a fan-shaped area. Enemy heroes hit are marked with a <font color="a6aafb">Sigil of Yin/Yang</font>.
Luo Yi stores up to 4 <font color="a6aafb">Dispersion</font> charges and gains 1 charge every 8s. She also immediately gains 1 charge each time <font color="a6aafb">Yin-Yang Reaction</font> is triggered.
The state of this skill changes on each cast.'
WHERE skill_name = 'Dispersion' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Luo Yi' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Luo Yi summons <font color="a6aafb">Fire of Yang/Aqua of Yin</font> at the target location, dealing 250<font color="62f8fe"> (+50% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> to enemies hit and slowing them by 60% for 0.5s.
<font color="a6aafb">Fire of Yan/Aqua of Yin</font> then remains at the location for 6s, dealing 50<font color="62f8fe"> (+10% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> every 0.7s to nearby enemies. It can also trigger <font color="a6aafb">Yin-Yang Reaction</font> with Sigils of opposite attributes.
The state of this skill changes on each cast.'
WHERE skill_name = 'Rotation' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Luo Yi' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Luo Yi creates a Teleport Circle around herself and marks the target location (within 28 units) as its destination. After a 3s delay, allied heroes (including herself) within the Circle will be teleported to the location.

<font color="a6aafb">Passive</font>: Luo Yi''s Cooldown Reduction is increased by 6%.'
WHERE skill_name = 'Diversion' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Luo Yi' AND game_id = 1);

-- Lylia
UPDATE hero_skills 
SET skill_description = 'Lylia gets power from <font color="a6aafb">Gloom</font>, increasing her Movement Speed by 15%. Each <font color="a6aafb">Gloom</font> upgrade further increases this bonus by 5%.
<font color="a6aafb">Gloom</font> gains an upgrade every time he devours <font color="a6aafb">Shadow Energy</font>, up to 5 times. Gloom upgrade increases the detonation damage of <font color="a6aafb">Shadow Energy</font>.'
WHERE skill_name = 'Angry Gloom' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Lylia' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Lylia sends out <font color="a6aafb">Gloom</font> with a shockwave, dealing 250<font color="62f8fe"> (+100% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> to enemies in a line and slowing them by 30% for 1.5s.
If <font color="a6aafb">Gloom</font> touches <font color="a6aafb">Shadow Energy</font>, he will devour and detonate it.'
WHERE skill_name = 'Magic Shockwave' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Lylia' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Lylia condenses Shadow Energy at the target location, dealing 90<font color="62f8fe"> (+50% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> to enemies hit and slowing them by 80%.
<font color="a6aafb">Shadow Energy</font> can be detonated by <font color="a6aafb">Gloom''s</font> devour, dealing 220<font color="62f8fe"> (+115% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> to the enemies nearby. Each <font color="a6aafb">Gloom</font> upgrade increases the detonation damage by 20%, up to 80%.
<font color="a6aafb">Gloom</font> will restore 20% of Shadow Energy''s Recharge Time when it hits an enemy hero.
Lylia starts with the <font color="a6aafb">Shadow Energy</font> skill, storing one charge every 6s.'
WHERE skill_name = 'Shadow Energy' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Lylia' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Lylia returns to the Black Shoes'' location 4s ago and restores her HP and Mana to the previous state, and an extra 10% Max HP. She also gains 20% extra Movement Speed for 2s.'
WHERE skill_name = 'Black Shoes' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Lylia' AND game_id = 1);

-- Martis
UPDATE hero_skills 
SET skill_description = 'Each time Martis uses a skill, his Attack Speed will be increased by 30%, 120% maximum. Lasts 4s. He gains (+8*Hero Level) extra Attack at full stacks.'
WHERE skill_name = 'Asura''s Wrath' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Martis' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Martis draws enemies to a fan-shaped area in front of him and deals 350<font color="fba51f"> (+130% Extra Physical Attack)</font> <font color="fb1f1f">Physical Damage</font>, slowing them by 40% for 2s. '
WHERE skill_name = 'Asura Aura' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Martis' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Martis strikes in the target direction three times, each time dealing 225<font color="fba51f"> (+120% Extra Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to enemies hit. Enemies hit by the first and third strike are also knocked back. The attack direction can be changed once using the Joystick.

<font color="a6aafb">Use Again</font>: Martis leaps in the target direction, dealing 300<font color="fba51f"> (+150% Extra Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to enemies in his path and knocking them airborne.
Martis gains Control Immunity and 60% Damage Reduction when casting this skill.'
WHERE skill_name = 'Mortal Coil' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Martis' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Martis lunges at a designated enemy hero, dealing 700<font color="fba51f"> (+120% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> (deals True Damage if the enemy''s HP is below 50%).
If the enemy is killed by this skill, Martis can cast the skill again within 10s and gains 100% extra Movement Speed that gradually decays over 5s. Each successive cast also increases the skill''s damage by 15% (up to 30%).'
WHERE skill_name = 'Decimation' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Martis' AND game_id = 1);

-- Masha
UPDATE hero_skills 
SET skill_description = 'Blessed by the Bear King, Masha has 3 HP bars and won''t die until all of them are depleted. She can ignore an instance of damage and remove all Control effects on herself each time she loses an HP bar. When Masha only has two HP bars left, skills will only require 50% of their original HP Cost to cast. When Masha only has one HP bar left, she doesn''t need to spend HP to cast skills.'
WHERE skill_name = 'Ancient Strength' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Masha' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = '<font color="a6aafb">Passive</font>: Masha gains <font color="a6aafb">Power of the Wild</font>, causing her Basic Attacks to deal extra <font color="fb1f1f">Physical Damage</font> equal to 2<font color="fba51f"> (+1% Extra Physical Attack)</font>% of the target''s Max HP (up to 60 against Creeps and doesn''t take effect on Turrets or Base).

<font color="a6aafb">Active</font>: Masha consumes 24% HP to empower herself, gaining 50% Movement Speed (decays over time) for 2s. She also increases the extra <font color="fb1f1f">Physical Damage</font> from <font color="a6aafb">Power of the Wild</font> by 3<font color="fba51f"> (+1% Extra Physical Attack)</font>% of the target''s Max HP and gains 50% Attack Speed for her next two Basic Attacks.'
WHERE skill_name = 'Wild Power' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Masha' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Masha spends 24% HP to roar at enemies, dealing 200<font color="fba51f"> (+100% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> and reducing their Attack Speed by 50% for 2s.'
WHERE skill_name = 'Howl Shock' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Masha' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Masha spends 34% HP to lunge at an enemy hero (immune to control effects during the lunge), dealing 400<font color="fba51f"> (+220% Extra Physical Attack)</font> <font color="fb1f1f">Physical Damage</font>, slowing them by 25% for 2s, and knocking back nearby enemies. The cooldown of this skill will be reset each time Masha loses an HP bar.'
WHERE skill_name = 'Thunderclap' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Masha' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Masha gains Energy when dealing damage to enemies and extra Energy when dealing damage with Wild Power.

After leaving combat for 3s, Masha can activate this skill to spend half a full bar of Energy to recover a full HP bar. Masha is invincible while casting this skill.'
WHERE skill_name = 'Life Recovery' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Masha' AND game_id = 1);

-- Mathilda
UPDATE hero_skills 
SET skill_description = 'Mathilda gains <font color="a6aafb">Ancestral Guidance</font> while moving. When it''s fully charged, her next Basic Attack will be enhanced, dealing 200<font color="fba51f"> (+100% Total Physical Attack)</font> <font color="62f8fe">(+100% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> to the target and granting her 80 extra Movement Speed that decays over 2.5s.'
WHERE skill_name = 'Ancestral Guidance' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Mathilda' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Mathilda resonates with the power of her ancestors for 4s, attracting wisps as her movement distance increases (up to 6 wisps).

At the end of the skill''s duration, or when Mathilda casts this skill again, the wisps will seek and attack nearby enemies, each dealing 275<font color="62f8fe"> (+80% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> and revealing the enemies'' positions briefly. Subsequent damage dealt by wisps to the same target decays to 40%.'
WHERE skill_name = 'Soul Bloom' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Mathilda' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Mathilda leaps in the target direction and creates a field around her, gaining a 350<font color="62f8fe"> (+180% Total Magic Power)</font> shield and 25% extra Movement Speed for 3s. Allied heroes who come into contact with the field will receive a 50% shield and <font color="a6aafb">Guiding Wind</font>. The first allied hero that triggers <font color="a6aafb">Guiding Wind</font> will be guided to Mathilda, and both of them will gain the same Movement Speed boost.

When casting this skill during <font color="a6aafb">Circling Eagle</font>, Mathilda won''t change her position.
<font color="a6aafb">Guiding Wind</font> expires 2s after the hero leaves Mathilda''s field.'
WHERE skill_name = 'Guiding Wind' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Mathilda' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Mathilda applies a <font color="a6aafb">Soul Mark</font> to the target enemy hero and circles around them for up to 3.5s, during which her wisps will fly into nearby enemies, each dealing 40<font color="62f8fe"> (+15% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font>. The Soul Mark will also slow the target by 15% and <font color="a6aafb">Soul Bloom</font> will prioritize the target with Soul Mark.
Within the duration, Mathilda can select an area to dash to. At the end of the duration, she''ll dash at the target with <font color="a6aafb">Soul Mark</font>, dealing 320<font color="62f8fe"> (+120% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> while knocking enemies in her path airborne for 0.6s, transferring the <font color="a6aafb">Soul Mark</font> to the first enemy hero that she knocks airborne, and reducing the skill cooldown by 40%.
Mathilda gains Control Immunity and a 400<font color="62f8fe"> (+160% Total Magic Power)</font> shield for the skill duration.'
WHERE skill_name = 'Circling Eagle' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Mathilda' AND game_id = 1);

-- Melissa
UPDATE hero_skills 
SET skill_description = '"My tailor shop excels at fixing and ''fixing'' dolls. Am I right, Muddles?"

(Melissa deals 125% damage to Minions, Creeps, and Summoned Units.)'
WHERE skill_name = 'Doll Buster' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Melissa' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = '"Watch me slide forward and increase my Attack Speed for 3 seconds— Ah, that was just boring…"

"<font color="a6aafb">Muddles</font>, go that way!"
"<font color="a6aafb">Cuddles</font>, come here!"

(The skill''s cooldown is reduced by 0.5s each time Melissa damages the enemy by attacking <font color="a6aafb">Muddles</font>.)'
WHERE skill_name = 'Falling!' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Melissa' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'The plan''s like this: Throw <font color="a6aafb">Muddles</font> out to hold down the bad guys, and then… I come on stage!
"I puncture the bad guys, while <font color="a6aafb">Giggles</font> hit <font color="a6aafb">Muddles</font> to punish them as well! Hee, fantastic!"

(<font color="a6aafb">Muddles</font> deals 250<font color="fba51f"> (+80% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> on the first hit and links nearby enemies for up to 6s. Linked enemies are slowed by 60% that decays over 1.5s and can break the link by moving out of the range. <font color="a6aafb">Muddles</font> will return to Melissa early when there are no enemies around and immediately if she''s too far away. When <font color="a6aafb">Muddles</font> is present, you can tap the <font color="a6aafb">Attack Minion</font> button to directly attack <font color="a6aafb">Muddles</font>, though it cannot trigger the multi-hit damage. <font color="a6aafb">Giggles</font> only hits <font color="a6aafb">Muddles</font> when Melissa has a target for her Basic Attack.)'
WHERE skill_name = 'Eyes on You!' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Melissa' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = '<font color="a6aafb">Cuddles</font>, protect me! For 4 seconds, let no bad guys come close. Unless I say otherwise!

(When activated, the field knocks back enemies in the area and deals them 500<font color="62f8fe"> (+100% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font>. It''ll then continuously knock back enemies who attempt to enter the field, dealing them 50<font color="62f8fe"> (+10% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> and briefly slowing them. The field will also interrupt the enemy''s movement skills unless they''re immune to control effects. The field will move with Melissa once, when she''s about to move out of the boundary.
<font color="a6aafb">Passive</font>: Melissa''s Physical & Magic Defense are increased by 3. This effect is increased to 5 times when the skill is active.)'
WHERE skill_name = 'Go Away!' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Melissa' AND game_id = 1);

-- Minotaur
UPDATE hero_skills 
SET skill_description = 'When Minotaur applies a control effect to an enemy hero with a skill, he will also reduce their Hybrid Defense by 5 (+1*Hero Level)%. When Minotaur heals an allied hero with a skill, he will also increase their Hybrid Defense by 3 for 200%s. These effects are doubled in Enraged state.'
WHERE skill_name = 'Rage Incarnate' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Minotaur' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Minotaur jumps to the target location, dealing 280<font color="fba51f"> (+60% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to enemies in the area and briefly knocking them airborne. Enemies hit will also be slowed by 40% while Minotaur enhances his Basic Attacks to deal <font color="26e407"> (+3% Total HP)</font> extra <font color="fb1f1f">Physical Damage</font> for 2s.

<font color="a6aafb">Enraged</font>: Increases the AOE range and the damage dealt by <font color="26e407"> (+3% Total HP)</font> <font color="fb1f1f">Physical Damage</font>.'
WHERE skill_name = 'Despair Stomp' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Minotaur' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Minotaur motivates himself and nearby allied heroes, recovering 220<font color="62f8fe"> (+60% Total Magic Power)</font> HP for himself and his allies. Minotaur additionally recovers 150% of his lost HP.

<font color="a6aafb">Enraged</font>: Minotaur gains <font color="a6aafb">Enraged Regen</font> for 8%s, during which he recovers HP equal to  of damage taken from enemy heroes'' Basic Attacks.'
WHERE skill_name = 'Motivation Roar' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Minotaur' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Minotaur enters <font color="a6aafb">Enraged</font> state and smashes the ground 3 times. The first 2 hits deal 180<font color="fba51f"> (+85% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to nearby enemies and slow them by 60%, while the final hit deals 200<font color="ffe63c"> (+85% Total Physical Attack)</font> <font color="ffe63c">True Damage</font> and knocks targets airborne for 0.8s. Minotaur is immune to control effects during this attack.

The <font color="a6aafb">Enraged</font> state lasts 12s and enhances Minotaur''s skills for the duration.'
WHERE skill_name = 'Minoan Fury' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Minotaur' AND game_id = 1);

-- Minsitthar
UPDATE hero_skills 
SET skill_description = 'Minsitthar''s Basic Attacks and skills apply a stack of <font color="a6aafb">Mark of the King</font>, up to 5 stacks. Upon reaching max stacks, the next attack detonates all <font color="a6aafb">Mark of the King</font> stacks, dealing <font color="fb1f1f">Physical Damage</font> equal to 400<font color="26e407"> (+6% Total HP)</font> of Minsitthar''s Max HP and stunning the target for 0.8s while healing Minsitthar for 400<font color="26e407"> (+6% Total HP)</font> HP. Can only trigger once every 6s on the same target.'
WHERE skill_name = 'Mark of the King' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Minsitthar' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Minsitthar thrusts forward with the Spear of Glory, dealing 175<font color="fba51f"> (+40% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> and slowing enemies hit by 30%. Enemy heroes hit by the tip of the spear will be stunned for 0.6s. After a short delay, Minsitthar pulls back the spear, dealing 175<font color="fba51f"> (+40% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to all enemies along the way and dragging enemy heroes hit to him.'
WHERE skill_name = 'Spear of Glory' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Minsitthar' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Minsitthar awakens the power in his shield and releases it, dealing 100<font color="fba51f"> (+45% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to all enemies in a rectangular area and slowing them by 80% (decaying rapidly over 2s). Meanwhile, he enters <font color="a6aafb">Phalanx</font> state for 3s, reducing damage taken from the front by 25% and enhancing his Basic Attack to swiftly strike an area in front of him for 100<font color="fba51f"> (+45% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> per hit.'
WHERE skill_name = 'Shield Assault' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Minsitthar' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Minsitthar charges forward and calls 4 Royal Guards to form a field around him. The Royal Guards cannot move but will attack enemies in the field and deal <font color="fba51f"> (+40% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to them.
Enemies in the field are slowed by 20% and cannot use movement skills.'
WHERE skill_name = 'King''s Calling' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Minsitthar' AND game_id = 1);

-- Miya
UPDATE hero_skills 
SET skill_description = 'Each time Miya hits a target with her Basic Attack, she gains 5% Attack Speed for 4s. Stacks up to 5 times.

After reaching full stacks, Miya summons a <font color="a6aafb">Moonlight Shadow</font> with each Basic Attack that deals 30<font color="fba51f"> (+25% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> and inherits a portion of Attack Effects.'
WHERE skill_name = 'Moon Blessing' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Miya' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Miya shoots two extra arrows with each Basic Attack, dealing 10<font color="fba51f"> (+100% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to the target enemy and 30% damage to nearby targets. This effect lasts 4s. Each extra arrow inherits a portion of Attack Effects.'
WHERE skill_name = 'Moon Arrow' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Miya' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Miya launches an empowered arrow on the target area, dealing 270<font color="fba51f"> (+45% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to enemies within and immobilizing them for 1.2s. The arrow then splits into 6 scattering minor arrows, each dealing 40<font color="fba51f"> (+20% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to the first enemy hit and slowing them by 30% for 2s.'
WHERE skill_name = 'Arrow of Eclipse' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Miya' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Miya removes all debuffs on her and conceals herself, gaining 65% extra Movement Speed. This state lasts 2s or until she launches an attack.

Miya gains full stacks of <font color="a6aafb">Moon Blessing</font> upon leaving the state.'
WHERE skill_name = 'Hidden Moonlight' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Miya' AND game_id = 1);

-- Moskov
UPDATE hero_skills 
SET skill_description = 'Moskov''s Basic Attacks can penetrate the target and deal <font color="fba51f"> (+68% Total Physical Attack)</font>-<font color="fba51f"> (+110% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to enemies behind them (scales with hero level). Each Basic Attack hit reduces the cooldowns of <font color="a6aafb">Abyss Walker</font> by 0.8s and <font color="a6aafb">Spear of Misery</font> by 0.8s.'
WHERE skill_name = 'Spear of Quiescence' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Moskov' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Moskov teleports to the target location, increasing his Attack Speed to 1.15 times for 3s. Meanwhile, his Basic Attack deals <font color="fba51f"> (+10% Total Physical Attack)</font> more damage to enemies behind the primary target.'
WHERE skill_name = 'Abyss Walker' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Moskov' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Moskov launches a powerful strike at the target enemy hero or Creep, dealing 300<font color="fba51f"> (+60% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font>, knocking them back, and revealing their position for 2s.

If the target collides with an enemy hero when knocked back, they''ll both take 200<font color="fba51f"> (+30% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> and be stunned for 1.2s. If the enemy is knocked into a wall, they will also be stunned for the same duration.'
WHERE skill_name = 'Spear of Misery' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Moskov' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'After a short delay, Moskov throws the <font color="a6aafb">Spear of Destruction</font> in the target direction, dealing 340<font color="fba51f"> (+100% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to enemies in its path and to the first enemy hero hit. Upon hitting an enemy hero, the spear pierces them, dealing 10% extra <font color="fb1f1f">Physical Damage</font> to enemies behind them. The target and enemies hit by the piercing damage will be slowed by 50% for 1s (the slow duration scales with the spear''s travel time, up to 3s).

When <font color="a6aafb">Spear of Destruction</font> hits the first enemy hero, it creates a shadow behind them and refreshes the cooldown of <font color="a6aafb">Abyss Walker</font>.

<font color="a6aafb">Use Again</font>: Moskov casts <font color="a6aafb">Abyss Walker</font> from the shadow''s location (shares the same cooldown as the skill).'
WHERE skill_name = 'Spear of Destruction' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Moskov' AND game_id = 1);

-- Nana
UPDATE hero_skills 
SET skill_description = 'Upon taking fatal damage, Nana removes all debuffs on her and transforms, becoming untargetable and invincible, and gains 30% Movement Speed for 2s. She also recovers 10% Max HP over the duration.

Nana can only transform once every 150s and cannot cast skills in the transformed form.'
WHERE skill_name = 'Molina''s Gift' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Nana' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Nana hurls her Magic Boomerang in the target direction, dealing damage to enemies hit on its way out and back. The boomerang deals 300<font color="62f8fe"> (+100% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> to the first enemy hit. For every additional enemy hit, the damage is reduced by 10% (max reduction of 30%).'
WHERE skill_name = 'Magic Boomerang' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Nana' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Nana throws Molina at the target location, dealing 150<font color="62f8fe"> (+30% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> to enemies within range and <font color="a6aafb">Transforming</font> enemy heroes hit into small animals.

If Molina does not hit an enemy hero, she will remain on the ground and chase the nearest enemy hero that comes into range, <font color="a6aafb">Transforming</font> the first enemy hero she touches.

<font color="a6aafb">Transform</font>: Reduces the target''s Movement Speed by 50% and Magic Defense by 30% for 1.5s. Transformed heroes cannot attack or use skills.'
WHERE skill_name = 'Molina Smooch' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Nana' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Nana summons Molina to strike the target area 3 times, each time dealing 440<font color="62f8fe"> (+140% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> to enemies within and slowing them by 30% for 1s. Enemies hit consecutively will be stunned for 1s.'
WHERE skill_name = 'Molina Blitz' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Nana' AND game_id = 1);

-- Natalia
UPDATE hero_skills 
SET skill_description = 'If Natalia stays in a bush without taking damage for 1s, she will enter <font color="a6aafb">Camouflage</font> state and gain 15% Movement Speed. In this state, Natalia''s next Basic Attack will teleport her behind her target and deal 200<font color="fba51f"> (+110% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> while silencing the target for 0.25s.

Dealing damage, taking damage or using skills will immediately end the <font color="a6aafb">Camouflage</font> state, but her next Basic Attack will remain enhanced for another 1s.

Natalia''s base Crit Damage is reduced to 150%, but her damage to Creeps is increased to 150%.'
WHERE skill_name = 'Assassin Instinct' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Natalia' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Natalia dashes in the target direction, dealing 250<font color="fba51f"> (+50% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to enemies in her path.

After hitting an enemy, she can cast this skill again within 5s.'
WHERE skill_name = 'Claw Dash' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Natalia' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Natalia releases a <font color="a6aafb">Smoke Bomb</font> at her location, slowing enemies within by 25% while Natalia becomes immune to enemy Basic Attacks for 4s.'
WHERE skill_name = 'Smoke Bomb' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Natalia' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = '<font color="a6aafb">Passive</font>: Natalia gains 15% extra Crit Chance.

<font color="a6aafb">Active</font>: Natalia immediately enters <font color="a6aafb">Assassin Instinct</font> state. Natalia can store up to 2 charges of her Ultimate and each charge has a recharge time of 30s. Creep kills will reduce the current remaining recharge time by 50% of the full recharge time.'
WHERE skill_name = 'The Hunt' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Natalia' AND game_id = 1);

-- Natan
UPDATE hero_skills 
SET skill_description = 'Natan gains a stack of <font color="a6aafb">Entanglement</font> each time he or his <font color="a6aafb">Reverse-Clone</font> hits an enemy with a skill (up to 6 stacks). Each stack lasts 2.5s and grants 7.5% Attack Speed and 5% Movement Speed.
Natan''s Basic Attack projectiles will return to Natan after reaching the maximum range, dealing an extra 30<font color="fba51f"> (+50% Total Physical Attack)</font> <font color="62f8fe">(+60% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> to enemies along the way (inherits a portion of Attack Effects). Hitting an enemy refreshes <font color="a6aafb">Entanglement</font>''s duration.'
WHERE skill_name = 'Theory of Everything' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Natan' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Natan shoots a dense mass of energy in the target direction, dealing 225<font color="fba51f"> (+100% Total Physical Attack)</font> <font color="62f8fe">(+120% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> to enemies in its path.'
WHERE skill_name = 'Superposition' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Natan' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Natan launches a Gravitational Attractor in the target direction, dealing 150<font color="fba51f"> (+50% Total Physical Attack)</font> <font color="62f8fe">(+60% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> to enemies in its path and knocking them back.
The Attractor detonates upon reaching the maximum range, dealing 30<font color="fba51f"> (+10% Total Physical Attack)</font> <font color="62f8fe">(+12% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> to nearby enemies and knocking them back.'
WHERE skill_name = 'Interference!' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Natan' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Natan summons a <font color="a6aafb">Reverse-Clone</font> that lasts 10s at 6 units away. The <font color="a6aafb">Reverse-Clone</font> copies his moves and attacks in reverse and inherits 35% of his Basic Attack and skill damage.
<font color="a6aafb">Use Again</font>: Natan switches places with the <font color="a6aafb">Reverse-Clone</font>.

Each cast reduces other skills'' remaining cooldowns by 50%. The <font color="a6aafb">Reverse-Clone</font> will disappear if Natan is too far away.'
WHERE skill_name = 'Entropy?' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Natan' AND game_id = 1);

-- Novaria
UPDATE hero_skills 
SET skill_description = '<font color="a6aafb">Astral Spheres</font> summoned by Novaria will continuously slow nearby enemies by 20% and grant vision of them.'
WHERE skill_name = 'Star Trail' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Novaria' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Novaria summons an <font color="a6aafb">Astral Sphere</font> at the target location, continuously dealing 75<font color="62f8fe"> (+25% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> to nearby enemies. After 2s, the sphere will explode, dealing <font color="7f62fe">Magic Damage</font> equal to 260<font color="62f8fe"> (+50% Total Magic Power)</font> plus 4% of the enemy''s Max HP to nearby enemies, and increasing <font color="a6aafb">Astral Sphere''s</font> slow effect to 2.5 times the original slow effect.'
WHERE skill_name = 'Astral Meteor' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Novaria' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Novaria summons an <font color="a6aafb">Astral Sphere</font> at a distance and draws it towards her. At the same time, Novaria gains 20% Movement Speed and can pass through terrain. Passing through a wall will increase the Movement Speed bonus to 60%.

When the <font color="a6aafb">Astral Sphere</font> reaches Novaria, she can cast <font color="a6aafb">Star Shatter</font> to launch it in a target direction within 5s. The sphere will explode when hitting an enemy hero, dealing <font color="7f62fe">Magic Damage</font> equal to 230<font color="62f8fe"> (+70% Total Magic Power)</font> plus 4% of the target''s Max HP. The damage will increase based on the <font color="a6aafb">Astral Sphere''s</font> travel distance (starting from when the sphere is summoned), up to 2.5 times the original damage.'
WHERE skill_name = 'Astral Recall' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Novaria' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Novaria scatters <font color="a6aafb">Astral Echo</font> in the target direction, briefly slowing enemy heroes hit by 50% while applying <font color="a6aafb">Astral Ring</font> on them, increasing their hitbox by 2.5 times and revealing their surrounding area. This effect lasts 5s.'
WHERE skill_name = 'Astral Echo' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Novaria' AND game_id = 1);

-- Odette
UPDATE hero_skills 
SET skill_description = 'Each skill cast grants extra range on Odette''s next Basic Attack within 8s and causes it to bounce between enemies (or an enemy and herself if only one enemy is in range), dealing 144-200<font color="62f8fe"> (+50% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> per hit.

Odette''s skills will also trigger this effect when hitting an enemy. This effect stacks up to 3 times.'
WHERE skill_name = 'Lakeshore Ambience' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Odette' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Odette releases a magic swan in the target direction, dealing 300<font color="62f8fe"> (+150% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> to enemies hit and slowing them by 30% for 2s.'
WHERE skill_name = 'Avian Authority' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Odette' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Odette releases a set of magic energy balls in the target direction, dealing 250<font color="62f8fe"> (+50% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> to the first enemy hit and immobilizing them for 1.5s. After hitting an enemy, another energy ball will split off and attack a nearby enemy (prioritizes enemy heroes), dealing them 250<font color="62f8fe"> (+50% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> and immobilizing them for 1.5s.'
WHERE skill_name = 'Blue Nova' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Odette' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Odette begins to dance, gaining a 1400<font color="62f8fe"> (+150% Total Magic Power)</font> shield while dealing up to 2400<font color="62f8fe"> (+900% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> to enemies in a large area around her for 5s. The bounce speed and frequency of <font color="a6aafb">Lakeshore Ambience</font>''s sound wave in the area are also enhanced when the skill is active.
Use again while the skill is active to dash in the target direction.
<font color="A4AAC7">The skill is a channeling cast and will be interrupted if Odette is hit by high level control effects (knocked airborne, transformed, etc.) or if she performs another action.</font>'
WHERE skill_name = 'Swan Song' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Odette' AND game_id = 1);

-- Paquito
UPDATE hero_skills 
SET skill_description = 'After every 3 skill casts, Paquito enters the <font color="a6aafb">Champ Stance</font>, gaining an enhanced skill ignoring his current cooldowns. He gains 60% extra Movement Speed that decays over 1.8s after casting the enhanced skill.
Paquito''s Basic Attacks only deal <font color="fba51f"> (+85% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font>.'
WHERE skill_name = 'Champ Stance' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Paquito' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Paquito throws a punch in the target direction, dealing 210<font color="fba51f"> (+50% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to enemies hit. If this skill hits an enemy hero or Creep, Paquito will also gain a 150<font color="fba51f"> (+135% Total Physical Attack)</font> shield for 2.5s.

<font color="a6aafb">Champ Stance</font>: The damage is increased to 350<font color="fba51f"> (+100% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> and the shield value is increased to 140%. The normal and enhanced shields can stack.'
WHERE skill_name = 'Heavy Left Punch' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Paquito' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Paquito dashes in the target direction and throws a jab, dealing 200<font color="fba51f"> (+165% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to enemies hit. Paquito will stop and throw the jab immediately upon colliding with an enemy hero or Creep during the dash.

<font color="a6aafb">Champ Stance</font>: The damage is increased to 350<font color="fba51f"> (+230% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font>.'
WHERE skill_name = 'Jab' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Paquito' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Paquito launches an elbow strike in the target direction, dealing 250<font color="fba51f"> (+50% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to enemies hit and knocking them back. He then throws a haymaker, dealing 300<font color="fba51f"> (+90% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to enemies hit and slowing them by 75% for 1s, as he darts backward.

<font color="a6aafb">Champ Stance</font>: Instead of a haymaker, Paquito launches an uppercut after the elbow strike, dealing 400<font color="fba51f"> (+120% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to enemies hit and knocking them airborne for 0.5s.'
WHERE skill_name = 'Knockout Strike' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Paquito' AND game_id = 1);

-- Pharsa
UPDATE hero_skills 
SET skill_description = 'Every 5 to 8s (varies with <font color="a6aafb">Feathered Air Strike</font> level), Verri enters the Hunting state and assists Pharsa on her next attack against an enemy hero, dealing extra <font color="7f62fe">Magic Damage</font> equal to 8% of the target''s Max HP (+ 1% for every 200 Magic Power owned) and slowing them by 60% for 1s.'
WHERE skill_name = 'Spiritual Unity' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Pharsa' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Pharsa unleashes a blast of magic at the target location, dealing 300<font color="62f8fe"> (+120% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> to enemies hit and marking them for 4s.

When Pharsa hits a marked enemy with a Basic Attack or active skill, the mark is consumed to stun them for 1s.
Marked enemies have their position revealed.'
WHERE skill_name = 'Curse of Crow' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Pharsa' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Pharsa releases magic energy in the target direction, dealing 525<font color="62f8fe"> (+145% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> to enemies hit.'
WHERE skill_name = 'Energy Impact' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Pharsa' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = '<font color="a6aafb">Passive</font>: Each level-up reduces <font color="a6aafb">Spiritual Unity</font>''s interval by 1s.
<font color="a6aafb">Active</font>: Pharsa takes flight for 8s and bombards the target location, dealing 570<font color="62f8fe"> (+160% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> to enemies within the area. This skill can be cast up to 4 times within the duration.'
WHERE skill_name = 'Feathered Air Strike' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Pharsa' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Pharsa turns into mist and wraps herself around Verri, gaining 150% extra Movement Speed (decaying over time) and the ability to fly over terrain. This state lasts up to 5s or until she uses a Basic Attack or skills, or is controlled.'
WHERE skill_name = 'Wings by Wings' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Pharsa' AND game_id = 1);

-- Phoveus
UPDATE hero_skills 
SET skill_description = 'Phoveus''s next Basic Attack allows him to charge at the enemy, knocking them back, dealing extra <font color="7f62fe">Magic Damage</font> equal to 4% of the enemy''s Max HP, and gaining a Shield equal to 8% of his Max HP. This effect has a 26-14s cooldown (based on <font color="a6aafb">Infernal Pursuit</font> level).
<font color="a6aafb">Astaros'' Gaze</font>: Whenever an enemy hero blinks, dashes, or is displaced within 8 units of Phoveus, the cooldown of <font color="a6aafb">Demonic Force</font> will be reduced by 20% and the cooldown of his other skills will be reduced by 0.5s.'
WHERE skill_name = 'Demonic Force' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Phoveus' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Phoveus slams his monolith into the ground, dealing 200<font color="fba51f"> (+120% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to enemies in the area and slowing them by 70% for 0.5s. If this skill hits an enemy, Phoveus''s next <font color="a6aafb">Demonic Impact</font> will leave behind an <font color="a6aafb">Astaros Eye</font>.

<font color="a6aafb">Astaros Eye</font>: Implodes after a short delay, dealing 100<font color="fba51f"> (+60% Total Physical Attack)</font> <font color="7f62fe">Magic Damage</font> to the enemies.'
WHERE skill_name = 'Demonic Impact' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Phoveus' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Phoveus lowers his monolith and releases his demonic power in the target direction, knocking enemies airborne, dragging them along, and dealing 250<font color="fba51f"> (+100% Extra Physical Attack)</font> <font color="7f62fe">Magic Damage</font>.'
WHERE skill_name = 'Dark Wave' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Phoveus' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = '<font color="a6aafb">Sinner</font>: <font color="a6aafb">Demonic Force</font>, <font color="a6aafb">Astaros Eye</font>, and <font color="a6aafb">Dark Wave</font> can apply <font color="a6aafb">Sinner''s Mark</font> to the enemy hero hit.

<font color="a6aafb">Judgment</font>: Phoveus leaps into the air and smashes down with his monolith at the enemy hero with <font color="a6aafb">Sinner''s Mark</font>, dealing 250<font color="fba51f"> (+100% Total Physical Attack)</font> plus extra <font color="fb1f1f">Physical Damage</font> equal to 5% of the target''s Max HP to enemies in the area while Phoveus recovers <font color="26e407">50 plus 6% of his Lost HP</font>.

<font color="A4AAC7">The HP recovered is reduced by 80% when hitting multiple enemies</font>.'
WHERE skill_name = 'Infernal Pursuit' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Phoveus' AND game_id = 1);

-- Popol and Kupa
UPDATE hero_skills 
SET skill_description = 'Kupa recovers 10% Max HP per second after not taking damage for 5s. When Kupa is killed, Popol can <font color="a6aafb">Pray</font> for 3s to bring Kupa back to the battlefield. Cooldown: 30s.
Every 3 consecutive attacks from Kupa will enhance Popol''s next Basic Attack to deal <font color="fba51f"> (+220% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font>. Kupa has 2500<font color="fba51f"> (+1200% Total Physical Attack)</font> Max HP and inherits 100% of Popol''s other attributes and passive equipment effects (excluding Jungling and Roaming equipment effects).
Kupa deals an additional 120% damage against Creeps.'
WHERE skill_name = 'We Are Friends' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Popol and Kupa' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Popol throws a spear at the target enemy, dealing 80<font color="fba51f"> (+100% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> while simultaneously commanding Kupa to lunge at the target, dealing an additional 70<font color="fba51f"> (+75% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font>. Kupa will continue to attack the target for 3s.
<font color="a6aafb">Alpha Wolf Form</font>: Kupa stuns the enemy for 1s and bites them 3 times in quick succession.'
WHERE skill_name = 'Bite ''em, Kupa!' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Popol and Kupa' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Popol summons Kupa back to his side, gaining a 240<font color="fba51f"> (+200% Extra Physical Attack)</font> shield while dealing 240<font color="fba51f"> (+50% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to nearby enemies and slowing them by 35% for 0.5s. Kupa will then assist Popol to attack nearby enemies for 3s.
<font color="a6aafb">Alpha Wolf Form</font>: Kupa darts back to Popol, knocking nearby enemies airborne for 0.2s. The shield and damage are increased to 125%.'
WHERE skill_name = 'Kupa, Help!' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Popol and Kupa' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Popol sets a trap at the target location that will detonate after a short delay once triggered, dealing 70<font color="62f8fe"> (+20% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> to the enemy that steps on it, immobilizing them for 1s, and creating a frost zone for 4s. Enemies in the frost zone will have their Movement Speed reduced by 20%.
Popol gains a trap charge every 22s (up to 3). Up to 3 traps can exist at the same time on the battlefield, each lasting up to 60s.'
WHERE skill_name = 'Popol''s Surprise' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Popol and Kupa' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Popol and Kupa enter the Enraged state for 12s, gaining 15% extra Movement Speed and increasing their Attack Speed to 1.3 times.
Kupa turns into <font color="a6aafb">Alpha Wolf Form</font>, gaining 1500 extra Max HP, fully restoring its HP, while <font color="a6aafb">enhancing</font> its other skills.'
WHERE skill_name = 'We Are Angry!' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Popol and Kupa' AND game_id = 1);

-- Rafaela
UPDATE hero_skills 
SET skill_description = 'Rafaela can cast a special skill every 40s. After channeling for 2.5s, she instantly resurrects an ally and increases their Movement Speed by 30% for 5s (taking damage from heroes and Legend Creeps interrupts channeling and puts the skill on base cooldown).
This skill''s cooldown is increased by 500% of the target''s remaining respawn time, capped at 240s. This skill is not affected by Cooldown Reduction.'
WHERE skill_name = 'Divine Resurrection' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Rafaela' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Rafaela strikes the three nearest enemies with <font color="a6aafb">Light of Retribution</font>, dealing them 225<font color="62f8fe"> (+120% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font>, briefly revealing their positions, and slowing them by 40% for 1.5s. Enemies hit by <font color="a6aafb">Light of Retribution</font> again within 6s will take 20% extra damage (this effect stacks up to 3 times).'
WHERE skill_name = 'Light of Retribution' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Rafaela' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Rafaela calls upon <font color="a6aafb">Holy Light</font>, recovering 100<font color="62f8fe"> (+35% Total Magic Power)</font> HP for nearby allied heroes, plus an additional 150<font color="62f8fe"> (+65% Total Magic Power)</font> HP for herself and the most injured allied hero in range. She also increases the Movement Speed of nearby allied heroes by 30% and grants Slow Immunity for 1s.

Every 10 point(s) of Magic Power will add 1% to the Movement Speed bonus.'
WHERE skill_name = 'Holy Healing' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Rafaela' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Rafaela unleashes the true power of <font color="a6aafb">Holy Light</font> in the target direction, dealing 460<font color="62f8fe"> (+120% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> to enemies in a line and stunning them for 1.2s.'
WHERE skill_name = 'Holy Baptism' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Rafaela' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Rafaela can cast a special skill every 40s. After channeling for 2.5s, she instantly resurrects an ally and increases their Movement Speed by 30% for 5s (taking damage from heroes and Legend Creeps interrupts channeling and puts the skill on base cooldown).
This skill''s cooldown is increased by 500% of the target''s remaining respawn time, capped at 240s. This skill is not affected by Cooldown Reduction.'
WHERE skill_name = 'Divine Resurrection' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Rafaela' AND game_id = 1);

-- Roger
UPDATE hero_skills 
SET skill_description = 'Roger can freely switch between human and wolf forms.

In human form, Roger''s Basic Attack and skills deal additional damage equal to 4% of the target''s current HP.

In wolf form, Roger''s Basic Attack and skills deal additional damage equal to 4% of the target''s lost HP.

This effect can only deal up to 60 additional damage against Creeps.'
WHERE skill_name = 'Full Moon Curse' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Roger' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Roger fires two quick shots in the target direction, dealing 250<font color="fba51f"> (+125% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> in total to the enemy hit. The first shot is a hunter net that slows the enemy by 80% for 1.5s, while the second is a bullet that reduces the enemy''s Physical Defense by 10 for 5s.'
WHERE skill_name = 'Open Fire' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Roger' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Roger gains 20% Movement Speed and 20% Attack Speed for 2.5s.'
WHERE skill_name = 'Hunter''s Steps' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Roger' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Roger lunges in the target direction and turns into wolf form, dealing 150<font color="fba51f"> (+100% Extra Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to enemies hit and slowing them by 90% for 0.8s.

<font color="a6aafb">Passive</font>: In wolf form, Roger gains 20 Physical & Magic Defense and 25 Movement Speed.'
WHERE skill_name = 'Wolf Transformation' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Roger' AND game_id = 1);

-- Ruby
UPDATE hero_skills 
SET skill_description = 'Ruby starts with 6%-20% Spell Vamp (scales with level) and her skills have a 125% Spell Vamp Ratio (but her Basic Attacks cannot trigger Lifesteal).

After each skill cast, Ruby can dash to another location and gains 8-25 Physical & Magic Defense (scales with level) for 4s (stacks up to 3 times).'
WHERE skill_name = 'Let''s Dance!' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Ruby' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Ruby swings her scythe, dealing 90<font color="fba51f"> (+70% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to enemies hit. She then unleashes a shockwave in the same direction, dealing 90<font color="fba51f"> (+70% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to enemies hit and slowing them by 40% for 1s.'
WHERE skill_name = 'Be Good!' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Ruby' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Ruby swings her scythe around herself twice, each swing dealing 60<font color="fba51f"> (+55% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to nearby enemies, stunning them for 0.5s, and slowly pulling them toward her.'
WHERE skill_name = 'Don''t Run, Wolf King!' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Ruby' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Ruby sweeps her scythe in the target direction, dealing 200<font color="fba51f"> (+200% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to enemies hit, pulling them toward her, and stunning them for 0.5s.'
WHERE skill_name = 'I''m Offended!' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Ruby' AND game_id = 1);

-- Saber
UPDATE hero_skills 
SET skill_description = 'Saber''s attacks reduce enemies'' Physical Defense by 3-8 for 5s on hit. This effect stacks up to 5 times.'
WHERE skill_name = 'Enemy''s Bane' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Saber' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Saber shoots out 5 swords that orbit around him, dealing 80<font color="fba51f"> (+30% Extra Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to enemies on contact. After orbiting around Saber for a period of time, the swords will fly back to Saber.

Within the duration of this skill, when Saber deals damage with his Basic Attacks or skills, he will send an orbiting sword towards the target, dealing 210<font color="fba51f"> (+60% Extra Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to the main target and 50% of the damage to other targets it passes through and reducing the cooldown of <font color="a6aafb">Charge</font> by 1s. It deals only 50% damage to minions.'
WHERE skill_name = 'Orbiting Swords' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Saber' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Saber dashes in the target direction, dealing 75<font color="fba51f"> (+50% Extra Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to enemies along the way while enhancing his next Basic Attack. Saber can dash to the target, and his enhanced Basic Attack deals 75<font color="fba51f"> (+120% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> and slows the target by 60% for 1s.'
WHERE skill_name = 'Charge' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Saber' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Saber charges at the target enemy hero, knocking them airborne for 1.2s (unaffected by Resilience) and striking them 3 times over the duration. The first two strikes deal 120<font color="fba51f"> (+100% Extra Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> each, while the third strike deals 240<font color="fba51f"> (+200% Extra Physical Attack)</font> <font color="fb1f1f">Physical Damage</font>.'
WHERE skill_name = 'Triple Sweep' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Saber' AND game_id = 1);

-- Selena
UPDATE hero_skills 
SET skill_description = 'Selena can switch freely between her two forms.
<font color="a6aafb">Elven Form</font>: Selena applies <font color="a6aafb">Abyssal Mark</font> when her skills deal damage. Marks last 8s and can stack up to 2 times.
<font color="a6aafb">Abyssal Form</font>: Selena''s Basic Attacks become melee and deal <font color="62f8fe"> (+25% Total Magic Power)</font> additional <font color="7f62fe">Magic Damage</font>. Her skills deal 240-450<font color="62f8fe"> (+40% Total Magic Power)</font> additional <font color="7f62fe">Magic Damage</font> to enemies with <font color="a6aafb">Abyssal Mark</font> and consume their mark stacks by 1. This damage is increased to 250% against Creeps and Minions.'
WHERE skill_name = 'Symbiosis' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Selena' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Selena summons an Abyssal Devil to lurk underground. The Abyssal Devil will attach itself to any enemy that approaches, inflicting a stack of <font color="a6aafb">Abyssal Mark</font> and reducing their Movement Speed by 50% for 1s. The Abyssal Devil then explodes, dealing 350<font color="62f8fe"> (+150% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> to enemies in the area and reducing their Movement Speed by 50% for 1s.

Each additional Abyssal Devil on an enemy increases the final damage by 50%.

Each Abyssal Devil can lurk up to 60s and up to 3 Abyssal Devils can exist at the same time.'
WHERE skill_name = 'Abyssal Trap' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Selena' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Selena fires an abyssal wraith in the target direction that stops when it hits an enemy hero, Creep, or Summon, dealing 250<font color="62f8fe"> (+20% Total Magic Power)</font> to 500<font color="62f8fe"> (+40% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> to the target hit and stunning them for 0.5s to 2.5s while revealing their locations (the damage and stun duration increase with the wraith''s travel distance).

The wraith will pick up <font color="a6aafb">Abyssal Trap</font> as it travels over it and will apply the <font color="a6aafb">trap</font> to the enemy target upon stunning them.

If the wraith stuns an enemy for 0.9s or longer, Selena will gain 60% Movement Speed for 2s.'
WHERE skill_name = 'Abyssal Arrow' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Selena' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = '<font color="a6aafb">Passive</font>: Selena gains 5 Magic Power.

<font color="a6aafb">Active</font>: Selena enters Abyssal Form and gains 20% Movement Speed for 0.8s. This also immediately resets the cooldown of <font color="a6aafb">Soul Eater</font> and <font color="a6aafb">Garotte</font>.'
WHERE skill_name = 'Primal Darkness' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Selena' AND game_id = 1);

-- Silvanna
UPDATE hero_skills 
SET skill_description = 'Silvanna''s Basic Attacks deal 25<font color="fba51f"> (+45% Total Physical Attack)</font> <font color="62f8fe">(+75% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font>.
Silvanna''s attacks apply a mark on enemy heroes for 5s on hit, each mark reducing their Physical & Magic Defense by 3-6 (up to 5 stacks).
Silvanna''s skills and Basic Attacks deal 30% extra damage to enemy heroes with the max number of marks.'
WHERE skill_name = 'Knightess'' Resolve' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Silvanna' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Silvanna dashes forward. Upon reaching the max range or hitting a non-Minion enemy, she swings her lance, dealing 250<font color="62f8fe"> (+100% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> to nearby enemies and stunning them for 1s.'
WHERE skill_name = 'Cometic Lance' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Silvanna' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Silvanna thrusts her lance in the target direction and spins it 6 times while gaining a 350<font color="62f8fe"> (+150% Total Magic Power)</font> shield. Each spin deals 165<font color="62f8fe"> (+45% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> and slightly pulls targets toward the center. Silvanna spins 1 additional time for every 50% of extra Attack Speed she possesses.

The skill deals only 50% damage against Minions.

<font color="a6aafb">Spiral Strangling</font> counts as a Basic Attack but cannot Crit.'
WHERE skill_name = 'Spiral Strangling' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Silvanna' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Silvanna leaps to the target location and creates a Circle of Light upon landing, dealing 350<font color="62f8fe"> (+110% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> to enemies in the area, slowing them by 40% for 1.5s, and restraining the closest enemy hero to the area for 3.5s. (This skill cannot be interrupted.)

Silvanna gains 100% Attack Speed and 40% Lifesteal when in the Circle.'
WHERE skill_name = 'Imperial Justice' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Silvanna' AND game_id = 1);

-- Sun
UPDATE hero_skills 
SET skill_description = 'Enemies hit by Sun and his Doppelgangers will have their Physical Defense reduced by 5% (stacks up to 6 times). Sun recovers HP equal to 75 plus 25% of the Doppelganger''s Physical Attack each time a Doppelganger deals damage.
Sun and his Doppelgangers'' Basic Attacks deal 50 extra damage to Creeps.'
WHERE skill_name = 'Simian God' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Sun' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Sun hurls his <font color="a6aafb">Golden Staff</font> in the target direction, dealing 200<font color="fba51f"> (+40% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to enemies in its path. Upon hitting an enemy hero or Creep, or reaching the maximum range, the <font color="a6aafb">Golden Staff</font> morphs into a Doppelganger that lasts 5s and inherits 40% of Sun''s attributes (and a portion of his Attack Effects).

<font color="a6aafb">Endless Variety</font> and <font color="a6aafb">Swift Exchange</font> are learned and upgraded together and share the same cooldown.'
WHERE skill_name = 'Endless Variety' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Sun' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Sun hurls his <font color="a6aafb">Golden Staff</font> in the target direction, dealing 200<font color="fba51f"> (+40% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to enemies in its path.
He conjures a Doppelganger at his location that lasts 5s and inherits 40% of his attributes (and a portion of Attack Effects). Meanwhile, Sun conceals himself and moves with the <font color="a6aafb">Golden Staff</font>.'
WHERE skill_name = 'Swift Exchange' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Sun' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Sun commands his Doppelgangers to strike at the target enemy with him, dealing 270<font color="fba51f"> (+40% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> and slowing the target and enemies behind them by 20% (can be stacked) for 1.5s. This counts as Basic Attack damage and can trigger Attack Effects but cannot Crit.'
WHERE skill_name = 'Instantaneous Move' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Sun' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Sun summons a Doppelganger that lasts 8s and inherits 70% of his attributes and a portion of his Attack Effects. The Doppelganger takes increased damage.'
WHERE skill_name = 'Clone Techniques' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Sun' AND game_id = 1);

-- Suyou
UPDATE hero_skills 
SET skill_description = '<font color="a6aafb">Tap-casting</font> any skill will put Suyou in his Mortal form, granting him 40 Movement Speed and decreasing the interval between Basic Attacks.
<font color="a6aafb">Hold-casting</font> any skill will put Suyou in his Immortal form, increasing the damage of Basic Attacks to 125% and granting him 20% Physical Damage Reduction. In this form, for every 20 extra Physical Attack Suyou has, he gains 1% Physical Damage Reduction (up to 40%).'
WHERE skill_name = 'Transient Immortal' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Suyou' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = '<font color="a6aafb">Tap</font>: Suyou throws his weapon in the target direction, dealing 250<font color="fba51f"> (+100% Extra Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to enemies in its path. Suyou then blinks to the weapon''s location, catches it, and performs a slash in the opposite direction, dealing 375<font color="fba51f"> (+150% Extra Physical Attack)</font> <font color="fb1f1f">Physical Damage</font>.
<font color="a6aafb">Hold</font>: Suyou channels the Immortal''s power and charges in the target direction, dealing 250<font color="fba51f"> (+100% Extra Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to enemies along the path. When hitting an enemy hero, he stops and stuns enemies in a rectangular area in front for 0.6s. The charge distance increases with the hold time.
<font color="A4AAC7">Suyou can be controlled while charging, but the skill cannot be interrupted</font>.'
WHERE skill_name = 'Blade Surge' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Suyou' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = '<font color="a6aafb">Tap</font>: Suyou performs a sweeping attack with his weapon, dealing <font color="fb1f1f">Physical Damage</font> equal to 300<font color="fba51f"> (+200% Extra Physical Attack)</font> plus 15% of target''s Lost HP to enemies in a fan-shaped area.
<font color="a6aafb">Hold</font>: Suyou channels the power of the Immortal to perform 3 cleaves in a fan-shaped area. The first two strikes deal 250<font color="fba51f"> (+80% Extra Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> each, while the final strike deals 400<font color="fba51f"> (+128% Extra Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> and recovers 150<font color="fba51f"> (+50% Extra Physical Attack)</font> HP for himself.'
WHERE skill_name = 'Soul Sever' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Suyou' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = '<font color="a6aafb">Tap</font>: Suyou glides backward and swings his weapon in the target direction, dealing 420<font color="fba51f"> (+120% Extra Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to enemies in a rectangular area and on his path backward, and reducing their Movement Speed by 30% for 1.5s.
<font color="a6aafb">Hold</font>: Suyou uses the Immortal''s power to shoot a deadly arrow in the target direction, dealing 580<font color="fba51f"> (+165% Extra Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to the target hit. The range increases with the hold time. 
<font color="A4AAC7">Suyou can be controlled while charging, but the skill cannot be interrupted</font>.'
WHERE skill_name = 'Evil Queller' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Suyou' AND game_id = 1);

-- Terizla
UPDATE hero_skills 
SET skill_description = 'Terizla gains 1% extra Damage Reduction (up to 20 (+1*Hero Level)%) for every 2.5% HP lost.
He cannot gain extra Attack Speed and will convert every 1% extra Attack Speed he''s supposed to receive into 1 extra Physical Attack.'
WHERE skill_name = 'Body of Smith' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Terizla' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Terizla cracks the ground with his hammer and the fissure will spread out, dealing 300<font color="fba51f"> (+80% Extra Physical Attack)</font> <font color="fb1f1f">Physical Damage</font>. After the fissure hits the first target, it will drill into the target and slow them by 15%. At the same time, Terizla''s Movement Speed will be increased by 15% for 3.5s. The fissure on target will then explode, dealing 300<font color="fba51f"> (+80% Extra Physical Attack)</font> plus 20% of the enemy''s lost HP <font color="fb1f1f">Physical Damage</font>.'
WHERE skill_name = 'Revenge Strike' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Terizla' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Terizla swings his hammer in a fan-shaped area ahead. This skill can be cast up to 3 times. The first two attacks deal 90<font color="fba51f"> (+135% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> each, while the third deals 225<font color="fba51f"> (+220% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font>. Enemies hit will also be slowed by 20% for 1.25s (the Slowing Effect can stack).
Deals only 80% damage to Minions.'
WHERE skill_name = 'Execution Strike' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Terizla' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Terizla jumps to the designated area, dealing 300<font color="fba51f"> (+100% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> and knocking enemies airborne for 0.6s. He then summons Scaffold and slows enemies by 25%. Scaffold will send out a hook at enemy heroes in range and pull them several times while dealing 150<font color="fba51f"> (+30% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> each time.'
WHERE skill_name = 'Penalty Zone' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Terizla' AND game_id = 1);

-- Thamuz
UPDATE hero_skills 
SET skill_description = 'Thamuz''s Basic Attacks have a chance of 10%–60% (scaling with <font color="a6aafb">Lava''s Rage</font>) to conjure Lava Energy beneath the target that erupts after a brief delay, dealing 55<font color="ffe63c"> (+60% Total Physical Attack)</font><font color="ffe63c">(+8*Hero Level)</font> <font color="ffe63c">True Damage</font>. Basic Attacks that don''t trigger Lava Energy increase Thamuz''s <font color="a6aafb">Lava''s Rage</font>.

While Thamuz is without his <font color="a6aafb">Scythes</font>, he gains 25% Movement Speed. After retrieving his <font color="a6aafb">Scythes</font>, his next Basic Attack slows the target by 30% and is guaranteed to trigger Lava Energy.'
WHERE skill_name = 'Grand Lord Lava' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Thamuz' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Thamuz tosses <font color="a6aafb">Scythes</font> in the target direction. After traveling a set distance or hitting the first enemy hero, they deal 120<font color="fba51f"> (+60% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font>. The <font color="a6aafb">Scythes</font> will then slow nearby enemies by 30% and deal 45<font color="fba51f"> (+20% Extra Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> every 0.5s.

After leaving Thamuz for a short time or reaching a set distance, the <font color="a6aafb">Scythes</font> return to him, dragging enemies along their path toward Thamuz. Thamuz can move toward the <font color="a6aafb">Scythes</font> or cast the skill again to retrieve them.'
WHERE skill_name = 'Molten Scythes' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Thamuz' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Thamuz jumps to a designated area to deal 230<font color="fba51f"> (+60% Extra Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> and slow the enemy units by 25% for 2s upon landing. 
If the Scythes are still travelling, they will return to Thamuz and <font color="a6aafb">Molten Scythes</font> will reset its CD instantly.'
WHERE skill_name = 'Chasm Trample' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Thamuz' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Thamuz spouts the lava within, dealing 300<font color="fba51f"> (+80% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to nearby enemies and creating a <font color="a6aafb">Cauterant Zone</font> around himself. The <font color="a6aafb">Cauterant Zone</font> lasts 9s and deals 30<font color="fba51f"> (+10% Extra Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> every 0.5s to enemies in the area.

Meanwhile, Thamuz gains 800<font color="26e407"> (+50% Extra Max HP)</font> extra Max HP, immediately healing for the same amount, and gains 60% Attack Speed. Each time his Basic Attacks or <font color="a6aafb">Scythes</font> deal damage, he recovers 1.5% Max HP.'
WHERE skill_name = 'Cauterant Inferno' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Thamuz' AND game_id = 1);

-- Tigreal
UPDATE hero_skills 
SET skill_description = 'Tigreal gains a stack of <font color="a6aafb">Fearless</font> each time he uses a skill or is hit by a Basic Attack. After getting 4 stacks, Tigreal will consume all <font color="a6aafb">Fearless</font> stacks to block the next incoming Basic Attack (including attacks from Turrets).

<font color="A4AAC7">Attacks from Minions do not grant</font> <font color="a6aafb">Fearless</font> <font color="A4AAC7">stacks nor trigger its effect</font>.'
WHERE skill_name = 'Fearless' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Tigreal' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Tigreal smashes the ground with his hammer and sends a shockwave that erupts 3 times in the target direction, each time dealing 270<font color="fba51f"> (+70% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to enemies along the fan-shaped area and slowing them by 20%/40%/60% for 1.5s.'
WHERE skill_name = 'Attack Wave' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Tigreal' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Tigreal charges in the target direction, dealing <font color="fba51f"> (+100% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to enemies along the way and pushing them to the end of the charge.

<font color="a6aafb">Use Again</font>: Tigreal can use this skill again within 4s, dealing 280<font color="fba51f"> (+60% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to enemies in front of him and knocking them airborne for 0.6s.'
WHERE skill_name = 'Sacred Hammer' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Tigreal' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Tigreal unleashes the power of his hammer, pulling nearby enemies to him and stunning them for 1.8s while dealing 600<font color="fba51f"> (+130% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font>.

<font color="A4AAC7">The first half of the channeling can be interrupted by control effects. The second half of the channeling can only be interrupted by Suppression.</font>'
WHERE skill_name = 'Implosion' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Tigreal' AND game_id = 1);

-- Uranus
UPDATE hero_skills 
SET skill_description = 'Each time Uranus takes damage, he gains a stack of <font color="a6aafb">Radiance</font>. Each stack recovers 1.2-11.2 HP (increases with level) every 0.8s for 10s, up to 20 stacks.
Uranus''s Basic Attacks deal <font color="fba51f"> (+80% Total Physical Attack)</font> <font color="a6aafb">(+ 4-8 × Radiance stacks)</font> <font color="7f62fe">Magic Damage</font> (increases with level).'
WHERE skill_name = 'Radiance' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Uranus' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Uranus releases 2 energy blades that orbit around him, dealing 155<font color="62f8fe"> (+30% Total Magic Power)</font> <font color="a6aafb">(+6 × Radiance stacks)</font> <font color="7f62fe">Magic Damage</font> to enemies hit and slowing them by 30% for 2s.
Each blade can only damage the same target once.'
WHERE skill_name = 'Ionic Edge' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Uranus' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Uranus charges to the target location, dealing 80<font color="62f8fe"> (+20% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> to enemies along the way, and 160<font color="62f8fe"> (+80% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> to enemies at the target location and slowing them by 25%. Uranus also generates a 300<font color="62f8fe"> (+200% Total Magic Power)</font> shield for 4s.

The shield explodes at the end of its duration or when destroyed, dealing 300<font color="62f8fe"> (+150% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> to enemies nearby.'
WHERE skill_name = 'Transcendent Ward' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Uranus' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Uranus unleashes the energy stored within his body, removing slow effects on himself, recovering 200 HP, and gaining 60% Movement Speed for 8s (decays over time).

Uranus directly gains 5 stacks of Radiance, increasing shields received and HP Regen by 20% for 8s.'
WHERE skill_name = 'Consecration' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Uranus' AND game_id = 1);

-- Vale
UPDATE hero_skills 
SET skill_description = 'Vale gains 1 stack of <font color="a6aafb">Windtalk</font> each time he gets a kill or an assist that increases his Movement Speed by 8. This effect can stack up to 10 times.'
WHERE skill_name = 'Windtalk' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Vale' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Vale unleashes two wind blades toward the left and right of a target area, each dealing 250<font color="62f8fe"> (+80% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> to enemies hit.'
WHERE skill_name = 'Wind Blade' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Vale' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Vale sends a whirlwind in the target direction, dealing 350<font color="62f8fe"> (+100% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> to enemies hit and knocking them airborne for 0.8s (each enemy can only be knocked airborne 1 time). When the whirlwind reaches its destination, it will remain for 1.6s while continuously dealing a total of 150<font color="62f8fe"> (+30% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> to enemies in range.'
WHERE skill_name = 'Windblow' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Vale' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Vale summons a windstorm at the target location, dealing a total of 150<font color="62f8fe"> (+30% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> to enemies in the area and slowing them by 20% while continuously pulling them into its center. After 1s, the windstorm will explode, dealing 1000<font color="62f8fe"> (+240% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font>.

The remaining whirlwinds will also be pulled into the center.'
WHERE skill_name = 'Windstorm' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Vale' AND game_id = 1);

-- Valentina
UPDATE hero_skills 
SET skill_description = 'Valentina gains 8-50 extra EXP each time she deals damage to an enemy hero. Cooldown: 2s. 
If the enemy hero''s level isn''t higher than Valentina''s, 30% of the damage dealt is converted into her HP. The EXP scales with Valentina''s level.'
WHERE skill_name = 'Primal Force' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Valentina' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Valentina casts <font color="a6aafb">Shadow Strike</font> in the target direction, dealing 300<font color="62f8fe"> (+165% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> to enemies hit and slowing them by 40% for 1s.
Enemy heroes hit by <font color="a6aafb">Shadow Strike</font> are marked with a Shadow Sigil for 4s and will be <font color="fb1f1f">terrified</font> for 1s when hit by <font color="a6aafb">Shadow Strike</font> again within the duration (a unit can only be terrified once within 4s).'
WHERE skill_name = 'Shadow Strike' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Valentina' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Valentina dashes in the target direction, firing 3 Shadow Bolts at nearby enemies that deal 125<font color="62f8fe"> (+30% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> each. Valentina can cast this skill again within 6s (costs Mana).

The cooldown of <font color="a6aafb">Shadow Strike</font> is reduced by 1s each time a Shadow Bolt hits an enemy.'
WHERE skill_name = 'Arcane Shade' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Valentina' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Valentina slows the target enemy hero by 70% for 0.5s and gains the ability to cast their <font color="a6aafb">Ultimate</font>. Casting the enemy''s <font color="a6aafb">Ultimate</font> turns Valentina into the enemy hero''s form and allows her to inherit their Basic Attack type for up to 12s. Her skills remain unchanged unless the enemy''s <font color="a6aafb">Ultimate</font> has a <font color="a6aafb">Morph</font> effect.
The stolen <font color="a6aafb">Ultimate</font>''s level will be equal to Valentina''s <font color="a6aafb">Ultimate</font> level and the Ultimate cooldown will be 120% of the target''s Ultimate cooldown (but no lower than 10s). Valentina gains <font color="62f8fe"> (+100% Total Magic Power)</font> <font color="fba51f">Physical Attack</font> for the duration if the enemy is a Physical Damage hero. This cannot be used on an enemy Valentina.'
WHERE skill_name = 'I Am You' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Valentina' AND game_id = 1);

-- Valir
UPDATE hero_skills 
SET skill_description = 'Valir''s skills apply a stack of Ablaze to enemies hit, dealing them <font color="7f62fe">Magic Damage</font> equal to 1<font color="62f8fe"> (+0.2% Total Magic Power)</font>% of their Max HP per second for 3s.
At 3 stacks, the fire detonates, dealing <font color="7f62fe">Magic Damage</font> equal to 5<font color="62f8fe"> (+1% Total Magic Power)</font>% of the target''s Max HP to the enemy and stunning them for 1s (the same target can only be stunned by Valir''s skills once every 7s.)'
WHERE skill_name = 'Ashing' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Valir' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Valir launches a fireball that explodes upon hitting the first target, dealing 235<font color="62f8fe"> (+80% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> and slowing them by 30% for 1s. The lingering flame on the ground will explode after 1s, dealing 118<font color="62f8fe"> (+40% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font>.
Valir recharges 1 fireball every 9s and can hold up to 2 fireball charges. Hitting an enemy hero or Legend Creep with this skill will immediately restore a fireball charge, while hitting a Minion will restore 4s of the recharge time.
Once enhanced by <font color="a6aafb">Vengeance Flame</font>, the cast range of <font color="a6aafb">Burst Fireball</font> increases by 30%.'
WHERE skill_name = 'Burst Fireball' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Valir' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Valir unleashes a torrent of flames in the target direction, dealing 200<font color="62f8fe"> (+60% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> to enemies hit and knocking them to the end of its path.
<font color="a6aafb">Vengeance Flame</font>: The torrent forms a firewall at the end of its path that lasts 4s and deals 100<font color="62f8fe"> (+30% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> to nearby enemies per second.
Enemies hit by the torrent or the firewall are slowed by 25% for 1s.'
WHERE skill_name = 'Searing Torrent' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Valir' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Valir removes all existing debuffs on him, gains 40% Movement Speed that decays over 3s, and conjures 4 <font color="a6aafb">Vengeance Flames</font>, enhancing <font color="a6aafb">Burst Fireball</font> and <font color="a6aafb">Searing Torrent</font> for 9s.'
WHERE skill_name = 'Vengeance Flame' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Valir' AND game_id = 1);

-- Vexana
UPDATE hero_skills 
SET skill_description = 'Vexana and the <font color="a6aafb">Eternal Guard</font> inflict <font color="a6aafb">Nether Curse</font> on enemies hit. The Curse lasts 5s and will cause the affected enemy to explode upon death, dealing 108-500<font color="62f8fe"> (+60% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> to nearby enemies (base damage scales with level).'
WHERE skill_name = 'Nether Touch' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Vexana' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Vexana unleashes a <font color="a6aafb">Deathly Grasp</font> in the target direction, dealing 200<font color="62f8fe"> (+60% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> to enemies in its path. The projectile stops upon hitting an enemy hero, terrifying them and knocking them back, then it explodes, dealing 200<font color="62f8fe"> (+60% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> to nearby enemies and terrifying them for 1s.'
WHERE skill_name = 'Deathly Grasp' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Vexana' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Vexana marks the target area with the power of the undead, striking it after a 0.8s delay and dealing 580<font color="62f8fe"> (+165% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> to enemies hit.'
WHERE skill_name = 'Cursed Blast' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Vexana' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Vexana summons an <font color="a6aafb">Eternal Guard</font> at the target location, dealing 480<font color="62f8fe"> (+60% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> to enemies hit and knocking them airborne for 0.8s. The <font color="a6aafb">Eternal Guard</font> then joins Vexana in battle for 15s. Each of the Eternal Guard''s attacks deals 200<font color="62f8fe"> (+40% Total Magic Power)</font> plus 5% of the target''s Max HP as <font color="7f62fe">Magic Damage</font> to enemies in a large area.'
WHERE skill_name = 'Eternal Guard' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Vexana' AND game_id = 1);

-- Wanwan
UPDATE hero_skills 
SET skill_description = 'Enemy heroes hit by Wanwan''s attacks will have their weaknesses and positions exposed for 5s. When hitting an enemy''s weakness, Wanwan deals 67(+3*Hero Level) extra <font color="ffe63c">True Damage</font> and increases their damage taken from her subsequent attacks by 10% for 5s.
Wanwan can dash a short distance after each arrow fired from her Basic Attack. The dash speed scales with her Attack Speed.'
WHERE skill_name = 'Tiger Pace' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Wanwan' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Wanwan throws a Fire Swallow in the target direction, triggering <font color="a6aafb">Tiger Pace</font> while dealing 120<font color="fba51f"> (+40% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to enemies in its path. The Fire Swallow then turns into 3 rotating Swallow Daggers. After a short delay, these Swallow Daggers will fly back to Wanwan one after another, dealing 60<font color="fba51f"> (+65% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to enemies on their way back and slowing them by 30% for 1.5s. Enemies hit twice by the Swallow Daggers will be immobilized for 0.5s.'
WHERE skill_name = 'Swallow’s Path' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Wanwan' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Wanwan removes all control effects on herself and triggers <font color="a6aafb">Tiger Pace</font>. Meanwhile, she shoots Deadly Needles in all directions, dealing 150<font color="fba51f"> (+60% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to enemies hit.'
WHERE skill_name = 'Needles in Flowers' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Wanwan' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Wanwan leaps into the air and becomes untargetable, firing arrows at the target enemy hero for 2.5s in rapid succession, dealing 60<font color="fba51f"> (+35% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> per arrow. If the target is killed during this attack, Wanwan will switch to another enemy hero in her attack range, gain 30% Attack Speed, and extend the skill duration by 1s (this effect can trigger up to 3 times). Wanwan can trigger <font color="a6aafb">Tiger Pace</font> upon killing an enemy and at the end of the duration.
<font color="a6aafb">Crossbow of Tang</font> can only be cast on enemy heroes with all their weaknesses hit and Wanwan gains 100% Movement Speed during the duration. This damage is regarded as Basic Attack damage, and the firing rate scales with Wanwan''s Attack Speed.'
WHERE skill_name = 'Crossbow of Tang' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Wanwan' AND game_id = 1);

-- X.Borg
UPDATE hero_skills 
SET skill_description = 'Firaga Armor inherits 160% of X.Borg''s Max HP and absorbs all incoming damage when it''s active. When destroyed, X.Borg rolls in the direction of the Joystick (he is invincible during this process). The Armor''s energy will gradually regenerate while X.Borg is in the Armorless State. At full energy, X.Borg re-equips the Armor and restores it to 30% HP.
X.Borg''s attacks cause enemies to enter <font color="a6aafb">Overheated</font> state. Enemies in <font color="a6aafb">Overheated</font> state will drop Firaga Supplies when they take damage from X.Borg. Picking up supplies restores 10% of the Armor''s HP (or 10 energy while in the Armorless State).
X.Borg''s skills deal <font color="ffe63c">True Damage</font> to enemies in <font color="a6aafb">Overheated</font> state.'
WHERE skill_name = 'Firaga Armor' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'X.Borg' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'X.Borg sprays fire, dealing 25<font color="fba51f"> (+60% Total Physical Attack)</font> <font color="62f8fe">(+40% Total Magic Power)</font> <font color="fb1f1f">Physical Damage</font> 7 times over 2s to enemies in front of him (75% damage to minions). 

Armorless State: The attack area becomes narrower but longer, while the damage is reduced to 60%.'
WHERE skill_name = 'Fire Missiles' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'X.Borg' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'X.Borg fires 5 Fire Stakes forward and recalls them after 1.7s. Each stake deals 50<font color="fba51f"> (+20% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> and pulls enemies and Firaga Supplies along its path back to him.

Armorless State: X.Borg adjusts the Fire Stake launcher, making the stakes travel farther and closer together.'
WHERE skill_name = 'Fire Stake' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'X.Borg' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'X.Borg charges in the target direction while spinning and spraying fire (cannot pick up Firaga Supplies during this time), dealing 90<font color="fba51f"> (+60% Extra Physical Attack)</font> <font color="62f8fe">(+45% Total Magic Power)</font> <font color="fb1f1f">Physical Damage</font> 12 times and slowing enemies hit by 25%. He stops upon touching an enemy hero and will slow them by an additional 40%. After 3s, his mecha suit detonates, dealing 300 plus 15% of the target''s Max HP as <font color="ffe63c">True Damage</font>. If his armor is destroyed, it will immediately explode but damage drops to 50%. The detonation destroys his Armor, removes all debuffs, and collects all nearby Firaga Supplies. Cannot be used in <font color="a6aafb">Armorless State</font>.

<font color="a6aafb">Use Again</font>: Immediately stop spraying fire and detonate early.'
WHERE skill_name = 'Last Insanity' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'X.Borg' AND game_id = 1);

-- Xavier
UPDATE hero_skills 
SET skill_description = 'Xavier enhances his subsequent skills each time his skill hits an enemy hero. <font color="a6aafb">Stage I:</font> Increases Movement Speed by 50% when subsequent skills hit, decaying over 1.2s. <font color="a6aafb">Stage II:</font> Width of subsequent skills will be greatly increased. <font color="a6aafb">Stage III:</font> Skill Cooldown reduced by 4s (36s for the Ultimate). At <font color="a6aafb">Stage III</font>, Xavier enters the <font color="a6aafb">Transcendence</font> state.

<font color="a6aafb">Transcendence:</font> All of Xavier''s skills are enhanced to <font color="a6aafb">Stage III</font> state for 5s (this duration is extended by 1s each time Xavier''s skill hits an enemy).'
WHERE skill_name = 'Transcendence' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Xavier' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Xavier fires a Mystic Bullet that deals 480<font color="62f8fe"> (+100% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> to enemies it passes through.

The Bullet''s flying distance increases each time it hits an enemy or the <font color="a6aafb">Mystic Barrier</font> (up to 5 times).'
WHERE skill_name = 'Infinite Extension' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Xavier' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Xavier conjures a <font color="a6aafb">Mystic Barrier</font> that lasts 5s. Enemies that come into contact with the Barrier will take 220<font color="62f8fe"> (+65% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> and be slowed by 50%, while allies will gain 50% extra Movement Speed that decays over 1.2s.
When hit by Xavier''s other skills, the Barrier expands into a <font color="a6aafb">Mystic Field</font> for 3s, dealing 220<font color="62f8fe"> (+65% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> to enemies within and immobilizing them for 0.8s.'
WHERE skill_name = 'Mystic Field' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Xavier' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Xavier unleashes a beam of Mystic magic in the target direction, dealing 600<font color="62f8fe"> (+180% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> to all enemies along its path.

Once cast, he also directly enters the <font color="a6aafb">Transcendence</font> state and resets the state''s duration.'
WHERE skill_name = 'Dawning Light' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Xavier' AND game_id = 1);

-- Yi Sun-shin
UPDATE hero_skills 
SET skill_description = 'Yi Sun-shin attacks with his <font color="a6aafb">longbow</font> or <font color="a6aafb">glaive</font> according to his distance from the target.
<font color="a6aafb">Weapon Mastery</font>: After each weapon switch, the next two Basic Attacks will gain extra Attack Speed, dealing 70% and 55% Crit Damage respectively, and gain 15% Movement Speed for 1s.'
WHERE skill_name = 'Heavenly Vow' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Yi Sun-shin' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Yi Sun-shin dashes forward and slashes with his glaive, dealing 150<font color="fba51f"> (+40% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> and becoming immune to control effects for 0.4s.

Each <font color="a6aafb">Weapon Mastery</font> triggered reduces the cooldown of <font color="a6aafb">Traceless</font> by 1s.'
WHERE skill_name = 'Traceless' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Yi Sun-shin' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = '<font color="a6aafb">Tap</font>: Yi Sun-shin slashes swiftly with his glaive, dealing 240<font color="fba51f"> (+80% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font>.
<font color="a6aafb">Hold</font>: Yi Sun-shin shoots a powerful arrow, dealing 240<font color="fba51f"> (+80% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to the target. The arrow''s damage scales with the hold time, up to 200%.
Yi Sun-shin gains <font color="a6aafb">Weapon Mastery</font> immediately when this skill is used.'
WHERE skill_name = 'Blood Floods' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Yi Sun-shin' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Yi Sun-shin summons a turtle ship and gains sight of the whole map for 2s. The turtle ship lasts for up to 15s, during which Yi Sun-shin gains 70% burst Movement Speed (decays to 20% over 2s).
When cast again, Yi Sun-shin commands the turtle ship to ram toward the target area, dealing 160<font color="fba51f"> (+50% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> and stunning enemy units in the central area for 0.8s. Then Yi Sun-shin commands the naval fleet to launch 3 waves of cannon shots on a larger area, each dealing 160<font color="fba51f"> (+50% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> and slowing the enemies by 30%.
Yi Sun-shin gains <font color="a6aafb">Weapon Mastery</font> effect immediately when this skill is used.'
WHERE skill_name = 'Mountain Shocker' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Yi Sun-shin' AND game_id = 1);

-- Yin
UPDATE hero_skills 
SET skill_description = 'If there are no allied heroes within 4 units of Yin, his damage is increased to 120% and he gains 8% Spell Vamp.'
WHERE skill_name = 'Leave It to Me' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Yin' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Yin gains 60% extra Movement Speed (decays over 3s).
Yin can launch an enhanced Basic Attack that deals 25<font color="fba51f"> (+100% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> within the duration. Upon hitting an enemy with the enhanced Basic Attack, Yin will throw another charged punch forward, dealing 360<font color="fba51f"> (+200% Extra Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to enemies in the path.
Successfully throwing the charged punch reduces the skill''s cooldown by 35%.'
WHERE skill_name = 'Charged Punch' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Yin' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Yin dashes forward, leaving a <font color="a6aafb">Golden Ring</font> behind while dealing 75<font color="fba51f"> (+35% Extra Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to enemies along the way. He gains 30% extra Damage Reduction for 4s if an enemy hero is hit.
After 1s, the <font color="a6aafb">Golden Ring</font> will catch up with Yin, dealing 150<font color="fba51f"> (+70% Extra Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> to enemies it passes through and stunning them for 1s.'
WHERE skill_name = 'Instant Blast' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Yin' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'After a short delay, Yin locks onto an enemy hero (<font color="a6aafb">cannot lock onto pets or clones</font>) and pulls them into a domain for up to 8s and turns into <font color="a6aafb">Lieh</font>. When in the domain, the two cannot be affected by other heroes'' skills.
<font color="a6aafb">Lieh</font> has stronger skills and 50 extra <font color="26e407">Physical & Magic Defense</font> that last 8s.
The domain will end early if either of the two is killed. If <font color="a6aafb">Lieh</font> successfully kills the enemy, he''ll recover 20% of his Max HP, leave the domain with the cooldowns of <font color="a6aafb">Frenzy Strike</font> and <font color="a6aafb">Instant Blast</font> reset, and continue to fight as <font color="a6aafb">Lieh</font> for 8s.
If Yin fails to pull his target into the domain, the skill will enter a 3s cooldown.'
WHERE skill_name = 'My Turn' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Yin' AND game_id = 1);

-- Yve
UPDATE hero_skills 
SET skill_description = 'When Yve deals damage to enemy heroes with her skills, she gains Galactic Power (cooldown: 0.5s), up to 3 stacks. Each stack provides Yve with a 50(+10*Hero Level)<font color="62f8fe"> (+20% Total Magic Power)</font> shield for 3s.'
WHERE skill_name = 'Galactic Power' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Yve' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Yve detonates Galactic Energy at the target location, dealing 290<font color="62f8fe"> (+150% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> to enemies in the area.
Successfully hitting an enemy grants Yve 55% extra Movement Speed (halved if a non-hero enemy is hit) that decreases over 1s.'
WHERE skill_name = 'Void Blast' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Yve' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Yve summons a <font color="a6aafb">Void Crystal</font> at the target location, dealing 220<font color="62f8fe"> (+40% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> to nearby enemies.

<font color="a6aafb">Use Again</font>: Yve commands the Crystal to fire materialized energy in the target direction for 2.7s, dealing 75<font color="62f8fe"> (+10% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> every 0.45s to enemies hit and slowing them by 30%. Enemies hit multiple times are slowed by an extra 6% for each hit after the first hit (up to 60%).'
WHERE skill_name = 'Void Crystal' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Yve' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Yve creates a Starfield that lasts 15s. Within the duration, you can Tap or Swipe the screen to attack up to 20 times.
<font color="a6aafb">Tap</font>: Deals 340<font color="62f8fe"> (+150% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> to enemies in the target area.
<font color="a6aafb">Swipe</font>: Deals 85<font color="62f8fe"> (+10% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> every 0.45s to enemies in the target area for 2.7s and slows them by 60%.
Enemies leaving or entering the Starfield will be immobilized for 0.8s (only once against the same target).
Yve cannot be displaced while the Starfield is active, and the Starfield will remain even if Yve is controlled (except for Suppression).'
WHERE skill_name = 'Real World Manipulation' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Yve' AND game_id = 1);

-- Zhask
UPDATE hero_skills 
SET skill_description = 'Upon death, Zhask summons a frenzied <font color="a6aafb">Nightmaric Spawn</font> on the spot, which gradually loses HP over time until death.'
WHERE skill_name = 'Decimation' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Zhask' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Zhask summons a <font color="a6aafb">Nightmaric Spawn</font> that inherits 55% of his Attributes (HP, Hybrid Defense, and Magic Power). <font color="a6aafb">Nightmaric Spawn</font> will automatically attack nearby enemies by firing a <font color="a6aafb">Death Ray</font> at the target, dealing 55 (+<font color="26e407">20% extra Attack Speed</font>) (+<font color="62f8fe">20% Magic Power</font>) <font color="7f62fe">Magic Damage</font> and slowing them by up to 30%. If Zhask is too far away from <font color="a6aafb">Nightmaric Spawn</font>, it will disappear.
<font color="a6aafb">Death Ray</font> is considered as a Basic Attack but cannot Crit.
<font color="a6aafb">Fusion Enhanced</font>: The damage of <font color="a6aafb">Nightmaric Spawn</font> is increased to 180%, and it can be repositioned.'
WHERE skill_name = 'Nightmaric Spawn' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Zhask' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Zhask fires a penetrating mental missile in the designated direction, dealing 300<font color="62f8fe"> (+100% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font>. Afterward, <font color="a6aafb">Nightmaric Spawn</font> will attack enemies hit by <font color="a6aafb">Mind Eater</font> for 120<font color="62f8fe"> (+80% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> and stun them for 0.5s. 

<font color="a6aafb">Fusion Enhanced</font>: Increases the damage dealt by <font color="a6aafb">Mind Eater</font> by 540<font color="62f8fe"> (+180% Total Magic Power)</font>.'
WHERE skill_name = 'Mind Eater' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Zhask' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Zhask releases a swarm of <font color="a6aafb">Hive Clones</font> in the targeted direction. The clones will explode and deal 55<font color="62f8fe"> (+18% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> to enemies on contact, reducing their Movement Speed by 80% for 1s. 
If <font color="a6aafb">Hive Clones</font> find no target, they will burrow into the ground and ambush enemies passing by.
<font color="a6aafb">Fusion Enhanced</font>: Zhask releases several swarms of <font color="a6aafb">Hive Clones</font>.
Subsequent damage dealt to the same target decays to 20%.'
WHERE skill_name = 'Hive Clones' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Zhask' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Zhask selects a designated position to summon <font color="a6aafb">Nightmaric Spawn</font> and fuses with it. Nightmaric Spawn can inherit 100% of his attributes and get extra of them. His skills are enhanced during the fusion period.

<font color="a6aafb">Use Again</font>: Zhask immediately gets off <font color="a6aafb">Nightmaric Spawn</font> and loses enhancement.'
WHERE skill_name = 'Dominator''s Descent' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Zhask' AND game_id = 1);

-- Zhuxin
UPDATE hero_skills 
SET skill_description = 'Every time Zhuxin channels <font color="a6aafb">Lantern Flare</font>, she converts the Mana spent into up to 15 <font color="a6aafb">Crimson Butterflies</font> to follow her <font color="a6aafb">Spirit Lantern</font>. After Zhuxin stops channeling <font color="a6aafb">Lantern Flare</font>, the <font color="a6aafb">Crimson Butterflies</font> will gradually disappear, each restoring 3% of her Max Mana.
Zhuxin has a naturally high base Max Mana, but it doesn''t scale with her level.'
WHERE skill_name = 'Crimson Butterflies' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Zhuxin' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Zhuxin deals 150<font color="62f8fe"> (+30% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> to all enemies in a fan-shaped area and applies 1 stack(s) of <font color="a6aafb">Soul Snare</font>. Zhuxin also slows all enemy heroes hit by 20% and gains 20% of extra Movement Speed herself for 1.5s.'
WHERE skill_name = 'Fluttering Grace' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Zhuxin' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = '<font color="a6aafb">Hold</font>: Hold the skill button to move the <font color="a6aafb">Spirit Lantern</font>. It deals 45<font color="62f8fe"> (+30% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> to all enemies in range every 0.33s (Magic Power increases to 60% against Minions) and applies <font color="a6aafb">Soul Snare</font> to enemy heroes hit. When an enemy hero reaches 10 stacks of <font color="a6aafb">Soul Snare</font>, the <font color="a6aafb">Crimson Butterflies</font> capture them, pulling them airborne for 1s.

<font color="a6aafb">Release</font>: Throw all captured enemies to the target location, dealing 200<font color="62f8fe"> (+150% Total Magic Power)</font> + 10% of the captured target''s Max HP as <font color="7f62fe">Magic Damage</font> to all enemies in the area. If an enemy is hit multiple times, subsequent hits deal 80% less damage.

After a target is captured, <font color="a6aafb">Soul Snare</font> cannot stack on them again for 4s. During this time, this skill deals 15% increased damage to that target.'
WHERE skill_name = 'Lantern Flare' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Zhuxin' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Zhuxin blinks to the target location while gaining a 400<font color="62f8fe"> (+100% Total Magic Power)</font> shield. While flying, she creates a field around her for 6s. The field deals 60<font color="62f8fe"> (+20% Total Magic Power)</font> <font color="7f62fe">Magic Damage</font> and applies 1 stack of <font color="a6aafb">Soul Snare</font> to enemies every 0.5s.'
WHERE skill_name = 'Crimson Beacon' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Zhuxin' AND game_id = 1);

-- Zilong
UPDATE hero_skills 
SET skill_description = 'After dealing damage 3 time(s) with Basic Attacks or skills, Zilong triggers <font color="a6aafb">Dragon Flurry</font> on the next Basic Attack, hitting the target 3 time(s). Each hit deals 80<font color="fba51f"> (+30% Total Physical Attack)</font> Basic Attack Damage and heals himself for 50<font color="fba51f"> (+20% Total Physical Attack)</font> HP.

Zilong''s Basic Attack deals 100<font color="fba51f"> (+80% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font>.

If the target''s HP is below 50%, all damage dealt by Zilong''s skills and Basic Attacks is increased by 30.'
WHERE skill_name = 'Dragon Flurry' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Zilong' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Zilong flings the target enemy over his head, dealing 250<font color="fba51f"> (+80% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font>.'
WHERE skill_name = 'Spear Flip' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Zilong' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Zilong lunges at the target enemy, dealing 250<font color="fba51f"> (+60% Total Physical Attack)</font> <font color="fb1f1f">Physical Damage</font> and reducing their Physical Defense by 15 for 2s.

The cooldown of <font color="a6aafb">Spear Strike</font> is reset each time Zilong kills an enemy.'
WHERE skill_name = 'Spear Strike' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Zilong' AND game_id = 1);

UPDATE hero_skills 
SET skill_description = 'Zilong removes all slow effects on himself and gains 40% Movement Speed, 35% Attack Speed, and Slow Immunity for 7.5s.

For the duration, he can trigger <font color="a6aafb">Dragon Flurry</font> after every 2 Basic Attacks (instead of the previous 3).'
WHERE skill_name = 'Supreme Warrior' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = 'Zilong' AND game_id = 1);


COMMIT;

-- Total skills processed: 492
-- Review the statements above before executing!
