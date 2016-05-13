Shell = window.Shell || {};

(function($, Vue, Core, Shell, undefined) {

    function stub(title, subtitle) {
        return {
            type: 'NTR1XDefaultBundle/Stub',
            _action: 'ignore',
            params: {
                title: { value: title },
                subtitle: { value: subtitle }
            }
        }
    }

    var DecoratorMixin = {

        props: {
            items: Array,
        },

        methods: {

            removeWidget: function() {
                this.$dispatch('removeChildWidget', { item: this.model });
            },

            doApply: function(model) {

                Object.assign(this.model, JSON.parse(JSON.stringify(model)), {
                    _action: this.model._action
                        ? this.model._action
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
                        original: this.model,
                        current: JSON.parse(JSON.stringify(this.model))
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
        },
    };

    var BindingsMixin = {

        data: function() {
            return {
                bindings: this.bindings,
            };
        },

        created: function() {

            var self = this;

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

            this.$watch('data', (data) => {
                this.bindings = recur(this.model.params);
            }, {
                deep: true,
                immediate: true,
            });

            this.$watch('model', (model) => {
                this.bindings = recur(model.params);
                // console.log(this.bindings);
            }, {
                deep: true,
                immediate: true,
            });
        }
    };

    var CompositeMixin = {

        data: function() {
            return {
                children: this.children,
            };
        },

        created: function() {

            this.$watch('items', (items) => {

                var children = [];
                if (items) {
                    for (var i = 0; i < items.length; i++) {
                        var item = items[i];
                        if (item._action != 'remove') {
                            children.push(item);
                        }
                    }
                }

                if (children.length < 1) {
                    children.push(JSON.parse(JSON.stringify(this.stub())));
                }

                this.children = children;
                // console.log('composite', this.children);
            }, {
                immediate: true,
                deep: true,
            });
        },

        events: {

            removeChildWidget: function(data) {

                var item = data.item;

                if (item._action == 'create') {
                    this.items.$remove(item);
                } else {
                    item._action = 'remove';
                }

                this.items = this.items.slice();//$.extend([], this.items);
            },
        },
    };

    var SortableMixin = function (selector) {

        function find(children, domIndex) {

            var index = 0;
            for (var i = 0; i < children.length && index < domIndex; i++) {

                var child = children[i];

                if (child._action != 'remove') {
                    index++;
                }
            }

            return index;
        }

        return {

            data: function() {

                return {
                    selected: this.selected,
                };
            },

            ready: function() {

                var self = this;
                this.$watch('selected', function(selected) {

                    if (selected) {

                        self.sortable =
                        Sortable.create($(selector, self.$el).get(0), {

                            group: {
                                name: 'widgets',
                                pull: 'clone',
                            },
                            animation: 150,

                            onAdd: function (evt) {

                                var palette = $(evt.item).closest('.ge.ge-palette');

                                if (self.globals.selection.dragged) {

                                    var dragged = self.globals.selection.dragged;
                                    var container = $(evt.to).closest('.ge.ge-widget').get(0).__vue__;

                                    var ni = find(self.items, evt.newIndex);

                                    var newItem = JSON.parse(JSON.stringify(dragged.vue.model));
                                    newItem._action = 'create';
                                    delete newItem.resource.id;
                                    delete newItem.id;

                                    dragged.item.remove();

                                    container.items.splice(ni, 0, newItem);
                                    container.items = container.items.slice();

                                } else if (!palette.length) {

                                    $(evt.item).remove();

                                    var ni = find(self.items, evt.newIndex);

                                    var widget = self.$root.$refs.shell.getWidget($(evt.item).data('widget'));

                                    self.items.splice(ni, 0, {
                                        type: widget.id,
                                        resource: {
                                            params: [],
                                            _action: 'create'
                                        },
                                        params: widget.params
                                            ? JSON.parse(JSON.stringify(widget.params))
                                            : {}
                                        ,
                                        widgets: [],
                                        _action: 'create',
                                    });
                                }
                            },

                            onStart: function (evt) {

                                self.globals.selection.dragged = {
                                    vue: $('.ge.ge-widget', evt.item).get(0).__vue__,
                                    item: $('.ge.ge-widget', evt.item),
                                    clone: $('.ge.ge-widget', evt.clone),
                                };
                            },

                            onRemove: function(evt) {

                                if (self.globals.selection.dragged) {

                                    var dragged = self.globals.selection.dragged;
                                    var stack =  dragged.vue.$parent.$parent.$parent;

                                    dragged.clone.remove();

                                    if (dragged.vue.model._action == 'create') {
                                        stack.items.$remove(dragged.vue.model);
                                    } else {
                                        dragged.vue.model._action = 'remove';
                                    }

                                    stack.items = stack.items.slice();
                                }
                            },

                            onUpdate: function (evt) {

                                if  (evt.newIndex != evt.oldIndex) {

                                    var oi = find(self.items, evt.oldIndex);
                                    var ni = find(self.items, evt.newIndex);

                                    self.items.splice(ni, 0, self.items.splice(oi, 1)[0]);
                                }
                            },

                            onEnd: function (evt) {

                                console.log('end', evt);

                                self.globals.selection.dragged = null;
                            }
                        });

                    } else {

                        if (self.sortable) {
                            self.sortable.destroy();
                            self.sortable = null;
                        }
                    }
                }, {
                    immediate: true
                });
            },

            methods: {
                selectTarget: function() {
                    this.selected = true;
                },

                unselectTarget: function() {
                    this.selected = false;
                },
            }
        };
    };

    Vue.component('shell-decorator-stub', {
        template: '#shell-decorator-stub',
        mixins: [ DecoratorMixin, BindingsMixin ],
        props: {
            globals: Object,
            settings: Object,
            stack: Object,
            page: Object,
            data: Object,
            model: Object,
            widget: Object,
            editable: Boolean,
            items: Array,
        },
    });

    Vue.component('shell-decorator-widget', {
        template: '#shell-decorator-widget',
        mixins: [ DecoratorMixin, BindingsMixin ],
        props: {
            globals: Object,
            settings: Object,
            stack: Object,
            page: Object,
            data: Object,
            model: Object,
            widget: Object,
            editable: Boolean,
            items: Array,
        },
    });

    Vue.component('shell-decorator-horisontal', {
        template: '#shell-decorator-horisontal',
        mixins: [ DecoratorMixin, CompositeMixin, SortableMixin('>.ge.ge-content >.wg.wg-default-stack >.wg.wg-content >.wg.wg-table >.wg.wg-row'), BindingsMixin ],
        props: {
            globals: Object,
            settings: Object,
            stack: Object,
            page: Object,
            data: Object,
            model: Object,
            widget: Object,
            editable: Boolean,
            items: Array,
        },
        methods: {
            stub: function() { return stub('Horisontal Stack', 'Drop Here'); }
        },
    });

    Vue.component('shell-decorator-vertical', {
        template: '#shell-decorator-vertical',
        mixins: [ DecoratorMixin, CompositeMixin, SortableMixin('>.ge.ge-content >.wg.wg-default-stack >.wg.wg-content >.wg.wg-table'), BindingsMixin ],
        props: {
            globals: Object,
            settings: Object,
            stack: Object,
            page: Object,
            data: Object,
            model: Object,
            widget: Object,
            editable: Boolean,
            items: Array,
        },
        methods: {
            stub: function() { return stub('Vertical Stack', 'Drop Here'); }
        },
    });

    Vue.component('shell-decorator-canvas', {
        template: '#shell-decorator-canvas',
        mixins: [ CompositeMixin, SortableMixin('>.ge.ge-content >.wg.wg-default-stack >.wg.wg-content >.wg.wg-table') ],
        props: {
            globals: Object,
            settings: Object,
            stack: Object,
            page: Object,
            data: Object,
            editable: Boolean,
            items: Array,
        },
        methods: {
            stub: function() { return stub('Vertical Stack', 'Drop Here'); }
        },
    });

})(jQuery, Vue, Core, Shell);
