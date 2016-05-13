(function($, Vue, Core) {

    Vue.component('default-footer', {
        template: '#default-footer',
        mixins: [ Core.WidgetMixin ],
    });

})(jQuery, Vue, Core);

(function($, Vue, Core) {

    Vue.component('default-menu', {
        template: '#default-menu',
        mixins: [ Core.WidgetMixin ],
    });

})(jQuery, Vue, Core);

(function($, Vue, Core) {

    Vue.component('default-header', {
        template: '#default-header',
        mixins: [ Core.WidgetMixin ],
    });

})(jQuery, Vue, Core);

(function($, Vue, Core) {

    Vue.component('default-placeholder', {
        template: '#default-placeholder',
        mixins: [ Core.WidgetMixin ],
    });

})(jQuery, Vue, Core);

Shell = window.Shell || {};

(function($, Vue, Core, Shell, undefined) {
    
    Vue.component('default-stack-canvas', {
        template: '#default-stack-canvas',
        mixins: [ Core.StackedMixin ],
    });

    Vue.component('default-stack-horisontal', {
        template: '#default-stack-horisontal',
        mixins: [ Core.WidgetMixin, Core.StackedMixin ],
    });

    Vue.component('default-stack-vertical', {
        template: '#default-stack-vertical',
        mixins: [ Core.WidgetMixin, Core.StackedMixin ],
    });

})(jQuery, Vue, Core, Shell);

(function($, Vue, Core) {

    Vue.component('default-sitemap', {
        template: '#default-sitemap',
        mixins: [ Core.WidgetMixin ],
    });

})(jQuery, Vue, Core);

(function($, Vue, Core) {

    Vue.component('default-stub', {
        template: '#default-stub',
        mixins: [ Core.WidgetMixin ],
    });

})(jQuery, Vue, Core);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZvb3Rlci9mb290ZXIuanMiLCJtZW51L21lbnUuanMiLCJoZWFkZXIvaGVhZGVyLmpzIiwicGxhY2Vob2xkZXIvcGxhY2Vob2xkZXIuanMiLCJzdGFjay9zdGFjay5qcyIsInNpdGVtYXAvc2l0ZW1hcC5qcyIsInN0dWIvc3R1Yi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6InNjcmlwdHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlKSB7XHJcblxyXG4gICAgVnVlLmNvbXBvbmVudCgnZGVmYXVsdC1mb290ZXInLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjZGVmYXVsdC1mb290ZXInLFxyXG4gICAgICAgIG1peGluczogWyBDb3JlLldpZGdldE1peGluIF0sXHJcbiAgICB9KTtcclxuXHJcbn0pKGpRdWVyeSwgVnVlLCBDb3JlKTtcclxuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSkge1xyXG5cclxuICAgIFZ1ZS5jb21wb25lbnQoJ2RlZmF1bHQtbWVudScsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNkZWZhdWx0LW1lbnUnLFxyXG4gICAgICAgIG1peGluczogWyBDb3JlLldpZGdldE1peGluIF0sXHJcbiAgICB9KTtcclxuXHJcbn0pKGpRdWVyeSwgVnVlLCBDb3JlKTtcclxuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSkge1xyXG5cclxuICAgIFZ1ZS5jb21wb25lbnQoJ2RlZmF1bHQtaGVhZGVyJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI2RlZmF1bHQtaGVhZGVyJyxcclxuICAgICAgICBtaXhpbnM6IFsgQ29yZS5XaWRnZXRNaXhpbiBdLFxyXG4gICAgfSk7XHJcblxyXG59KShqUXVlcnksIFZ1ZSwgQ29yZSk7XHJcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUpIHtcclxuXHJcbiAgICBWdWUuY29tcG9uZW50KCdkZWZhdWx0LXBsYWNlaG9sZGVyJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI2RlZmF1bHQtcGxhY2Vob2xkZXInLFxyXG4gICAgICAgIG1peGluczogWyBDb3JlLldpZGdldE1peGluIF0sXHJcbiAgICB9KTtcclxuXHJcbn0pKGpRdWVyeSwgVnVlLCBDb3JlKTtcclxuIiwiU2hlbGwgPSB3aW5kb3cuU2hlbGwgfHwge307XHJcblxyXG4oZnVuY3Rpb24oJCwgVnVlLCBDb3JlLCBTaGVsbCwgdW5kZWZpbmVkKSB7XHJcbiAgICBcclxuICAgIFZ1ZS5jb21wb25lbnQoJ2RlZmF1bHQtc3RhY2stY2FudmFzJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI2RlZmF1bHQtc3RhY2stY2FudmFzJyxcclxuICAgICAgICBtaXhpbnM6IFsgQ29yZS5TdGFja2VkTWl4aW4gXSxcclxuICAgIH0pO1xyXG5cclxuICAgIFZ1ZS5jb21wb25lbnQoJ2RlZmF1bHQtc3RhY2staG9yaXNvbnRhbCcsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNkZWZhdWx0LXN0YWNrLWhvcmlzb250YWwnLFxyXG4gICAgICAgIG1peGluczogWyBDb3JlLldpZGdldE1peGluLCBDb3JlLlN0YWNrZWRNaXhpbiBdLFxyXG4gICAgfSk7XHJcblxyXG4gICAgVnVlLmNvbXBvbmVudCgnZGVmYXVsdC1zdGFjay12ZXJ0aWNhbCcsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNkZWZhdWx0LXN0YWNrLXZlcnRpY2FsJyxcclxuICAgICAgICBtaXhpbnM6IFsgQ29yZS5XaWRnZXRNaXhpbiwgQ29yZS5TdGFja2VkTWl4aW4gXSxcclxuICAgIH0pO1xyXG5cclxufSkoalF1ZXJ5LCBWdWUsIENvcmUsIFNoZWxsKTtcclxuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSkge1xyXG5cclxuICAgIFZ1ZS5jb21wb25lbnQoJ2RlZmF1bHQtc2l0ZW1hcCcsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNkZWZhdWx0LXNpdGVtYXAnLFxyXG4gICAgICAgIG1peGluczogWyBDb3JlLldpZGdldE1peGluIF0sXHJcbiAgICB9KTtcclxuXHJcbn0pKGpRdWVyeSwgVnVlLCBDb3JlKTtcclxuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSkge1xyXG5cclxuICAgIFZ1ZS5jb21wb25lbnQoJ2RlZmF1bHQtc3R1YicsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNkZWZhdWx0LXN0dWInLFxyXG4gICAgICAgIG1peGluczogWyBDb3JlLldpZGdldE1peGluIF0sXHJcbiAgICB9KTtcclxuXHJcbn0pKGpRdWVyeSwgVnVlLCBDb3JlKTtcclxuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
