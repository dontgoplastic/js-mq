(function () {
'use strict';

mq.register([{ name: 'xs', query: '(max-width: 767px)' }, { name: 'sm', query: '(min-width: 768px) and (max-width: 991px)' }, { name: 'md', query: '(min-width: 992px) and (max-width: 1199px)' }, { name: 'lg', query: '(min-width: 1200px)' }]);

document.addEventListener('DOMContentLoaded', function () {

    var states = [];
    var classUpdateAnim = 'mq-item--anim-flash';
    var classActive = 'mq-item--active';
    var classInactive = 'mq-item--inactive';

    function updateQueryTable() {
        window.requestAnimationFrame(function () {
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {

                for (var _iterator = states[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var state = _step.value;
                    var active = state.active;
                    var updated = state.updated;
                    var el = state.el;


                    if (updated) {
                        if (active) {
                            el.classList.remove(classInactive);
                            el.classList.add(classActive, classUpdateAnim);
                        } else {
                            el.classList.remove(classActive);
                            el.classList.add(classInactive, classUpdateAnim);
                        }
                        state.updated = false;
                    }
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }
        });
    }

    Array.from(document.querySelectorAll('.js-mq-item')).forEach(function (el) {

        var on = el.dataset.mq;
        var from = el.dataset.mqFrom || '*';

        el.addEventListener('animationend', function () {
            window.requestAnimationFrame(function () {
                el.classList.remove(classUpdateAnim);
            });
        });

        var state = {
            el: el,
            active: false,
            updated: false
        };

        states.push(state);

        mq.on(on, from, function () {
            state.active = true;
            state.updated = true;
        }, function () {
            state.active = false;
            state.updated = true;
        });
    });

    mq.on('*', updateQueryTable, true);
});

}());
//# sourceMappingURL=demo-es5.js.map
