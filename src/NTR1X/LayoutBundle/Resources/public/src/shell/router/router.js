(function(Vue, $) {

    Vue.component('shell-router', {
        template: '#shell-router',
        props: {
            selection: Object,
            settings: Object,
            model: Object,
        },
        data: function() {

            return {
                page: this.page,
                globals: this.globals,
            };
        },
        created: function() {

            this.$set('globals', {
                selection: this.selection,
                settings: this.settings,
                model: this.model,
            });

            // this.$set('page', {
            //
            // });

            // for (var i = 0; i < )
            //
            //
            // <shell-page
            //     :globals.sync="globals"
            //     :settings.sync="settings"
            //     :page.sync="page"
            //     :items.sync="page.widgets"
            // ></shell-page>
        },
        methods: {

            getWidget: function(id) {

                for (var i = 0; i < this.settings.widgets.length; i++) {
                    var w = this.settings.widgets[i];
                    if (w.id == id) {
                        return w;
                    }
                }

                return null;
            },
        },
        events: {
            selectPage: function(data) {
                this.selection.page = data.item;
            },
        }
    });

})(Vue, jQuery, undefined);
