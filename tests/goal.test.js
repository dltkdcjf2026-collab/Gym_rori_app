(function () {
  'use strict';
  var test = T.test, eq = T.assertEqual, ok = T.assertTrue;

  function run(over) {
    var v = { age: 30, sex: 'male', heightCm: 175, weightKg: 80, targetWeightKg: 72, level: 'beginner' };
    for (var k in over) v[k] = over[k];
    return Fit.goal.analyze(v, Fit.metrics.compute(v));
  }
  function codes(g) { return g.warnings.map(function (w) { return w.code; }); }

  test('goal: 80→72kg는 감량, 주 0.6kg, 14주, 하루 -660kcal', function () {
    var g = run();
    eq(g.type, 'lose');
    eq(g.diffKg, -8);
    eq(g.weeklyRateKg, 0.6);
    eq(g.weeks, 14);
    eq(g.dailyKcalDelta, -660);
  });

  test('goal: 60→65kg는 증량, 주 0.2kg, 25주, 하루 +220kcal', function () {
    var g = run({ weightKg: 60, targetWeightKg: 65 });
    eq(g.type, 'gain');
    eq(g.weeklyRateKg, 0.2);
    eq(g.weeks, 25);
    eq(g.dailyKcalDelta, 220);
  });

  test('goal: 차이가 0.5kg 미만이면 유지', function () {
    var g = run({ weightKg: 70, targetWeightKg: 70.4 });
    eq(g.type, 'maintain');
    eq(g.weeks, 0);
    eq(g.dailyKcalDelta, 0);
    eq(g.weeklyRateKg, 0);
  });

  test('goal: 0.5kg 차이는 유지가 아니라 목표 변화로 본다', function () {
    eq(run({ weightKg: 70, targetWeightKg: 69.5 }).type, 'lose');
  });

  test('goal: 감량 속도는 0.25~0.75 범위로 제한', function () {
    eq(run({ weightKg: 40, targetWeightKg: 35, heightCm: 160 }).weeklyRateKg, 0.3);
    eq(run({ weightKg: 150, targetWeightKg: 120, heightCm: 180 }).weeklyRateKg, 0.75);
  });

  test('goal: 안전 상한은 체중 1%, 최대 1kg', function () {
    eq(run().maxSafeWeeklyKg, 0.8);
    eq(run({ weightKg: 150, targetWeightKg: 120, heightCm: 180 }).maxSafeWeeklyKg, 1);
  });

  test('goal: 추천 속도는 항상 안전 상한 이하', function () {
    [[50, 45], [80, 70], [100, 80], [200, 150]].forEach(function (p) {
      var g = run({ weightKg: p[0], targetWeightKg: p[1], heightCm: 180 });
      ok(g.weeklyRateKg <= g.maxSafeWeeklyKg, p[0] + 'kg: ' + g.weeklyRateKg + ' > ' + g.maxSafeWeeklyKg);
    });
  });

  test('goal: 정상 목표는 경고 없음', function () {
    eq(run().warnings.length, 0);
  });

  test('goal: 저체중 목표 경고', function () {
    ok(codes(run({ weightKg: 55, targetWeightKg: 50, heightCm: 175 })).indexOf('target_underweight') !== -1);
  });

  test('goal: 이미 저체중인데 감량하면 경고', function () {
    ok(codes(run({ weightKg: 52, targetWeightKg: 50, heightCm: 175 })).indexOf('losing_while_underweight') !== -1);
  });

  test('goal: 과체중 범위로 증량하면 경고', function () {
    ok(codes(run({ weightKg: 75, targetWeightKg: 90, heightCm: 175 })).indexOf('gain_overweight') !== -1);
  });

  test('goal: 변화량이 20% 초과면 큰 목표 경고', function () {
    ok(codes(run({ weightKg: 100, targetWeightKg: 75 })).indexOf('large_goal') !== -1);
    eq(codes(run({ weightKg: 100, targetWeightKg: 80 })).indexOf('large_goal'), -1);
  });

  test('goal: 65세 이상 안내, 64세는 없음', function () {
    ok(codes(run({ age: 65 })).indexOf('senior') !== -1);
    eq(codes(run({ age: 64 })).indexOf('senior'), -1);
  });

  test('goal: 중간 목표는 12주치 변화량, 목표가 작으면 목표 전체', function () {
    eq(run().milestoneKg, 7.2);
    eq(run({ weightKg: 80, targetWeightKg: 78 }).milestoneKg, 2);
  });
})();
