(function($, Vue, Core) {

    Vue.component('default-box', {
        template: '#default-box',
        props: {
            bindings: Object,
            class: String,
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

Core = window.Core || {};

(function($, Vue, Core) {

    Vue.component('default-form', {
        template: '#default-form',
        mixins: [ Core.WidgetMixin ]
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

    Vue.component('default-h1-h6', {
        template: '#default-h1-h6',
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

Core = window.Core || {};

(function($, Vue, Core) {

    Vue.component('default-items', {
        template: '#default-items',
        mixins: [ Core.WidgetMixin ]
    });

    Vue.component('default-media-horisontal', {
        template: '#default-media-horisontal',
        mixins: [ Core.WidgetMixin ]
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
    
    Vue.component('default-rich', {
        template: '#default-rich',
        mixins: [ Core.WidgetMixin ]
    });

})(jQuery, Vue, Core);

(function($, Vue, Core) {

    Vue.component('default-sitemap', {
        template: '#default-sitemap',
        mixins: [ Core.WidgetMixin ]
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

Core = window.Core || {};

(function($, Vue, Core) {

    Vue.component('default-table', {
        template: '#default-table',
        mixins: [ Core.WidgetMixin ]
    });

})(jQuery, Vue, Core);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJveC9ib3guanMiLCJidXR0b24vYnV0dG9uLmpzIiwiY2Fyb3VzZWwvY2Fyb3VzZWwuanMiLCJmb290ZXIvZm9vdGVyLmpzIiwiZm9ybS9mb3JtLmpzIiwiZ2FsbGVyeS9nYWxsZXJ5LmpzIiwiaDEtaDYvaDEtaDYuanMiLCJoZWFkZXIvaGVhZGVyLmpzIiwiaW5wdXQvaW5wdXQuanMiLCJpdGVtcy9pdGVtcy5qcyIsIm5hdi9uYXYuanMiLCJwbGFjZWhvbGRlci9wbGFjZWhvbGRlci5qcyIsInJpY2gvcmljaC5qcyIsInNpdGVtYXAvc2l0ZW1hcC5qcyIsInN0YWNrL3N0YWNrLmpzIiwic3R1Yi9zdHViLmpzIiwidGFibGUvdGFibGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM3REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoic2NyaXB0cy5qcyIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigkLCBWdWUsIENvcmUpIHtcclxuXHJcbiAgICBWdWUuY29tcG9uZW50KCdkZWZhdWx0LWJveCcsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNkZWZhdWx0LWJveCcsXHJcbiAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgYmluZGluZ3M6IE9iamVjdCxcclxuICAgICAgICAgICAgY2xhc3M6IFN0cmluZyxcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbn0pKGpRdWVyeSwgVnVlLCBDb3JlKTtcclxuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSkge1xyXG5cclxuICAgIFZ1ZS5jb21wb25lbnQoJ2RlZmF1bHQtYnV0dG9uJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI2RlZmF1bHQtYnV0dG9uJyxcclxuICAgICAgICBtaXhpbnM6IFsgQ29yZS5XaWRnZXRNaXhpbiBdLFxyXG4gICAgfSk7XHJcblxyXG59KShqUXVlcnksIFZ1ZSwgQ29yZSk7XHJcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUpIHtcclxuXHJcbiAgICBWdWUuY29tcG9uZW50KCdkZWZhdWx0LWNhcm91c2VsJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI2RlZmF1bHQtY2Fyb3VzZWwnLFxyXG4gICAgICAgIG1peGluczogWyBDb3JlLldpZGdldE1peGluIF0sXHJcbiAgICB9KTtcclxuXHJcbn0pKGpRdWVyeSwgVnVlLCBDb3JlKTtcclxuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSkge1xyXG5cclxuICAgIFZ1ZS5jb21wb25lbnQoJ2RlZmF1bHQtZm9vdGVyJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI2RlZmF1bHQtZm9vdGVyJyxcclxuICAgICAgICBtaXhpbnM6IFsgQ29yZS5XaWRnZXRNaXhpbiBdLFxyXG4gICAgfSk7XHJcblxyXG59KShqUXVlcnksIFZ1ZSwgQ29yZSk7XHJcbiIsIkNvcmUgPSB3aW5kb3cuQ29yZSB8fCB7fTtcclxuXHJcbihmdW5jdGlvbigkLCBWdWUsIENvcmUpIHtcclxuXHJcbiAgICBWdWUuY29tcG9uZW50KCdkZWZhdWx0LWZvcm0nLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjZGVmYXVsdC1mb3JtJyxcclxuICAgICAgICBtaXhpbnM6IFsgQ29yZS5XaWRnZXRNaXhpbiBdXHJcbiAgICB9KTtcclxuXHJcbn0pKGpRdWVyeSwgVnVlLCBDb3JlKTtcclxuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSkge1xyXG5cclxuICAgIFZ1ZS5jb21wb25lbnQoJ2RlZmF1bHQtZ2FsbGVyeScsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNkZWZhdWx0LWdhbGxlcnknLFxyXG4gICAgICAgIG1peGluczogWyBDb3JlLldpZGdldE1peGluIF0sXHJcblxyXG4gICAgICAgIGRhdGE6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgbWF0cml4OiB0aGlzLm1hdHJpeCxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGNyZWF0ZWQ6IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgICAgICAgdGhpcy4kd2F0Y2goJ2JpbmRpbmdzJywgdXBkYXRlTWF0cml4LmJpbmQodGhpcyksIHsgaW1tZWRpYXRlOiB0cnVlLCBkZWVwOiB0cnVlIH0pO1xyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gdXBkYXRlTWF0cml4KGJpbmRpbmdzKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ2NyZWF0ZWQnKTtcclxuICAgICAgICAgICAgICAgIHZhciBpdGVtcyA9IGJpbmRpbmdzLml0ZW1zIHx8IFtdO1xyXG5cclxuICAgICAgICAgICAgICAgIHZhciByb3dzID0gcGFyc2VJbnQoYmluZGluZ3Mucm93cyk7XHJcbiAgICAgICAgICAgICAgICByb3dzID0gcm93cyA+IDAgPyByb3dzIDogMTtcclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgY29scyA9IHBhcnNlSW50KGJpbmRpbmdzLmNvbHMpO1xyXG4gICAgICAgICAgICAgICAgY29scyA9IGNvbHMgPiAwID8gY29scyA6IDM7XHJcblxyXG4gICAgICAgICAgICAgICAgdmFyIGNlbGxzID0gcm93cyAqIGNvbHM7XHJcblxyXG4gICAgICAgICAgICAgICAgdmFyIGRpdiA9IHBhcnNlSW50KGl0ZW1zLmxlbmd0aCAvIGNlbGxzKTtcclxuICAgICAgICAgICAgICAgIHZhciBtb2QgPSBpdGVtcy5sZW5ndGggJSBjZWxscztcclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgY291bnQgPSAobW9kID4gMCB8fCBkaXYgPT0gMClcclxuICAgICAgICAgICAgICAgICAgICA/IGRpdiArIDFcclxuICAgICAgICAgICAgICAgICAgICA6IGRpdlxyXG4gICAgICAgICAgICAgICAgO1xyXG5cclxuICAgICAgICAgICAgICAgIHZhciBtYXRyaXggPSBbXTtcclxuXHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBwID0gMDsgcCA8IGNvdW50OyBwKyspIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHBkID0gW107XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgciA9IDA7IHIgPCByb3dzOyByKyspIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHJkID0gW107XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGMgPSAwOyBjIDwgY29sczsgYysrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgaW5kZXggPSAocCAqIHJvd3MgKyByKSAqIGNvbHMgKyBjO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGluZGV4IDwgaXRlbXMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmQucHVzaChpdGVtc1tpbmRleF0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBkLnB1c2gocmQpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBtYXRyaXgucHVzaChwZCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5tYXRyaXggPSBtYXRyaXg7XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG59KShqUXVlcnksIFZ1ZSwgQ29yZSk7XHJcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUpIHtcclxuXHJcbiAgICBWdWUuY29tcG9uZW50KCdkZWZhdWx0LWgxLWg2Jywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI2RlZmF1bHQtaDEtaDYnLFxyXG4gICAgICAgIG1peGluczogWyBDb3JlLldpZGdldE1peGluIF0sXHJcbiAgICB9KTtcclxuXHJcbn0pKGpRdWVyeSwgVnVlLCBDb3JlKTtcclxuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSkge1xyXG5cclxuICAgIFZ1ZS5jb21wb25lbnQoJ2RlZmF1bHQtaGVhZGVyJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI2RlZmF1bHQtaGVhZGVyJyxcclxuICAgICAgICBtaXhpbnM6IFsgQ29yZS5XaWRnZXRNaXhpbiBdLFxyXG4gICAgfSk7XHJcblxyXG59KShqUXVlcnksIFZ1ZSwgQ29yZSk7XHJcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUpIHtcclxuXHJcbiAgICBWdWUuY29tcG9uZW50KCdkZWZhdWx0LWlucHV0LXRleHQnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjZGVmYXVsdC1pbnB1dC10ZXh0JyxcclxuICAgICAgICBtaXhpbnM6IFsgQ29yZS5XaWRnZXRNaXhpbiBdLFxyXG4gICAgfSk7XHJcblxyXG4gICAgVnVlLmNvbXBvbmVudCgnZGVmYXVsdC1pbnB1dC10ZXh0YXJlYScsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNkZWZhdWx0LWlucHV0LXRleHRhcmVhJyxcclxuICAgICAgICBtaXhpbnM6IFsgQ29yZS5XaWRnZXRNaXhpbiBdLFxyXG4gICAgfSk7XHJcblxyXG4gICAgVnVlLmNvbXBvbmVudCgnZGVmYXVsdC1pbnB1dC1jaGVja2JveCcsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNkZWZhdWx0LWlucHV0LWNoZWNrYm94JyxcclxuICAgICAgICBtaXhpbnM6IFsgQ29yZS5XaWRnZXRNaXhpbiBdLFxyXG4gICAgfSk7XHJcblxyXG4gICAgVnVlLmNvbXBvbmVudCgnZGVmYXVsdC1pbnB1dC1yYWRpbycsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNkZWZhdWx0LWlucHV0LXJhZGlvJyxcclxuICAgICAgICBtaXhpbnM6IFsgQ29yZS5XaWRnZXRNaXhpbiBdLFxyXG4gICAgfSk7XHJcblxyXG59KShqUXVlcnksIFZ1ZSwgQ29yZSk7XHJcbiIsIkNvcmUgPSB3aW5kb3cuQ29yZSB8fCB7fTtcclxuXHJcbihmdW5jdGlvbigkLCBWdWUsIENvcmUpIHtcclxuXHJcbiAgICBWdWUuY29tcG9uZW50KCdkZWZhdWx0LWl0ZW1zJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI2RlZmF1bHQtaXRlbXMnLFxyXG4gICAgICAgIG1peGluczogWyBDb3JlLldpZGdldE1peGluIF1cclxuICAgIH0pO1xyXG5cclxuICAgIFZ1ZS5jb21wb25lbnQoJ2RlZmF1bHQtbWVkaWEtaG9yaXNvbnRhbCcsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNkZWZhdWx0LW1lZGlhLWhvcmlzb250YWwnLFxyXG4gICAgICAgIG1peGluczogWyBDb3JlLldpZGdldE1peGluIF1cclxuICAgIH0pO1xyXG5cclxufSkoalF1ZXJ5LCBWdWUsIENvcmUpO1xyXG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlKSB7XHJcblxyXG4gICAgdmFyIE5hdiA9IHtcclxuICAgICAgICBtZXRob2RzOiB7XHJcbiAgICAgICAgICAgIHNldEFjdGl2ZTogZnVuY3Rpb24oYWN0aXZlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmJpbmRpbmdzLmFjdGl2ZSA9IGFjdGl2ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICB9O1xyXG5cclxuICAgIFZ1ZS5jb21wb25lbnQoJ2RlZmF1bHQtbmF2LWhvcmlzb250YWwnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjZGVmYXVsdC1uYXYtaG9yaXNvbnRhbCcsXHJcbiAgICAgICAgbWl4aW5zOiBbIENvcmUuV2lkZ2V0TWl4aW4sIE5hdiBdLFxyXG4gICAgfSk7XHJcblxyXG4gICAgVnVlLmNvbXBvbmVudCgnZGVmYXVsdC1uYXYtdmVydGljYWwnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjZGVmYXVsdC1uYXYtdmVydGljYWwnLFxyXG4gICAgICAgIG1peGluczogWyBDb3JlLldpZGdldE1peGluLCBOYXYgXSxcclxuICAgIH0pO1xyXG5cclxufSkoalF1ZXJ5LCBWdWUsIENvcmUpO1xyXG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlKSB7XHJcblxyXG4gICAgVnVlLmNvbXBvbmVudCgnZGVmYXVsdC1wbGFjZWhvbGRlcicsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNkZWZhdWx0LXBsYWNlaG9sZGVyJyxcclxuICAgICAgICBtaXhpbnM6IFsgQ29yZS5XaWRnZXRNaXhpbiBdLFxyXG4gICAgfSk7XHJcblxyXG59KShqUXVlcnksIFZ1ZSwgQ29yZSk7XHJcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUpIHtcclxuICAgIFxyXG4gICAgVnVlLmNvbXBvbmVudCgnZGVmYXVsdC1yaWNoJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI2RlZmF1bHQtcmljaCcsXHJcbiAgICAgICAgbWl4aW5zOiBbIENvcmUuV2lkZ2V0TWl4aW4gXVxyXG4gICAgfSk7XHJcblxyXG59KShqUXVlcnksIFZ1ZSwgQ29yZSk7XHJcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUpIHtcclxuXHJcbiAgICBWdWUuY29tcG9uZW50KCdkZWZhdWx0LXNpdGVtYXAnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjZGVmYXVsdC1zaXRlbWFwJyxcclxuICAgICAgICBtaXhpbnM6IFsgQ29yZS5XaWRnZXRNaXhpbiBdXHJcbiAgICB9KTtcclxuXHJcbn0pKGpRdWVyeSwgVnVlLCBDb3JlKTtcclxuIiwiU2hlbGwgPSB3aW5kb3cuU2hlbGwgfHwge307XHJcblxyXG4oZnVuY3Rpb24oJCwgVnVlLCBDb3JlLCBTaGVsbCwgdW5kZWZpbmVkKSB7XHJcbiAgICBcclxuICAgIFZ1ZS5jb21wb25lbnQoJ2RlZmF1bHQtc3RhY2stY2FudmFzJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI2RlZmF1bHQtc3RhY2stY2FudmFzJyxcclxuICAgICAgICBtaXhpbnM6IFsgQ29yZS5TdGFja2VkTWl4aW4gXSxcclxuICAgIH0pO1xyXG5cclxuICAgIFZ1ZS5jb21wb25lbnQoJ2RlZmF1bHQtc3RhY2staG9yaXNvbnRhbCcsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNkZWZhdWx0LXN0YWNrLWhvcmlzb250YWwnLFxyXG4gICAgICAgIG1peGluczogWyBDb3JlLldpZGdldE1peGluLCBDb3JlLlN0YWNrZWRNaXhpbiBdLFxyXG4gICAgfSk7XHJcblxyXG4gICAgVnVlLmNvbXBvbmVudCgnZGVmYXVsdC1zdGFjay12ZXJ0aWNhbCcsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNkZWZhdWx0LXN0YWNrLXZlcnRpY2FsJyxcclxuICAgICAgICBtaXhpbnM6IFsgQ29yZS5XaWRnZXRNaXhpbiwgQ29yZS5TdGFja2VkTWl4aW4gXSxcclxuICAgIH0pO1xyXG5cclxufSkoalF1ZXJ5LCBWdWUsIENvcmUsIFNoZWxsKTtcclxuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSkge1xyXG5cclxuICAgIFZ1ZS5jb21wb25lbnQoJ2RlZmF1bHQtc3R1YicsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNkZWZhdWx0LXN0dWInLFxyXG4gICAgICAgIG1peGluczogWyBDb3JlLldpZGdldE1peGluIF0sXHJcbiAgICB9KTtcclxuXHJcbn0pKGpRdWVyeSwgVnVlLCBDb3JlKTtcclxuIiwiQ29yZSA9IHdpbmRvdy5Db3JlIHx8IHt9O1xyXG5cclxuKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSkge1xyXG5cclxuICAgIFZ1ZS5jb21wb25lbnQoJ2RlZmF1bHQtdGFibGUnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjZGVmYXVsdC10YWJsZScsXHJcbiAgICAgICAgbWl4aW5zOiBbIENvcmUuV2lkZ2V0TWl4aW4gXVxyXG4gICAgfSk7XHJcblxyXG59KShqUXVlcnksIFZ1ZSwgQ29yZSk7XHJcbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
