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

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var res = Fit.validate.validate(readInput());
    showErrors(res.errors);
    if (!res.ok) {
      result.hidden = true;
      return;
    }
    var m = Fit.metrics.compute(res.values);
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
      '<p class="note">활동량은 경험 수준(주 ' + m.trainingDays + '일 운동)에서 추정한 값이라 실제와 ±10% 정도 차이가 날 수 있습니다.</p>';
  });
})();
