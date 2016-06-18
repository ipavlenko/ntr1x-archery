(function($, Vue, Shell, undefined) {

    Shell.Shell = {
        props: {
            settings: Object,
            model: Object,
        },
        data: function() {
            return {
                globals: this.globals,
            };
        },
        created: function() {

            Vue.service('shell', {

                getWidget: (id) => {

                    for (var i = 0; i < this.settings.widgets.length; i++) {
                        var w = this.settings.widgets[i];
                        if (w.id == id) {
                            return w;
                        }
                    }

                    return null;
                },
            });

            this.globals = {
                selection: {
                    category: null,
                    page: null,
                    source: null,
                    storage: null,
                },
                settings: this.settings,
                model: this.model,
            };
        },
    };

    Shell.ShellPublic =
    Vue.component('shell-public', {
        mixins: [ Shell.Shell ],
        template: '#shell-public',
    });

    Shell.ShellPrivate =
    Vue.component('shell-private', {

        mixins: [ Shell.Shell ],
        template: '#shell-private',

        created: function() {

            function relevant(current, collection) {

                if (!current || current._action == 'remove' || (collection && collection.indexOf(current) < 0)) {

                    if (collection) {
                        for (var i = 0; i < collection.length; i++) {
                            var c = collection[i];
                            if (c._action != 'remove') {
                                return c;
                            }
                        }
                    }

                    return null;
                }

                if (current && current._action == 'remove') {
                    return null;
                }

                return current;
            }

            this.$watch('settings.categories', (categories) => {

                var category = null;
                if (categories.length > 0) {
                    var sub = categories[0];
                    if (categories.length > 0) {
                        category = sub.categories[0];
                    }
                }
                this.globals.selection.category = category;
            }, {
                immediate: true,
            });

            this.$watch('model.domains', (domains) => {
                this.globals.selection.domain = relevant(this.globals.selection.domain, domains);
            }, {
                immediate: true,
            });

            this.$watch('model.pages', (pages) => {
                this.globals.selection.page = relevant(this.globals.selection.page, pages);
            }, {
                immediate: true,
            });

            this.$watch('globals.selection.page.sources', (sources) => {
                this.globals.selection.source = relevant(this.globals.selection.source, sources);
            }, {
                immediate: true,
            });

            this.$watch('globals.selection.page.storages', (storages) => {
                this.globals.selection.storage = relevant(this.globals.selection.storage, storages);
            }, {
                immediate: true,
            });

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
            pull: function(data) {
                $.ajax({
                    url: '/settings',
                    method: 'GET',
                    dataType: "json"
                })
                .done((d) => {
                    Object.assign(this.model, d);
                })
            },
            push: function(data) {
                $.ajax({
                    url: '/settings/do-update',
                    method: 'POST',
                    dataType: "json",
                    data: JSON.stringify(this.model),
                    contentType: "application/json",
                })
                .done((d) => {
                    Object.assign(this.model, d);
                })
            },
            selectCategory: function(data) {
                this.globals.selection.category = data.item;
            },
            selectDomain: function(data) {
                this.globals.selection.domain = data.item;
            },
            selectPage: function(data) {
                this.globals.selection.page = data.item;
            },
            selectSource: function(data) {
                this.globals.selection.source = data.item;
            },
            selectStorage: function(data) {
                this.globals.selection.storage = data.item;
            },
        }
    });

})(jQuery, Vue, Shell, undefined);
