(function () {
  'use strict';
  var test = T.test, eq = T.assertEqual, ok = T.assertTrue;
  var v = Fit.validate.validate;

  function valid(over) {
    var base = { age: '30', sex: 'male', heightCm: '175', weightKg: '80', targetWeightKg: '72', level: 'beginner' };
    for (var k in over) base[k] = over[k];
    return base;
  }

  test('validate: 정상 입력은 ok이고 숫자로 변환된다', function () {
    var r = v(valid());
    eq(r.ok, true);
    eq(r.values.age, 30);
    eq(r.values.heightCm, 175);
    eq(r.values.targetWeightKg, 72);
  });

  test('validate: 소수 체중(72.5) 허용', function () {
    eq(v(valid({ weightKg: '72.5' })).ok, true);
  });

  test('validate: 빈 값은 필드별 오류', function () {
    var r = v({});
    eq(r.ok, false);
    ['age', 'sex', 'heightCm', 'weightKg', 'targetWeightKg', 'level'].forEach(function (f) {
      ok(r.errors[f], f + ' 오류가 있어야 함');
    });
  });

  test('validate: 공백 문자열은 오류', function () {
    eq(v(valid({ age: '  ' })).errors.age !== undefined, true);
  });

  test('validate: 문자열 숫자가 아니면 오류', function () {
    eq(v(valid({ weightKg: 'abc' })).errors.weightKg !== undefined, true);
  });

  test('validate: 나이 경계값 17 오류 / 18 허용 / 80 허용 / 81 오류', function () {
    eq(v(valid({ age: '17' })).errors.age !== undefined, true);
    eq(v(valid({ age: '18' })).ok, true);
    eq(v(valid({ age: '80' })).ok, true);
    eq(v(valid({ age: '81' })).errors.age !== undefined, true);
  });

  test('validate: 나이는 정수만', function () {
    eq(v(valid({ age: '30.5' })).errors.age !== undefined, true);
  });

  test('validate: 키 경계값 119 오류 / 120 허용 / 230 허용 / 231 오류', function () {
    eq(v(valid({ heightCm: '119' })).errors.heightCm !== undefined, true);
    eq(v(valid({ heightCm: '120' })).ok, true);
    eq(v(valid({ heightCm: '230' })).ok, true);
    eq(v(valid({ heightCm: '231' })).errors.heightCm !== undefined, true);
  });

  test('validate: 체중/목표체중 경계값 29 오류 / 30 허용 / 300 허용 / 301 오류', function () {
    eq(v(valid({ weightKg: '29' })).errors.weightKg !== undefined, true);
    eq(v(valid({ weightKg: '30', targetWeightKg: '30' })).ok, true);
    eq(v(valid({ weightKg: '300', targetWeightKg: '300' })).ok, true);
    eq(v(valid({ targetWeightKg: '301' })).errors.targetWeightKg !== undefined, true);
  });

  test('validate: 목표 체중이 현재 체중과 같아도 유효(유지 목표)', function () {
    eq(v(valid({ weightKg: '70', targetWeightKg: '70' })).ok, true);
  });

  test('validate: 허용되지 않은 성별/수준 값은 오류', function () {
    eq(v(valid({ sex: 'other' })).errors.sex !== undefined, true);
    eq(v(valid({ level: 'expert' })).errors.level !== undefined, true);
  });

  test('validate: Infinity/NaN 문자열 거부', function () {
    eq(v(valid({ weightKg: 'Infinity' })).errors.weightKg !== undefined, true);
    eq(v(valid({ weightKg: 'NaN' })).errors.weightKg !== undefined, true);
  });

  test('validate: 오류가 있으면 해당 필드는 values에 없다', function () {
    var r = v(valid({ age: '5' }));
    eq(r.values.age, undefined);
  });

  test('validate: null/undefined 입력에도 예외 없이 동작', function () {
    eq(v(null).ok, false);
    eq(v(undefined).ok, false);
  });
})();
