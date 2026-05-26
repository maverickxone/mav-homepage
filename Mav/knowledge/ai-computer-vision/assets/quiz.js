// ============================================================
// Interactive Quiz — click to select, check to reveal
// ============================================================
(function () {
  'use strict';

  document.querySelectorAll('.quiz-card').forEach(function (card) {
    var options = card.querySelectorAll('.quiz-option');
    var checkBtn = card.querySelector('.quiz-check');
    var explanation = card.querySelector('.quiz-explanation');
    var correctIndex = parseInt(card.getAttribute('data-correct'), 10);
    var selected = -1;

    // Select an option
    options.forEach(function (opt, i) {
      opt.addEventListener('click', function () {
        if (card.classList.contains('answered')) return;
        options.forEach(function (o) { o.classList.remove('selected'); });
        opt.classList.add('selected');
        selected = i;
        checkBtn.disabled = false;
      });
    });

    // Check answer
    checkBtn.disabled = true;
    checkBtn.addEventListener('click', function () {
      if (selected < 0 || card.classList.contains('answered')) return;

      card.classList.add('answered');

      // Mark correct
      options[correctIndex].classList.add('correct');

      // Mark wrong if different
      if (selected !== correctIndex) {
        options[selected].classList.add('wrong');
      }

      // Show explanation
      if (explanation) {
        explanation.removeAttribute('hidden');
      }
    });
  });
})();
