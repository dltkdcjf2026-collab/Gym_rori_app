(function (root) {
  'use strict';

  // 경험 수준별 주당 운동일수와 활동계수 (Harris-Benedict 활동계수 관례값)
  var ACTIVITY = {
    beginner: { days: 3, factor: 1.375 },
    intermediate: { days: 4, factor: 1.55 },
    advanced: { days: 5, factor: 1.725 }
  };

  function round(n, digits) {
    var p = Math.pow(10, digits || 0);
    return Math.round(n * p) / p;
  }

  function bmiRaw(weightKg, heightCm) {
    var m = heightCm / 100;
    return weightKg / (m * m);
  }

  // 대한비만학회 기준
  function bmiCategory(bmi) {
    if (bmi < 18.5) return '저체중';
    if (bmi < 23) return '정상';
    if (bmi < 25) return '과체중';
    return '비만';
  }

  // Mifflin-St Jeor
  function bmrRaw(sex, weightKg, heightCm, age) {
    var base = 10 * weightKg + 6.25 * heightCm - 5 * age;
    return sex === 'male' ? base + 5 : base - 161;
  }

  function compute(values) {
    var act = ACTIVITY[values.level];
    var bmi = bmiRaw(values.weightKg, values.heightCm);
    var bmr = bmrRaw(values.sex, values.weightKg, values.heightCm, values.age);
    var targetBmi = bmiRaw(values.targetWeightKg, values.heightCm);
    return {
      bmi: round(bmi, 1),
      bmiCategory: bmiCategory(round(bmi, 1)),
      targetBmi: round(targetBmi, 1),
      targetBmiCategory: bmiCategory(round(targetBmi, 1)),
      bmr: round(bmr),
      activityFactor: act.factor,
      trainingDays: act.days,
      tdee: round(bmr * act.factor)
    };
  }

  root.Fit = root.Fit || {};
  root.Fit.metrics = { compute: compute, bmiCategory: bmiCategory, ACTIVITY: ACTIVITY };
})(typeof window !== 'undefined' ? window : globalThis);
