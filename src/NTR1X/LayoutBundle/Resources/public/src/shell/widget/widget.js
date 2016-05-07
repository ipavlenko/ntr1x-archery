Shell = window.Shell || {};
Shell.Widgets = window.Shell.Widgets || {};

(function($, Vue, Shell, undefined) {

    Shell.Widget =
    Vue.component('shell-widget', {
        template: '#shell-widget',
        props: {
            globals: Object,
            settings: Object,
            page: Object,
            stack: Object,
            data: Object,
        },
        ready: function() {

            this.widget = Shell.Services.Layout.getWidget(this.data.type);

            var self = this;

            this.$watch('data.params', function(params) {

                function recur(params) {

                    var value = {};

                    for(var key in params) {

                        if (params[key]['binding']) {

                            value[key] = self.$interpolate(params[key]['binding']);

                        } else if ($.isArray(params[key]['value'])) {

                            value[key] = [];

                            for(var i = 0; i < params[key]['value'].length; i++) {
                                value[key][i] = recur(params[key]['value'][i]);
                            }

                        } else {
                            value[key] = params[key]['value'];
                        }
                    }

                    return value;
                }

                self.bindings = recur(self.data.params);

            }, {
              deep: true,
              immediate: true,
            });
        },
        data: function() {

            return {
                widget: this.widget,
                bindings: this.bindings,
            };
        },
        methods: {

            doApply: function(model) {

                Object.assign(this.data, JSON.parse(JSON.stringify(model)), {
                    _action: this.data._action
                        ? this.data._action
                        : 'update'
                });

                $(window).trigger('resize');
            },

            showSettings: function() {

                var dialog = new Shell.Widgets.ModalEditor({

                    data: {
                        globals: this.globals,
                        owner: this,
                        context: {
                            widget: this.widget
                        },
                        original: this.data,
                        current: JSON.parse(JSON.stringify(this.data))
                    },

                    methods: {
                        submit: function() {
                            this.owner.doApply(this.current);
                            this.$remove();
                            this.$destroy();
                        },
                        reset: function() {
                            this.$remove();
                            this.$destroy();
                        }
                    }
                }).$mount().$appendTo($('body').get(0));
            },

            removeWidget: function() {
                this.$dispatch('removeWidget', { item: this.data });
            }
        }
    });

})(jQuery, Vue, Shell);
