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

    Vue.component('default-combobox', {
        template: '#default-combobox',
        mixins: [ Core.WidgetMixin ],
        ready: function () {
            $('.combobox').combobox();
        }
    });

})(jQuery, Vue, Core);

(function($, Vue, Core) {

    Vue.component('default-datepicker', {
        template: '#default-datepicker',
        mixins: [ Core.WidgetMixin ],
        ready: function () {

            $('.datepicker').datetimepicker({
                format: this.bindings.format
            });
        }
    });

    Vue.component('default-dateinterval', {
        template: '#default-dateinterval',
        mixins: [ Core.WidgetMixin ],
        ready: function () {

            start = '#'+this.systemId+'-start';
            end = '#'+this.systemId+'-end';

            $(start).datetimepicker();
            $(end).datetimepicker({
                useCurrent: false //Important! See issue #1075
            });
            $(start).on("dp.change", function (e) {
                $(end).data("DateTimePicker").minDate(e.date);
            });
            $(end).on("dp.change", function (e) {
                $(start).data("DateTimePicker").maxDate(e.date);
            });
        }
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
        created: function() {
            // console.log('model', this.bindings);
            // console.log('storage', this.storage.one);
        }
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

    Vue.component('default-inputrange', {
        template: '#default-inputrange',
        mixins: [ Core.WidgetMixin ],
        ready: function () {
            id = "#"+this.systemId;
            $(id).slider({});
        }
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

    Vue.component('default-select', {
        template: '#default-select',
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJveC9ib3guanMiLCJidXR0b24vYnV0dG9uLmpzIiwiY2Fyb3VzZWwvY2Fyb3VzZWwuanMiLCJjb21ib2JveC9jb21ib2JveC5qcyIsImRhdGVwaWNrZXIvZGF0ZXBpY2tlci5qcyIsImZvb3Rlci9mb290ZXIuanMiLCJmb3JtL2Zvcm0uanMiLCJnYWxsZXJ5L2dhbGxlcnkuanMiLCJoMS1oNi9oMS1oNi5qcyIsImhlYWRlci9oZWFkZXIuanMiLCJpbnB1dC9pbnB1dC5qcyIsImlucHV0cmFuZ2UvaW5wdXRyYW5nZS5qcyIsIml0ZW1zL2l0ZW1zLmpzIiwibmF2L25hdi5qcyIsInBsYWNlaG9sZGVyL3BsYWNlaG9sZGVyLmpzIiwicmljaC9yaWNoLmpzIiwic2VsZWN0L3NlbGVjdC5qcyIsInNpdGVtYXAvc2l0ZW1hcC5qcyIsInN0YWNrL3N0YWNrLmpzIiwic3R1Yi9zdHViLmpzIiwidGFibGUvdGFibGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDN0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJzY3JpcHRzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSkge1xuXG4gICAgVnVlLmNvbXBvbmVudCgnZGVmYXVsdC1ib3gnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI2RlZmF1bHQtYm94JyxcbiAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICAgIGJpbmRpbmdzOiBPYmplY3QsXG4gICAgICAgICAgICBjbGFzczogU3RyaW5nLFxuICAgICAgICB9XG4gICAgfSk7XG5cbn0pKGpRdWVyeSwgVnVlLCBDb3JlKTtcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUpIHtcblxuICAgIFZ1ZS5jb21wb25lbnQoJ2RlZmF1bHQtYnV0dG9uJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNkZWZhdWx0LWJ1dHRvbicsXG4gICAgICAgIG1peGluczogWyBDb3JlLldpZGdldE1peGluIF0sXG4gICAgfSk7XG5cbn0pKGpRdWVyeSwgVnVlLCBDb3JlKTtcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUpIHtcblxuICAgIFZ1ZS5jb21wb25lbnQoJ2RlZmF1bHQtY2Fyb3VzZWwnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI2RlZmF1bHQtY2Fyb3VzZWwnLFxuICAgICAgICBtaXhpbnM6IFsgQ29yZS5XaWRnZXRNaXhpbiBdLFxuICAgIH0pO1xuXG59KShqUXVlcnksIFZ1ZSwgQ29yZSk7XG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlKSB7XG5cbiAgICBWdWUuY29tcG9uZW50KCdkZWZhdWx0LWNvbWJvYm94Jywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNkZWZhdWx0LWNvbWJvYm94JyxcbiAgICAgICAgbWl4aW5zOiBbIENvcmUuV2lkZ2V0TWl4aW4gXSxcbiAgICAgICAgcmVhZHk6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICQoJy5jb21ib2JveCcpLmNvbWJvYm94KCk7XG4gICAgICAgIH1cbiAgICB9KTtcblxufSkoalF1ZXJ5LCBWdWUsIENvcmUpO1xuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSkge1xuXG4gICAgVnVlLmNvbXBvbmVudCgnZGVmYXVsdC1kYXRlcGlja2VyJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNkZWZhdWx0LWRhdGVwaWNrZXInLFxuICAgICAgICBtaXhpbnM6IFsgQ29yZS5XaWRnZXRNaXhpbiBdLFxuICAgICAgICByZWFkeTogZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgICAkKCcuZGF0ZXBpY2tlcicpLmRhdGV0aW1lcGlja2VyKHtcbiAgICAgICAgICAgICAgICBmb3JtYXQ6IHRoaXMuYmluZGluZ3MuZm9ybWF0XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgVnVlLmNvbXBvbmVudCgnZGVmYXVsdC1kYXRlaW50ZXJ2YWwnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI2RlZmF1bHQtZGF0ZWludGVydmFsJyxcbiAgICAgICAgbWl4aW5zOiBbIENvcmUuV2lkZ2V0TWl4aW4gXSxcbiAgICAgICAgcmVhZHk6IGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAgICAgc3RhcnQgPSAnIycrdGhpcy5zeXN0ZW1JZCsnLXN0YXJ0JztcbiAgICAgICAgICAgIGVuZCA9ICcjJyt0aGlzLnN5c3RlbUlkKyctZW5kJztcblxuICAgICAgICAgICAgJChzdGFydCkuZGF0ZXRpbWVwaWNrZXIoKTtcbiAgICAgICAgICAgICQoZW5kKS5kYXRldGltZXBpY2tlcih7XG4gICAgICAgICAgICAgICAgdXNlQ3VycmVudDogZmFsc2UgLy9JbXBvcnRhbnQhIFNlZSBpc3N1ZSAjMTA3NVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAkKHN0YXJ0KS5vbihcImRwLmNoYW5nZVwiLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgICQoZW5kKS5kYXRhKFwiRGF0ZVRpbWVQaWNrZXJcIikubWluRGF0ZShlLmRhdGUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAkKGVuZCkub24oXCJkcC5jaGFuZ2VcIiwgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICAkKHN0YXJ0KS5kYXRhKFwiRGF0ZVRpbWVQaWNrZXJcIikubWF4RGF0ZShlLmRhdGUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9KTtcblxufSkoalF1ZXJ5LCBWdWUsIENvcmUpO1xuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSkge1xuXG4gICAgVnVlLmNvbXBvbmVudCgnZGVmYXVsdC1mb290ZXInLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI2RlZmF1bHQtZm9vdGVyJyxcbiAgICAgICAgbWl4aW5zOiBbIENvcmUuV2lkZ2V0TWl4aW4gXSxcbiAgICB9KTtcblxufSkoalF1ZXJ5LCBWdWUsIENvcmUpO1xuIiwiQ29yZSA9IHdpbmRvdy5Db3JlIHx8IHt9O1xuXG4oZnVuY3Rpb24oJCwgVnVlLCBDb3JlKSB7XG5cbiAgICBWdWUuY29tcG9uZW50KCdkZWZhdWx0LWZvcm0nLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI2RlZmF1bHQtZm9ybScsXG4gICAgICAgIG1peGluczogWyBDb3JlLldpZGdldE1peGluIF1cbiAgICB9KTtcblxufSkoalF1ZXJ5LCBWdWUsIENvcmUpO1xuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSkge1xuXG4gICAgVnVlLmNvbXBvbmVudCgnZGVmYXVsdC1nYWxsZXJ5Jywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNkZWZhdWx0LWdhbGxlcnknLFxuICAgICAgICBtaXhpbnM6IFsgQ29yZS5XaWRnZXRNaXhpbiBdLFxuXG4gICAgICAgIGRhdGE6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBtYXRyaXg6IHRoaXMubWF0cml4LFxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGNyZWF0ZWQ6IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICB0aGlzLiR3YXRjaCgnYmluZGluZ3MnLCB1cGRhdGVNYXRyaXguYmluZCh0aGlzKSwgeyBpbW1lZGlhdGU6IHRydWUsIGRlZXA6IHRydWUgfSk7XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIHVwZGF0ZU1hdHJpeChiaW5kaW5ncykge1xuXG4gICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ2NyZWF0ZWQnKTtcbiAgICAgICAgICAgICAgICB2YXIgaXRlbXMgPSBiaW5kaW5ncy5pdGVtcyB8fCBbXTtcblxuICAgICAgICAgICAgICAgIHZhciByb3dzID0gcGFyc2VJbnQoYmluZGluZ3Mucm93cyk7XG4gICAgICAgICAgICAgICAgcm93cyA9IHJvd3MgPiAwID8gcm93cyA6IDE7XG5cbiAgICAgICAgICAgICAgICB2YXIgY29scyA9IHBhcnNlSW50KGJpbmRpbmdzLmNvbHMpO1xuICAgICAgICAgICAgICAgIGNvbHMgPSBjb2xzID4gMCA/IGNvbHMgOiAzO1xuXG4gICAgICAgICAgICAgICAgdmFyIGNlbGxzID0gcm93cyAqIGNvbHM7XG5cbiAgICAgICAgICAgICAgICB2YXIgZGl2ID0gcGFyc2VJbnQoaXRlbXMubGVuZ3RoIC8gY2VsbHMpO1xuICAgICAgICAgICAgICAgIHZhciBtb2QgPSBpdGVtcy5sZW5ndGggJSBjZWxscztcblxuICAgICAgICAgICAgICAgIHZhciBjb3VudCA9IChtb2QgPiAwIHx8IGRpdiA9PSAwKVxuICAgICAgICAgICAgICAgICAgICA/IGRpdiArIDFcbiAgICAgICAgICAgICAgICAgICAgOiBkaXZcbiAgICAgICAgICAgICAgICA7XG5cbiAgICAgICAgICAgICAgICB2YXIgbWF0cml4ID0gW107XG5cbiAgICAgICAgICAgICAgICBmb3IgKHZhciBwID0gMDsgcCA8IGNvdW50OyBwKyspIHtcblxuICAgICAgICAgICAgICAgICAgICB2YXIgcGQgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgciA9IDA7IHIgPCByb3dzOyByKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciByZCA9IFtdO1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgYyA9IDA7IGMgPCBjb2xzOyBjKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgaW5kZXggPSAocCAqIHJvd3MgKyByKSAqIGNvbHMgKyBjO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpbmRleCA8IGl0ZW1zLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZC5wdXNoKGl0ZW1zW2luZGV4XSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgcGQucHVzaChyZCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgbWF0cml4LnB1c2gocGQpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHRoaXMubWF0cml4ID0gbWF0cml4O1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG59KShqUXVlcnksIFZ1ZSwgQ29yZSk7XG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlKSB7XG5cbiAgICBWdWUuY29tcG9uZW50KCdkZWZhdWx0LWgxLWg2Jywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNkZWZhdWx0LWgxLWg2JyxcbiAgICAgICAgbWl4aW5zOiBbIENvcmUuV2lkZ2V0TWl4aW4gXSxcbiAgICB9KTtcblxufSkoalF1ZXJ5LCBWdWUsIENvcmUpO1xuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSkge1xuXG4gICAgVnVlLmNvbXBvbmVudCgnZGVmYXVsdC1oZWFkZXInLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI2RlZmF1bHQtaGVhZGVyJyxcbiAgICAgICAgbWl4aW5zOiBbIENvcmUuV2lkZ2V0TWl4aW4gXSxcbiAgICB9KTtcblxufSkoalF1ZXJ5LCBWdWUsIENvcmUpO1xuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSkge1xuXG4gICAgVnVlLmNvbXBvbmVudCgnZGVmYXVsdC1pbnB1dC10ZXh0Jywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNkZWZhdWx0LWlucHV0LXRleHQnLFxuICAgICAgICBtaXhpbnM6IFsgQ29yZS5XaWRnZXRNaXhpbiBdLFxuICAgICAgICBjcmVhdGVkOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdtb2RlbCcsIHRoaXMuYmluZGluZ3MpO1xuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ3N0b3JhZ2UnLCB0aGlzLnN0b3JhZ2Uub25lKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgVnVlLmNvbXBvbmVudCgnZGVmYXVsdC1pbnB1dC10ZXh0YXJlYScsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjZGVmYXVsdC1pbnB1dC10ZXh0YXJlYScsXG4gICAgICAgIG1peGluczogWyBDb3JlLldpZGdldE1peGluIF0sXG4gICAgfSk7XG5cbiAgICBWdWUuY29tcG9uZW50KCdkZWZhdWx0LWlucHV0LWNoZWNrYm94Jywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNkZWZhdWx0LWlucHV0LWNoZWNrYm94JyxcbiAgICAgICAgbWl4aW5zOiBbIENvcmUuV2lkZ2V0TWl4aW4gXSxcbiAgICB9KTtcblxuICAgIFZ1ZS5jb21wb25lbnQoJ2RlZmF1bHQtaW5wdXQtcmFkaW8nLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI2RlZmF1bHQtaW5wdXQtcmFkaW8nLFxuICAgICAgICBtaXhpbnM6IFsgQ29yZS5XaWRnZXRNaXhpbiBdLFxuICAgIH0pO1xuXG59KShqUXVlcnksIFZ1ZSwgQ29yZSk7XG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlKSB7XG5cbiAgICBWdWUuY29tcG9uZW50KCdkZWZhdWx0LWlucHV0cmFuZ2UnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI2RlZmF1bHQtaW5wdXRyYW5nZScsXG4gICAgICAgIG1peGluczogWyBDb3JlLldpZGdldE1peGluIF0sXG4gICAgICAgIHJlYWR5OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZCA9IFwiI1wiK3RoaXMuc3lzdGVtSWQ7XG4gICAgICAgICAgICAkKGlkKS5zbGlkZXIoe30pO1xuICAgICAgICB9XG4gICAgfSk7XG5cbn0pKGpRdWVyeSwgVnVlLCBDb3JlKTtcbiIsIkNvcmUgPSB3aW5kb3cuQ29yZSB8fCB7fTtcblxuKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSkge1xuXG4gICAgVnVlLmNvbXBvbmVudCgnZGVmYXVsdC1pdGVtcycsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjZGVmYXVsdC1pdGVtcycsXG4gICAgICAgIG1peGluczogWyBDb3JlLldpZGdldE1peGluIF1cbiAgICB9KTtcblxuICAgIFZ1ZS5jb21wb25lbnQoJ2RlZmF1bHQtbWVkaWEtaG9yaXNvbnRhbCcsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjZGVmYXVsdC1tZWRpYS1ob3Jpc29udGFsJyxcbiAgICAgICAgbWl4aW5zOiBbIENvcmUuV2lkZ2V0TWl4aW4gXVxuICAgIH0pO1xuXG59KShqUXVlcnksIFZ1ZSwgQ29yZSk7XG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlKSB7XG5cbiAgICB2YXIgTmF2ID0ge1xuICAgICAgICBtZXRob2RzOiB7XG4gICAgICAgICAgICBzZXRBY3RpdmU6IGZ1bmN0aW9uKGFjdGl2ZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuYmluZGluZ3MuYWN0aXZlID0gYWN0aXZlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgIH07XG5cbiAgICBWdWUuY29tcG9uZW50KCdkZWZhdWx0LW5hdi1ob3Jpc29udGFsJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNkZWZhdWx0LW5hdi1ob3Jpc29udGFsJyxcbiAgICAgICAgbWl4aW5zOiBbIENvcmUuV2lkZ2V0TWl4aW4sIE5hdiBdLFxuICAgIH0pO1xuXG4gICAgVnVlLmNvbXBvbmVudCgnZGVmYXVsdC1uYXYtdmVydGljYWwnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI2RlZmF1bHQtbmF2LXZlcnRpY2FsJyxcbiAgICAgICAgbWl4aW5zOiBbIENvcmUuV2lkZ2V0TWl4aW4sIE5hdiBdLFxuICAgIH0pO1xuXG59KShqUXVlcnksIFZ1ZSwgQ29yZSk7XG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlKSB7XG5cbiAgICBWdWUuY29tcG9uZW50KCdkZWZhdWx0LXBsYWNlaG9sZGVyJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNkZWZhdWx0LXBsYWNlaG9sZGVyJyxcbiAgICAgICAgbWl4aW5zOiBbIENvcmUuV2lkZ2V0TWl4aW4gXSxcbiAgICB9KTtcblxufSkoalF1ZXJ5LCBWdWUsIENvcmUpO1xuIiwiKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSkge1xuICAgIFxuICAgIFZ1ZS5jb21wb25lbnQoJ2RlZmF1bHQtcmljaCcsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjZGVmYXVsdC1yaWNoJyxcbiAgICAgICAgbWl4aW5zOiBbIENvcmUuV2lkZ2V0TWl4aW4gXVxuICAgIH0pO1xuXG59KShqUXVlcnksIFZ1ZSwgQ29yZSk7XG4iLCIoZnVuY3Rpb24oJCwgVnVlLCBDb3JlKSB7XG5cbiAgICBWdWUuY29tcG9uZW50KCdkZWZhdWx0LXNlbGVjdCcsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjZGVmYXVsdC1zZWxlY3QnLFxuICAgICAgICBtaXhpbnM6IFsgQ29yZS5XaWRnZXRNaXhpbiBdXG4gICAgfSk7XG5cbn0pKGpRdWVyeSwgVnVlLCBDb3JlKTtcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUpIHtcblxuICAgIFZ1ZS5jb21wb25lbnQoJ2RlZmF1bHQtc2l0ZW1hcCcsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjZGVmYXVsdC1zaXRlbWFwJyxcbiAgICAgICAgbWl4aW5zOiBbIENvcmUuV2lkZ2V0TWl4aW4gXVxuICAgIH0pO1xuXG59KShqUXVlcnksIFZ1ZSwgQ29yZSk7XG4iLCJTaGVsbCA9IHdpbmRvdy5TaGVsbCB8fCB7fTtcblxuKGZ1bmN0aW9uKCQsIFZ1ZSwgQ29yZSwgU2hlbGwsIHVuZGVmaW5lZCkge1xuICAgIFxuICAgIFZ1ZS5jb21wb25lbnQoJ2RlZmF1bHQtc3RhY2stY2FudmFzJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNkZWZhdWx0LXN0YWNrLWNhbnZhcycsXG4gICAgICAgIG1peGluczogWyBDb3JlLlN0YWNrZWRNaXhpbiBdLFxuICAgIH0pO1xuXG4gICAgVnVlLmNvbXBvbmVudCgnZGVmYXVsdC1zdGFjay1ob3Jpc29udGFsJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNkZWZhdWx0LXN0YWNrLWhvcmlzb250YWwnLFxuICAgICAgICBtaXhpbnM6IFsgQ29yZS5XaWRnZXRNaXhpbiwgQ29yZS5TdGFja2VkTWl4aW4gXSxcbiAgICB9KTtcblxuICAgIFZ1ZS5jb21wb25lbnQoJ2RlZmF1bHQtc3RhY2stdmVydGljYWwnLCB7XG4gICAgICAgIHRlbXBsYXRlOiAnI2RlZmF1bHQtc3RhY2stdmVydGljYWwnLFxuICAgICAgICBtaXhpbnM6IFsgQ29yZS5XaWRnZXRNaXhpbiwgQ29yZS5TdGFja2VkTWl4aW4gXSxcbiAgICB9KTtcblxufSkoalF1ZXJ5LCBWdWUsIENvcmUsIFNoZWxsKTtcbiIsIihmdW5jdGlvbigkLCBWdWUsIENvcmUpIHtcblxuICAgIFZ1ZS5jb21wb25lbnQoJ2RlZmF1bHQtc3R1YicsIHtcbiAgICAgICAgdGVtcGxhdGU6ICcjZGVmYXVsdC1zdHViJyxcbiAgICAgICAgbWl4aW5zOiBbIENvcmUuV2lkZ2V0TWl4aW4gXSxcbiAgICB9KTtcblxufSkoalF1ZXJ5LCBWdWUsIENvcmUpO1xuIiwiQ29yZSA9IHdpbmRvdy5Db3JlIHx8IHt9O1xuXG4oZnVuY3Rpb24oJCwgVnVlLCBDb3JlKSB7XG5cbiAgICBWdWUuY29tcG9uZW50KCdkZWZhdWx0LXRhYmxlJywge1xuICAgICAgICB0ZW1wbGF0ZTogJyNkZWZhdWx0LXRhYmxlJyxcbiAgICAgICAgbWl4aW5zOiBbIENvcmUuV2lkZ2V0TWl4aW4gXVxuICAgIH0pO1xuXG59KShqUXVlcnksIFZ1ZSwgQ29yZSk7XG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
