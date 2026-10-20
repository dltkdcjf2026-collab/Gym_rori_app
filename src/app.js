(function () {
  'use strict';

  var FIELDS = ['age', 'sex', 'heightCm', 'weightKg', 'targetWeightKg', 'level'];
  var form = document.getElementById('profile-form');
  var result = document.getElementById('result');

  function readInput() {
    var data = new FormData(form);
    var input = {};
    FIELDS.forEach(function (name) { input[name] = data.get(name); });
    return input;
  }

  function showErrors(errors) {
    FIELDS.forEach(function (name) {
      var holder = form.querySelector('[data-field="' + name + '"]');
      var msg = holder.querySelector('.error');
      msg.textContent = errors[name] || '';
      holder.classList.toggle('invalid', Boolean(errors[name]));
    });
  }

  var GOAL_LABEL = { lose: '체중 감량', gain: '체중 증량', maintain: '체중 유지' };

  function goalHtml(g) {
    var html = '<h2>목표 분석</h2><ul class="metrics">' +
      '<li><span>목표 유형</span><strong>' + GOAL_LABEL[g.type] + '</strong></li>';
    if (g.type !== 'maintain') {
      html += '<li><span>변화량</span><strong>' + (g.diffKg > 0 ? '+' : '') + g.diffKg + ' kg</strong></li>' +
        '<li><span>권장 속도</span><strong>주 ' + g.weeklyRateKg + ' kg</strong></li>' +
        '<li><span>예상 기간</span><strong>약 ' + g.weeks + '주 (' + Math.round(g.weeks / 4.345) + '개월)</strong></li>' +
        '<li><span>하루 칼로리 조정</span><strong>' + (g.dailyKcalDelta > 0 ? '+' : '') + g.dailyKcalDelta + ' kcal</strong></li>' +
        '<li><span>12주 중간 목표</span><strong>' + g.milestoneKg + ' kg</strong></li>';
    }
    html += '</ul>';
    g.warnings.forEach(function (w) {
      html += '<p class="warn">⚠ ' + w.message + '</p>';
    });
    return html;
  }

  function nutritionHtml(n, g) {
    var html = '<h2>식단 가이드</h2><ul class="metrics">' +
      '<li><span>하루 목표 칼로리</span><strong>' + n.calories + ' kcal</strong></li>' +
      '<li><span>탄수화물</span><strong>' + n.macros.carbG + ' g</strong></li>' +
      '<li><span>단백질</span><strong>' + n.macros.proteinG + ' g</strong></li>' +
      '<li><span>지방</span><strong>' + n.macros.fatG + ' g</strong></li>' +
      '<li><span>하루 식사 횟수</span><strong>' + n.meals + '끼</strong></li>' +
      '<li><span>물 섭취</span><strong>약 ' + n.waterL + ' L</strong></li>' +
      '</ul>';
    if (n.floored) {
      html += '<p class="warn">안전을 위해 하루 ' + n.floorKcal + ' kcal 아래로는 줄이지 않았습니다. ' +
        '그래서 목표 도달 기간이 약 ' + n.weeks + '주로 늘어납니다.</p>';
    }
    html += '<ul class="tips">';
    n.tips.forEach(function (t) { html += '<li>' + t + '</li>'; });
    return html + '</ul>';
  }

  function workoutHtml(w) {
    var html = '<h2>운동 프로그램</h2>' +
      '<p class="note">' + w.split + ' · 추천 요일: ' + w.weekdays.join(' / ') + '</p>';
    w.days.forEach(function (d) {
      html += '<h3>' + d.label + '</h3><table class="ex"><thead><tr><th>운동</th><th>세트</th><th>반복</th><th>휴식</th></tr></thead><tbody>';
      d.exercises.forEach(function (e) {
        html += '<tr><td>' + e.name + '</td><td>' + e.sets + '</td><td>' + e.reps + '</td><td>' + e.restSec + '초</td></tr>';
      });
      html += '</tbody></table>';
    });
    var c = w.cardio;
    html += '<h3>유산소</h3><p class="note">주 ' + c.sessionsPerWeek + '회 · 회당 ' + c.minutes + '분 · ' + c.activities.join(', ') +
      '<br>강도: ' + c.intensity + '<br>' + c.note + '</p>';
    html += '<h3>운동 시 유의사항</h3><ul class="tips">';
    w.notes.forEach(function (t) { html += '<li>' + t + '</li>'; });
    return html + '</ul>';
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var res = Fit.validate.validate(readInput());
    showErrors(res.errors);
    if (!res.ok) {
      result.hidden = true;
      return;
    }
    var m = Fit.metrics.compute(res.values);
    var g = Fit.goal.analyze(res.values, m);
    var n = Fit.nutrition.plan(res.values, m, g);
    var w = Fit.workout.plan(res.values, g);
    result.hidden = false;
    // 아래 값은 모두 계산된 숫자와 고정 문구뿐이다 (사용자 입력 문자열을 넣지 않는다)
    result.innerHTML =
      '<h2>내 신체 지표</h2>' +
      '<ul class="metrics">' +
      '<li><span>BMI</span><strong>' + m.bmi + ' (' + m.bmiCategory + ')</strong></li>' +
      '<li><span>목표 체중 BMI</span><strong>' + m.targetBmi + ' (' + m.targetBmiCategory + ')</strong></li>' +
      '<li><span>기초대사량(BMR)</span><strong>' + m.bmr + ' kcal</strong></li>' +
      '<li><span>하루 소비 열량(TDEE)</span><strong>' + m.tdee + ' kcal</strong></li>' +
      '</ul>' +
      '<p class="note">활동량은 경험 수준(주 ' + m.trainingDays + '일 운동)에서 추정한 값이라 실제와 ±10% 정도 차이가 날 수 있습니다.</p>' +
      goalHtml(g) +
      nutritionHtml(n, g) +
      workoutHtml(w);
  });
})();
