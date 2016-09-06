import mq from '../../src/js-mq';

mq.register([
    {name: 'xs', query: '(max-width: 767px)'},
    {name: 'sm', query: '(min-width: 768px) and (max-width: 991px)'},
    {name: 'md', query: '(min-width: 992px) and (max-width: 1199px)'},
    {name: 'lg', query: '(min-width: 1200px)'}
]);


document.addEventListener('DOMContentLoaded', () => {

    const states = [];
    const classUpdateAnim = 'mq-item--anim-flash';
    const classActive = 'mq-item--active';
    const classInactive = 'mq-item--inactive';

    function updateQueryTable() {
        window.requestAnimationFrame(() => {

            for (const state of states) {
                let {active, updated, el} = state;

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

        });
    }

    Array.from(document.querySelectorAll('.js-mq-item')).forEach(el => {

        const on = el.dataset.mq;
        const from = el.dataset.mqFrom || '*';

        el.addEventListener('animationend', () => {
            window.requestAnimationFrame(() => {
                el.classList.remove(classUpdateAnim);
            });
        });

        const state = {
            el,
            active: false,
            updated: false,
        };

        states.push(state);

        mq.on(on, from, () => {
            state.active = true;
            state.updated = true;
        }, () => {
            state.active = false;
            state.updated = true;
        });
    });

    mq.on('*', updateQueryTable, true);

});