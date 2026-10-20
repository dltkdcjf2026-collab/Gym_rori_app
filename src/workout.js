(function (root) {
  'use strict';

  var EX = root.Fit.exercises.byId;

  // c = 복합(compound) 운동, a = 보조(accessory) 운동
  var TEMPLATES = {
    beginner: {
      split: '전신 운동 (주 3일)',
      weekdays: ['월', '수', '금'],
      days: [
        { label: 'DAY 1 · 전신 A', slots: [['leg_press', 'c'], ['chest_press_machine', 'c'], ['lat_pulldown', 'c'], ['lateral_raise', 'a'], ['plank', 'a']] },
        { label: 'DAY 2 · 전신 B', slots: [['goblet_squat', 'c'], ['seated_row', 'c'], ['pushup', 'c'], ['rdl', 'a'], ['dead_bug', 'a']] },
        { label: 'DAY 3 · 전신 C', slots: [['hip_thrust', 'c'], ['db_shoulder_press', 'c'], ['lat_pulldown', 'a'], ['leg_curl', 'a'], ['bird_dog', 'a']] }
      ]
    },
    intermediate: {
      split: '상체/하체 분할 (주 4일)',
      weekdays: ['월', '화', '목', '금'],
      days: [
        { label: 'DAY 1 · 상체 A', slots: [['bench_press', 'c'], ['seated_row', 'c'], ['db_shoulder_press', 'c'], ['lat_pulldown', 'a'], ['triceps_pushdown', 'a'], ['db_curl', 'a']] },
        { label: 'DAY 2 · 하체 A', slots: [['barbell_squat', 'c'], ['rdl', 'c'], ['leg_press', 'a'], ['leg_curl', 'a'], ['calf_raise', 'a'], ['plank', 'a']] },
        { label: 'DAY 3 · 상체 B', slots: [['incline_db_press', 'c'], ['one_arm_row', 'c'], ['lateral_raise', 'a'], ['face_pull', 'a'], ['hammer_curl', 'a'], ['overhead_triceps', 'a']] },
        { label: 'DAY 4 · 하체 B', slots: [['leg_press', 'c'], ['hip_thrust', 'c'], ['lunge', 'a'], ['leg_extension', 'a'], ['calf_raise', 'a'], ['cable_crunch', 'a']] }
      ]
    },
    advanced: {
      split: '부위별 분할 (주 5일)',
      weekdays: ['월', '화', '수', '금', '토'],
      days: [
        { label: 'DAY 1 · 가슴/삼두', slots: [['bench_press', 'c'], ['incline_db_press', 'c'], ['cable_fly', 'a'], ['triceps_pushdown', 'a'], ['overhead_triceps', 'a']] },
        { label: 'DAY 2 · 등/이두', slots: [['pullup', 'c'], ['one_arm_row', 'c'], ['seated_row', 'a'], ['face_pull', 'a'], ['db_curl', 'a'], ['hammer_curl', 'a']] },
        { label: 'DAY 3 · 하체', slots: [['barbell_squat', 'c'], ['rdl', 'c'], ['leg_press', 'a'], ['leg_curl', 'a'], ['calf_raise', 'a']] },
        { label: 'DAY 4 · 어깨/코어', slots: [['db_shoulder_press', 'c'], ['lateral_raise', 'a'], ['rear_delt_fly', 'a'], ['hanging_leg_raise', 'a'], ['cable_crunch', 'a']] },
        { label: 'DAY 5 · 하체 B/둔근', slots: [['hip_thrust', 'c'], ['lunge', 'c'], ['leg_extension', 'a'], ['leg_curl', 'a'], ['plank', 'a']] }
      ]
    }
  };

  var SETS = { beginner: { c: 3, a: 2 }, intermediate: { c: 4, a: 3 }, advanced: { c: 4, a: 3 } };

  function repsFor(type, goalType, level, senior) {
    if (senior) return type === 'c' ? '10-12' : '12-15';
    if (type === 'c') {
      if (level === 'beginner') return '10-12';
      return goalType === 'gain' ? '6-10' : '8-12';
    }
    return goalType === 'gain' ? '10-12' : '12-15';
  }

  function buildDay(def, ctx) {
    var used = {};
    var exercises = [];
    def.slots.forEach(function (slot) {
      var ex = EX[slot[0]];
      if (ctx.senior && ex.skill === 'high' && ex.alt) ex = EX[ex.alt];
      if (used[ex.id]) return; // 대체 후 같은 운동이 겹치면 건너뛴다
      used[ex.id] = true;
      var type = slot[1];
      exercises.push({
        id: ex.id,
        name: ex.name,
        sets: SETS[ctx.level][type],
        reps: ex.timed ? '30-45초' : repsFor(type, ctx.goalType, ctx.level, ctx.senior),
        restSec: (type === 'c' ? 90 : 60) + (ctx.senior ? 30 : 0)
      });
    });
    return { label: def.label, exercises: exercises };
  }

  function cardioPlan(values, goalType, senior) {
    var gentle = ['경사 걷기', '실내 사이클'];
    var normal = ['경사 걷기', '실내 사이클', '조깅', '로잉 머신'];
    var base = {
      lose: { sessions: 3, minutes: values.level === 'beginner' ? 20 : 30 },
      maintain: { sessions: 2, minutes: 20 },
      gain: { sessions: 1, minutes: 20 }
    }[goalType];
    return {
      sessionsPerWeek: base.sessions,
      minutes: base.minutes,
      activities: senior ? gentle : normal,
      intensity: '대화가 가능한 정도(최대 심박의 60~70%)',
      note: '근력 운동이 없는 날이나 근력 운동 후에 하세요.'
    };
  }

  function plan(values, goal) {
    var tpl = TEMPLATES[values.level];
    var senior = values.age >= 50;
    var ctx = { level: values.level, goalType: goal.type, senior: senior };

    var notes = [
      '각 운동 전 5~10분 가벼운 유산소와 해당 부위 워밍업 세트를 하세요.',
      '마지막 세트에서 2회 정도 더 할 수 있는 무게를 고르세요. 모든 세트를 목표 반복수로 해내면 다음에 2.5~5% 올리세요.',
      '4~6주마다 한 주는 무게와 세트를 절반으로 줄여 회복하세요.',
      '통증(근육통이 아닌 관절·찌르는 통증)이 있으면 즉시 중단하세요.'
    ];
    if (values.age >= 40) notes.unshift('워밍업을 10분 이상 하고 관절 가동 운동(어깨·고관절 돌리기)을 포함하세요.');
    if (senior) notes.push('50세 이상 권장: 고난도·고충격 운동은 머신이나 저충격 운동으로 바꿔 구성했고, 세트 간 휴식을 30초 더 두었습니다.');
    if (values.age >= 65) notes.push('65세 이상은 균형 운동(한 발 서기)을 매일 1~2분 더하고, 낙상에 주의하세요.');
    if (goal.type === 'lose') notes.push('감량 중에는 근육을 지키기 위해 근력 운동 강도를 낮추지 말고 유산소를 더하세요.');
    if (goal.type === 'gain') notes.push('증량 중에는 유산소를 줄이고 복합 운동의 무게를 점진적으로 늘리세요.');

    return {
      level: values.level,
      daysPerWeek: tpl.days.length,
      split: tpl.split,
      weekdays: tpl.weekdays.slice(),
      days: tpl.days.map(function (d) { return buildDay(d, ctx); }),
      cardio: cardioPlan(values, goal.type, senior),
      notes: notes
    };
  }

  root.Fit = root.Fit || {};
  root.Fit.workout = { plan: plan, TEMPLATES: TEMPLATES };
})(typeof window !== 'undefined' ? window : globalThis);
