const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('🧪 Starting FitPulse Full-Stack Automated Verification (Pillars 1-12)...\n');
  let passed = 0;
  let failed = 0;

  const assert = (condition: boolean, testName: string, detail?: any) => {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`, detail || '');
      failed++;
    }
  };

  // 1. Health check
  const healthRes = await fetch(`${BASE_URL}/health`);
  const healthData: any = await healthRes.json();
  assert(healthRes.status === 200 && healthData.status === 'healthy', 'API Health Check (/api/health)');

  // 2. Auth - Athlete Login
  const sarahLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'sarah@fitpulse.com', password: 'User123!' }),
  });
  const sarahData: any = await sarahLoginRes.json();
  assert(sarahLoginRes.status === 200 && sarahData.success && sarahData.data.token, 'Athlete Login (Sarah)');
  const sarahToken = sarahData.data?.token;

  // 3. Auth - Admin Login
  const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@fitpulse.com', password: 'Admin123!' }),
  });
  const adminData: any = await adminLoginRes.json();
  assert(adminLoginRes.status === 200 && adminData.success && adminData.data.user.role === 'ADMIN', 'Admin Login (Marcus)');
  const adminToken = adminData.data?.token;

  // 4. Workout Logging & CRUD
  const logRes = await fetch(`${BASE_URL}/workouts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sarahToken}`,
    },
    body: JSON.stringify({
      type: 'HIIT',
      duration_minutes: 40,
      intensity: 'HIGH',
      calories_burned: 480,
      notes: 'Automated test interval circuit',
    }),
  });
  const logData: any = await logRes.json();
  assert(logRes.status === 201 && logData.success && logData.data.type === 'HIIT', 'Create Workout Log (POST /api/workouts)');
  const newWorkoutId = logData.data?.id;

  // 5. Workout Analytics & Progress Tracking (Requirement 7)
  const analyticsRes = await fetch(`${BASE_URL}/workouts/analytics`, {
    headers: { Authorization: `Bearer ${sarahToken}` },
  });
  const analyticsData: any = await analyticsRes.json();
  const summary = analyticsData.data?.summary;
  const dailyTrend = analyticsData.data?.dailyTrend;
  assert(
    analyticsRes.status === 200 &&
    summary.weeklyCaloriesBurned > 0 &&
    summary.weeklyWorkoutsCount > 0 &&
    summary.monthlyCaloriesBurned >= summary.weeklyCaloriesBurned &&
    summary.totalLifetimeWorkouts >= 1 &&
    dailyTrend.length === 7,
    'Progress Tracking: Real Database Calculations & Aggregations (GET /api/workouts/analytics)'
  );

  // 6. Fitness Goals CRUD (Requirement 8)
  const createGoalRes = await fetch(`${BASE_URL}/goals`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sarahToken}`,
    },
    body: JSON.stringify({
      title: 'Monthly Caloric Milestone',
      description: 'Burn 5000 kcal through cardiovascular workouts',
      goalType: 'CALORIE_BURN',
      targetValue: 5000,
      currentValue: 1200,
      unit: 'kcal',
      targetDate: new Date(Date.now() + 20 * 86400000).toISOString(),
    }),
  });
  const createGoalData: any = await createGoalRes.json();
  const goalId = createGoalData.data?.id;
  assert(
    createGoalRes.status === 201 &&
    createGoalData.success &&
    createGoalData.data.completionPercentage === 24,
    'Goals: Create Fitness Goal with target, value, deadline (POST /api/goals)'
  );

  const readGoalsRes = await fetch(`${BASE_URL}/goals`, {
    headers: { Authorization: `Bearer ${sarahToken}` },
  });
  const readGoalsData: any = await readGoalsRes.json();
  assert(
    readGoalsRes.status === 200 &&
    Array.isArray(readGoalsData.data) &&
    readGoalsData.data.some((g: any) => g.id === goalId),
    'Goals: Read User Goals (GET /api/goals)'
  );

  const updateGoalRes = await fetch(`${BASE_URL}/goals/${goalId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sarahToken}`,
    },
    body: JSON.stringify({
      targetValue: 6000,
      description: 'Adjusted target to 6000 kcal',
    }),
  });
  const updateGoalData: any = await updateGoalRes.json();
  assert(
    updateGoalRes.status === 200 &&
    updateGoalData.data.targetValue === 6000 &&
    updateGoalData.data.completionPercentage === 20,
    'Goals: Update Target and Value (PUT /api/goals/:id)'
  );

  const incGoalRes = await fetch(`${BASE_URL}/goals/${goalId}/increment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sarahToken}`,
    },
    body: JSON.stringify({ increment: 1800 }),
  });
  const incGoalData: any = await incGoalRes.json();
  assert(
    incGoalRes.status === 200 &&
    incGoalData.data.currentValue === 3000 &&
    incGoalData.data.completionPercentage === 50,
    'Goals: Increment Progress Percentage (POST /api/goals/:id/increment)'
  );

  const deleteGoalRes = await fetch(`${BASE_URL}/goals/${goalId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${sarahToken}` },
  });
  assert(deleteGoalRes.status === 200, 'Goals: Delete Goal (DELETE /api/goals/:id)');

  // 7. Fitness Challenges (Requirement 9)
  const createChallengeRes = await fetch(`${BASE_URL}/challenges/admin/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      title: 'October Ultra Endurance Quest',
      description: 'Log 600 minutes of high-intensity training.',
      target_metric: 'DURATION',
      target_value: 600,
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 14 * 86400000).toISOString(),
      reward_badge: 'Titan of Endurance',
    }),
  });
  const createChallengeData: any = await createChallengeRes.json();
  const testChallengeId = createChallengeData.data?.id;
  assert(
    createChallengeRes.status === 201 &&
    createChallengeData.success &&
    testChallengeId,
    'Challenges: Admin Creates Challenge (POST /api/challenges/admin/create)'
  );

  const listChallengesRes = await fetch(`${BASE_URL}/challenges`, {
    headers: { Authorization: `Bearer ${sarahToken}` },
  });
  const listChallengesData: any = await listChallengesRes.json();
  assert(
    listChallengesRes.status === 200 &&
    listChallengesData.data.some((c: any) => c.id === testChallengeId),
    'Challenges: User Views Challenges (GET /api/challenges)'
  );

  const joinRes = await fetch(`${BASE_URL}/challenges/${testChallengeId}/join`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${sarahToken}` },
  });
  const joinData: any = await joinRes.json();
  assert(
    joinRes.status === 201 &&
    joinData.success,
    'Challenges: User Joins Challenge (POST /api/challenges/:id/join)'
  );

  const dupJoinRes = await fetch(`${BASE_URL}/challenges/${testChallengeId}/join`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${sarahToken}` },
  });
  assert(
    dupJoinRes.status === 400,
    'Challenges: Prevent Duplicate Participation (400 Bad Request on duplicate enroll)'
  );

  const updateProgressRes = await fetch(`${BASE_URL}/challenges/${testChallengeId}/progress`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sarahToken}`,
    },
    body: JSON.stringify({ current_progress: 300 }),
  });
  const updateProgressData: any = await updateProgressRes.json();
  assert(
    updateProgressRes.status === 200 &&
    updateProgressData.data.current_progress === 300,
    'Challenges: User Tracks & Updates Progress (POST /api/challenges/:id/progress)'
  );

  const historyRes = await fetch(`${BASE_URL}/challenges/my/history`, {
    headers: { Authorization: `Bearer ${sarahToken}` },
  });
  const historyData: any = await historyRes.json();
  assert(
    historyRes.status === 200 &&
    Array.isArray(historyData.data) &&
    historyData.data.some((h: any) => h.challenge_id === testChallengeId),
    'Challenges: Maintain Challenge History (GET /api/challenges/my/history)'
  );

  const monitorRes = await fetch(`${BASE_URL}/challenges/admin/${testChallengeId}/monitor`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const monitorData: any = await monitorRes.json();
  assert(
    monitorRes.status === 200 &&
    monitorData.data.totalParticipants >= 1 &&
    monitorData.data.participants.some((p: any) => p.userEmail === 'sarah@fitpulse.com'),
    'Challenges: Admin Monitors Challenge Roster & Rates (GET /api/challenges/admin/:id/monitor)'
  );

  const updateChallengeRes = await fetch(`${BASE_URL}/challenges/admin/${testChallengeId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      target_value: 750,
      reward_badge: 'Grand Titan of Endurance',
    }),
  });
  const updateChallengeData: any = await updateChallengeRes.json();
  assert(
    updateChallengeRes.status === 200 &&
    updateChallengeData.data.target_value === 750,
    'Challenges: Admin Updates Challenge (PUT /api/challenges/admin/:id)'
  );

  const deleteChallengeRes = await fetch(`${BASE_URL}/challenges/admin/${testChallengeId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(deleteChallengeRes.status === 200, 'Challenges: Admin Deletes Challenge (DELETE /api/challenges/admin/:id)');

  // ==========================================
  // 10. ADMIN USER MANAGEMENT (Requirement 10)
  // ==========================================
  // 10a. Admin lists users
  const listUsersRes = await fetch(`${BASE_URL}/admin/users`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const listUsersData: any = await listUsersRes.json();
  assert(
    listUsersRes.status === 200 &&
    listUsersData.success &&
    listUsersData.data.users.length >= 3,
    'Admin Users: Listing with directory count (GET /api/admin/users)'
  );

  // 10b. Search by query
  const searchUsersRes = await fetch(`${BASE_URL}/admin/users?search=sarah`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const searchUsersData: any = await searchUsersRes.json();
  assert(
    searchUsersRes.status === 200 &&
    searchUsersData.data.users.length >= 1 &&
    searchUsersData.data.users[0].email === 'sarah@fitpulse.com',
    'Admin Users: Search filter by name/email (GET /api/admin/users?search=sarah)'
  );

  // 10c. Filter by Role & Status
  const roleFilterRes = await fetch(`${BASE_URL}/admin/users?role=ADMIN`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const roleFilterData: any = await roleFilterRes.json();
  assert(
    roleFilterRes.status === 200 &&
    roleFilterData.data.users.every((u: any) => u.role === 'ADMIN'),
    'Admin Users: Filter by Role (GET /api/admin/users?role=ADMIN)'
  );

  // 10d. Admin creates user
  const tempEmail = `testathlete_${Date.now()}@fitpulse.com`;
  const createUserRes = await fetch(`${BASE_URL}/admin/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      name: 'Test Managed Athlete',
      email: tempEmail,
      password: 'Password123!',
      role: 'USER',
    }),
  });
  const createUserData: any = await createUserRes.json();
  const managedUserId = createUserData.data?.id;
  assert(
    createUserRes.status === 201 &&
    createUserData.success &&
    managedUserId,
    'Admin Users: Create new athlete account (POST /api/admin/users)'
  );

  // 10e. Admin edits user details
  const updateUserRes = await fetch(`${BASE_URL}/admin/users/${managedUserId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      name: 'Test Managed Athlete Updated',
    }),
  });
  const updateUserData: any = await updateUserRes.json();
  assert(
    updateUserRes.status === 200 &&
    updateUserData.data.name === 'Test Managed Athlete Updated',
    'Admin Users: Update user details (PATCH /api/admin/users/:id)'
  );

  // 10f. Admin manages role
  const updateRoleRes = await fetch(`${BASE_URL}/admin/users/${managedUserId}/role`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ role: 'ADMIN' }),
  });
  const updateRoleData: any = await updateRoleRes.json();
  assert(
    updateRoleRes.status === 200 &&
    updateRoleData.data.role === 'ADMIN',
    'Admin Users: Role management promotion/demotion (PATCH /api/admin/users/:id/role)'
  );

  // 10g. Admin toggles status (Deactivation)
  const deactivateRes = await fetch(`${BASE_URL}/admin/users/${managedUserId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ is_active: false }),
  });
  const deactivateData: any = await deactivateRes.json();
  assert(
    deactivateRes.status === 200 &&
    deactivateData.data.is_active === false &&
    deactivateData.data.status === 'Suspended',
    'Admin Users: Account deactivation/suspension (PATCH /api/admin/users/:id/status)'
  );

  // 10h. Admin self-protection (Cannot deactivate or demote own account)
  const selfDemoteRes = await fetch(`${BASE_URL}/admin/users/${adminData.data.user.id}/role`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ role: 'USER' }),
  });
  assert(
    selfDemoteRes.status === 400,
    'Admin Users: Self-protection guard blocks admin self-demotion (400 Bad Request)'
  );

  // 10i. Admin deletes user
  const deleteManagedUserRes = await fetch(`${BASE_URL}/admin/users/${managedUserId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(
    deleteManagedUserRes.status === 200,
    'Admin Users: Delete user account (DELETE /api/admin/users/:id)'
  );

  // 10j. RBAC protection: Athlete blocked from Admin user endpoints
  const athleteBlockedUsersRes = await fetch(`${BASE_URL}/admin/users`, {
    headers: { Authorization: `Bearer ${sarahToken}` },
  });
  assert(
    athleteBlockedUsersRes.status === 403,
    'Admin Users: RBAC authorization protects user management from athletes (403 Forbidden)'
  );

  // ==========================================
  // 11. FITNESS CONTENT MANAGEMENT (Requirement 11)
  // ==========================================
  // 11a. Athlete submits content (Default PENDING)
  const submitContentRes = await fetch(`${BASE_URL}/content`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sarahToken}`,
    },
    body: JSON.stringify({
      title: 'Zone 2 Heart-Rate Conditioning Protocol',
      description: 'Aerobic base building protocol maintaining 60-70% maximum heart rate for cellular mitochondrial density.',
      category: 'Guide',
    }),
  });
  const submitContentData: any = await submitContentRes.json();
  const testContentId = submitContentData.data?.id;
  assert(
    submitContentRes.status === 201 &&
    submitContentData.data.status === 'PENDING',
    'Content Management: User submits content into PENDING state (POST /api/content)'
  );

  // 11b. Public user access only gets APPROVED content
  const publicContentRes = await fetch(`${BASE_URL}/content`);
  const publicContentData: any = await publicContentRes.json();
  assert(
    publicContentRes.status === 200 &&
    publicContentData.data.every((c: any) => c.status === 'APPROVED'),
    'Content Management: Public API returns only APPROVED content (GET /api/content)'
  );

  // 11c. Athlete retrieves personal submissions (including PENDING)
  const myContentRes = await fetch(`${BASE_URL}/content/my`, {
    headers: { Authorization: `Bearer ${sarahToken}` },
  });
  const myContentData: any = await myContentRes.json();
  assert(
    myContentRes.status === 200 &&
    myContentData.data.some((c: any) => c.id === testContentId),
    'Content Management: Athlete tracks own submissions (GET /api/content/my)'
  );

  // 11d. Admin views all content (including PENDING)
  const adminAllContentRes = await fetch(`${BASE_URL}/content/admin/all`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const adminAllContentData: any = await adminAllContentRes.json();
  assert(
    adminAllContentRes.status === 200 &&
    adminAllContentData.data.some((c: any) => c.id === testContentId),
    'Content Management: Admin views all moderation content (GET /api/content/admin/all)'
  );

  // 11e. Admin approves content
  const approveContentRes = await fetch(`${BASE_URL}/content/admin/${testContentId}/moderate`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ status: 'APPROVED' }),
  });
  const approveContentData: any = await approveContentRes.json();
  assert(
    approveContentRes.status === 200 &&
    approveContentData.data.status === 'APPROVED',
    'Content Management: Admin approves content into APPROVED state (PATCH /api/content/admin/:id/moderate)'
  );

  // 11f. Admin rejects content with feedback
  const rejectContentRes = await fetch(`${BASE_URL}/content/admin/${testContentId}/moderate`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      status: 'REJECTED',
      feedback: 'Please clarify hydration pacing and include scientific citations.',
    }),
  });
  const rejectContentData: any = await rejectContentRes.json();
  assert(
    rejectContentRes.status === 200 &&
    rejectContentData.data.status === 'REJECTED' &&
    rejectContentData.data.feedback.includes('citations'),
    'Content Management: Admin rejects content into REJECTED state with feedback (PATCH /api/content/admin/:id/moderate)'
  );

  // 11g. Admin deletes content
  const deleteContentRes = await fetch(`${BASE_URL}/content/admin/${testContentId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(
    deleteContentRes.status === 200,
    'Content Management: Admin deletes content guide (DELETE /api/content/admin/:id)'
  );

  // 11h. Athlete blocked from content moderation
  const athleteBlockedModerateRes = await fetch(`${BASE_URL}/content/admin/${testContentId}/moderate`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sarahToken}`,
    },
    body: JSON.stringify({ status: 'APPROVED' }),
  });
  assert(
    athleteBlockedModerateRes.status === 403,
    'Content Management: RBAC protects moderation endpoint from athletes (403 Forbidden)'
  );

  // ==========================================
  // 12. SYSTEM SETTINGS (Requirement 12)
  // ==========================================
  // 12a. Admin retrieves settings from database
  const getSettingsRes = await fetch(`${BASE_URL}/admin/settings`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const getSettingsData: any = await getSettingsRes.json();
  assert(
    getSettingsRes.status === 200 &&
    Array.isArray(getSettingsData.data) &&
    getSettingsData.data.length >= 3,
    'System Settings: Retrieve database-persisted configuration (GET /api/admin/settings)'
  );

  // 12b. Admin updates a setting
  const updateSettingRes = await fetch(`${BASE_URL}/admin/settings/maintenance_mode`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      value: 'true',
      description: 'Platform Maintenance Mode (Active)',
    }),
  });
  const updateSettingData: any = await updateSettingRes.json();
  assert(
    updateSettingRes.status === 200 &&
    updateSettingData.data.key === 'maintenance_mode' &&
    updateSettingData.data.value === 'true',
    'System Settings: Update setting stored in database (PUT /api/admin/settings/:key)'
  );

  // 12c. Confirm persistence in database
  const verifySettingRes = await fetch(`${BASE_URL}/admin/settings`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const verifySettingData: any = await verifySettingRes.json();
  const maintSetting = verifySettingData.data.find((s: any) => s.key === 'maintenance_mode');
  assert(
    maintSetting && maintSetting.value === 'true',
    'System Settings: Verify updated setting persisted in database (GET /api/admin/settings)'
  );

  // 12d. Reset setting back to false
  await fetch(`${BASE_URL}/admin/settings/maintenance_mode`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ value: 'false' }),
  });

  // 12e. RBAC protection: Athlete blocked from settings
  const athleteBlockedSettingsRes = await fetch(`${BASE_URL}/admin/settings`, {
    headers: { Authorization: `Bearer ${sarahToken}` },
  });
  assert(
    athleteBlockedSettingsRes.status === 403,
    'System Settings: RBAC protects settings from non-admin athletes (403 Forbidden)'
  );

  // ==========================================
  // 13. ACTIVITY MONITORING (Requirement 13)
  // ==========================================
  // 13a. Admin retrieves activity logs
  const getLogsRes = await fetch(`${BASE_URL}/admin/activity-logs`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const getLogsData: any = await getLogsRes.json();
  assert(
    getLogsRes.status === 200 &&
    Array.isArray(getLogsData.data) &&
    getLogsData.data.length > 0 &&
    getLogsData.pagination.total > 0,
    'Activity Monitoring: Retrieve activity logs stream (GET /api/admin/activity-logs)'
  );

  // 13b. Action filtering
  const filterActionRes = await fetch(`${BASE_URL}/admin/activity-logs?action=LOG_WORKOUT`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const filterActionData: any = await filterActionRes.json();
  assert(
    filterActionRes.status === 200 &&
    filterActionData.data.every((l: any) => l.action === 'LOG_WORKOUT'),
    'Activity Monitoring: Filter activity by action type (GET /api/admin/activity-logs?action=LOG_WORKOUT)'
  );

  // 13c. Search filter
  const searchLogsRes = await fetch(`${BASE_URL}/admin/activity-logs?search=sarah`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const searchLogsData: any = await searchLogsRes.json();
  assert(
    searchLogsRes.status === 200 &&
    searchLogsData.data.length > 0,
    'Activity Monitoring: Search logs by keyword/actor (GET /api/admin/activity-logs?search=sarah)'
  );

  // 13d. Activity stats summary
  const actStatsRes = await fetch(`${BASE_URL}/admin/activity-stats`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const actStatsData: any = await actStatsRes.json();
  assert(
    actStatsRes.status === 200 &&
    actStatsData.data.totalLogs > 0 &&
    typeof actStatsData.data.byAction === 'object',
    'Activity Monitoring: Retrieve activity stats summary (GET /api/admin/activity-stats)'
  );

  // 13e. Athlete blocked from activity logs (RBAC)
  const athleteBlockedLogsRes = await fetch(`${BASE_URL}/admin/activity-logs`, {
    headers: { Authorization: `Bearer ${sarahToken}` },
  });
  assert(
    athleteBlockedLogsRes.status === 403,
    'Activity Monitoring: RBAC protects activity logs from athletes (403 Forbidden)'
  );

  // ==========================================
  // 14. ADMIN STATISTICS (Requirement 14)
  // ==========================================
  // 14a. Real database-driven platform statistics
  const statsRes = await fetch(`${BASE_URL}/admin/statistics`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const statsData: any = await statsRes.json();
  const st = statsData.data;
  assert(
    statsRes.status === 200 &&
    st.users.total >= 3 &&
    st.users.active >= 1 &&
    st.workouts.totalWorkouts >= 1 &&
    st.workouts.totalCalories > 0 &&
    st.workouts.byType.length > 0 &&
    st.workouts.byIntensity.length > 0 &&
    st.challenges.totalChallenges >= 1 &&
    st.content.totalContent >= 1 &&
    st.engagementTrend.length === 7,
    'Admin Statistics: Real database-driven aggregations across users, workouts, challenges, content (GET /api/admin/statistics)'
  );

  // 14b. Athlete blocked from admin statistics (RBAC)
  const athleteBlockedStatsRes = await fetch(`${BASE_URL}/admin/statistics`, {
    headers: { Authorization: `Bearer ${sarahToken}` },
  });
  assert(
    athleteBlockedStatsRes.status === 403,
    'Admin Statistics: RBAC protects platform statistics from athletes (403 Forbidden)'
  );

  // ==========================================
  // 15. CODE QUALITY & SECURITY (Requirement 15)
  // ==========================================
  // 15a. Unauthenticated request rejected with 401
  const unauthRes = await fetch(`${BASE_URL}/admin/statistics`);
  assert(
    unauthRes.status === 401,
    'Code Quality & Security: Unauthenticated request rejected (401 Unauthorized)'
  );

  // 15b. Input Validation boundary check (Negative duration)
  const invalidWorkoutRes = await fetch(`${BASE_URL}/workouts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sarahToken}`,
    },
    body: JSON.stringify({
      type: 'Running',
      duration_minutes: -15,
      intensity: 'HIGH',
      calories_burned: 150,
    }),
  });
  assert(invalidWorkoutRes.status === 400, 'Input Validation: Rejection of negative duration (400 Bad Request)');

  // 15c. Admin Dashboard KPIs & Telemetry
  const adminDashRes = await fetch(`${BASE_URL}/admin/dashboard`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const adminDashData: any = await adminDashRes.json();
  assert(
    adminDashRes.status === 200 &&
    adminDashData.data.kpis.totalUsers >= 3 &&
    adminDashData.data.recentActivity.length > 0,
    'Admin Dashboard Telemetry (GET /api/admin/dashboard)'
  );

  // 15d. Cleanup test workout
  if (newWorkoutId) {
    const deleteWorkoutRes = await fetch(`${BASE_URL}/workouts/${newWorkoutId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${sarahToken}` },
    });
    assert(deleteWorkoutRes.status === 200, 'Workout Cleanup (DELETE /api/workouts/:id)');
  }

  // ========================================================
  // 16. COMPREHENSIVE FAILURE & EDGE CASE TESTS (Requirement 16)
  // ========================================================
  console.log('\n  -- Negative & Edge Case Assertions (Requirement 16) --');

  // 16a. Auth: Bad Password Login Rejection
  const badPassRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'sarah@fitpulse.com', password: 'WrongPassword999!' }),
  });
  assert(badPassRes.status === 401, 'Auth Negative: Incorrect password rejected (401 Unauthorized)');

  // 16b. Auth: Unknown User Login Rejection
  const unknownUserRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'ghost_user_9999@fitpulse.com', password: 'AnyPassword123!' }),
  });
  assert(unknownUserRes.status === 401, 'Auth Negative: Unknown user email rejected (401 Unauthorized)');

  // 16c. Auth: Duplicate User Registration Rejection
  const dupRegisterRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Duplicate Sarah',
      email: 'sarah@fitpulse.com',
      password: 'User123!',
    }),
  });
  assert(dupRegisterRes.status === 409, 'Auth Negative: Duplicate email registration rejected (409 Conflict)');

  // 16d. Authorization: Unauthenticated Protected Endpoints
  const unauthWorkoutsRes = await fetch(`${BASE_URL}/workouts`);
  assert(unauthWorkoutsRes.status === 401, 'RBAC Negative: Unauthenticated /workouts rejected (401 Unauthorized)');

  const unauthGoalsRes = await fetch(`${BASE_URL}/goals`);
  assert(unauthGoalsRes.status === 401, 'RBAC Negative: Unauthenticated /goals rejected (401 Unauthorized)');

  const unauthAnalyticsRes = await fetch(`${BASE_URL}/workouts/analytics`);
  assert(unauthAnalyticsRes.status === 401, 'RBAC Negative: Unauthenticated /workouts/analytics rejected (401 Unauthorized)');

  // 16e. Authorization: Athlete Blocked from Admin Challenge Creation
  const athleteCreateChallengeRes = await fetch(`${BASE_URL}/challenges/admin/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sarahToken}`,
    },
    body: JSON.stringify({
      title: 'Hacked Athlete Challenge',
      target_metric: 'DURATION',
      target_value: 100,
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 86400000).toISOString(),
    }),
  });
  assert(athleteCreateChallengeRes.status === 403, 'RBAC Negative: Athlete blocked from admin challenge creation (403 Forbidden)');

  // 16f. Authorization: Athlete Blocked from Admin Content Moderation List
  const athleteContentAdminRes = await fetch(`${BASE_URL}/content/admin/all`, {
    headers: { Authorization: `Bearer ${sarahToken}` },
  });
  assert(athleteContentAdminRes.status === 403, 'RBAC Negative: Athlete blocked from admin content inspection (403 Forbidden)');

  // 16g. Workout CRUD: Update Non-existent Workout Rejection
  const badWorkoutUpdateRes = await fetch(`${BASE_URL}/workouts/a0000000-0000-0000-0000-000000000000`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sarahToken}`,
    },
    body: JSON.stringify({ duration_minutes: 60 }),
  });
  assert(badWorkoutUpdateRes.status === 404, 'Workout CRUD Negative: Non-existent workout update rejected (404 Not Found)');

  // 16h. Workout CRUD: Delete Non-existent Workout Rejection
  const badWorkoutDeleteRes = await fetch(`${BASE_URL}/workouts/non-existent-wkt-id-9999`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${sarahToken}` },
  });
  assert(badWorkoutDeleteRes.status === 404, 'Workout CRUD Negative: Non-existent workout delete rejected (404 Not Found)');

  // 16i. Goals CRUD: Update Non-existent Goal Rejection
  const badGoalUpdateRes = await fetch(`${BASE_URL}/goals/non-existent-goal-id-9999`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sarahToken}`,
    },
    body: JSON.stringify({ targetValue: 5000 }),
  });
  assert(badGoalUpdateRes.status === 404, 'Goal CRUD Negative: Non-existent goal update rejected (404 Not Found)');

  // 16j. Goals CRUD: Delete Non-existent Goal Rejection
  const badGoalDeleteRes = await fetch(`${BASE_URL}/goals/non-existent-goal-id-9999`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${sarahToken}` },
  });
  assert(badGoalDeleteRes.status === 404, 'Goal CRUD Negative: Non-existent goal delete rejected (404 Not Found)');

  // 16k. Goals CRUD: Create Goal Missing Mandatory Title/Target
  const invalidGoalPayloadRes = await fetch(`${BASE_URL}/goals`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sarahToken}`,
    },
    body: JSON.stringify({ description: 'No title or target provided' }),
  });
  assert(invalidGoalPayloadRes.status === 400, 'Goal CRUD Negative: Goal missing title/target rejected (400 Bad Request)');

  // 16l. Challenges: Join Non-existent Challenge Rejection
  const badChallengeJoinRes = await fetch(`${BASE_URL}/challenges/non-existent-chal-9999/join`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${sarahToken}` },
  });
  assert(badChallengeJoinRes.status === 404, 'Challenge Negative: Joining non-existent challenge rejected (404 Not Found)');

  // 16m. Challenges: Admin Update Non-existent Challenge Rejection
  const badChallengeUpdateRes = await fetch(`${BASE_URL}/challenges/admin/non-existent-chal-9999`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ title: 'Ghost Quest' }),
  });
  assert(badChallengeUpdateRes.status === 404, 'Challenge Negative: Updating non-existent challenge rejected (404 Not Found)');

  // 16n. Challenges: Admin Delete Non-existent Challenge Rejection
  const badChallengeDeleteRes = await fetch(`${BASE_URL}/challenges/admin/non-existent-chal-9999`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(badChallengeDeleteRes.status === 404, 'Challenge Negative: Deleting non-existent challenge rejected (404 Not Found)');

  // 16o. Admin User CRUD: Update Non-existent User Rejection
  const badUserUpdateRes = await fetch(`${BASE_URL}/admin/users/non-existent-user-9999`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ name: 'Ghost Athlete' }),
  });
  assert(badUserUpdateRes.status === 404, 'Admin User CRUD Negative: Non-existent user update rejected (404 Not Found)');

  // 16p. Admin User CRUD: Delete Non-existent User Rejection
  const badUserDeleteRes = await fetch(`${BASE_URL}/admin/users/non-existent-user-9999`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(badUserDeleteRes.status === 404, 'Admin User CRUD Negative: Non-existent user delete rejected (404 Not Found)');

  // 16q. Admin Operations: Admin Self-Deletion Guard
  const adminProfileRes = await fetch(`${BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const adminProfile = (await adminProfileRes.json()).data;
  const selfDeleteRes = await fetch(`${BASE_URL}/admin/users/${adminProfile.id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(selfDeleteRes.status === 400, 'Admin Negative: Admin self-deletion guard blocks deletion (400 Bad Request)');

  // 16r. Admin Content: Moderate Non-existent Content Rejection
  const badContentModerateRes = await fetch(`${BASE_URL}/content/admin/non-existent-content-9999/moderate`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ status: 'APPROVED' }),
  });
  assert(badContentModerateRes.status === 404, 'Admin Content Negative: Moderating non-existent content rejected (404 Not Found)');

  // 16s. Auth Header: Bearer undefined rejection (401 Unauthorized)
  const bearerUndefinedRes = await fetch(`${BASE_URL}/auth/me`, {
    headers: { Authorization: 'Bearer undefined' },
  });
  const bearerUndefinedData: any = await bearerUndefinedRes.json();
  assert(
    bearerUndefinedRes.status === 401 && bearerUndefinedData.message === 'Token is undefined or null. Please log in again.',
    'Auth Extraction: "Bearer undefined" normalized and rejected (401)'
  );

  // 16t. Auth Header: Bearer null rejection (401 Unauthorized)
  const bearerNullRes = await fetch(`${BASE_URL}/auth/me`, {
    headers: { Authorization: 'Bearer null' },
  });
  const bearerNullData: any = await bearerNullRes.json();
  assert(
    bearerNullRes.status === 401 && bearerNullData.message === 'Token is undefined or null. Please log in again.',
    'Auth Extraction: "Bearer null" normalized and rejected (401)'
  );

  // 16u. Auth Header: Non-Bearer format rejection (401 Unauthorized)
  const nonBearerRes = await fetch(`${BASE_URL}/auth/me`, {
    headers: { Authorization: 'Token abc123xyz' },
  });
  const nonBearerData: any = await nonBearerRes.json();
  assert(
    nonBearerRes.status === 401 && nonBearerData.message === 'Authentication token missing or invalid format.',
    'Auth Extraction: Invalid auth header format rejected (401)'
  );

  // 16v. Auth Header: Malformed JWT token rejection (401 Unauthorized)
  const malformedJwtRes = await fetch(`${BASE_URL}/auth/me`, {
    headers: { Authorization: 'Bearer invalid.token.payload' },
  });
  const malformedJwtData: any = await malformedJwtRes.json();
  assert(
    malformedJwtRes.status === 401 && malformedJwtData.message === 'Invalid, malformed, or expired token. Authentication failed.',
    'Auth Extraction: Malformed/tampered JWT rejected (401)'
  );

  // 16w. Auth Profile: Authenticated PATCH /api/auth/profile updates profile settings
  const updateProfileRes = await fetch(`${BASE_URL}/auth/profile`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sarahToken}`,
    },
    body: JSON.stringify({ name: 'Sarah Connor (Verified Elite)' }),
  });
  const updateProfileData: any = await updateProfileRes.json();
  assert(
    updateProfileRes.status === 200 && updateProfileData.success && updateProfileData.data.name === 'Sarah Connor (Verified Elite)',
    'Athlete Profile: Update settings with valid JWT (PATCH /api/auth/profile)'
  );

  console.log(`\n===============================================`);
  console.log(`📊 Verification Summary: ${passed} Passed, ${failed} Failed`);
  console.log(`===============================================`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
