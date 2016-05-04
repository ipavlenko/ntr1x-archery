(function($,Vue, undefined) {

    Vue.component('shell-widget', {
        template: '#shell-widget',
        props: {
            globals: Object,
            settings: Object,
            page: Object,
            data: Object,
        },
        ready: function() {

            var bindings = null;
            var widget = null;

            // TODO Evaluate

            for (var i = 0; i < this.settings.widgets.length; i++) {
                var w = this.settings.widgets[i];
                if (w.id == this.data.type) {
                    widget = w;
                    break;
                }
            }

            this.bindings = bindings;
            this.widget = widget;
        },
        data: function() {

            return {
                widget: this.widget,
                bindings: this.bindings,
            };
        },
        methods: {
            showSettings: function() {
                console.log('settings');
            }
        }
    });

})(jQuery, Vue);
