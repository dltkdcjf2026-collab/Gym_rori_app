(function () {
  'use strict';
  var test = T.test, eq = T.assertEqual;
  var m = Fit.metrics;

  function vals(over) {
    var base = { age: 30, sex: 'male', heightCm: 175, weightKg: 80, targetWeightKg: 72, level: 'beginner' };
    for (var k in over) base[k] = over[k];
    return base;
  }

  test('metrics: 남성 30세 175cm 80kg → BMI 26.1 / BMR 1749', function () {
    var r = m.compute(vals());
    eq(r.bmi, 26.1);
    eq(r.bmr, 1749);
  });

  test('metrics: 초급 TDEE = BMR*1.375 (2405), 주 3일', function () {
    var r = m.compute(vals());
    eq(r.activityFactor, 1.375);
    eq(r.trainingDays, 3);
    eq(r.tdee, 2405);
  });

  test('metrics: 중급 TDEE 계수 1.55 / 주 4일', function () {
    var r = m.compute(vals({ level: 'intermediate' }));
    eq(r.activityFactor, 1.55);
    eq(r.trainingDays, 4);
    eq(r.tdee, 2711);
  });

  test('metrics: 고급 TDEE 계수 1.725 / 주 5일', function () {
    var r = m.compute(vals({ level: 'advanced' }));
    eq(r.activityFactor, 1.725);
    eq(r.trainingDays, 5);
    eq(r.tdee, 3017);
  });

  test('metrics: 여성 25세 160cm 50kg → BMI 19.5 정상 / BMR 1214', function () {
    var r = m.compute(vals({ sex: 'female', age: 25, heightCm: 160, weightKg: 50, targetWeightKg: 50 }));
    eq(r.bmi, 19.5);
    eq(r.bmiCategory, '정상');
    eq(r.bmr, 1214);
  });

  test('metrics: 성별 차이는 BMR에서 166 (남 +5, 여 -161)', function () {
    var a = m.compute(vals({ sex: 'male' })).bmr;
    var b = m.compute(vals({ sex: 'female' })).bmr;
    eq(a - b, 166);
  });

  test('metrics: BMI 분류 경계값', function () {
    eq(m.bmiCategory(18.4), '저체중');
    eq(m.bmiCategory(18.5), '정상');
    eq(m.bmiCategory(22.9), '정상');
    eq(m.bmiCategory(23), '과체중');
    eq(m.bmiCategory(24.9), '과체중');
    eq(m.bmiCategory(25), '비만');
  });

  test('metrics: 목표 체중의 BMI/분류도 계산', function () {
    var r = m.compute(vals({ targetWeightKg: 55 }));
    eq(r.targetBmi, 18);
    eq(r.targetBmiCategory, '저체중');
  });

  test('metrics: 나이가 많을수록 BMR 감소 (나이 1세당 5kcal)', function () {
    var a = m.compute(vals({ age: 30 })).bmr;
    var b = m.compute(vals({ age: 40 })).bmr;
    eq(a - b, 50);
  });
})();
