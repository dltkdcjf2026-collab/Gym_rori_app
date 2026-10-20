(function () {
  'use strict';
  var test = T.test, eq = T.assertEqual, ok = T.assertTrue;
  var HIGH = ['barbell_squat', 'bench_press', 'pullup', 'lunge', 'hanging_leg_raise'];

  function run(over) {
    var v = { age: 30, sex: 'male', heightCm: 175, weightKg: 80, targetWeightKg: 72, level: 'beginner' };
    for (var k in over) v[k] = over[k];
    var m = Fit.metrics.compute(v);
    return Fit.workout.plan(v, Fit.goal.analyze(v, m));
  }
  function ids(day) { return day.exercises.map(function (e) { return e.id; }); }
  function allIds(p) { return p.days.reduce(function (a, d) { return a.concat(ids(d)); }, []); }

  test('workout: 운동 DB의 모든 템플릿 id가 존재하고 대체 운동도 존재', function () {
    var T2 = Fit.workout.TEMPLATES;
    Object.keys(T2).forEach(function (lv) {
      T2[lv].days.forEach(function (d) {
        d.slots.forEach(function (s) { ok(Fit.exercises.byId[s[0]], lv + ': ' + s[0]); });
      });
    });
    Fit.exercises.list.forEach(function (e) {
      if (e.alt) ok(Fit.exercises.byId[e.alt], e.id + ' alt ' + e.alt);
    });
  });

  test('workout: 초급 3일 / 중급 4일 / 고급 5일', function () {
    eq(run({ level: 'beginner' }).daysPerWeek, 3);
    eq(run({ level: 'intermediate' }).daysPerWeek, 4);
    eq(run({ level: 'advanced' }).daysPerWeek, 5);
  });

  test('workout: 운동일 수와 요일 배치 수, days 길이가 일치', function () {
    ['beginner', 'intermediate', 'advanced'].forEach(function (lv) {
      var p = run({ level: lv });
      eq(p.days.length, p.daysPerWeek, lv);
      eq(p.weekdays.length, p.daysPerWeek, lv);
    });
  });

  test('workout: 하루 안에 같은 운동이 중복되지 않는다 (모든 수준/연령)', function () {
    ['beginner', 'intermediate', 'advanced'].forEach(function (lv) {
      [25, 45, 55, 70].forEach(function (age) {
        run({ level: lv, age: age }).days.forEach(function (d) {
          var seen = {};
          ids(d).forEach(function (id) {
            ok(!seen[id], lv + '/' + age + ' ' + d.label + ' 중복 ' + id);
            seen[id] = true;
          });
        });
      });
    });
  });

  test('workout: 모든 운동에 세트, 반복, 휴식이 있다', function () {
    run({ level: 'advanced' }).days.forEach(function (d) {
      ok(d.exercises.length >= 4, d.label);
      d.exercises.forEach(function (e) {
        ok(e.sets >= 2 && e.reps && e.restSec >= 60, e.id);
      });
    });
  });

  test('workout: 49세까지는 고난도 운동 유지, 50세부터 대체', function () {
    var young = allIds(run({ level: 'advanced', age: 49 }));
    ok(young.indexOf('barbell_squat') !== -1 && young.indexOf('pullup') !== -1);
    var senior = allIds(run({ level: 'advanced', age: 50 }));
    HIGH.forEach(function (id) { eq(senior.indexOf(id), -1, id + ' 포함됨'); });
    ok(senior.indexOf('goblet_squat') !== -1);
  });

  test('workout: 50세 이상 중급도 고난도 운동 없음, 휴식 +30초, 반복수 상향', function () {
    var p = run({ level: 'intermediate', age: 60 });
    HIGH.forEach(function (id) { eq(allIds(p).indexOf(id), -1, id); });
    var firstC = p.days[0].exercises[0];
    eq(firstC.restSec, 120);
    eq(firstC.reps, '10-12');
    eq(run({ level: 'intermediate', age: 30 }).days[0].exercises[0].restSec, 90);
  });

  test('workout: 감량 유산소 주 3회 > 유지 2회 > 증량 1회', function () {
    eq(run({ targetWeightKg: 72 }).cardio.sessionsPerWeek, 3);
    eq(run({ targetWeightKg: 80 }).cardio.sessionsPerWeek, 2);
    eq(run({ weightKg: 60, targetWeightKg: 66 }).cardio.sessionsPerWeek, 1);
  });

  test('workout: 50세 이상 유산소는 조깅 제외(저충격)', function () {
    ok(run({ age: 30 }).cardio.activities.indexOf('조깅') !== -1);
    eq(run({ age: 50 }).cardio.activities.indexOf('조깅'), -1);
  });

  test('workout: 증량은 복합 운동 반복수 6-10, 감량은 8-12 (중급)', function () {
    eq(run({ level: 'intermediate', weightKg: 60, targetWeightKg: 66 }).days[0].exercises[0].reps, '6-10');
    eq(run({ level: 'intermediate' }).days[0].exercises[0].reps, '8-12');
  });

  test('workout: 플랭크는 시간으로 표기', function () {
    var plank = run({ level: 'beginner' }).days[0].exercises.filter(function (e) { return e.id === 'plank'; })[0];
    eq(plank.reps, '30-45초');
  });

  test('workout: 연령별 안내 문구 (40세 워밍업 / 50세 대체 / 65세 균형)', function () {
    function has(p, s) { return p.notes.some(function (n) { return n.indexOf(s) !== -1; }); }
    eq(has(run({ age: 30 }), '관절 가동'), false);
    ok(has(run({ age: 40 }), '관절 가동'));
    ok(has(run({ age: 50 }), '50세 이상'));
    eq(has(run({ age: 64 }), '균형 운동'), false);
    ok(has(run({ age: 65 }), '균형 운동'));
  });
})();
