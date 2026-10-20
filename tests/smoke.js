(function () {
  'use strict';
  var test = T.test, eq = T.assertEqual, ok = T.assertTrue;
  var frame = document.getElementById('app');

  function fill(doc, v) {
    var f = doc.getElementById('profile-form');
    f.age.value = v.age; f.heightCm.value = v.heightCm; f.weightKg.value = v.weightKg;
    f.targetWeightKg.value = v.targetWeightKg; f.level.value = v.level;
    var radio = f.querySelector('input[name=sex][value=' + v.sex + ']');
    if (radio) radio.checked = true;
    return f;
  }

  frame.addEventListener('load', function () {
    var doc = frame.contentDocument;
    var form = doc.getElementById('profile-form');
    var result = doc.getElementById('result');

    test('smoke: 빈 폼 제출 시 오류 6개가 표시되고 결과는 숨김', function () {
      form.requestSubmit();
      var shown = [].filter.call(doc.querySelectorAll('.error'), function (e) { return e.textContent !== ''; });
      eq(shown.length, 6);
      eq(result.hidden, true);
    });

    test('smoke: 정상 입력 시 4개 섹션이 모두 표시', function () {
      fill(doc, { age: '30', sex: 'male', heightCm: '175', weightKg: '80', targetWeightKg: '72', level: 'intermediate' });
      form.requestSubmit();
      eq(result.hidden, false);
      ['내 신체 지표', '목표 분석', '식단 가이드', '운동 프로그램'].forEach(function (h) {
        ok(result.textContent.indexOf(h) !== -1, h + ' 누락');
      });
      eq([].filter.call(doc.querySelectorAll('.error'), function (e) { return e.textContent !== ''; }).length, 0);
    });

    test('smoke: 중급 결과의 핵심 수치 (BMI 26.1, BMR 1749, TDEE 2711, 목표 2050 kcal)', function () {
      var t = result.textContent;
      ['26.1', '1749 kcal', '2711 kcal', '2050 kcal'].forEach(function (s) {
        ok(t.indexOf(s) !== -1, s + ' 누락');
      });
    });

    test('smoke: 잘못된 입력으로 다시 제출하면 이전 결과가 숨겨진다', function () {
      fill(doc, { age: '10', sex: 'male', heightCm: '175', weightKg: '80', targetWeightKg: '72', level: 'intermediate' });
      form.requestSubmit();
      eq(result.hidden, true);
    });

    test('smoke: 여성/증량/고급 입력도 예외 없이 동작', function () {
      fill(doc, { age: '28', sex: 'female', heightCm: '165', weightKg: '52', targetWeightKg: '57', level: 'advanced' });
      form.requestSubmit();
      eq(result.hidden, false);
      ok(result.textContent.indexOf('체중 증량') !== -1);
      ok(result.textContent.indexOf('DAY 5') !== -1);
    });

    test('smoke: 면책 문구가 화면에 있다', function () {
      ok(doc.body.textContent.indexOf('의학적 조언이 아닙니다') !== -1);
    });

    T.report();
  });
})();
