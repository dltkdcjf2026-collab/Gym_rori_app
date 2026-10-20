(function () {
  'use strict';
  var test = T.test, eq = T.assertEqual, ok = T.assertTrue, close = T.assertClose;

  function run(over) {
    var v = { age: 30, sex: 'male', heightCm: 175, weightKg: 80, targetWeightKg: 72, level: 'beginner' };
    for (var k in over) v[k] = over[k];
    var m = Fit.metrics.compute(v);
    var g = Fit.goal.analyze(v, m);
    return Fit.nutrition.plan(v, m, g);
  }
  function kcalOf(p) { return p.macros.proteinG * 4 + p.macros.carbG * 4 + p.macros.fatG * 9; }

  test('nutrition: 남 80→72kg 감량 → 1750kcal, P144/C184/F49', function () {
    var p = run();
    eq(p.calories, 1750);
    eq(p.dailyKcalDelta, -655);
    eq(p.floored, false);
    eq(p.macros.proteinG, 144);
    eq(p.macros.carbG, 184);
    eq(p.macros.fatG, 49);
  });

  test('nutrition: 탄단지 열량 합이 목표 칼로리와 ±15kcal 이내', function () {
    [{}, { weightKg: 60, targetWeightKg: 65 }, { sex: 'female', weightKg: 70, targetWeightKg: 62 }].forEach(function (o) {
      var p = run(o);
      close(kcalOf(p), p.calories, 15, JSON.stringify(o));
    });
  });

  test('nutrition: 여성 최저 칼로리 1200 적용 + 기간 재계산', function () {
    var p = run({ age: 40, sex: 'female', heightCm: 150, weightKg: 45, targetWeightKg: 42 });
    eq(p.floored, true);
    eq(p.calories, 1200);
    eq(p.dailyKcalDelta, -211);
    eq(p.weeks, 16);
  });

  test('nutrition: 남성 최저 칼로리는 1500', function () {
    eq(Fit.nutrition.FLOOR_KCAL.male, 1500);
    eq(Fit.nutrition.FLOOR_KCAL.female, 1200);
  });

  test('nutrition: 감량 시 목표 칼로리는 최저선 아래로 내려가지 않는다', function () {
    [[45, 40], [55, 50], [60, 52], [90, 70]].forEach(function (p) {
      var r = run({ sex: 'female', heightCm: 155, age: 55, weightKg: p[0], targetWeightKg: p[1] });
      ok(r.calories >= 1200, p[0] + '→' + p[1] + ' ' + r.calories);
    });
  });

  test('nutrition: 증량은 TDEE보다 높은 칼로리 + 하루 4끼', function () {
    var p = run({ weightKg: 60, targetWeightKg: 65 });
    eq(p.calories, 2350);
    eq(p.meals, 4);
  });

  test('nutrition: 유지는 TDEE를 10kcal 단위로 반올림한 값(차이 ±5 이내)이고 3끼', function () {
    var p = run({ weightKg: 70, targetWeightKg: 70 });
    ok(Math.abs(p.dailyKcalDelta) <= 5, 'delta=' + p.dailyKcalDelta);
    eq(p.calories % 10, 0);
    eq(p.meals, 3);
  });

  test('nutrition: 단백질은 감량 2.0 > 증량 1.8 > 유지 1.6 g/kg', function () {
    eq(Fit.nutrition.macros(2500, 100, 'lose', 30).proteinG, 200);
    eq(Fit.nutrition.macros(3000, 100, 'gain', 30).proteinG, 180);
    eq(Fit.nutrition.macros(3000, 100, 'maintain', 30).proteinG, 160);
  });

  test('nutrition: 50세 이상은 단백질 +0.2 g/kg', function () {
    eq(Fit.nutrition.macros(3000, 100, 'maintain', 50).proteinG, 180);
    eq(Fit.nutrition.macros(3000, 100, 'maintain', 49).proteinG, 160);
  });

  test('nutrition: 단백질은 총 칼로리의 35% 이하로 제한', function () {
    var m = Fit.nutrition.macros(1200, 120, 'lose', 30);
    eq(m.proteinG, 105);
    ok(m.carbG >= 0);
  });

  test('nutrition: 수분 권장량은 체중 x 0.035L, 팁은 목표별로 제공', function () {
    var p = run();
    eq(p.waterL, 2.8);
    ok(p.tips.length >= 3);
    ok(run({ weightKg: 60, targetWeightKg: 65 }).tips[0] !== p.tips[0]);
  });
})();
