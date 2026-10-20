(function (root) {
  'use strict';

  var LIMITS = {
    age: { min: 18, max: 80 },
    heightCm: { min: 120, max: 230 },
    weightKg: { min: 30, max: 300 },
    targetWeightKg: { min: 30, max: 300 }
  };
  var SEXES = ['male', 'female'];
  var LEVELS = ['beginner', 'intermediate', 'advanced'];

  function toNumber(raw) {
    if (raw === null || raw === undefined) return NaN;
    var s = String(raw).trim();
    if (s === '') return NaN;
    return Number(s);
  }

  function checkRange(name, label, raw, errors, values, integerOnly) {
    var n = toNumber(raw);
    var lim = LIMITS[name];
    if (isNaN(n) || !isFinite(n)) {
      errors[name] = label + ': 숫자로 입력해 주세요.';
    } else if (integerOnly && Math.floor(n) !== n) {
      errors[name] = label + ': 정수로 입력해 주세요.';
    } else if (n < lim.min || n > lim.max) {
      errors[name] = label + ': ' + lim.min + '~' + lim.max + ' 사이로 입력해 주세요.';
    } else {
      values[name] = n;
    }
  }

  function validate(input) {
    input = input || {};
    var errors = {};
    var values = {};

    checkRange('age', '나이', input.age, errors, values, true);
    checkRange('heightCm', '키(cm)', input.heightCm, errors, values, false);
    checkRange('weightKg', '현재 체중(kg)', input.weightKg, errors, values, false);
    checkRange('targetWeightKg', '목표 체중(kg)', input.targetWeightKg, errors, values, false);

    if (SEXES.indexOf(input.sex) === -1) {
      errors.sex = '성별을 선택해 주세요.';
    } else {
      values.sex = input.sex;
    }
    if (LEVELS.indexOf(input.level) === -1) {
      errors.level = '운동 경험 수준을 선택해 주세요.';
    } else {
      values.level = input.level;
    }

    return { ok: Object.keys(errors).length === 0, errors: errors, values: values };
  }

  var api = { validate: validate, LIMITS: LIMITS, SEXES: SEXES, LEVELS: LEVELS };
  root.Fit = root.Fit || {};
  root.Fit.validate = api;
})(typeof window !== 'undefined' ? window : globalThis);
