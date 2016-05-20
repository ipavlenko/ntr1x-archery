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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJveC9ib3guanMiLCJidXR0b24vYnV0dG9uLmpzIiwiY2Fyb3VzZWwvY2Fyb3VzZWwuanMiLCJmb290ZXIvZm9vdGVyLmpzIiwiZ2FsbGVyeS9nYWxsZXJ5LmpzIiwiaGVhZGVyL2hlYWRlci5qcyIsIm5hdi9uYXYuanMiLCJpbnB1dC9pbnB1dC5qcyIsInBsYWNlaG9sZGVyL3BsYWNlaG9sZGVyLmpzIiwic3RhY2svc3RhY2suanMiLCJzaXRlbWFwL3NpdGVtYXAuanMiLCJzdHViL3N0dWIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM3REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoic2NyaXB0cy5qcyIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigkLCBWdWUsIENvcmUpIHtcclxuXHJcbiAgICBWdWUuY29tcG9uZW50KCdkZWZhdWx0LWJveCcsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNkZWZhdWx0LWJveCcsXHJcbiAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgYmluZGluZ3M6IE9iamVjdCxcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbn0pKGpRdWVyeSwgVnVlLCBDb3JlKTtcclxuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSkge1xyXG5cclxuICAgIFZ1ZS5jb21wb25lbnQoJ2RlZmF1bHQtYnV0dG9uJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI2RlZmF1bHQtYnV0dG9uJyxcclxuICAgICAgICBtaXhpbnM6IFsgQ29yZS5XaWRnZXRNaXhpbiBdLFxyXG4gICAgfSk7XHJcblxyXG59KShqUXVlcnksIFZ1ZSwgQ29yZSk7XHJcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUpIHtcclxuXHJcbiAgICBWdWUuY29tcG9uZW50KCdkZWZhdWx0LWNhcm91c2VsJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI2RlZmF1bHQtY2Fyb3VzZWwnLFxyXG4gICAgICAgIG1peGluczogWyBDb3JlLldpZGdldE1peGluIF0sXHJcbiAgICB9KTtcclxuXHJcbn0pKGpRdWVyeSwgVnVlLCBDb3JlKTtcclxuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSkge1xyXG5cclxuICAgIFZ1ZS5jb21wb25lbnQoJ2RlZmF1bHQtZm9vdGVyJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI2RlZmF1bHQtZm9vdGVyJyxcclxuICAgICAgICBtaXhpbnM6IFsgQ29yZS5XaWRnZXRNaXhpbiBdLFxyXG4gICAgfSk7XHJcblxyXG59KShqUXVlcnksIFZ1ZSwgQ29yZSk7XHJcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUpIHtcclxuXHJcbiAgICBWdWUuY29tcG9uZW50KCdkZWZhdWx0LWdhbGxlcnknLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjZGVmYXVsdC1nYWxsZXJ5JyxcclxuICAgICAgICBtaXhpbnM6IFsgQ29yZS5XaWRnZXRNaXhpbiBdLFxyXG5cclxuICAgICAgICBkYXRhOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIG1hdHJpeDogdGhpcy5tYXRyaXgsXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBjcmVhdGVkOiBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuJHdhdGNoKCdiaW5kaW5ncycsIHVwZGF0ZU1hdHJpeC5iaW5kKHRoaXMpLCB7IGltbWVkaWF0ZTogdHJ1ZSwgZGVlcDogdHJ1ZSB9KTtcclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIHVwZGF0ZU1hdHJpeChiaW5kaW5ncykge1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdjcmVhdGVkJyk7XHJcbiAgICAgICAgICAgICAgICB2YXIgaXRlbXMgPSBiaW5kaW5ncy5pdGVtcyB8fCBbXTtcclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgcm93cyA9IHBhcnNlSW50KGJpbmRpbmdzLnJvd3MpO1xyXG4gICAgICAgICAgICAgICAgcm93cyA9IHJvd3MgPiAwID8gcm93cyA6IDE7XHJcblxyXG4gICAgICAgICAgICAgICAgdmFyIGNvbHMgPSBwYXJzZUludChiaW5kaW5ncy5jb2xzKTtcclxuICAgICAgICAgICAgICAgIGNvbHMgPSBjb2xzID4gMCA/IGNvbHMgOiAzO1xyXG5cclxuICAgICAgICAgICAgICAgIHZhciBjZWxscyA9IHJvd3MgKiBjb2xzO1xyXG5cclxuICAgICAgICAgICAgICAgIHZhciBkaXYgPSBwYXJzZUludChpdGVtcy5sZW5ndGggLyBjZWxscyk7XHJcbiAgICAgICAgICAgICAgICB2YXIgbW9kID0gaXRlbXMubGVuZ3RoICUgY2VsbHM7XHJcblxyXG4gICAgICAgICAgICAgICAgdmFyIGNvdW50ID0gKG1vZCA+IDAgfHwgZGl2ID09IDApXHJcbiAgICAgICAgICAgICAgICAgICAgPyBkaXYgKyAxXHJcbiAgICAgICAgICAgICAgICAgICAgOiBkaXZcclxuICAgICAgICAgICAgICAgIDtcclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgbWF0cml4ID0gW107XHJcblxyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgcCA9IDA7IHAgPCBjb3VudDsgcCsrKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHZhciBwZCA9IFtdO1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIHIgPSAwOyByIDwgcm93czsgcisrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciByZCA9IFtdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBjID0gMDsgYyA8IGNvbHM7IGMrKykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGluZGV4ID0gKHAgKiByb3dzICsgcikgKiBjb2xzICsgYztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpbmRleCA8IGl0ZW1zLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJkLnB1c2goaXRlbXNbaW5kZXhdKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwZC5wdXNoKHJkKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgbWF0cml4LnB1c2gocGQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMubWF0cml4ID0gbWF0cml4O1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxufSkoalF1ZXJ5LCBWdWUsIENvcmUpO1xyXG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlKSB7XHJcblxyXG4gICAgVnVlLmNvbXBvbmVudCgnZGVmYXVsdC1oZWFkZXInLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjZGVmYXVsdC1oZWFkZXInLFxyXG4gICAgICAgIG1peGluczogWyBDb3JlLldpZGdldE1peGluIF0sXHJcbiAgICB9KTtcclxuXHJcbn0pKGpRdWVyeSwgVnVlLCBDb3JlKTtcclxuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSkge1xyXG5cclxuICAgIHZhciBOYXYgPSB7XHJcbiAgICAgICAgbWV0aG9kczoge1xyXG4gICAgICAgICAgICBzZXRBY3RpdmU6IGZ1bmN0aW9uKGFjdGl2ZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5iaW5kaW5ncy5hY3RpdmUgPSBhY3RpdmU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgfTtcclxuXHJcbiAgICBWdWUuY29tcG9uZW50KCdkZWZhdWx0LW5hdi1ob3Jpc29udGFsJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI2RlZmF1bHQtbmF2LWhvcmlzb250YWwnLFxyXG4gICAgICAgIG1peGluczogWyBDb3JlLldpZGdldE1peGluLCBOYXYgXSxcclxuICAgIH0pO1xyXG5cclxuICAgIFZ1ZS5jb21wb25lbnQoJ2RlZmF1bHQtbmF2LXZlcnRpY2FsJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI2RlZmF1bHQtbmF2LXZlcnRpY2FsJyxcclxuICAgICAgICBtaXhpbnM6IFsgQ29yZS5XaWRnZXRNaXhpbiwgTmF2IF0sXHJcbiAgICB9KTtcclxuXHJcbn0pKGpRdWVyeSwgVnVlLCBDb3JlKTtcclxuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSkge1xyXG5cclxuICAgIFZ1ZS5jb21wb25lbnQoJ2RlZmF1bHQtaW5wdXQtdGV4dCcsIHtcclxuICAgICAgICB0ZW1wbGF0ZTogJyNkZWZhdWx0LWlucHV0LXRleHQnLFxyXG4gICAgICAgIG1peGluczogWyBDb3JlLldpZGdldE1peGluIF0sXHJcbiAgICB9KTtcclxuXHJcbiAgICBWdWUuY29tcG9uZW50KCdkZWZhdWx0LWlucHV0LXRleHRhcmVhJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI2RlZmF1bHQtaW5wdXQtdGV4dGFyZWEnLFxyXG4gICAgICAgIG1peGluczogWyBDb3JlLldpZGdldE1peGluIF0sXHJcbiAgICB9KTtcclxuXHJcbiAgICBWdWUuY29tcG9uZW50KCdkZWZhdWx0LWlucHV0LWNoZWNrYm94Jywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI2RlZmF1bHQtaW5wdXQtY2hlY2tib3gnLFxyXG4gICAgICAgIG1peGluczogWyBDb3JlLldpZGdldE1peGluIF0sXHJcbiAgICB9KTtcclxuXHJcbiAgICBWdWUuY29tcG9uZW50KCdkZWZhdWx0LWlucHV0LXJhZGlvJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI2RlZmF1bHQtaW5wdXQtcmFkaW8nLFxyXG4gICAgICAgIG1peGluczogWyBDb3JlLldpZGdldE1peGluIF0sXHJcbiAgICB9KTtcclxuXHJcbn0pKGpRdWVyeSwgVnVlLCBDb3JlKTtcclxuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSkge1xyXG5cclxuICAgIFZ1ZS5jb21wb25lbnQoJ2RlZmF1bHQtcGxhY2Vob2xkZXInLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjZGVmYXVsdC1wbGFjZWhvbGRlcicsXHJcbiAgICAgICAgbWl4aW5zOiBbIENvcmUuV2lkZ2V0TWl4aW4gXSxcclxuICAgIH0pO1xyXG5cclxufSkoalF1ZXJ5LCBWdWUsIENvcmUpO1xyXG4iLCJTaGVsbCA9IHdpbmRvdy5TaGVsbCB8fCB7fTtcclxuXHJcbihmdW5jdGlvbigkLCBWdWUsIENvcmUsIFNoZWxsLCB1bmRlZmluZWQpIHtcclxuICAgIFxyXG4gICAgVnVlLmNvbXBvbmVudCgnZGVmYXVsdC1zdGFjay1jYW52YXMnLCB7XHJcbiAgICAgICAgdGVtcGxhdGU6ICcjZGVmYXVsdC1zdGFjay1jYW52YXMnLFxyXG4gICAgICAgIG1peGluczogWyBDb3JlLlN0YWNrZWRNaXhpbiBdLFxyXG4gICAgfSk7XHJcblxyXG4gICAgVnVlLmNvbXBvbmVudCgnZGVmYXVsdC1zdGFjay1ob3Jpc29udGFsJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI2RlZmF1bHQtc3RhY2staG9yaXNvbnRhbCcsXHJcbiAgICAgICAgbWl4aW5zOiBbIENvcmUuV2lkZ2V0TWl4aW4sIENvcmUuU3RhY2tlZE1peGluIF0sXHJcbiAgICB9KTtcclxuXHJcbiAgICBWdWUuY29tcG9uZW50KCdkZWZhdWx0LXN0YWNrLXZlcnRpY2FsJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI2RlZmF1bHQtc3RhY2stdmVydGljYWwnLFxyXG4gICAgICAgIG1peGluczogWyBDb3JlLldpZGdldE1peGluLCBDb3JlLlN0YWNrZWRNaXhpbiBdLFxyXG4gICAgfSk7XHJcblxyXG59KShqUXVlcnksIFZ1ZSwgQ29yZSwgU2hlbGwpO1xyXG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlKSB7XHJcblxyXG4gICAgVnVlLmNvbXBvbmVudCgnZGVmYXVsdC1zaXRlbWFwJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI2RlZmF1bHQtc2l0ZW1hcCcsXHJcbiAgICAgICAgbWl4aW5zOiBbIENvcmUuV2lkZ2V0TWl4aW4gXSxcclxuICAgIH0pO1xyXG5cclxufSkoalF1ZXJ5LCBWdWUsIENvcmUpO1xyXG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlKSB7XHJcblxyXG4gICAgVnVlLmNvbXBvbmVudCgnZGVmYXVsdC1zdHViJywge1xyXG4gICAgICAgIHRlbXBsYXRlOiAnI2RlZmF1bHQtc3R1YicsXHJcbiAgICAgICAgbWl4aW5zOiBbIENvcmUuV2lkZ2V0TWl4aW4gXSxcclxuICAgIH0pO1xyXG5cclxufSkoalF1ZXJ5LCBWdWUsIENvcmUpO1xyXG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
