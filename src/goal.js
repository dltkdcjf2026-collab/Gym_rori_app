(function (root) {
  'use strict';

  var KCAL_PER_KG = 7700;
  var MAINTAIN_BAND_KG = 0.5;

  function clamp(n, lo, hi) { return Math.min(hi, Math.max(lo, n)); }
  function round(n, digits) { var p = Math.pow(10, digits); return Math.round(n * p) / p; }

  function analyze(values, metrics) {
    var diff = round(values.targetWeightKg - values.weightKg, 1);
    var absDiff = Math.abs(diff);
    var type = absDiff < MAINTAIN_BAND_KG ? 'maintain' : (diff < 0 ? 'lose' : 'gain');

    var weeklyRateKg = 0;
    if (type === 'lose') weeklyRateKg = clamp(values.weightKg * 0.0075, 0.25, 0.75);
    if (type === 'gain') weeklyRateKg = clamp(values.weightKg * 0.003, 0.2, 0.5);
    weeklyRateKg = round(weeklyRateKg, 2);

    var weeks = type === 'maintain' ? 0 : Math.ceil(round(absDiff / weeklyRateKg, 6));
    var dailyKcalDelta = Math.round(weeklyRateKg * KCAL_PER_KG / 7);
    if (type === 'lose') dailyKcalDelta = -dailyKcalDelta;
    if (type === 'maintain') dailyKcalDelta = 0;

    var maxSafeWeeklyKg = round(Math.min(values.weightKg * 0.01, 1), 2);

    var warnings = [];
    if (metrics.targetBmi < 18.5) {
      warnings.push({ code: 'target_underweight', message: '목표 체중이 저체중 범위(BMI 18.5 미만)입니다. 건강을 위해 목표를 다시 검토해 보세요.' });
    }
    if (type === 'lose' && metrics.bmi < 18.5) {
      warnings.push({ code: 'losing_while_underweight', message: '현재 이미 저체중입니다. 체중 감량은 권장하지 않으며 전문가 상담이 필요합니다.' });
    }
    if (type === 'gain' && metrics.targetBmi >= 25) {
      warnings.push({ code: 'gain_overweight', message: '목표 체중이 과체중/비만 범위입니다. 체중 대신 근육량 증가를 목표로 하는 것이 좋습니다.' });
    }
    if (absDiff > values.weightKg * 0.2) {
      warnings.push({ code: 'large_goal', message: '목표 변화량이 큽니다(현재 체중의 20% 초과). 3개월 단위의 중간 목표로 나누어 진행하세요.' });
    }
    if (values.age >= 65) {
      warnings.push({ code: 'senior', message: '65세 이상은 운동·식단을 시작하기 전에 의사와 상담하세요. 근감소 예방을 위해 급격한 감량은 피해야 합니다.' });
    }

    return {
      type: type,
      diffKg: diff,
      weeklyRateKg: weeklyRateKg,
      weeks: weeks,
      dailyKcalDelta: dailyKcalDelta,
      maxSafeWeeklyKg: maxSafeWeeklyKg,
      milestoneKg: type === 'maintain' ? 0 : round(Math.min(absDiff, weeklyRateKg * 12), 1),
      warnings: warnings
    };
  }

  root.Fit = root.Fit || {};
  root.Fit.goal = { analyze: analyze, KCAL_PER_KG: KCAL_PER_KG };
})(typeof window !== 'undefined' ? window : globalThis);
