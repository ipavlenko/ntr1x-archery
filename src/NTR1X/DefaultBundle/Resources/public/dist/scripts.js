(function($, Vue, Core) {

    Vue.component('default-box', {
        template: '#default-box',
        props: {
            bindings: Object,
        }
    });

})(jQuery, Vue, Core);

(function($, Vue, Core) {

    Vue.component('default-button', {
        template: '#default-button',
        mixins: [ Core.WidgetMixin ],
    });

})(jQuery, Vue, Core);

(function($, Vue, Core) {

    Vue.component('default-carousel', {
        template: '#default-carousel',
        mixins: [ Core.WidgetMixin ],
    });

})(jQuery, Vue, Core);

(function($, Vue, Core) {

    Vue.component('default-footer', {
        template: '#default-footer',
        mixins: [ Core.WidgetMixin ],
    });

})(jQuery, Vue, Core);

(function($, Vue, Core) {

    Vue.component('default-gallery', {
        template: '#default-gallery',
        mixins: [ Core.WidgetMixin ],

        data: function() {
            return {
                matrix: this.matrix,
            }
        },

        created: function() {

            this.$watch('bindings', updateMatrix.bind(this), { immediate: true, deep: true });

            function updateMatrix(bindings) {

                // console.log('created');
                var items = bindings.items || [];

                var rows = parseInt(bindings.rows);
                rows = rows > 0 ? rows : 1;

                var cols = parseInt(bindings.cols);
                cols = cols > 0 ? cols : 3;

                var cells = rows * cols;

                var div = parseInt(items.length / cells);
                var mod = items.length % cells;

                var count = (mod > 0 || div == 0)
                    ? div + 1
                    : div
                ;

                var matrix = [];

                for (var p = 0; p < count; p++) {

                    var pd = [];
                    for (var r = 0; r < rows; r++) {
                        var rd = [];
                        for (var c = 0; c < cols; c++) {
                            var index = (p * rows + r) * cols + c;
                            if (index < items.length) {
                                rd.push(items[index]);
                            }
                        }
                        pd.push(rd);
                    }
                    matrix.push(pd);
                }

                this.matrix = matrix;
            };
        }
    });

})(jQuery, Vue, Core);

(function($, Vue, Core) {

    Vue.component('default-header', {
        template: '#default-header',
        mixins: [ Core.WidgetMixin ],
    });

})(jQuery, Vue, Core);

(function($, Vue, Core) {

    Vue.component('default-input-text', {
        template: '#default-input-text',
        mixins: [ Core.WidgetMixin ],
    });

    Vue.component('default-input-textarea', {
        template: '#default-input-textarea',
        mixins: [ Core.WidgetMixin ],
    });

    Vue.component('default-input-checkbox', {
        template: '#default-input-checkbox',
        mixins: [ Core.WidgetMixin ],
    });

    Vue.component('default-input-radio', {
        template: '#default-input-radio',
        mixins: [ Core.WidgetMixin ],
    });

})(jQuery, Vue, Core);

(function($, Vue, Core) {

    var Nav = {
        methods: {
            setActive: function(active) {
                this.bindings.active = active;
            }
        },
    };

    Vue.component('default-nav-horisontal', {
        template: '#default-nav-horisontal',
        mixins: [ Core.WidgetMixin, Nav ],
    });

    Vue.component('default-nav-vertical', {
        template: '#default-nav-vertical',
        mixins: [ Core.WidgetMixin, Nav ],
    });

})(jQuery, Vue, Core);

(function($, Vue, Core) {

    Vue.component('default-placeholder', {
        template: '#default-placeholder',
        mixins: [ Core.WidgetMixin ],
    });

})(jQuery, Vue, Core);

(function($, Vue, Core) {

    Vue.component('default-sitemap', {
        template: '#default-sitemap',
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

    Vue.component('default-stub', {
        template: '#default-stub',
        mixins: [ Core.WidgetMixin ],
    });

})(jQuery, Vue, Core);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJveC9ib3guanMiLCJidXR0b24vYnV0dG9uLmpzIiwiY2Fyb3VzZWwvY2Fyb3VzZWwuanMiLCJmb290ZXIvZm9vdGVyLmpzIiwiZ2FsbGVyeS9nYWxsZXJ5LmpzIiwiaGVhZGVyL2hlYWRlci5qcyIsImlucHV0L2lucHV0LmpzIiwibmF2L25hdi5qcyIsInBsYWNlaG9sZGVyL3BsYWNlaG9sZGVyLmpzIiwic2l0ZW1hcC9zaXRlbWFwLmpzIiwic3RhY2svc3RhY2suanMiLCJzdHViL3N0dWIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM3REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoic2NyaXB0cy5qcyIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigkLCBWdWUsIENvcmUpIHtcblxuICAgIFZ1ZS5jb21wb25lbnQoJ2RlZmF1bHQtYm94Jywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNkZWZhdWx0LWJveCcsXG4gICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgICBiaW5kaW5nczogT2JqZWN0LFxuICAgICAgICB9XG4gICAgfSk7XG5cbn0pKGpRdWVyeSwgVnVlLCBDb3JlKTtcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUpIHtcblxuICAgIFZ1ZS5jb21wb25lbnQoJ2RlZmF1bHQtYnV0dG9uJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNkZWZhdWx0LWJ1dHRvbicsXG4gICAgICAgIG1peGluczogWyBDb3JlLldpZGdldE1peGluIF0sXG4gICAgfSk7XG5cbn0pKGpRdWVyeSwgVnVlLCBDb3JlKTtcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUpIHtcblxuICAgIFZ1ZS5jb21wb25lbnQoJ2RlZmF1bHQtY2Fyb3VzZWwnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI2RlZmF1bHQtY2Fyb3VzZWwnLFxuICAgICAgICBtaXhpbnM6IFsgQ29yZS5XaWRnZXRNaXhpbiBdLFxuICAgIH0pO1xuXG59KShqUXVlcnksIFZ1ZSwgQ29yZSk7XG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlKSB7XG5cbiAgICBWdWUuY29tcG9uZW50KCdkZWZhdWx0LWZvb3RlcicsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjZGVmYXVsdC1mb290ZXInLFxuICAgICAgICBtaXhpbnM6IFsgQ29yZS5XaWRnZXRNaXhpbiBdLFxuICAgIH0pO1xuXG59KShqUXVlcnksIFZ1ZSwgQ29yZSk7XG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlKSB7XG5cbiAgICBWdWUuY29tcG9uZW50KCdkZWZhdWx0LWdhbGxlcnknLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI2RlZmF1bHQtZ2FsbGVyeScsXG4gICAgICAgIG1peGluczogWyBDb3JlLldpZGdldE1peGluIF0sXG5cbiAgICAgICAgZGF0YTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIG1hdHJpeDogdGhpcy5tYXRyaXgsXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgY3JlYXRlZDogZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgIHRoaXMuJHdhdGNoKCdiaW5kaW5ncycsIHVwZGF0ZU1hdHJpeC5iaW5kKHRoaXMpLCB7IGltbWVkaWF0ZTogdHJ1ZSwgZGVlcDogdHJ1ZSB9KTtcblxuICAgICAgICAgICAgZnVuY3Rpb24gdXBkYXRlTWF0cml4KGJpbmRpbmdzKSB7XG5cbiAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZygnY3JlYXRlZCcpO1xuICAgICAgICAgICAgICAgIHZhciBpdGVtcyA9IGJpbmRpbmdzLml0ZW1zIHx8IFtdO1xuXG4gICAgICAgICAgICAgICAgdmFyIHJvd3MgPSBwYXJzZUludChiaW5kaW5ncy5yb3dzKTtcbiAgICAgICAgICAgICAgICByb3dzID0gcm93cyA+IDAgPyByb3dzIDogMTtcblxuICAgICAgICAgICAgICAgIHZhciBjb2xzID0gcGFyc2VJbnQoYmluZGluZ3MuY29scyk7XG4gICAgICAgICAgICAgICAgY29scyA9IGNvbHMgPiAwID8gY29scyA6IDM7XG5cbiAgICAgICAgICAgICAgICB2YXIgY2VsbHMgPSByb3dzICogY29scztcblxuICAgICAgICAgICAgICAgIHZhciBkaXYgPSBwYXJzZUludChpdGVtcy5sZW5ndGggLyBjZWxscyk7XG4gICAgICAgICAgICAgICAgdmFyIG1vZCA9IGl0ZW1zLmxlbmd0aCAlIGNlbGxzO1xuXG4gICAgICAgICAgICAgICAgdmFyIGNvdW50ID0gKG1vZCA+IDAgfHwgZGl2ID09IDApXG4gICAgICAgICAgICAgICAgICAgID8gZGl2ICsgMVxuICAgICAgICAgICAgICAgICAgICA6IGRpdlxuICAgICAgICAgICAgICAgIDtcblxuICAgICAgICAgICAgICAgIHZhciBtYXRyaXggPSBbXTtcblxuICAgICAgICAgICAgICAgIGZvciAodmFyIHAgPSAwOyBwIDwgY291bnQ7IHArKykge1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciBwZCA9IFtdO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciByID0gMDsgciA8IHJvd3M7IHIrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHJkID0gW107XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBjID0gMDsgYyA8IGNvbHM7IGMrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpbmRleCA9IChwICogcm93cyArIHIpICogY29scyArIGM7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGluZGV4IDwgaXRlbXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJkLnB1c2goaXRlbXNbaW5kZXhdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBwZC5wdXNoKHJkKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBtYXRyaXgucHVzaChwZCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdGhpcy5tYXRyaXggPSBtYXRyaXg7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfSk7XG5cbn0pKGpRdWVyeSwgVnVlLCBDb3JlKTtcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUpIHtcblxuICAgIFZ1ZS5jb21wb25lbnQoJ2RlZmF1bHQtaGVhZGVyJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNkZWZhdWx0LWhlYWRlcicsXG4gICAgICAgIG1peGluczogWyBDb3JlLldpZGdldE1peGluIF0sXG4gICAgfSk7XG5cbn0pKGpRdWVyeSwgVnVlLCBDb3JlKTtcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUpIHtcblxuICAgIFZ1ZS5jb21wb25lbnQoJ2RlZmF1bHQtaW5wdXQtdGV4dCcsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjZGVmYXVsdC1pbnB1dC10ZXh0JyxcbiAgICAgICAgbWl4aW5zOiBbIENvcmUuV2lkZ2V0TWl4aW4gXSxcbiAgICB9KTtcblxuICAgIFZ1ZS5jb21wb25lbnQoJ2RlZmF1bHQtaW5wdXQtdGV4dGFyZWEnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI2RlZmF1bHQtaW5wdXQtdGV4dGFyZWEnLFxuICAgICAgICBtaXhpbnM6IFsgQ29yZS5XaWRnZXRNaXhpbiBdLFxuICAgIH0pO1xuXG4gICAgVnVlLmNvbXBvbmVudCgnZGVmYXVsdC1pbnB1dC1jaGVja2JveCcsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjZGVmYXVsdC1pbnB1dC1jaGVja2JveCcsXG4gICAgICAgIG1peGluczogWyBDb3JlLldpZGdldE1peGluIF0sXG4gICAgfSk7XG5cbiAgICBWdWUuY29tcG9uZW50KCdkZWZhdWx0LWlucHV0LXJhZGlvJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNkZWZhdWx0LWlucHV0LXJhZGlvJyxcbiAgICAgICAgbWl4aW5zOiBbIENvcmUuV2lkZ2V0TWl4aW4gXSxcbiAgICB9KTtcblxufSkoalF1ZXJ5LCBWdWUsIENvcmUpO1xuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSkge1xuXG4gICAgdmFyIE5hdiA9IHtcbiAgICAgICAgbWV0aG9kczoge1xuICAgICAgICAgICAgc2V0QWN0aXZlOiBmdW5jdGlvbihhY3RpdmUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmJpbmRpbmdzLmFjdGl2ZSA9IGFjdGl2ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICB9O1xuXG4gICAgVnVlLmNvbXBvbmVudCgnZGVmYXVsdC1uYXYtaG9yaXNvbnRhbCcsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjZGVmYXVsdC1uYXYtaG9yaXNvbnRhbCcsXG4gICAgICAgIG1peGluczogWyBDb3JlLldpZGdldE1peGluLCBOYXYgXSxcbiAgICB9KTtcblxuICAgIFZ1ZS5jb21wb25lbnQoJ2RlZmF1bHQtbmF2LXZlcnRpY2FsJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNkZWZhdWx0LW5hdi12ZXJ0aWNhbCcsXG4gICAgICAgIG1peGluczogWyBDb3JlLldpZGdldE1peGluLCBOYXYgXSxcbiAgICB9KTtcblxufSkoalF1ZXJ5LCBWdWUsIENvcmUpO1xuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSkge1xuXG4gICAgVnVlLmNvbXBvbmVudCgnZGVmYXVsdC1wbGFjZWhvbGRlcicsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjZGVmYXVsdC1wbGFjZWhvbGRlcicsXG4gICAgICAgIG1peGluczogWyBDb3JlLldpZGdldE1peGluIF0sXG4gICAgfSk7XG5cbn0pKGpRdWVyeSwgVnVlLCBDb3JlKTtcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUpIHtcblxuICAgIFZ1ZS5jb21wb25lbnQoJ2RlZmF1bHQtc2l0ZW1hcCcsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjZGVmYXVsdC1zaXRlbWFwJyxcbiAgICAgICAgbWl4aW5zOiBbIENvcmUuV2lkZ2V0TWl4aW4gXSxcbiAgICB9KTtcblxufSkoalF1ZXJ5LCBWdWUsIENvcmUpO1xuIiwiU2hlbGwgPSB3aW5kb3cuU2hlbGwgfHwge307XG5cbihmdW5jdGlvbigkLCBWdWUsIENvcmUsIFNoZWxsLCB1bmRlZmluZWQpIHtcbiAgICBcbiAgICBWdWUuY29tcG9uZW50KCdkZWZhdWx0LXN0YWNrLWNhbnZhcycsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjZGVmYXVsdC1zdGFjay1jYW52YXMnLFxuICAgICAgICBtaXhpbnM6IFsgQ29yZS5TdGFja2VkTWl4aW4gXSxcbiAgICB9KTtcblxuICAgIFZ1ZS5jb21wb25lbnQoJ2RlZmF1bHQtc3RhY2staG9yaXNvbnRhbCcsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjZGVmYXVsdC1zdGFjay1ob3Jpc29udGFsJyxcbiAgICAgICAgbWl4aW5zOiBbIENvcmUuV2lkZ2V0TWl4aW4sIENvcmUuU3RhY2tlZE1peGluIF0sXG4gICAgfSk7XG5cbiAgICBWdWUuY29tcG9uZW50KCdkZWZhdWx0LXN0YWNrLXZlcnRpY2FsJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNkZWZhdWx0LXN0YWNrLXZlcnRpY2FsJyxcbiAgICAgICAgbWl4aW5zOiBbIENvcmUuV2lkZ2V0TWl4aW4sIENvcmUuU3RhY2tlZE1peGluIF0sXG4gICAgfSk7XG5cbn0pKGpRdWVyeSwgVnVlLCBDb3JlLCBTaGVsbCk7XG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlKSB7XG5cbiAgICBWdWUuY29tcG9uZW50KCdkZWZhdWx0LXN0dWInLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI2RlZmF1bHQtc3R1YicsXG4gICAgICAgIG1peGluczogWyBDb3JlLldpZGdldE1peGluIF0sXG4gICAgfSk7XG5cbn0pKGpRdWVyeSwgVnVlLCBDb3JlKTtcbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
