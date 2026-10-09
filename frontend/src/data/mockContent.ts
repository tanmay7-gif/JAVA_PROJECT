import { FitnessContent } from '../types';

export const CLINICAL_PROTOCOLS: FitnessContent[] = [
  // =========================================================================
  // CATEGORY: GUIDE (Biomechanical Technique & Conditioning Fundamentals)
  // =========================================================================
  {
    id: 'proto-guide-1',
    creator_id: 'usr-admin-1',
    title: 'Biomechanical Barbell Kinematics: Eliminating Spinal Shear in Posterior Chain Lifts',
    category: 'GUIDE',
    status: 'APPROVED',
    readTime: '7 min read',
    author: 'Dr. Aris Thorne, CSCS',
    imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80',
    media_url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80',
    summary: 'Comprehensive kinematic breakdown of pelvic tilt, intra-abdominal bracing, and hip hinge levers to maximize force transfer while minimizing lumbar strain.',
    description: 'Comprehensive kinematic breakdown of pelvic tilt, intra-abdominal bracing, and hip hinge levers to maximize force transfer while minimizing lumbar strain.',
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    creator: {
      id: 'usr-admin-1',
      name: 'Dr. Aris Thorne, CSCS',
      email: 'thorne@fitpulse.com',
      profile_image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
    },
    content: `## 1. Fundamentals of Spinal Shear vs Axial Compression
During closed-kinetic-chain posterior lifts (deadlifts, Romanian deadlifts, good mornings), the lumbar spine (L4-S1) experiences two vector forces: axial compression and transverse shear. While spinal disks are exceptionally adapted to tolerate axial compressive loads exceeding 10x bodyweight, shear forces—induced by excessive forward trunk inclination and lumbar flexion—drastically increase the risk of annulus fibrosus herniation.

## 2. Intra-Abdominal Pressure (IAP) & The Valsalva Maneuver
Maximizing intra-abdominal pressure creates an incompressible fluid-gas cylinder anterior to the vertebral column:
* **Deep Diaphragmatic Inhalation**: Inhale to ~80% vital lung capacity into the lower abdomen, pelvic floor, and obliques—not the upper chest.
* **Closed-Glottis Contraction**: Forcefully contract the rectus abdominis, transverse abdominis, and internal obliques against the closed glottis.
* **Rigid Hydraulic Cylinder**: This expands hoop tension and offloads up to 40% of the shear moment from the lumbar erectors onto the core musculature.

## 3. Hip-Dominant vs Knee-Dominant Articulation
* **Hip Hinge Cues**: Initiate movement by pushing the acetabulofemoral joints rearward while maintaining an isometric tibia angle (75°-85° relative to the floor).
* **Latissimus Dorsi Tension**: Actively pull the barbell into the shins ("bend the bar around your shins"), which engages the thoracolumbar fascia and locks the spine into neutral lordosis.
* **Pelvic Alignment**: Avoid anterior pelvic dumping at the floor and posterior hyperextension at lockout. Lock out with gluteus maximus co-contraction.

## 4. Bar Path Verticality & Ground Reaction Vectors
Any anterior horizontal displacement of the barbell creates an exponential lever arm increase between the center of mass (COM) and the L5-S1 fulcrum. Keep the bar path strictly perpendicular over the midfoot (scaphoid bone) throughout both concentric and eccentric phases.

## 5. Clinical Action Steps
1. Perform 3 sets of 5 repetitions of dead-bug breathing with 5-second max IAP holds prior to loading.
2. Establish bar contact against shins before initiating leg drive.
3. Record side-angle video at 60fps to verify 0° lumbar deflection under peak concentric velocity.`,
  },
  {
    id: 'proto-guide-2',
    creator_id: 'usr-admin-2',
    title: 'Zone-2 Aerobic Base Architecture: Mitochondrial Density & Lactate Clearance',
    category: 'GUIDE',
    status: 'APPROVED',
    readTime: '8 min read',
    author: 'Coach Mateo Diaz, M.S.',
    imageUrl: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=1200&q=80',
    media_url: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=1200&q=80',
    summary: 'Step-by-step programming guidelines for building an expansive aerobic base below 2.0 mmol/L blood lactate.',
    description: 'Step-by-step programming guidelines for building an expansive aerobic base below 2.0 mmol/L blood lactate.',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    creator: {
      id: 'usr-admin-2',
      name: 'Coach Mateo Diaz, M.S.',
      email: 'diaz@fitpulse.com',
      profile_image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
    },
    content: `## 1. Metabolic Bioenergetics: Fat Oxidation vs Glycolysis
Zone-2 training targets the specific exercise intensity where the body maximizes fat oxidation (FatMax) while maintaining steady-state blood lactate concentrations below 2.0 mmol/L. At this intensity, Type-I slow-twitch oxidative muscle fibers do virtually all the metabolic work, relying on cellular respiration rather than glycolytic substrate phosphorylation.

## 2. Determining True Zone-2 Boundaries
* **Blood Lactate Benchmark**: Lab-verified lactate profile between 1.5 mmol/L and 2.0 mmol/L.
* **Ventilatory Threshold 1 (VT1)**: The breathing rate increases slightly, but the athlete can still recite full multi-sentence paragraphs without gasping (the "conversational pacing test").
* **Heart Rate Reserve Calculation**: Typically 60%–70% of maximal heart rate (HRmax), or roughly (207 - (0.7 × age)) × 0.65.

## 3. Mitochondrial Biogenesis & PGC-1α Signaling
Zone-2 endurance drives sustained calcium calmodulin-dependent protein kinase (CaMK) and AMPK activation, which upregulates PGC-1α. This transcriptional coactivator triggers:
* Exponential increases in mitochondrial cristae surface area.
* Amplified monocarboxylate transporter 1 (MCT-1) expression to rapidly shuttle lactate into oxidative fibers for fuel.
* Increased capillary network density per muscle fascicle.

## 4. The 80/20 Polarized Volume Distribution Matrix
To prevent autonomic nervous system burnout while achieving elite cardiorespiratory fitness:
* **80% Low-Intensity Base**: 3 to 4 weekly sessions of 45–90 minutes strictly capped in Zone-2.
* **20% High-Intensity Threshold / VO2 Max**: 1 weekly session of Tabata, Norwegian 4x4 intervals, or hard tempo efforts above 4.0 mmol/L.

## 5. Clinical Action Steps
1. Dedicate at least 150–240 minutes per week to uninterrupted Zone-2 sessions.
2. Select low-impact modalities (cycle ergometer, incline treadmill rucking, rowing) to preserve joint cartilage.
3. Keep nasal breathing continuous throughout the entire session to prevent unintentional drift into Zone-3.`,
  },
  {
    id: 'proto-guide-3',
    creator_id: 'usr-admin-3',
    title: 'Grip Dynamics & Kinetic Chain Radiations in Overhead Presses',
    category: 'GUIDE',
    status: 'APPROVED',
    readTime: '5 min read',
    author: 'Julian Ward, DPT',
    imageUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=1200&q=80',
    media_url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=1200&q=80',
    summary: "Exploring Sherrington's law of irradiation to unlock vertical pressing stability through active forearm tension and scapulohumeral rhythm.",
    description: "Exploring Sherrington's law of irradiation to unlock vertical pressing stability through active forearm tension and scapulohumeral rhythm.",
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    creator: {
      id: 'usr-admin-3',
      name: 'Julian Ward, DPT',
      email: 'ward@fitpulse.com',
      profile_image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80',
    },
    content: `## 1. Sherrington's Law of Neural Irradiation
Sir Charles Sherrington established that a muscle working under maximal voluntary isometric contraction radiates excitatory neural signals into adjacent synergist muscle groups. In vertical pressing, white-knuckle crush grip on the implement recruits forearm flexors, which reflexively fires the biceps, triceps lateral head, rotator cuff stabilizers (supraspinatus, infraspinatus), and the latissimus dorsi foundation.

## 2. Hand Placement: The Bulldog Grip Mechanism
Resting the barbell high across the metacarpal phalanges causes passive wrist extension, creating a severe shear moment across the carpal tunnel and destabilizing the forearm lever:
* **Bulldog Rotation**: Internally rotate the hands slightly outward so the barbell rests directly over the base of the thenar eminence (heel of the palm).
* **Vertical Forearm Stacking**: Ensure the olecranon process (elbow tip) remains directly vertical under the barbell bar path throughout the starting rack position.

## 3. Scapulohumeral Rhythm & Serratus Anterior Mechanics
A healthy overhead press requires smooth upward rotation of the scapula:
* As humerus elevates past 90°, the serratus anterior and lower trapezius must upwardly rotate the glenoid cavity by ~60°.
* Actively push the ceiling away at lockout ("shrug up into the bar") to clear the subacromial space and completely eliminate impingement on the supraspinatus tendon.

## 4. Latissimus Wedge & Torso Stability
Before initiating concentric drive, pull your shoulder blades down and back into your back pockets, clamping the ribcage down with maximum transverse abdominal tension to eliminate compensatory lumbar hyperextension.

## 5. Clinical Action Steps
1. Squeeze the barbell with 100% grip strength for 2 seconds before breaking the front-rack position.
2. Tuck the chin slightly back to provide clear vertical clearance for the barbell trajectory.
3. Finish the lockout with upper arms aligned behind the ears, maintaining total gluteal and quad tension.`,
  },

  // =========================================================================
  // CATEGORY: NUTRITION (Macronutrient Strategies & Hydration)
  // =========================================================================
  {
    id: 'proto-nutri-1',
    creator_id: 'usr-admin-4',
    title: 'Peri-Workout Glycogen Supercompensation: Precision Nutrient Timing',
    category: 'NUTRITION',
    status: 'APPROVED',
    readTime: '6 min read',
    author: 'Elena Rostova, RD, CSSD',
    imageUrl: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1200&q=80',
    media_url: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1200&q=80',
    summary: 'A clinical roadmap to pre-, intra-, and post-workout macronutrient ratios designed to maximize muscle protein synthesis and accelerate glycogen resynthesis.',
    description: 'A clinical roadmap to pre-, intra-, and post-workout macronutrient ratios designed to maximize muscle protein synthesis and accelerate glycogen resynthesis.',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    creator: {
      id: 'usr-admin-4',
      name: 'Elena Rostova, RD, CSSD',
      email: 'rostova@fitpulse.com',
      profile_image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=250&q=80',
    },
    content: `## 1. Kinetics of Muscle Glycogen Resynthesis
High-volume resistance training and anaerobic threshold intervals deplete intramyocellular glycogen stores by 30%–45% per session. Glycogen synthase activity peaks immediately post-exercise through insulin-independent GLUT-4 transporter translocation to the sarcolemma. Capitalizing on this 45-minute window dramatically shortens systemic recovery timelines.

## 2. Pre-Workout Nutrition Timeline
* **2.5–3 Hours Prior**: Ingest a balanced whole-food meal comprising 1.0–1.2 g/kg low-to-moderate glycemic carbohydrates (oats, jasmine rice, sweet potato) paired with 0.4 g/kg lean complete protein and low lipids (<10g) to ensure gastric emptying.
* **30 Minutes Prior**: Hydrate with 400–500mL fluid containing 200mg sodium and optionally 20g rapidly digestible cyclic dextrin.

## 3. Intra-Workout Osmolality & Fueling (For Sessions >60 Mins)
For prolonged high-demand sessions, sip a 6%–8% carbohydrate-electrolyte hypotonic beverage:
* **Substrate**: Highly Branched Cyclic Dextrin (HBCD) or maltodextrin/fructose in a 2:1 ratio for dual SGLT1 and GLUT5 transporter saturation.
* **Dosage**: 30–60 g carbs per hour combined with 400–700 mg sodium to preserve blood volume and blunt cortisol spikes.

## 4. Post-Workout Anabolic Trigger
* **Protein Threshold**: Ingest 0.4–0.5 g/kg of high-biological-value protein providing at least 3.0 g of free L-Leucine to fully trigger the mTORC1 kinase cascade.
* **Carbohydrate Co-Ingestion**: Pair with 0.8–1.0 g/kg high-glycemic carbohydrates to elevate circulating insulin, which suppresses myofibrillar proteolysis and upregulates glycogen storage.

## 5. Clinical Action Steps
1. Formulate intra-workout fuel using 30g cyclic dextrin, 5g EAAs, and 500mg pink Himalayan salt in 750mL cold water.
2. Ingest your post-workout recovery shake within 45 minutes of training cessation.
3. Keep dietary fats minimal during the immediate peri-workout window to maintain rapid gastrointestinal transit.`,
  },
  {
    id: 'proto-nutri-2',
    creator_id: 'usr-admin-5',
    title: 'Micronutrient Optimization for High-Volume Endurance & Electrolyte Balance',
    category: 'NUTRITION',
    status: 'APPROVED',
    readTime: '9 min read',
    author: 'Dr. Kaelen Hayes',
    imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=1200&q=80',
    media_url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=1200&q=80',
    summary: 'Combatting hyponatremia and exercise-induced cramping through customized sodium, potassium, and magnesium dosing strategies.',
    description: 'Combatting hyponatremia and exercise-induced cramping through customized sodium, potassium, and magnesium dosing strategies.',
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    creator: {
      id: 'usr-admin-5',
      name: 'Dr. Kaelen Hayes',
      email: 'hayes@fitpulse.com',
      profile_image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=250&q=80',
    },
    content: `## 1. Pathophysiology of Exercise-Associated Hyponatremia (EAH)
Endurance athletes often fall prey to overhydrating with hypotonic pure water during prolonged exertion, diluting serum sodium concentrations below 135 mmol/L. This induces cellular edema, muscle fasciculations, severe cramping, and in extreme scenarios, encephalopathy. Balanced electrolyte replenishment is an absolute clinical requirement.

## 2. Individual Sweat-Rate Quantification
Calculate personal fluid and mineral loss rates using this standard equation:
Sweat Rate (L/hr) = ((Pre-Exercise Weight - Post-Exercise Weight) + Fluid Consumed (L) - Urine Output (L)) / Duration (Hours).
Average sweat contains between 800–1500 mg of sodium per liter, alongside 150–300 mg potassium and 20–50 mg magnesium.

## 3. Bioavailable Mineral Chelates vs Oxide Salts
Never consume cheap inorganic mineral salts (magnesium oxide, calcium carbonate) due to poor intestinal permeability (<4%) and laxative side-effects:
* **Magnesium Glycinate / Malate**: High bioavailability, supports ATP phosphorylation, cellular relaxation, and blunts muscle tetany.
* **Potassium Citrate**: Alkaline donor that counteracts metabolic acidosis during sustained lactic accumulation.
* **Sodium Chloride / Sodium Citrate**: Prevents plasma volume collapse and maintains stroke volume during elevated ambient temperatures.

## 4. Strategic Mineral Supplementation Protocol
* **Morning**: 200mg elemental magnesium glycinate with 500mL water to replenish overnight respiratory moisture loss.
* **60 Minutes Pre-Training**: 500–750mg sodium in 500mL fluid to create a hyper-hydration buffer.
* **Post-Training**: Replenish 125%–150% of lost body mass with an electrolyte-dense beverage over a 2–4 hour window.

## 5. Clinical Action Steps
1. Conduct a 1-hour sweat test under typical environmental conditions twice per training cycle.
2. Replace table salt with mineral-rich sea salt containing trace selenium, zinc, and iodine.
3. Consume leafy greens, avocados, and coconut water daily to establish robust intracellular potassium stores.`,
  },
  {
    id: 'proto-nutri-3',
    creator_id: 'usr-admin-6',
    title: 'Metabolic Hypertrophy Diet: Surplus Calculations Without Adipose Accumulation',
    category: 'NUTRITION',
    status: 'APPROVED',
    readTime: '7 min read',
    author: 'Sarah Jenkins, Sports Nutritionist',
    imageUrl: 'https://images.unsplash.com/photo-1543353071-873f17a7a088?auto=format&fit=crop&w=1200&q=80',
    media_url: 'https://images.unsplash.com/photo-1543353071-873f17a7a088?auto=format&fit=crop&w=1200&q=80',
    summary: 'Fine-tuning caloric surplus increments (200–350 kcal) to bias nutrient partitioning toward lean skeletal muscle tissue over body fat.',
    description: 'Fine-tuning caloric surplus increments (200–350 kcal) to bias nutrient partitioning toward lean skeletal muscle tissue over body fat.',
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    creator: {
      id: 'usr-admin-6',
      name: 'Sarah Jenkins, Sports Nutritionist',
      email: 'jenkins@fitpulse.com',
      profile_image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=80',
    },
    content: `## 1. The Physiology of the P-Ratio (Partitioning Ratio)
The Partitioning Ratio (P-Ratio), conceptualized by Forbes, dictates what proportion of weight gained or lost is partitioned as lean fat-free mass versus adipose tissue. While natural muscle protein synthesis (MPS) rates have finite physiological caps (~0.25–0.5 lbs per week for trained individuals), surplus calories beyond this threshold convert directly into triglyceride accumulation in adipocytes.

## 2. Determining Accurate Caloric Surplus Thresholds
* **Avoid Dirty Bulking**: Massive +1000 kcal surpluses do not accelerate muscle accrual; they accelerate systemic inflammation, visceral fat gain, and peripheral insulin resistance.
* **The Controlled Lean Surplus**: Aim for a calculated +200 to +350 kcal/day above maintenance (TDEE), representing a conservative 5%–10% energy buffer.
* **TDEE Calculation**: BMR × PAL + EAT, where physical activity level (PAL) is adjusted for step count and training density.

## 3. Macronutrient Composition & The Protein Anchor
* **Protein Anchor**: Fix intake strictly at 1.8–2.2 g/kg of total body mass, spaced evenly across 4 to 5 meals with 3g+ leucine per feeding.
* **Dietary Lipids**: Set at 0.8–1.0 g/kg to sustain androgenic hormone biosynthesis (testosterone, DHEA) with emphasis on monounsaturated fats (extra virgin olive oil, avocado) and omega-3 EPA/DHA.
* **Carbohydrate Modulation**: Allocate all remaining surplus calories to complex carbohydrates to fuel training glycogen and elevate anabolic IGF-1 levels.

## 4. Monitoring Biometric Deltas & Auto-Regulation
* Weigh daily under standardized conditions (fasted upon waking), tracking the 7-day rolling median.
* Target a weekly weight increase of 0.25%–0.5% bodyweight.
* If waist circumference increases by >0.5 cm over two consecutive weeks without strength progression, taper surplus back by 150 kcal.

## 5. Clinical Action Steps
1. Log baseline food intake for 14 days to establish true caloric maintenance prior to surplus initiation.
2. Anchor each meal around 35–45g high-leucine protein sources (salmon, poultry, eggs, whey isolate).
3. Schedule periodic 1-week normocaloric maintenance breaks every 8–10 weeks to re-sensitize insulin receptors.`,
  },

  // =========================================================================
  // CATEGORY: RECOVERY (Deload Protocols, Sleep Hygiene & Myofascial Release)
  // =========================================================================
  {
    id: 'proto-recov-1',
    creator_id: 'usr-admin-1',
    title: 'Central Nervous System Deload Architecture: Preventing Neuro-Endocrine Burnout',
    category: 'RECOVERY',
    status: 'APPROVED',
    readTime: '6 min read',
    author: 'Dr. Marcus Vance',
    imageUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80',
    media_url: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80',
    summary: 'A structured 7-day protocol reducing systemic volume while maintaining movement motor patterns to restore neuromuscular readiness and endocrine baseline.',
    description: 'A structured 7-day protocol reducing systemic volume while maintaining movement motor patterns to restore neuromuscular readiness and endocrine baseline.',
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    creator: {
      id: 'usr-admin-1',
      name: 'Dr. Marcus Vance',
      email: 'admin@fitpulse.com',
      profile_image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
    },
    content: `## 1. Neuromuscular Fatigue vs Peripheral Muscle Soreness
Athletes frequently mistake localized Delayed Onset Muscle Soreness (DOMS) for central systemic fatigue. Peripheral muscular fatigue resolves within 48–72 hours, whereas central nervous system (CNS) fatigue—characterized by reduced motor neuron excitability, impaired calcium release in the sarcoplasmic reticulum, and hypothalamic-pituitary-adrenal (HPA) axis dysregulation—can persist for weeks if unmitigated.

## 2. Diagnostic Indicators of Autonomic Overreaching
* **Depressed Heart Rate Variability (HRV)**: A 7-day rolling rMSSD baseline dropping >1.5 standard deviations below individual baseline.
* **Elevated Resting Heart Rate (RHR)**: Waking pulse elevated by +5 to +8 bpm for three consecutive mornings.
* **Grip Dynamometry Decline**: A >10% decrease in isometric maximal grip strength is a direct clinical proxy for central motor drive attenuation.

## 3. Deload Architecture: The 50/85 Rule
Complete cessation of training ("couch rest") causes neuromuscular disinhibition and stiffness. Instead, implement a high-stimulus, low-fatigue structured deload:
* **Volume Reduction (-50%)**: Cut total working sets in half (e.g., reduce 4 working sets per movement down to 2).
* **Intensity Maintenance (80%–85%)**: Maintain loads at 80%–85% of 1RM to keep motor unit synchronization and rate coding active without accumulating metabolic byproducts.
* **Rate of Perceived Exertion (RPE)**: Cap all sets strictly at RPE 6–7 (leaving 3–4 clean reps in reserve).

## 4. Neuro-Endocrine Baseline Restoration
Incorporate daily 30-minute low-intensity parasympathetic outdoor walks in natural sunlight, contrast hydrotherapy (3 mins hot at 38°C / 1 min cold at 12°C for 4 cycles), and 10 minutes of box-breathing (4s in, 4s hold, 4s out, 4s hold) to downregulate sympathetic tone.

## 5. Clinical Action Steps
1. Schedule a proactive deload every 4th to 6th week of uninterrupted progressive overload.
2. Cut all sets to failure and eliminate forced repetitions or drop-sets completely.
3. Emphasize restorative sleep (aim for 8.5–9 hours per night during the deload week).`,
  },
  {
    id: 'proto-recov-2',
    creator_id: 'usr-admin-7',
    title: 'Sleep Architecture & Circadian Pacing for Maximal Growth Hormone Secretion',
    category: 'RECOVERY',
    status: 'APPROVED',
    readTime: '8 min read',
    author: 'Dr. Sophia Reynolds, Sleep Specialist',
    imageUrl: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=1200&q=80',
    media_url: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=1200&q=80',
    summary: 'Evidence-based environmental and behavioral adjustments to expand Slow Wave Sleep (SWS) and Stage 3/4 REM for tissue regeneration.',
    description: 'Evidence-based environmental and behavioral adjustments to expand Slow Wave Sleep (SWS) and Stage 3/4 REM for tissue regeneration.',
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    creator: {
      id: 'usr-admin-7',
      name: 'Dr. Sophia Reynolds, Sleep Specialist',
      email: 'reynolds@fitpulse.com',
      profile_image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=250&q=80',
    },
    content: `## 1. Neurobiology of Slow Wave Sleep (SWS) & Anabolism
Up to 95% of daily pulsatile Human Growth Hormone (hGH) secretion occurs during Stage 3 and Stage 4 non-rapid eye movement (NREM) slow-wave sleep. During this phase, delta brainwaves (0.5–4 Hz) dominate, cerebral glucose consumption plummets, and systemic blood flow shifts outward to skeletal muscle beds, promoting ribosomal protein synthesis and cellular microtrauma repair.

## 2. Thermoregulation & Distal Vasodilation
The circadian onset of sleep is physiologically contingent on a 1.0°C drop in internal core body temperature:
* **Ambient Thermal Control**: Maintain the sleeping quarters at 18°C (65°F). Warm environments prevent the core body heat dump through the palms and soles of the feet (arteriovenous anastomoses).
* **Hot Shower / Sauna Paradox**: Taking a hot shower 90 minutes before bed causes peripheral vasodilation, which accelerates rapid core cooling upon exiting.

## 3. Retinal Photobiology & Melatonin Secretion
The suprachiasmatic nucleus (SCN) controls the master circadian clock via intrinsically photosensitive retinal ganglion cells (ipRGCs), which are acutely sensitive to blue wavelengths (460–480 nm):
* View 10–15 minutes of direct sunlight within 60 minutes of waking to anchor the cortisol spike and synchronize the circadian pacemaker.
* Eliminate artificial overhead LED illumination and blue screens 90 minutes prior to intended sleep onset to allow uninhibited pineal melatonin synthesis.

## 4. Evidence-Backed Sleep Supplement Synergy
Avoid synthetic melatonin, which downregulates endogenous receptor sensitivity:
* **Magnesium L-Threonate (145mg elemental)**: Crosses the blood-brain barrier to activate GABA-A receptors and downregulate neuro-excitation.
* **Apigenin (50mg)**: Bioactive chamomile flavonoid binding to benzodiazepine receptors for gentle central calming.
* **L-Theanine (200mg)**: Amino acid that amplifies relaxing alpha brainwave activity without morning grogginess.

## 5. Clinical Action Steps
1. Maintain consistent sleep and wake times within a 30-minute variance 7 days a week.
2. Ensure sleeping room is 100% pitch black using blackout shades or a high-quality eye mask.
3. Finish the final meal at least 3 hours before sleep to prevent nocturnal insulin spikes from suppressing nocturnal growth hormone pulses.`,
  },
  {
    id: 'proto-recov-3',
    creator_id: 'usr-admin-8',
    title: 'Targeted Myofascial Release & Dynamic Floss Band Compression',
    category: 'RECOVERY',
    status: 'APPROVED',
    readTime: '5 min read',
    author: 'Tara Chen, Physical Therapist',
    imageUrl: 'https://images.unsplash.com/photo-1599447421416-3414500d18a5?auto=format&fit=crop&w=1200&q=80',
    media_url: 'https://images.unsplash.com/photo-1599447421416-3414500d18a5?auto=format&fit=crop&w=1200&q=80',
    summary: 'Clinical manual therapy routines focusing on joint capsule distraction, tissue shear, and venous flush for knee and shoulder complex longevity.',
    description: 'Clinical manual therapy routines focusing on joint capsule distraction, tissue shear, and venous flush for knee and shoulder complex longevity.',
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    creator: {
      id: 'usr-admin-8',
      name: 'Tara Chen, Physical Therapist',
      email: 'chen@fitpulse.com',
      profile_image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
    },
    content: `## 1. Fascial Viscoelasticity & Hyaluronic Acid Sliding
Deep fascia is a dense, highly innervated collagenous connective tissue network that envelops every muscle fiber and joint capsule. Chronic high-load training causes dehydration and densification of the hyaluronic acid inter-fascial lubricant, leading to restricted tissue sliding, altered proprioceptive signaling from Ruffini and Pacinian corpuscles, and joint impingement.

## 2. Mechanisms of Tissue Flossing (Voodoo Floss Banding)
Elastic latex compression bands wrapped tightly around an articulated joint produce three distinct therapeutic effects:
1. **Fascial Shear Under Tension**: Moving the joint through full active range of motion under high compression forcefully breaks cross-linked scar tissue and restores myofascial gliding planes.
2. **Venous Occlusion & Reactive Hyperemia**: Occluding superficial blood flow for 90–120 seconds followed by instantaneous band release triggers a massive influx of oxygenated, nutrient-rich arterial blood that flushes stagnant cellular debris.
3. **Mechanoreceptor Down-Regulation**: The intense cutaneous tactile stimulus overrides nociceptive pain signals at the spinal cord level (Gate Control Theory), immediately restoring lost ranges of motion.

## 3. Application Guidelines & Joint Distraction
* **Overlap Protocol**: Wrap the band from distal to proximal with a 50% overlap and approximately 70% stretch over the target tendon/fascia, tapering to 50% stretch across the joint crease.
* **Active Articulation**: Execute 20–30 slow, full-range repetitions (e.g., deep squats for patellofemoral flossing, arm circles for glenohumeral flossing).
* **Strict Safety Cutoff**: Never leave floss bands wrapped for more than 2 minutes. Remove immediately if numbness, pins-and-needles, or white/purple skin discoloration occurs.

## 4. Percussive & Foam Rolling Complementarity
Follow floss banding with 60–90 seconds of slow percussive therapy (2400 RPM) along the muscle belly—avoiding bony landmarks—to desensitize neuromuscular trigger points.

## 5. Clinical Action Steps
1. Apply patellar floss band wrapping before heavy squatting or track sprinting sessions.
2. Move through unloaded full depth ranges for 90 seconds, then immediately unwrap and walk for 60 seconds to maximize the reperfusion flush.
3. Follow with active mobility drills to cement newly gained joint articulation pathways.`,
  },

  // =========================================================================
  // CATEGORY: WORKOUT_ROUTINE (Conditioning Routines & Split Programming)
  // =========================================================================
  {
    id: 'proto-routine-1',
    creator_id: 'usr-admin-1',
    title: 'Optimal Hypertrophy Blueprint: Science-Backed Volume & Rep Ranges',
    category: 'WORKOUT_ROUTINE',
    status: 'APPROVED',
    readTime: '6 min read',
    author: 'Dr. Marcus Vance',
    imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80',
    media_url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80',
    summary: 'Comprehensive guide breaking down weekly mechanical tension, effective sets per muscle group, and progressive overload pacing.',
    description: 'Comprehensive guide breaking down weekly mechanical tension, effective sets per muscle group, and progressive overload pacing.',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    creator: {
      id: 'usr-admin-1',
      name: 'Dr. Marcus Vance',
      email: 'admin@fitpulse.com',
      profile_image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
    },
    content: `## 1. Mechanical Tension as the Primary Hypertrophic Driver
Mechanical tension produced during high-threshold motor unit recruitment is the primary stimulus for myofibrillar sarcomere addition in parallel. This is maximized when lifting loads between 60%–85% of 1RM within 1–3 reps in reserve (RIR).

## 2. Weekly Set Volume Benchmarks
* **Maintenance Volume (MV)**: 6–8 sets per muscle group per week.
* **Maximum Adaptive Volume (MAV)**: 12–18 sets per muscle group per week, split across 2–3 sessions.
* **Maximum Recoverable Volume (MRV)**: 20–22 sets per week before systemic overreaching occurs.

## 3. Repetition Velocity & Proximity to Failure
Take each set to 1–2 RIR (RPE 8–9). Training to concentric muscle failure on multi-joint compound lifts (squats, bench press, deadlifts) produces disproportionate axial fatigue without incremental hypertrophic signaling compared to stopping 1 rep shy of failure.

## 4. Mesocycle Progression Model
Progressive overload should be achieved through micro-loading barbell weight (+1.25–2.5kg) or adding 1 rep per set week-over-week across a 4-week accumulating block, culminating in a 1-week deload.`,
  },
  {
    id: 'proto-routine-2',
    creator_id: 'usr-sarah-101',
    title: 'High-Cadence Hybrid MetCon Circuit: Mitochondrial & Glycolytic Conditioning',
    category: 'WORKOUT_ROUTINE',
    status: 'APPROVED',
    readTime: '7 min read',
    author: 'David Miller, CSCS',
    imageUrl: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=1200&q=80',
    media_url: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=1200&q=80',
    summary: 'A demanding full-body metabolic conditioning split integrating Olympic clean-and-press sequences with air bike anaerobic sprints.',
    description: 'A demanding full-body metabolic conditioning split integrating Olympic clean-and-press sequences with air bike anaerobic sprints.',
    created_at: new Date(Date.now() - 6 * 86400000).toISOString(),
    creator: {
      id: 'usr-sarah-101',
      name: 'David Miller, CSCS',
      email: 'david@fitpulse.com',
      profile_image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
    },
    content: `## 1. Purpose of Hybrid Metabolic Conditioning (MetCon)
MetCon structures challenge both the phosphagen and glycolytic energy pathways while maintaining high cardiorespiratory cardiac output. The goal is rapid lactate shuttle training and enhanced buffering capacity through monocarboxylate transporter recruitment.

## 2. 25-Minute High-Density Circuit
Perform 5 total rounds of the following sequence:
1. **Dumbbell Devil Presses**: 8 repetitions (moderate weight, unbroken).
2. **Echo / Air Bike**: 15 calories at >65 RPM anaerobic output.
3. **Kettlebell Goblet Squats**: 15 repetitions with 2-second eccentric descent.
4. **Rest**: 90 seconds between rounds to allow partial PCr replenishment.

## 3. Pacing Strategy & Heart Rate Management
Target 85%–92% HRmax during work intervals, observing how rapidly your pulse recovers below 135 bpm during the 90-second rest interval. A heart rate recovery (HRR) drop >30 bpm in the first minute indicates superior parasympathetic reactivity.`,
  },
];
