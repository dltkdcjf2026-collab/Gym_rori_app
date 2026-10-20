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
    result.hidden = false;
    result.textContent = '입력이 확인되었습니다. (추천 기능은 다음 단계에서 추가됩니다.)';
  });
})();
