(function (root) {
  'use strict';

  var FLOOR_KCAL = { male: 1500, female: 1200 };
  var PROTEIN_PER_KG = { lose: 2.0, gain: 1.8, maintain: 1.6 };
  var PROTEIN_MAX_RATIO = 0.35;
  var FAT_RATIO = 0.25;

  function round(n, digits) { var p = Math.pow(10, digits || 0); return Math.round(n * p) / p; }

  function macros(calories, refWeightKg, goalType, age) {
    var perKg = PROTEIN_PER_KG[goalType] + (age >= 50 ? 0.2 : 0);
    var proteinKcal = Math.min(perKg * refWeightKg * 4, calories * PROTEIN_MAX_RATIO);
    var fatKcal = calories * FAT_RATIO;
    var carbKcal = Math.max(calories - proteinKcal - fatKcal, 0);
    return {
      proteinG: Math.round(proteinKcal / 4),
      fatG: Math.round(fatKcal / 9),
      carbG: Math.round(carbKcal / 4)
    };
  }

  var TIPS = {
    lose: [
      '매 끼니 손바닥 크기의 단백질(닭가슴살, 생선, 두부, 달걀)을 포함하세요.',
      '채소를 접시의 절반으로 채우면 포만감을 유지하면서 칼로리를 줄일 수 있습니다.',
      '음료(주스, 탄산, 술)의 칼로리를 먼저 줄이세요.',
      '체중은 매일 재서 주간 평균으로 판단하세요. 하루 변동은 수분 때문입니다.',
      '하루 7시간 이상 자야 감량 중 근손실과 폭식 욕구를 줄일 수 있습니다.'
    ],
    gain: [
      '하루 4끼(또는 간식 포함)로 나누어 칼로리를 채우세요.',
      '운동 후 1~2시간 안에 단백질과 탄수화물을 함께 드세요.',
      '현미, 고구마, 오트밀 같은 복합 탄수화물을 중심으로 하세요.',
      '체중은 주 0.2~0.5kg씩 늘어나는 것이 적당합니다. 더 빠르면 지방 비율이 높아집니다.'
    ],
    maintain: [
      '현재 체중이 유지되는 칼로리 범위에서 단백질을 충분히 드세요.',
      '주 1회 체중 평균을 확인하고 ±1kg를 넘으면 식사량을 조절하세요.',
      '가공식품보다 원재료 중심 식사를 하세요.'
    ]
  };

  function plan(values, metrics, goal) {
    var floor = FLOOR_KCAL[values.sex];
    var raw = metrics.tdee + goal.dailyKcalDelta;
    var target = Math.round(raw / 10) * 10;
    var floored = false;
    if (goal.type === 'lose' && target < floor) {
      target = floor;
      floored = true;
    }
    var delta = target - metrics.tdee;
    var weeks = goal.weeks;
    if (floored) {
      var absDiff = Math.abs(goal.diffKg);
      weeks = delta < 0 ? Math.ceil(round(absDiff * 7700 / (Math.abs(delta) * 7), 6)) : 0;
    }
    var refWeight = values.targetWeightKg;
    return {
      calories: target,
      dailyKcalDelta: delta,
      floored: floored,
      floorKcal: floor,
      weeks: weeks,
      macros: macros(target, refWeight, goal.type, values.age),
      waterL: round(values.weightKg * 0.035, 1),
      meals: goal.type === 'gain' ? 4 : 3,
      tips: TIPS[goal.type].slice()
    };
  }

  root.Fit = root.Fit || {};
  root.Fit.nutrition = { plan: plan, macros: macros, FLOOR_KCAL: FLOOR_KCAL };
})(typeof window !== 'undefined' ? window : globalThis);
