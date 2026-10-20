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
      goalHtml(g);
  });
})();
